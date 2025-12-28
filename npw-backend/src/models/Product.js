const mongoose = require('mongoose');

const PRODUCT_CODE_PREFIX = 'NPW-';
const PRODUCT_CODE_PART_LENGTH = 6;
const PRODUCT_CODE_REGEX = new RegExp(`^${PRODUCT_CODE_PREFIX}[A-Z0-9]{${PRODUCT_CODE_PART_LENGTH}}$`);

function randomCodePart(length) {
  return Math.random().toString(36).slice(2).toUpperCase().replaceAll(/[^A-Z0-9]/g, '').slice(0, length).padEnd(length, '0');
}

async function generateUniqueProductCode(ProductModel, maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = `${PRODUCT_CODE_PREFIX}${randomCodePart(PRODUCT_CODE_PART_LENGTH)}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await ProductModel.exists({ code: candidate });
    if (!exists) return candidate;
  }
  throw new Error('Failed to generate unique product code');
}

const productSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
    uppercase: true,
    match: PRODUCT_CODE_REGEX
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
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
  stockHistory: [{
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    buyingUnitPrice: {
      type: Number,
      min: 0
    },
    sellingUnitPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
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

productSchema.pre('validate', async function () {
  if (this.code && typeof this.code === 'string') {
    this.code = this.code.trim().toUpperCase();
    return;
  }

  if (!this.code) {
    this.code = await generateUniqueProductCode(this.constructor);
  }
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
