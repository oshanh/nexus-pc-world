const User = require('../models/User');
const Product = require('../models/Product');

const allowedPaymentStatuses = new Set([
  'pending',
  'awaiting_receipt',
  'awaiting_confirmation',
  'paid',
  'failed'
]);

const getAllOrders = async (_req, res) => {
  try {
    const users = await User.find({ 'orders.0': { $exists: true } })
      .select('username email orders')
      .lean();

    const orders = [];

    for (const u of users || []) {
      const customer = {
        id: String(u._id),
        username: u.username,
        email: u.email
      };

      for (const o of u.orders || []) {
        orders.push({
          ...o,
          customer
        });
      }
    }

    orders.sort((a, b) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return res.json({ orders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch admin orders' });
  }
};

const updateOrderPaymentStatus = async (req, res) => {
  try {
    const orderId = String(req.params.orderId || '').trim();
    const paymentStatus = String(req.body?.paymentStatus || '').trim();

    if (!orderId) return res.status(400).json({ message: 'Order ID is required' });
    if (!allowedPaymentStatuses.has(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const user = await User.findOne({ 'orders.id': orderId }).select('username email orders');
    if (!user) return res.status(404).json({ message: 'Order not found' });

    const order = (user.orders || []).find(o => o?.id === orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const prevStatus = String(order?.payment?.status || '');
    order.payment = order.payment || {};
    order.payment.status = paymentStatus;

    const shouldReleaseInventory =
      paymentStatus === 'failed' &&
      prevStatus !== 'failed' &&
      Boolean(order.inventoryDeductedAt) &&
      !order.inventoryReleasedAt;

    if (shouldReleaseInventory) {
      const requestedById = new Map();
      for (const it of order.items || []) {
        const id = String(it?.id || '').trim();
        const qtyNum = Number(it?.quantity);
        const qty = Number.isFinite(qtyNum) ? Math.floor(qtyNum) : 0;
        if (!id || qty <= 0) continue;
        requestedById.set(id, (requestedById.get(id) || 0) + qty);
      }

      await Promise.all(
        Array.from(requestedById.entries()).map(([id, qty]) => Product.updateOne({ _id: id }, { $inc: { stock: qty } }))
      );
      order.inventoryReleasedAt = new Date();
    }

    await user.save();

    return res.json({
      order: {
        ...order,
        customer: {
          id: String(user._id),
          username: user.username,
          email: user.email
        }
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update order' });
  }
};

module.exports = {
  getAllOrders,
  updateOrderPaymentStatus
};
