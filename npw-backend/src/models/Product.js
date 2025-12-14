const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Desktop', 'Laptop', 'Accessory']
  },
  subCategory: {
    type: String,
    enum: [
      'Normal PC', 'Middle-End PC', 'High-End PC',
      'Normal Lap', 'Middle-End Lap', 'Gaming Lap',
      'Cpu', 'Ram', 'Storage', 'VGA', 'Keyboard', 'Mouse',
      'Headset', 'Monitors', 'Mouse Pads', 'HDMI Cables'
    ]
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
    type: String, // Keeping as string to match frontend "Rs. 150,000" format for now
    required: true
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
