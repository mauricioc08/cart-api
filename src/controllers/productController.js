const db = require('../models/db');


const create = (req, res) => {
  const { name, stock } = req.body;
  if (!name || typeof stock !== 'number') {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  const sql = 'INSERT INTO products (name, stock) VALUES (?, ?)';
  db.run(sql, [name, stock], function (err) {
    if (err) return res.status(500).json({ error: 'Erro ao criar produto' });
    return res.status(201).json({ id: this.lastID, name, stock });
  });
};


const list = (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao listar produtos' });
    return res.json(rows);
  });
};

module.exports = { create, list };
