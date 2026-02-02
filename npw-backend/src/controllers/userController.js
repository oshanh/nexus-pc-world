const User = require('../models/User');
const Product = require('../models/Product');

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

const summarizeRequestedQuantities = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, status: 400, payload: { message: 'Order items are required' } };
  }

  const requestedById = new Map();
  for (const it of items) {
    const id = String(it?.id ?? '').trim();
    const qtyNum = Number(it?.quantity);
    const qty = Number.isFinite(qtyNum) ? Math.floor(qtyNum) : Number.NaN;

    if (!id) {
      return {
        ok: false,
        status: 400,
        payload: { message: 'Some order items are invalid. Please refresh your cart and try again.' }
      };
    }

    if (!Number.isFinite(qty) || qty <= 0) {
      return {
        ok: false,
        status: 400,
        payload: { message: 'Some order item quantities are invalid. Please refresh your cart and try again.' }
      };
    }

    requestedById.set(id, (requestedById.get(id) || 0) + qty);
  }

  return { ok: true, requestedById };
};

const buildInsufficientStockPayload = async (requestedById) => {
  const ids = Array.from(requestedById.keys());
  const products = await Product.find({ _id: { $in: ids } }).select('_id isActive stock').lean();
  const byId = new Map((products || []).map((p) => [String(p._id), p]));

  const unavailableIds = [];
  const insufficientStock = [];

  for (const [id, requestedQty] of requestedById.entries()) {
    const p = byId.get(String(id));
    const isActive = p && p.isActive !== false;
    if (!p || !isActive) {
      unavailableIds.push(id);
      continue;
    }

    const availableStock = Number(p.stock);
    const safeAvailable = Number.isFinite(availableStock) ? Math.max(0, Math.floor(availableStock)) : 0;
    if (requestedQty > safeAvailable) {
      insufficientStock.push({ id, requestedQty, availableStock: safeAvailable });
    }
  }

  return {
    message: 'Some items in your order do not have enough stock. Please update quantities in your cart and try again.',
    insufficientStock,
    unavailableIds: unavailableIds.length > 0 ? unavailableIds : insufficientStock.map((x) => x.id)
  };
};

const decrementStockForOrder = async (requestedById) => {
  const decremented = [];
  try {
    for (const [id, requestedQty] of requestedById.entries()) {
      // eslint-disable-next-line no-await-in-loop
      const updated = await Product.findOneAndUpdate(
        { _id: id, isActive: { $ne: false }, stock: { $gte: requestedQty } },
        { $inc: { stock: -requestedQty } },
        { new: false }
      );
      if (!updated) {
        throw new Error(`INSUFFICIENT_STOCK:${id}`);
      }
      decremented.push({ id, qty: requestedQty });
    }
    return { ok: true, decremented };
  } catch (error_) {
    // rollback
    try {
      await Promise.all(
        decremented.map((d) => Product.updateOne({ _id: d.id }, { $inc: { stock: d.qty } }))
      );
    } catch (error_) {
      console.error('Stock rollback failed', error_);
    }
    return { ok: false, decremented, error: error_ };
  }
};

const allowedPaymentMethods = new Set(['cod', 'bank_transfer', 'payhere']);

const buildSafeAddressesForOrder = (user, billingAddress, shippingAddress, shipToDifferentAddress) => {
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

  return { wantsDifferentShipping, safeBilling, safeShipping };
};

const buildSafePaymentForOrder = ({ paymentMethod, deliveryCharge, bankTransferReceiptUrl, bankTransferReceiptFilename, bankTransferReceiptMimeType }) => {
  const safePaymentMethod = allowedPaymentMethods.has(String(paymentMethod)) ? String(paymentMethod) : 'cod';
  const numericDeliveryCharge = Number(deliveryCharge);
  const safeDeliveryCharge = Number.isFinite(numericDeliveryCharge) ? numericDeliveryCharge : 0;

  let paymentStatus = 'pending';
  if (safePaymentMethod === 'bank_transfer') {
    paymentStatus = bankTransferReceiptUrl ? 'awaiting_confirmation' : 'awaiting_receipt';
  }

  return {
    method: safePaymentMethod,
    status: paymentStatus,
    deliveryCharge: safeDeliveryCharge,
    bankTransferReceiptUrl: sanitizeString(bankTransferReceiptUrl, 500),
    bankTransferReceiptFilename: sanitizeString(bankTransferReceiptFilename, 200),
    bankTransferReceiptMimeType: sanitizeString(bankTransferReceiptMimeType, 100),
    bankTransferReceiptUploadedAt: bankTransferReceiptUrl ? new Date() : undefined
  };
};

