const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.post('/', cartController.createCart);
router.post('/add', cartController.addToCart);
router.post('/remove', cartController.removeFromCart);
router.post('/checkout', cartController.checkout);

module.exports = router;
