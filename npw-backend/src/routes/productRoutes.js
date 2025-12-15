const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const csrfProtection = require('../middleware/csrfMiddleware');

router.route('/').get(getProducts).post(csrfProtection, verifyToken, requireAdmin, createProduct);
router.route('/:id').get(getProductById).put(csrfProtection, verifyToken, requireAdmin, updateProduct).delete(csrfProtection, verifyToken, requireAdmin, deleteProduct);

module.exports = router;
