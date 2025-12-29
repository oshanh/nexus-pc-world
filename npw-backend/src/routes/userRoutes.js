const express = require('express');
const router = express.Router();
const path = require('node:path');
const fs = require('node:fs');
const multer = require('multer');
const csrfProtection = require('../middleware/csrfMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');
const controller = require('../controllers/userController');
const cartController = require('../controllers/cartController');
const accountController = require('../controllers/accountController');
const paymentController = require('../controllers/paymentController');

const receiptsDir = path.join(__dirname, '..', '..', 'uploads', 'bank-receipts');
try {
	fs.mkdirSync(receiptsDir, { recursive: true });
} catch {}

const receiptStorage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, receiptsDir),
	filename: (_req, file, cb) => {
		const safeOriginal = String(file.originalname || 'receipt').replaceAll(/[^a-zA-Z0-9._-]/g, '_');
		const ext = path.extname(safeOriginal);
		const base = path.basename(safeOriginal, ext).slice(0, 80) || 'receipt';
		const stamp = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
		cb(null, `${base}-${stamp}${ext}`);
	}
});

const uploadReceipt = multer({
	storage: receiptStorage,
	limits: { fileSize: 10 * 1024 * 1024 },
	fileFilter: (_req, file, cb) => {
		const ok = file.mimetype?.startsWith('image/') || file.mimetype === 'application/pdf';
		cb(ok ? null : new Error('Only image or PDF receipts are allowed'), ok);
	}
});

// Cart
router.get('/cart', verifyToken, cartController.getCart);
router.put('/cart', csrfProtection, verifyToken, cartController.setCart);
router.post('/cart/items', csrfProtection, verifyToken, cartController.addCartItem);
router.post('/cart/items/:id/increase', csrfProtection, verifyToken, cartController.increaseCartItemQuantity);
router.post('/cart/items/:id/decrease', csrfProtection, verifyToken, cartController.decreaseCartItemQuantity);
router.delete('/cart/items/:id', csrfProtection, verifyToken, cartController.deleteCartItem);

// Wishlist
router.get('/wishlist', verifyToken, controller.getWishlist);
router.post('/wishlist', csrfProtection, verifyToken, controller.addWishlistItem);
router.delete('/wishlist/:id', csrfProtection, verifyToken, controller.removeWishlistItem);
router.put('/wishlist', csrfProtection, verifyToken, controller.updateWishlist);

// Account
router.get('/account', verifyToken, accountController.getAccount);
router.get('/account/orders', verifyToken, accountController.getAccountOrders);
router.put('/account', csrfProtection, verifyToken, accountController.updateAccount);

// Orders
router.get('/orders', verifyToken, controller.getOrders);
router.post('/orders', csrfProtection, verifyToken, controller.createOrder);

// Payment
router.get('/payment/settings', verifyToken, paymentController.getPaymentSettings);
router.post(
	'/payment/bank-transfer/receipt',
	csrfProtection,
	verifyToken,
	uploadReceipt.single('receipt'),
	paymentController.uploadBankTransferReceipt
);

router.get(
	'/payment/bank-transfer/receipt/:filename',
	verifyToken,
	paymentController.downloadBankTransferReceipt
);

module.exports = router;
