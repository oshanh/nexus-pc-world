const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}


const sendEmail = async (toEmail, subject, text, html) => {
  try {
    const fromAddress = process.env.EMAIL_USER;
    const fromName = process.env.EMAIL_FROM_NAME || 'Nexus PC World';
    const from = fromAddress ? `${fromName} <${fromAddress}>` : fromName;

    const mailOptions = {
      from,
      to: toEmail,
      subject,
      text,
    };

    if (html) {
      mailOptions.html = html;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return true;

  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
//Akarsha#88

const sendOTP = async (toEmail, otp) => {
  const subject = 'Your OTP Code';
  const text = `Your OTP code is: ${otp}. It is valid for 10 minutes.`;
  const result = await sendEmail(toEmail, subject, text);
  return result;
}

const sendWelcomeEmail = async (toEmail, username) => {
  const subject = 'Welcome to Nexus PC World!';

  const safeName = escapeHtml(username || 'there');
  const siteUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  const ctaUrl = siteUrl+'/login' || null;

  const textLines = [
    `Hello ${username || 'there'},`,
    '',
    "Welcome to Nexus PC World! We're excited to have you on board.",
    'You can browse products and manage your account anytime.',
    '',
    ctaUrl ? `Get started: ${ctaUrl}` : null,
    '',
    'Need help? Just reply to this email.',
    '',
    'Best regards,',
    'Nexus PC World Team'
  ].filter(Boolean);
  const text = textLines.join('\n');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Welcome to Nexus PC World</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Welcome to Nexus PC World — we’re excited to have you.</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f3f4f6;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;">
            <tr>
              <td style="font-family:Arial, Helvetica, sans-serif;color:#111827;padding:8px 8px 16px 8px;">
                <div style="font-size:18px;font-weight:700;letter-spacing:0.2px;">Nexus PC World</div>
              </td>
            </tr>
            <tr>
              <td style="background-color:#ffffff;border-radius:14px;padding:28px 24px;font-family:Arial, Helvetica, sans-serif;color:#111827;">
                <div style="font-size:22px;line-height:28px;font-weight:700;margin:0 0 10px 0;">Welcome, ${safeName}!</div>
                <div style="font-size:14px;line-height:22px;color:#374151;margin:0 0 18px 0;">
                  Thanks for joining Nexus PC World. We’re excited to help you build, upgrade, and discover the right parts and PCs for your needs.
                </div>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:18px 0 18px 0;">
                  <tr>
                    <td style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:14px 14px;">
                      <div style="font-size:14px;line-height:22px;color:#111827;margin:0 0 4px 0;font-weight:700;">Quick tips</div>
                      <div style="font-size:14px;line-height:22px;color:#374151;">
                        - Browse products and promotions<br />
                        - Save items to your wishlist<br />
                        - Manage your cart and checkout when you’re ready
                      </div>
                    </td>
                  </tr>
                </table>

                ${ctaUrl ? `
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 6px 0;">
                  <tr>
                    <td>
                      <a href="${ctaUrl}" style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:10px;font-size:14px;font-weight:700;">Get started</a>
                    </td>
                  </tr>
                </table>
                <div style="font-size:12px;line-height:18px;color:#6b7280;margin:0 0 18px 0;">Or copy and paste: ${escapeHtml(ctaUrl)}</div>
                ` : ''}

                <div style="font-size:14px;line-height:22px;color:#374151;margin:18px 0 0 0;">
                  Questions? Just reply to this email and we’ll help.
                </div>

                <div style="font-size:12px;line-height:18px;color:#6b7280;margin:20px 0 0 0;">
                  You’re receiving this email because you created an account at Nexus PC World.
                </div>
              </td>
            </tr>
            <tr>
              <td style="font-family:Arial, Helvetica, sans-serif;color:#6b7280;font-size:12px;line-height:18px;padding:14px 8px 0 8px;" align="center">
                © ${new Date().getFullYear()} Nexus PC World
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const result = await sendEmail(toEmail, subject, text, html);
  return result;
}

const sendPasswordResetEmail = async (toEmail, resetToken) => {
  const subject = 'Reset Your Password';
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const text = `You requested a password reset. Please use the following link to reset your password: ${resetUrl}. This link is valid for 1 hour.`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reset Your Password</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f3f4f6;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:14px;padding:28px 24px;font-family:Arial, Helvetica, sans-serif;color:#111827;">
            <tr>
              <td>
                <div style="font-size:22px;line-height:28px;font-weight:700;margin:0 0 10px 0;">Reset Your Password</div>
                <div style="font-size:14px;line-height:22px;color:#374151;margin:0 0 18px 0;">
                  We received a request to reset your password for your Nexus PC World account. Click the button below to proceed.
                </div>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 18px 0;">
                  <tr>
                    <td>
                      <a href="${resetUrl}" style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:10px;font-size:14px;font-weight:700;">Reset Password</a>
                    </td>
                  </tr>
                </table>
                <div style="font-size:12px;line-height:18px;color:#6b7280;margin:0 0 18px 0;">
                  If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.
                </div>
                <div style="font-size:12px;line-height:18px;color:#6b7280;">
                  Or copy and paste: ${resetUrl}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return await sendEmail(toEmail, subject, text, html);
};

module.exports = {
  ensureWebPushConfigured,
  sendToAllAdminSubscriptions,
  sendEmail,
  sendOTP,
  sendWelcomeEmail,
  sendPasswordResetEmail
};