const rollbackStockFromRequested = async (requestedById) => {
  await Promise.all(
    Array.from(requestedById.entries()).map(([id, qty]) => Product.updateOne({ _id: id }, { $inc: { stock: qty } }))
  );
};

const saveOrderAndClearCart = async (user, order, requestedById) => {
  user.orders.unshift(order);
  user.cart = [];
  try {
    await user.save();
  } catch (error_) {
    try {
      await rollbackStockFromRequested(requestedById);
    } catch (error_) {
      console.error('Stock rollback after save failure failed', error_);
    }
    throw error_;
  }
};

const validateOrderItemsAreAvailable = async (items) => {
  const summary = summarizeRequestedQuantities(items);
  if (!summary.ok) return summary;

  const { requestedById } = summary;
  const uniqueIds = Array.from(requestedById.keys());

  try {
    const active = await Product.find({ _id: { $in: uniqueIds }, isActive: { $ne: false } })
      .select('_id stock')
      .lean();

    const productById = new Map((active || []).map((p) => [String(p._id), p]));
    const unavailableIds = uniqueIds.filter((id) => !productById.has(String(id)));

    if (unavailableIds.length > 0) {
      return {
        ok: false,
        status: 400,
        payload: {
          message: 'Some items in your order are no longer available. Please remove them from your cart and try again.',
          unavailableIds
        }
      };
    }

    const insufficientStock = [];
    for (const [id, requestedQty] of requestedById.entries()) {
      const product = productById.get(String(id));
      const availableStock = Number(product?.stock);
      const safeAvailable = Number.isFinite(availableStock) ? Math.max(0, Math.floor(availableStock)) : 0;
      if (requestedQty > safeAvailable) {
        insufficientStock.push({ id, requestedQty, availableStock: safeAvailable });
      }
    }

    if (insufficientStock.length > 0) {
      return {
        ok: false,
        status: 400,
        payload: {
          message: 'Some items in your order do not have enough stock. Please update quantities in your cart and try again.',
          insufficientStock,
          unavailableIds: insufficientStock.map((x) => x.id)
        }
      };
    }

    return { ok: true, requestedById };
  } catch (err) {
    console.error(err);
    return {
      ok: false,
      status: 400,
      payload: { message: 'Some items in your order are invalid or unavailable. Please refresh your cart and try again.' }
    };
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

const { sendToAllAdminSubscriptions } = require('../utils/notifications');

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

    const itemsCheck = await validateOrderItemsAreAvailable(items);
    if (!itemsCheck.ok) return res.status(itemsCheck.status).json(itemsCheck.payload);

    const requestedById = itemsCheck.requestedById;
    if (!requestedById || !(requestedById instanceof Map)) {
      return res.status(400).json({ message: 'Some order items are invalid. Please refresh your cart and try again.' });
    }

    // Deduct stock atomically (protects against race conditions)
    const stockResult = await decrementStockForOrder(requestedById);
    if (!stockResult.ok) {
      const payload = await buildInsufficientStockPayload(requestedById);
      return res.status(400).json(payload);
    }

    const { wantsDifferentShipping, safeBilling, safeShipping } = buildSafeAddressesForOrder(
      user,
      billingAddress,
      shippingAddress,
      shipToDifferentAddress
    );

    const payment = buildSafePaymentForOrder({
      paymentMethod,
      deliveryCharge,
      bankTransferReceiptUrl,
      bankTransferReceiptFilename,
      bankTransferReceiptMimeType
    });

    const id = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const numericTotal = Number(total);
    const order = {
      id,
      items,
      total: Number.isFinite(numericTotal) ? numericTotal : 0,
      inventoryDeductedAt: new Date(),
      billingAddress: safeBilling,
      shippingAddress: safeShipping,
      shipToDifferentAddress: wantsDifferentShipping,
      payment,
      createdAt: new Date(),
    };

    await saveOrderAndClearCart(user, order, requestedById);

    // Fire-and-forget: don't block order creation on push delivery.
    sendToAllAdminSubscriptions({
      type: 'NEW_ORDER',
      title: 'New order placed',
      body: `${user.username} placed ${id} (Total: ${order.total})`,
      url: '/admin/orders',
      order: { id, total: order.total },
      customer: { username: user.username }
    }).catch(err => console.error('[push] notify admins failed:', err));

    return res.status(201).json({ order });
  } catch (error_) {
    console.error(error_);
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
