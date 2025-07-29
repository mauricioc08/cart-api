const db = require('../models/db');


const createCart = (req, res) => {
  db.run(
    'INSERT INTO carts (user_id) VALUES (?)',
    [req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao criar carrinho' });
      return res.status(201).json({ id: this.lastID });
    }
  );
};


const addItem = (req, res) => {
  const { cart_id, product_id, quantity } = req.body;

  db.get('SELECT stock FROM products WHERE id = ?', [product_id], (err, product) => {
    if (err || !product) return res.status(404).json({ error: 'Produto não encontrado' });

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Estoque insuficiente' });
    }

    db.run(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
      [cart_id, product_id, quantity],
      function (err) {
        if (err) return res.status(500).json({ error: 'Erro ao adicionar item' });
        return res.status(201).json({ id: this.lastID });
      }
    );
  });
};


const removeItem = (req, res) => {
  const { cart_id, product_id } = req.body;

  db.run(
    'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cart_id, product_id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao remover item' });
      return res.json({ removed: this.changes > 0 });
    }
  );
};


const checkout = (req, res) => {
  const { cart_id } = req.body;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    db.all('SELECT * FROM cart_items WHERE cart_id = ?', [cart_id], (err, items) => {
      if (err || items.length === 0) {
        db.run('ROLLBACK');
        return res.status(400).json({ error: 'Carrinho vazio' });
      }

      
      for (let item of items) {
        db.get('SELECT stock FROM products WHERE id = ?', [item.product_id], (err, product) => {
          if (!product || product.stock < item.quantity) {
            db.run('ROLLBACK');
            return res.status(400).json({ error: 'Estoque insuficiente para ' + item.product_id });
          }

          db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
        });
      }

      
      db.run('UPDATE carts SET finalized = 1 WHERE id = ?', [cart_id]);
      db.run('DELETE FROM cart_items WHERE cart_id = ?', [cart_id]);

      db.run('COMMIT');
      return res.json({ success: true, message: 'Compra finalizada' });
    });
  });
};

module.exports = { createCart, addItem, removeItem, checkout };
