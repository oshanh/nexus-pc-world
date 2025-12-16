const express = require('express');
const router = express.Router();
const csrfProtection = require('../middleware/csrfMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');
const controller = require('../controllers/userController');

// Cart
router.get('/cart', verifyToken, controller.getCart);
router.put('/cart', csrfProtection, verifyToken, controller.updateCart);
router.post('/cart/items', csrfProtection, verifyToken, controller.addCartItem);
router.delete('/cart/items/:id', csrfProtection, verifyToken, controller.removeCartItem);

// Wishlist
router.get('/wishlist', verifyToken, controller.getWishlist);
router.post('/wishlist', csrfProtection, verifyToken, controller.addWishlistItem);
router.delete('/wishlist/:id', csrfProtection, verifyToken, controller.removeWishlistItem);
router.put('/wishlist', csrfProtection, verifyToken, controller.updateWishlist);

// Orders
router.get('/orders', verifyToken, controller.getOrders);
router.post('/orders', csrfProtection, verifyToken, controller.createOrder);

module.exports = router;
