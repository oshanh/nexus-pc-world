const express = require('express');
const router = express.Router();

const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const csrfProtection = require('../middleware/csrfMiddleware');
const adminOrdersController = require('../controllers/adminOrdersController');
const paymentSettingsController = require('../controllers/paymentSettingsController');

// Orders
router.get('/orders', verifyToken, requireAdmin, adminOrdersController.getAllOrders);
router.put('/orders/:orderId/payment-status', csrfProtection, verifyToken, requireAdmin, adminOrdersController.updateOrderPaymentStatus);

// Payment settings
router.get('/payment/settings', verifyToken, requireAdmin, paymentSettingsController.getAdminPaymentSettings);
router.put('/payment/settings', csrfProtection, verifyToken, requireAdmin, paymentSettingsController.updateAdminPaymentSettings);

module.exports = router;
