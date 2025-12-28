const User = require('../models/User');

const sanitizeString = (value, maxLen = 500) => {
  const s = String(value ?? '').trim();
  if (!s) return '';
  return s.length > maxLen ? s.slice(0, maxLen) : s;
};

// GET /api/user/account
const getAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username email role deliveryInfo');
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      account: {
        id: String(user._id),
        username: user.username,
        email: user.email,
        role: user.role,
        deliveryInfo: user.deliveryInfo || {},
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load account' });
  }
};

// PUT /api/user/account
// Body: { username?: string, deliveryInfo?: { fullName, phone, address, note } }
const updateAccount = async (req, res) => {
  try {
    const { username, deliveryInfo } = req.body || {};

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (typeof username === 'string') {
      const nextUsername = sanitizeString(username, 80);
      if (nextUsername) user.username = nextUsername;
    }

    if (deliveryInfo && typeof deliveryInfo === 'object') {
      user.deliveryInfo = {
        fullName: sanitizeString(deliveryInfo.fullName, 120),
        phone: sanitizeString(deliveryInfo.phone, 40),
        address: sanitizeString(deliveryInfo.address, 500),
        note: sanitizeString(deliveryInfo.note, 500),
      };
    }

    await user.save();

    return res.json({
      account: {
        id: String(user._id),
        username: user.username,
        email: user.email,
        role: user.role,
        deliveryInfo: user.deliveryInfo || {},
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
