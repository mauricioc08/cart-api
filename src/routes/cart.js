const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middlewares/auth');


router.use(auth);

router.post('/', cartController.createCart);
router.post('/add', cartController.addItem);
router.post('/remove', cartController.removeItem);
router.post('/checkout', cartController.checkout);

module.exports = router;