const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateTokenAndSetCookie, generateOTP } = require('../utils/auth');
const { sendOTP, sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/notifications');
const crypto = require('crypto');


const signup = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { username, email, password } = req.body;
	try {
		// Check existing user
		let existing = await User.findOne({ email });
		if (existing) return res.status(400).json({ message: 'Email already in use' });

		existing = await User.findOne({ username });
		if (existing) return res.status(400).json({ message: 'Username already in use' });

		const hashed = await bcrypt.hash(password, 10);
		const user = new User({ username, email, password: hashed });
		const otp = generateOTP();
		user.verificationToken = otp;
		user.verificationTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

		const OTPSuccess = await sendOTP(email, otp);
		console.log('OTP sent:', OTPSuccess);
		if (!OTPSuccess) {
			return res.status(500).json({ message: 'Failed to send OTP email' });
		}
		// Save user without verification
		await user.save();

		// Return user info + email for OTP verification page (no auto-login)
		res.status(201).json({
			message: 'Account created. Please verify your email with the OTP sent.',
			email: user.email,
			username: user.username
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};

const login = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ message: 'Invalid credentials' });

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

		// Check if email is verified
		if (!user.isVerified) {
			return res.status(403).json({
				message: 'Email not verified',
				requiresVerification: true,
				email: user.email
			});
		}

		const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
		res.cookie('token', token, {
			httpOnly: true,
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 7 * 24 * 60 * 60 * 1000

		});

		res.json({ user: { id: user._id.toString(), username: user.username, email: user.email, role: user.role } });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};

const me = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		if (!user) return res.status(404).json({ message: 'User not found' });
		res.json({ user: { id: user._id.toString(), username: user.username, email: user.email, role: user.role } });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};

const logout = async (req, res) => {
	try {
		res.clearCookie('token', { sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', secure: process.env.NODE_ENV === 'production' });
		res.json({ message: 'Logged out' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};

const verifyOTP = async (req, res) => {
	const { email, otp } = req.body;
	try {
		if (!email || !otp) {
			return res.status(400).json({ message: 'Email and OTP are required' });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Check if OTP is expired
		if (!user.verificationTokenExpiresAt || Date.now() > user.verificationTokenExpiresAt) {
			return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
		}

		// Verify OTP
		if (user.verificationToken !== otp) {
			return res.status(400).json({ message: 'Invalid OTP' });
		}

		// Mark user as verified
		user.isVerified = true;
		user.verificationToken = null;
		user.verificationTokenExpiresAt = null;
		await user.save();

		// Send welcome email (non-blocking)
		sendWelcomeEmail(email, user.username).then((ok) => {
			if (!ok) console.warn('Failed to send welcome email');
		}).catch((e) => {
			console.warn('Error sending welcome email:', e);
		});

		// Log user in
		generateTokenAndSetCookie(res, user);

		res.json({
			message: 'Email verified successfully',
			user: { id: user._id.toString(), username: user.username, email: user.email, role: user.role }
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};

const resendOTP = async (req, res) => {
	const { email } = req.body;
	try {
		if (!email) {
			return res.status(400).json({ message: 'Email is required' });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		if (user.isVerified) {
			return res.status(400).json({ message: 'User already verified' });
		}

		// Generate new OTP
		const otp = generateOTP();
		user.verificationToken = otp;
		user.verificationTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
		await user.save();

		// Send OTP
		const OTPSuccess = await sendOTP(email, otp);
		if (!OTPSuccess) {
			return res.status(500).json({ message: 'Failed to send OTP email' });
		}

		res.json({ message: 'OTP sent successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};

const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			// To prevent email enumeration, we return success even if user not found
			return res.json({ message: 'If an account with that email exists, we have sent a password reset link.' });
		}

		// Generate token
		const resetToken = crypto.randomBytes(32).toString('hex');
		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = Date.now() + 3600000; // 1 hour

		await user.save();

		// Send email
		await sendPasswordResetEmail(email, resetToken);

		res.json({ message: 'If an account with that email exists, we have sent a password reset link.' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};

const resetPassword = async (req, res) => {
	const { token } = req.params;
	const { password } = req.body;

	try {
		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() }
		});

		if (!user) {
			return res.status(400).json({ message: 'Invalid or expired reset token' });
		}

		// Update password
		const hashed = await bcrypt.hash(password, 10);
		user.password = hashed;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;

		await user.save();

		res.json({ message: 'Password has been reset successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};

module.exports = { signup, login, me, logout, verifyOTP, resendOTP, forgotPassword, resetPassword };
