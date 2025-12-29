const PaymentSettings = require('../models/PaymentSettings');

const SETTINGS_KEY = 'default';

const normalizeString = (v, maxLen = 500) => {
  const s = String(v ?? '').trim();
  if (!s) return '';
  return s.length > maxLen ? s.slice(0, maxLen) : s;
};

const normalizeDeliveryCharge = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
};

const normalizeBankAccount = (v) => {
  const o = v && typeof v === 'object' ? v : {};
  return {
    bankName: normalizeString(o.bankName, 200),
    accountName: normalizeString(o.accountName, 200),
    accountNumber: normalizeString(o.accountNumber, 120),
    branch: normalizeString(o.branch, 200),
  };
};

const normalizeBankAccounts = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(normalizeBankAccount)
    .filter((a) => a.bankName || a.accountName || a.accountNumber || a.branch);
};

const toResponseSettings = (doc) => {
  if (!doc) return null;

  const accounts = Array.isArray(doc.bankAccounts) ? doc.bankAccounts : [];
  const normalizedAccounts = normalizeBankAccounts(accounts);

  const bankTransferInstructions = String(doc.bankTransferInstructions ?? '').trim();

  return {
    deliveryCharge: Number(doc.deliveryCharge) || 0,
    bankTransferInstructions,
    bankAccounts: normalizedAccounts,
  };
};

const getAdminPaymentSettings = async (_req, res) => {
  try {
    const doc = await PaymentSettings.findOne({ key: SETTINGS_KEY }).lean();
    return res.json({
      settings: toResponseSettings(doc)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load payment settings' });
  }
};

const updateAdminPaymentSettings = async (req, res) => {
  try {
    const payload = req.body?.settings && typeof req.body.settings === 'object' ? req.body.settings : req.body;

    const deliveryCharge = normalizeDeliveryCharge(payload?.deliveryCharge);

    // New shape
    const bankTransferInstructions = normalizeString(payload?.bankTransferInstructions, 2000);
    const bankAccounts = normalizeBankAccounts(payload?.bankAccounts);

    const next = {
      deliveryCharge,
      bankTransferInstructions,
      bankAccounts,
    };

    const doc = await PaymentSettings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $set: { key: SETTINGS_KEY, ...next } },
      { upsert: true, new: true }
    ).lean();

    return res.json({
      settings: toResponseSettings(doc)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update payment settings' });
  }
};

module.exports = {
  getAdminPaymentSettings,
  updateAdminPaymentSettings,
};
