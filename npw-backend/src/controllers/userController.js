const User = require('../models/User');

const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('cart');
    return res.json({ cart: user?.cart || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load cart' });
  }
};

const updateCart = async (req, res) => {
  try {
    const { items } = req.body;
    const user = await User.findById(req.user.id);
    user.cart = Array.isArray(items) ? items : [];
    await user.save();
    return res.json({ cart: user.cart });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update cart' });
  }
};

const addCartItem = async (req, res) => {
  try {
    const { item } = req.body;
    if (!item || !item.id) return res.status(400).json({ message: 'Invalid item' });
    const user = await User.findById(req.user.id);
    const existing = user.cart.find(i => i.id === item.id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
    } else {
      user.cart.push({ ...item, quantity: item.quantity || 1 });
    }
    await user.save();
    return res.json({ cart: user.cart });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to add cart item' });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(i => i.id !== id);
    await user.save();
    return res.json({ cart: user.cart });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to remove cart item' });
  }
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
    const { items, total } = req.body;
    const user = await User.findById(req.user.id);
    const id = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const order = { id, items, total, createdAt: new Date() };
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
  getCart,
  updateCart,
  addCartItem,
  removeCartItem,
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  updateWishlist,
  getOrders,
  createOrder
};
