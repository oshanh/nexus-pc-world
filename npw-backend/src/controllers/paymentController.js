const path = require('node:path');
const User = require('../models/User');

const receiptsDir = path.join(__dirname, '..', '..', 'uploads', 'bank-receipts');

const getPaymentSettings = async (req, res) => {
  try {
    const deliveryCharge = Number(process.env.DELIVERY_CHARGE);

    const settings = {
      deliveryCharge: Number.isFinite(deliveryCharge) ? deliveryCharge : 0,
      bankDetails: {
        instructions: process.env.BANK_TRANSFER_INSTRUCTIONS || 'Add order number as reference when making the transfer.',
        bankName: process.env.BANK_NAME || 'Sampath Bank',
        accountName: process.env.BANK_ACCOUNT_NAME || 'Nexus PC World Pvt Ltd',
        accountNumber: process.env.BANK_ACCOUNT_NUMBER || '833229972223',
        branch: process.env.BANK_BRANCH || 'Super Branch, Colombo 3',
      }
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
