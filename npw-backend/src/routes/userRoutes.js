const express = require('express');
const router = express.Router();
const csrfProtection = require('../middleware/csrfMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');
const controller = require('../controllers/userController');
const cartController = require('../controllers/cartController');
const accountController = require('../controllers/accountController');

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
router.put('/account', csrfProtection, verifyToken, accountController.updateAccount);

// Orders
router.get('/orders', verifyToken, controller.getOrders);
router.post('/orders', csrfProtection, verifyToken, controller.createOrder);

module.exports = router;
