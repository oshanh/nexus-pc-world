const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    filename: { type: String, required: true },
    alt: { type: String, default: '' },
    visible: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const websiteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    socialLinks: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
    promotions: { type: [promotionSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WebsiteSettings', websiteSettingsSchema);
