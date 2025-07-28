const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
// const cartRoutes = require('./routes/cart');

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
// app.use('/cart', cartRoutes);

module.exports = app;
