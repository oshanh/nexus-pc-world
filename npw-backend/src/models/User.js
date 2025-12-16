const mongoose = require('mongoose');

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
    enum: ['user', 'admin'],
    default: 'user'
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
  orders: [{
    id: String,
    items: [{ id: String, name: String, price: String, quantity: Number }],
    total: Number,
    createdAt: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
