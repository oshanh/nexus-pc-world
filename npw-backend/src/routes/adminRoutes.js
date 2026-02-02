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
try { fs.mkdirSync(promotionsDir, { recursive: true }); } catch { }

websiteSettingsController.ensureTeamDir();
const teamDir = path.join(__dirname, '..', '..', 'uploads', 'team');
try { fs.mkdirSync(teamDir, { recursive: true }); } catch { }

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

const teamStorage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, teamDir),
	filename: (_req, file, cb) => {
		const safeOriginal = String(file.originalname || 'portrait').replaceAll(/[^a-zA-Z0-9._-]/g, '_');
		const ext = path.extname(safeOriginal);
		const base = path.basename(safeOriginal, ext).slice(0, 80) || 'portrait';
		const stamp = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
		cb(null, `${base}-${stamp}${ext}`);
	}
});

const uploadTeamPortrait = multer({
	storage: teamStorage,
	limits: { fileSize: 5 * 1024 * 1024 },
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

router.post('/website/faqs', csrfProtection, verifyToken, requireAdmin, websiteSettingsController.createFaq);
router.put('/website/faqs/:faqId', csrfProtection, verifyToken, requireAdmin, websiteSettingsController.updateFaq);
router.delete('/website/faqs/:faqId', csrfProtection, verifyToken, requireAdmin, websiteSettingsController.deleteFaq);

router.post('/website/team', csrfProtection, verifyToken, requireAdmin, websiteSettingsController.createTeamMember);
router.put('/website/team/:memberId', csrfProtection, verifyToken, requireAdmin, websiteSettingsController.updateTeamMember);
router.delete('/website/team/:memberId', csrfProtection, verifyToken, requireAdmin, websiteSettingsController.deleteTeamMember);
router.post(
	'/website/team/:memberId/portrait',
	csrfProtection,
	verifyToken,
	requireAdmin,
	uploadTeamPortrait.single('image'),
	websiteSettingsController.uploadTeamMemberImage
);

module.exports = router;
