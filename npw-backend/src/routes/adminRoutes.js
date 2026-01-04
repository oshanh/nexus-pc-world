const express = require('express');
const router = express.Router();

const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const csrfProtection = require('../middleware/csrfMiddleware');
const adminOrdersController = require('../controllers/adminOrdersController');
const paymentSettingsController = require('../controllers/paymentSettingsController');
const adminPushController = require('../controllers/adminPushController');
const path = require('node:path');
const fs = require('node:fs');
const multer = require('multer');
const websiteSettingsController = require('../controllers/websiteSettingsController');

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

// Website settings (footer links, promotions)
websiteSettingsController.ensurePromotionsDir();
const promotionsDir = path.join(__dirname, '..', '..', 'uploads', 'promotions');
try { fs.mkdirSync(promotionsDir, { recursive: true }); } catch {}

const promotionStorage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, promotionsDir),
	filename: (_req, file, cb) => {
		const safeOriginal = String(file.originalname || 'promotion').replaceAll(/[^a-zA-Z0-9._-]/g, '_');
		const ext = path.extname(safeOriginal);
		const base = path.basename(safeOriginal, ext).slice(0, 80) || 'promotion';
		const stamp = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
		cb(null, `${base}-${stamp}${ext}`);
	}
});

const uploadPromotion = multer({
	storage: promotionStorage,
	limits: { fileSize: 10 * 1024 * 1024 },
	fileFilter: (_req, file, cb) => {
		const ok = file.mimetype?.startsWith('image/');
		cb(ok ? null : new Error('Only image files are allowed'), ok);
	}
});

router.get('/website/settings', verifyToken, requireAdmin, websiteSettingsController.getAdminWebsiteSettings);
router.put('/website/settings', csrfProtection, verifyToken, requireAdmin, websiteSettingsController.updateAdminWebsiteSettings);
router.post(
	'/website/promotions/upload',
	csrfProtection,
	verifyToken,
	requireAdmin,
	uploadPromotion.single('image'),
	websiteSettingsController.uploadPromotionImage
);
router.put('/website/promotions/:promotionId', csrfProtection, verifyToken, requireAdmin, websiteSettingsController.updatePromotion);
router.delete('/website/promotions/:promotionId', csrfProtection, verifyToken, requireAdmin, websiteSettingsController.deletePromotion);

module.exports = router;
