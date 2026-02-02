const PushSubscription = require('../models/PushSubscription');
const { ensureWebPushConfigured } = require('../utils/notifications');

const getVapidPublicKey = async (_req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) return res.status(500).json({ message: 'VAPID public key not configured' });
  return res.json({ publicKey });
};

const subscribe = async (req, res) => {
  try {
    const subscription = req.body?.subscription;

    const endpoint = subscription?.endpoint;
    const keys = subscription?.keys;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ message: 'Invalid push subscription payload' });
    }

    // Validate configuration early so admins know why it fails
    if (!ensureWebPushConfigured()) {
      // Still store subscription so it works once keys are added
      console.warn('[push] Storing subscription but VAPID keys are missing');
    }

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        userId: req.user.id,
        endpoint,
        expirationTime: subscription.expirationTime ?? null,
        keys: { p256dh: keys.p256dh, auth: keys.auth },
        userAgent: req.body?.userAgent || '',
        lastSeenAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to subscribe for push notifications' });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const endpoint = req.body?.endpoint;
    if (!endpoint) return res.status(400).json({ message: 'Endpoint is required' });

    await PushSubscription.deleteOne({ endpoint, userId: req.user.id });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to unsubscribe from push notifications' });
  }
};

module.exports = {
  getVapidPublicKey,
  subscribe,
  unsubscribe
};
