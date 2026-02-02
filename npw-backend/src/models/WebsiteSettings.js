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

const openingHourSchema = new mongoose.Schema(
  {
    days: { type: String, default: '' },
    hours: { type: String, default: '' },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    label: { type: String, default: '' },
    address: { type: String, default: '' },
    mapUrl: { type: String, default: '' },
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    question: { type: String, default: '' },
    answer: { type: String, default: '' },
    visible: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const teamMemberSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: '' },
    title: { type: String, default: '' },
    bio: { type: String, default: '' },
    filename: { type: String, default: '' },
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
    contactInfo: {
      emails: { type: [String], default: [] },
      phoneNumbers: { type: [String], default: [] },
      openingHours: { type: [openingHourSchema], default: [] },
      locations: { type: [locationSchema], default: [] },
    },
    featuredProducts: {
      desktopProductId: { type: String, default: '' },
      laptopProductId: { type: String, default: '' },
    },
    promotions: { type: [promotionSchema], default: [] },
    faqs: { type: [faqSchema], default: [] },
    teamMembers: { type: [teamMemberSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WebsiteSettings', websiteSettingsSchema);
