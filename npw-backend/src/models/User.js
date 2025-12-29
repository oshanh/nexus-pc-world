const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  phone: { type: String, default: '' },
  companyName: { type: String, default: '' },
  country: { type: String, default: 'Sri Lanka' },
  streetAddress: { type: String, default: '' },
  houseNumberAndStreetName: { type: String, default: '' },
  apartment: { type: String, default: '' },
  city: { type: String, default: '' },
  postcode: { type: String, default: '' },
  note: { type: String, default: '' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  }
  ,
  cart: [{
    id: String,
    name: String,
    price: String,
    imageUrls: [String],
    quantity: { type: Number, default: 1 }
  }],
  wishlist: [{
    id: String,
    name: String,
    price: String,
    imageUrls: [String]
  }],
  billingAddress: {
    type: addressSchema,
    default: () => ({})
  },
  shippingAddress: {
    type: addressSchema,
    default: () => ({})
  },
  orders: [{
    id: String,
    items: [{ id: String, name: String, price: String, quantity: Number }],
    total: Number,
    inventoryDeductedAt: { type: Date },
    inventoryReleasedAt: { type: Date },
    billingAddress: { type: addressSchema, default: () => ({}) },
    shippingAddress: { type: addressSchema, default: () => ({}) },
    shipToDifferentAddress: { type: Boolean, default: false },
    payment: {
      method: {
        type: String,
        enum: ['cod', 'bank_transfer', 'payhere'],
        default: 'cod'
      },
      status: {
        type: String,
        enum: ['pending', 'awaiting_receipt', 'awaiting_confirmation', 'paid', 'failed'],
        default: 'pending'
      },
      deliveryCharge: { type: Number, default: 0 },
      bankTransferReceiptUrl: { type: String, default: '' },
      bankTransferReceiptFilename: { type: String, default: '' },
      bankTransferReceiptMimeType: { type: String, default: '' },
      bankTransferReceiptUploadedAt: { type: Date }
    },
    createdAt: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
