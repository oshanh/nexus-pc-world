const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');
const User = require('../models/User');

let configured = false;

function ensureWebPushConfigured() {
  if (configured) return true;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) return false;

  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

async function sendToAllAdminSubscriptions(payload) {
  const canSend = ensureWebPushConfigured();
  if (!canSend) {
    console.warn('[push] VAPID keys not configured; skipping push send');
    return { sent: 0, removed: 0, skipped: true };
  }

  const adminUsers = await User.find({ role: 'admin' }).select('_id');
  const adminUserIds = adminUsers.map(u => u._id);
  if (adminUserIds.length === 0) return { sent: 0, removed: 0, skipped: false };

  const subs = await PushSubscription.find({ userId: { $in: adminUserIds } });
  if (subs.length === 0) return { sent: 0, removed: 0, skipped: false };

  let sent = 0;
  let removed = 0;

  await Promise.all(
    subs.map(async s => {
      try {
        const subscription = {
          endpoint: s.endpoint,
          expirationTime: s.expirationTime,
          keys: s.keys
        };

        await webpush.sendNotification(subscription, JSON.stringify(payload));
        sent += 1;

        s.lastSeenAt = new Date();
        await s.save();
      } catch (err) {
        const statusCode = err?.statusCode;
        // Subscription expired / gone
        if (statusCode === 404 || statusCode === 410) {
          try {
            await PushSubscription.deleteOne({ _id: s._id });
            removed += 1;
          } catch (error_) {
            console.error('[push] Failed to remove expired subscription:', error_);
          }
          return;
        }
        console.error('[push] Failed to send notification:', err);
      }
    })
  );

  return { sent, removed, skipped: false };
}

module.exports = {
  ensureWebPushConfigured,
  sendToAllAdminSubscriptions
};
