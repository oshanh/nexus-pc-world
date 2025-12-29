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

const getUserBillingAddressSnapshot = (user) => {
  if (user?.billingAddress && typeof user.billingAddress === 'object') {
    return sanitizeAddress(user.billingAddress);
  }
  return sanitizeAddress({});
};

const getUserShippingAddressSnapshot = (user, fallbackBilling) => {
  if (user?.shippingAddress && typeof user.shippingAddress === 'object') {
    return sanitizeAddress(user.shippingAddress);
  }
  return fallbackBilling;
};

// Wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wishlist');
    return res.json({ wishlist: user?.wishlist || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load wishlist' });
  }
};

const addWishlistItem = async (req, res) => {
  try {
    const { item } = req.body;
    if (!item || !item.id) return res.status(400).json({ message: 'Invalid item' });
    const user = await User.findById(req.user.id);
    if (!user.wishlist.some(i => i.id === item.id)) user.wishlist.push(item);
    await user.save();
    return res.json({ wishlist: user.wishlist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to add wishlist item' });
  }
};

const removeWishlistItem = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(i => i.id !== id);
    await user.save();
    return res.json({ wishlist: user.wishlist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to remove wishlist item' });
  }
};

const updateWishlist = async (req, res) => {
  try {
    const { items } = req.body;
    const user = await User.findById(req.user.id);
    user.wishlist = Array.isArray(items) ? items : [];
    await user.save();
    return res.json({ wishlist: user.wishlist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update wishlist' });
  }
};

// Orders
const getOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('orders');
    return res.json({ orders: user?.orders || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

const createOrder = async (req, res) => {
  try {
    const {
      items,
      total,
      billingAddress,
      shippingAddress,
      shipToDifferentAddress,
      paymentMethod,
      deliveryCharge,
      bankTransferReceiptUrl,
      bankTransferReceiptFilename,
      bankTransferReceiptMimeType
    } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    const wantsDifferentShipping = Boolean(shipToDifferentAddress);

    const safeBilling = billingAddress
      ? sanitizeAddress(billingAddress)
      : getUserBillingAddressSnapshot(user);

    let safeShipping = safeBilling;
    if (wantsDifferentShipping) {
      safeShipping = shippingAddress
        ? sanitizeAddress(shippingAddress)
        : getUserShippingAddressSnapshot(user, safeBilling);
    }

    // Do not hard-require shipping yet (frontend checkout step comes next),
    // but persist a snapshot if available.

    const allowedPaymentMethods = new Set(['cod', 'bank_transfer', 'payhere']);
    const safePaymentMethod = allowedPaymentMethods.has(String(paymentMethod)) ? String(paymentMethod) : 'cod';
    const numericDeliveryCharge = Number(deliveryCharge);
    const safeDeliveryCharge = Number.isFinite(numericDeliveryCharge) ? numericDeliveryCharge : 0;

    let paymentStatus = 'pending';
    if (safePaymentMethod === 'bank_transfer') {
      paymentStatus = bankTransferReceiptUrl ? 'awaiting_confirmation' : 'awaiting_receipt';
    }

    const id = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const numericTotal = Number(total);
    const order = {
      id,
      items,
      total: Number.isFinite(numericTotal) ? numericTotal : 0,
      billingAddress: safeBilling,
      shippingAddress: safeShipping,
      shipToDifferentAddress: wantsDifferentShipping,
      payment: {
        method: safePaymentMethod,
        status: paymentStatus,
        deliveryCharge: safeDeliveryCharge,
        bankTransferReceiptUrl: sanitizeString(bankTransferReceiptUrl, 500),
        bankTransferReceiptFilename: sanitizeString(bankTransferReceiptFilename, 200),
        bankTransferReceiptMimeType: sanitizeString(bankTransferReceiptMimeType, 100),
        bankTransferReceiptUploadedAt: bankTransferReceiptUrl ? new Date() : undefined
      },
      createdAt: new Date(),
    };
    user.orders.unshift(order);
    // Optionally clear cart
    user.cart = [];
    await user.save();
    return res.status(201).json({ order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create order' });
  }
};

module.exports = {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  updateWishlist,
  getOrders,
  createOrder
};
