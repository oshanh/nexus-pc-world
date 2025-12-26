const express = require('express');
const router = express.Router();
const {
  getProducts,
  getInactiveProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  stockInProduct,
  getStockInHistory
} = require('../controllers/productController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const csrfProtection = require('../middleware/csrfMiddleware');

router.route('/').get(getProducts).post(csrfProtection, verifyToken, requireAdmin, createProduct);

// Admin: list deactivated products
router.get('/inactive', verifyToken, requireAdmin, getInactiveProducts);

router.route('/:id').get(getProductById).put(csrfProtection, verifyToken, requireAdmin, updateProduct).delete(csrfProtection, verifyToken, requireAdmin, deleteProduct);

router.post('/:id/stock-in', csrfProtection, verifyToken, requireAdmin, stockInProduct);
router.get('/:id/stock-in/history', verifyToken, requireAdmin, getStockInHistory);

module.exports = router;
