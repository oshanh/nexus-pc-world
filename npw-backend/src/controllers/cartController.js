const User = require('../models/User');

const normalizeId = (value) => String(value ?? '').trim();

const normalizeQuantityDelta = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.trunc(n) || 1;
};

const getUserCart = async (userId) => {
  const user = await User.findById(userId).select('cart');
  return user?.cart || [];
};

// GET /api/user/cart
const getCart = async (req, res) => {
  try {
    const cart = await getUserCart(req.user.id);
    return res.json({ cart });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load cart' });
  }
};

// PUT /api/user/cart  { items: [...] }
const setCart = async (req, res) => {
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

// POST /api/user/cart/items  { item: {...} }
const addCartItem = async (req, res) => {
  try {
    const { item } = req.body;
    const id = normalizeId(item?.id);
    if (!id) return res.status(400).json({ message: 'Invalid item' });

    const user = await User.findById(req.user.id);

    const existing = user.cart.find((i) => normalizeId(i.id) === id);
    const addQty = Math.max(1, Number(item?.quantity ?? 1) || 1);

    if (existing) {
      existing.quantity = Math.max(1, Number(existing.quantity ?? 1) + addQty);
    } else {
      user.cart.push({
        id,
        name: item?.name,
        price: item?.price,
        imageUrls: item?.imageUrls,
        quantity: addQty,
      });
    }

    await user.save();
    return res.json({ cart: user.cart });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to add cart item' });
  }
};

// POST /api/user/cart/items/:id/increase  { amount?: number }
const increaseCartItemQuantity = async (req, res) => {
  try {
    const id = normalizeId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid item id' });

    const amount = Math.abs(normalizeQuantityDelta(req.body?.amount));

    const user = await User.findById(req.user.id);
    const existing = user.cart.find((i) => normalizeId(i.id) === id);
    if (!existing) return res.status(404).json({ message: 'Item not found in cart' });

    existing.quantity = Math.max(1, Number(existing.quantity ?? 1) + amount);
    await user.save();
    return res.json({ cart: user.cart });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to increase item quantity' });
  }
};

// POST /api/user/cart/items/:id/decrease  { amount?: number }
const decreaseCartItemQuantity = async (req, res) => {
  try {
    const id = normalizeId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid item id' });

    const amount = Math.abs(normalizeQuantityDelta(req.body?.amount));

    const user = await User.findById(req.user.id);
    const existing = user.cart.find((i) => normalizeId(i.id) === id);
    if (!existing) return res.status(404).json({ message: 'Item not found in cart' });

    const nextQty = Number(existing.quantity ?? 1) - amount;
    if (nextQty <= 0) {
      user.cart = user.cart.filter((i) => normalizeId(i.id) !== id);
    } else {
      existing.quantity = nextQty;
    }

    await user.save();
    return res.json({ cart: user.cart });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to decrease item quantity' });
  }
};

// DELETE /api/user/cart/items/:id
const deleteCartItem = async (req, res) => {
  try {
    const id = normalizeId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid item id' });

    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter((i) => normalizeId(i.id) !== id);
    await user.save();
    return res.json({ cart: user.cart });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete cart item' });
  }
};

module.exports = {
  getCart,
  setCart,
  addCartItem,
  increaseCartItemQuantity,
  decreaseCartItemQuantity,
  deleteCartItem,
};
