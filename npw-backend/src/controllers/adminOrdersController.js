const User = require('../models/User');

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

    const updated = await User.findOneAndUpdate(
      { 'orders.id': orderId },
      { $set: { 'orders.$.payment.status': paymentStatus } },
      { new: true, projection: { username: 1, email: 1, orders: 1 } }
    ).lean();

    if (!updated) return res.status(404).json({ message: 'Order not found' });

    const order = (updated.orders || []).find(o => o?.id === orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    return res.json({
      order: {
        ...order,
        customer: {
          id: String(updated._id),
          username: updated.username,
          email: updated.email
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
