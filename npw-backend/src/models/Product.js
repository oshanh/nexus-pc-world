const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subCategory: {
    type: String
  },
  shortDescription: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  imageUrls: [{
    type: String
  }],
  specs: [{
    name: String,
    value: String
  }]
}, {
  timestamps: true
});

// Transform _id to id for frontend compatibility
productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Product', productSchema);
