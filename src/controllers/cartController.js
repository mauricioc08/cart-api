const db = require('../models/db');
const { acquireLock, releaseLock } = require('../utils/locks');


exports.createCart = (req, res) => {
  const userId = req.user.id;

  db.get(
    `SELECT * FROM carts WHERE user_id = ? AND finalized = 0`,
    [userId],
    (err, cart) => {
      if (err) return res.status(500).json({ error: 'Erro ao verificar carrinho' });
      if (cart) {
        return res.status(400).json({
          error: 'Você já possui um carrinho em aberto. Finalize-o antes de criar outro.',
          cart_id: cart.id
        });
      }

      db.run(`INSERT INTO carts (user_id) VALUES (?)`, [userId], function (err) {
        if (err) return res.status(500).json({ error: 'Erro ao criar carrinho' });
        return res.status(201).json({ id: this.lastID });
      });
    }
  );
};


exports.addToCart = (req, res) => {
  const { cart_id, product_id, quantity } = req.body;
  const userId = req.user.id;

  db.get(`SELECT * FROM carts WHERE id = ? AND user_id = ? AND finalized = 0`, [cart_id, userId], (err, cart) => {
    if (err || !cart) return res.status(404).json({ error: 'Carrinho não encontrado ou já finalizado' });

    db.get(`SELECT stock FROM products WHERE id = ?`, [product_id], (err, product) => {
      if (err || !product) return res.status(404).json({ error: 'Produto não encontrado' });

      db.get(`SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?`, [cart_id, product_id], (err, existingItem) => {
        if (err) return res.status(500).json({ error: 'Erro ao verificar item no carrinho' });

        const alreadyInCart = existingItem ? existingItem.quantity : 0;
        const totalAfterAdd = alreadyInCart + quantity;

        if (totalAfterAdd > product.stock) {
          return res.status(400).json({
            error: `Quantidade total (${totalAfterAdd}) excede o estoque disponível (${product.stock}).`
          });
        }

        if (existingItem) {
          db.run(
            `UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?`,
            [quantity, cart_id, product_id],
            function (err) {
              if (err) return res.status(500).json({ error: 'Erro ao atualizar item no carrinho' });
              return res.status(200).json({ message: 'Quantidade atualizada no carrinho' });
            }
          );
        } else {
          db.run(
            `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`,
            [cart_id, product_id, quantity],
            function (err) {
              if (err) return res.status(500).json({ error: 'Erro ao adicionar item' });
              return res.status(201).json({ message: 'Item adicionado ao carrinho' });
            }
          );
        }
      });
    });
  });
};


exports.removeFromCart = (req, res) => {
  const { cart_id, product_id } = req.body;
  const userId = req.user.id;

  db.get(
    `SELECT * FROM carts WHERE id = ? AND user_id = ? AND finalized = 0`,
    [cart_id, userId],
    (err, cart) => {
      if (err || !cart) return res.status(404).json({ error: 'Carrinho não encontrado ou já finalizado' });

      db.run(
        `DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`,
        [cart_id, product_id],
        function (err) {
          if (err) return res.status(500).json({ error: 'Erro ao remover item' });
          if (this.changes === 0) return res.status(404).json({ error: 'Produto não encontrado no carrinho' });
          return res.json({ success: true });
        }
      );
    }
  );
};


exports.getCartItems = (req, res) => {
  const userId = req.user.id;

  
  db.get(
    `SELECT * FROM carts WHERE user_id = ? AND finalized = 0`,
    [userId],
    (err, cart) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar carrinho' });
      if (!cart) return res.status(404).json({ error: 'Nenhum carrinho ativo encontrado' });

      
      db.all(
        `SELECT p.id, p.name, ci.quantity, p.stock
         FROM cart_items ci
         JOIN products p ON p.id = ci.product_id
         WHERE ci.cart_id = ?`,
        [cart.id],
        (err, items) => {
          if (err) return res.status(500).json({ error: 'Erro ao listar itens' });

          return res.json({
            cart_id: cart.id,
            finalized: Number(cart.finalized) === 1,
            items
          });
        }
      );
    }
  );
};



exports.checkout = (req, res) => {
  const { cart_id } = req.body;
  const userId = req.user.id;

  if (!acquireLock(`cart-${cart_id}`)) {
    return res.status(409).json({ error: 'Carrinho em processamento. Tente novamente.' });
  }

  db.get(`SELECT * FROM carts WHERE id = ? AND user_id = ? AND finalized = 0`, [cart_id, userId], (err, cart) => {
    if (err) {
      releaseLock(`cart-${cart_id}`);
      return res.status(500).json({ error: 'Erro ao buscar carrinho' });
    }
    if (!cart) {
      releaseLock(`cart-${cart_id}`);
      return res.status(404).json({ error: 'Carrinho não encontrado ou já finalizado' });
    }

    db.all(`SELECT * FROM cart_items WHERE cart_id = ?`, [cart_id], (err, items) => {
      if (err) {
        releaseLock(`cart-${cart_id}`);
        return res.status(500).json({ error: 'Erro ao buscar itens' });
      }
      if (!items.length) {
        releaseLock(`cart-${cart_id}`);
        return res.status(400).json({ error: 'Carrinho vazio' });
      }

      const checkStockPromises = items.map(item => {
        return new Promise((resolve, reject) => {
          db.get(`SELECT stock FROM products WHERE id = ?`, [item.product_id], (err, product) => {
            if (err || !product) {
              return reject(`Produto ID ${item.product_id} não encontrado`);
            }
            if (product.stock < item.quantity) {
              return reject(`Estoque insuficiente para o produto ID ${item.product_id}`);
            }
            resolve();
          });
        });
      });

      Promise.all(checkStockPromises)
        .then(() => {
          db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            items.forEach(item => {
              db.run(`UPDATE products SET stock = stock - ? WHERE id = ?`, [item.quantity, item.product_id]);
            });

            db.run(`UPDATE carts SET finalized = 1 WHERE id = ? AND user_id = ?`, [cart_id, userId]);

            db.run('COMMIT', (err) => {
              releaseLock(`cart-${cart_id}`);
              if (err) {
                return res.status(500).json({ error: 'Erro ao finalizar compra' });
              }
              return res.json({ success: true, message: 'Compra finalizada com sucesso' });
            });
          });
        })
        .catch(stockError => {
          releaseLock(`cart-${cart_id}`);
          return res.status(400).json({ error: stockError });
        });
    });
  });
};

