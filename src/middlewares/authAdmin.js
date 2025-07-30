const db = require('../models/db');

module.exports = (req, res, next) => {

  const adminSecret = req.headers['adminsecret'];

  if(process.env.ADMIN_SECRET == adminSecret){
    next()
  } else {
    return res.status(401).json({ error: 'Acesso Administrador Não Autorizado.' });
  }

};
