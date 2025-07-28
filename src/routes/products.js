const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middlewares/auth');


router.use(auth);

router.post('/', productController.create);
router.get('/', productController.list);

module.exports = router;
