const express = require('express');
const router = express.Router();

const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const csrfProtection = require('../middleware/csrfMiddleware');
const adminOrdersController = require('../controllers/adminOrdersController');

// Orders
router.get('/orders', verifyToken, requireAdmin, adminOrdersController.getAllOrders);
router.put('/orders/:orderId/payment-status', csrfProtection, verifyToken, requireAdmin, adminOrdersController.updateOrderPaymentStatus);

module.exports = router;
