const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  bankName: { type: String, default: '' },
  accountName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  branch: { type: String, default: '' },
}, { _id: false });

const paymentSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  deliveryCharge: { type: Number, default: 0, min: 0 },
  bankTransferInstructions: { type: String, default: '' },
  bankAccounts: { type: [bankAccountSchema], default: () => [] },
}, { timestamps: true });

module.exports = mongoose.model('PaymentSettings', paymentSettingsSchema);
