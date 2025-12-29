const User = require('../models/User');

const sanitizeString = (value, maxLen = 500) => {
  const s = String(value ?? '').trim();
  if (!s) return '';
  return s.length > maxLen ? s.slice(0, maxLen) : s;
};

const sanitizeAddress = (address) => {
  const a = (address && typeof address === 'object') ? address : {};
  return {
    firstName: sanitizeString(a.firstName, 80),
    lastName: sanitizeString(a.lastName, 80),
    phone: sanitizeString(a.phone, 40),
    companyName: sanitizeString(a.companyName, 120),
    country: 'Sri Lanka',
    streetAddress: sanitizeString(a.streetAddress, 200),
    houseNumberAndStreetName: sanitizeString(a.houseNumberAndStreetName, 200),
    apartment: sanitizeString(a.apartment, 200),
    city: sanitizeString(a.city, 120),
    postcode: sanitizeString(a.postcode, 40),
    note: sanitizeString(a.note, 500),
  };
};

// GET /api/user/account
const getAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username email role billingAddress shippingAddress');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const billingAddress = (user.billingAddress && typeof user.billingAddress === 'object') ? user.billingAddress : {};
    const shippingAddress = (user.shippingAddress && typeof user.shippingAddress === 'object') ? user.shippingAddress : {};

    return res.json({
      account: {
        id: String(user._id),
        username: user.username,
        email: user.email,
        role: user.role,
        billingAddress: billingAddress || {},
        shippingAddress: shippingAddress || {},
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load account' });
  }
};

// PUT /api/user/account
// Body: { username?: string, billingAddress?: Address, shippingAddress?: Address }
const updateAccount = async (req, res) => {
  try {
    const { username, billingAddress, shippingAddress } = req.body || {};

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (typeof username === 'string') {
      const nextUsername = sanitizeString(username, 80);
      if (nextUsername) user.username = nextUsername;
    }

    if (billingAddress && typeof billingAddress === 'object') {
      user.billingAddress = sanitizeAddress(billingAddress);
    }

    if (shippingAddress && typeof shippingAddress === 'object') {
      user.shippingAddress = sanitizeAddress(shippingAddress);
    }

    await user.save();

    return res.json({
      account: {
        id: String(user._id),
        username: user.username,
        email: user.email,
        role: user.role,
        billingAddress: user.billingAddress || {},
        shippingAddress: user.shippingAddress || {},
      },
    });
  } catch (err) {
    // Most likely unique constraint on username
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Username already in use' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Failed to update account' });
  }
};

module.exports = {
  getAccount,
  updateAccount,
};
