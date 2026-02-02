const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const { signup, login, me, verifyOTP, resendOTP, forgotPassword, resetPassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const csrfProtection = require('../middleware/csrfMiddleware');


router.post('/signup', [
  check('username', 'Username is required').notEmpty(),
  check('email', 'Valid email is required').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], csrfProtection, signup);

router.post('/verify-otp', [
  check('email', 'Valid email is required').isEmail(),
  check('otp', 'OTP is required').notEmpty()
], csrfProtection, verifyOTP);

router.post('/resend-otp', [
  check('email', 'Valid email is required').isEmail()
], csrfProtection, resendOTP);

router.post('/login', [
  check('email', 'Valid email is required').isEmail(),
  check('password', 'Password is required').exists()
], csrfProtection, login);

router.post('/forgot-password', [
  check('email', 'Valid email is required').isEmail()
], csrfProtection, forgotPassword);

router.post('/reset-password/:token', [
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], csrfProtection, resetPassword);

router.get('/me', verifyToken, me);
router.post('/logout', csrfProtection, verifyToken, (req, res) => { // clear cookie
  const { logout } = require('../controllers/authController');
  return logout(req, res);
});

module.exports = router;
