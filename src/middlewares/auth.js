const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'Token ausente' });

  const token = auth.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};
