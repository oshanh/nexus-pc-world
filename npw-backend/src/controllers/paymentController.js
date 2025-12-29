const path = require('node:path');
const User = require('../models/User');
const PaymentSettings = require('../models/PaymentSettings');

const receiptsDir = path.join(__dirname, '..', '..', 'uploads', 'bank-receipts');

const normalizeBankAccounts = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((v) => {
      const o = v && typeof v === 'object' ? v : {};
      return {
        bankName: String(o.bankName ?? ''),
        accountName: String(o.accountName ?? ''),
        accountNumber: String(o.accountNumber ?? ''),
        branch: String(o.branch ?? ''),
      };
    })
    .filter((a) => a.bankName || a.accountName || a.accountNumber || a.branch);
};

const getPaymentSettings = async (req, res) => {
  try {
    const doc = await PaymentSettings.findOne({ key: 'default' }).lean();

    const settings = {
      deliveryCharge: doc && Number.isFinite(Number(doc.deliveryCharge)) ? Number(doc.deliveryCharge) : 0,
      bankTransferInstructions: doc ? String(doc.bankTransferInstructions ?? '') : '',
      bankAccounts: doc ? normalizeBankAccounts(doc.bankAccounts) : [],
    };

    return res.json({ settings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load payment settings' });
  }
};

const uploadBankTransferReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Receipt file is required' });
    }

    // Do NOT expose a public URL. Receipts are only accessible via an authenticated API route.
    const downloadUrl = `/user/payment/bank-transfer/receipt/${encodeURIComponent(req.file.filename)}`;

    return res.status(201).json({
      receipt: {
        downloadUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to upload receipt' });
  }
};

const downloadBankTransferReceipt = async (req, res) => {
  try {
    const filename = String(req.params.filename || '');
    if (!filename) return res.status(400).json({ message: 'Filename is required' });

    const user = await User.findById(req.user.id).select('role orders');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isAdmin = user.role === 'admin';
    const hasReceipt = (user.orders || []).some(o => o?.payment?.bankTransferReceiptFilename === filename);

    if (!isAdmin && !hasReceipt) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const absolutePath = path.join(receiptsDir, filename);
    res.setHeader('Content-Disposition', 'inline');
    return res.sendFile(absolutePath);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to download receipt' });
  }
};

module.exports = {
  getPaymentSettings,
  uploadBankTransferReceipt,
  downloadBankTransferReceipt
};
