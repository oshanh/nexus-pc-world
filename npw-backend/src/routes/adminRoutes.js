const express = require('express');
const router = express.Router();

const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const csrfProtection = require('../middleware/csrfMiddleware');
const adminOrdersController = require('../controllers/adminOrdersController');
const paymentSettingsController = require('../controllers/paymentSettingsController');
const adminPushController = require('../controllers/adminPushController');

// Orders
router.get('/orders', verifyToken, requireAdmin, adminOrdersController.getAllOrders);
router.put('/orders/:orderId/payment-status', csrfProtection, verifyToken, requireAdmin, adminOrdersController.updateOrderPaymentStatus);

// Payment settings
router.get('/payment/settings', verifyToken, requireAdmin, paymentSettingsController.getAdminPaymentSettings);
router.put('/payment/settings', csrfProtection, verifyToken, requireAdmin, paymentSettingsController.updateAdminPaymentSettings);

// Web Push (admin notifications)
router.get('/push/vapid-public-key', verifyToken, requireAdmin, adminPushController.getVapidPublicKey);
router.post('/push/subscribe', csrfProtection, verifyToken, requireAdmin, adminPushController.subscribe);
router.post('/push/unsubscribe', csrfProtection, verifyToken, requireAdmin, adminPushController.unsubscribe);

module.exports = router;
