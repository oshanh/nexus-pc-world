const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
		await user.save();

		const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
			// Set token as httpOnly cookie for session
			res.cookie('token', token, {
				httpOnly: true,
				sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
			});

			res.status(201).json({ token, user: { id: user._id.toString(), username: user.username, email: user.email, role: user.role } });
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

		const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
		res.cookie('token', token, {
			httpOnly: true,
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 7 * 24 * 60 * 60 * 1000
		});

		res.json({ token, user: { id: user._id.toString(), username: user.username, email: user.email, role: user.role } });
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

module.exports = { signup, login, me, logout };
