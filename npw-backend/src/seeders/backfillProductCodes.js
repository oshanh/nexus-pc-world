const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/mongodb');
const Product = require('../models/Product');

dotenv.config();

const backfillProductCodes = async () => {
  let updated = 0;
  let failed = 0;

  try {
    await connectDB();

    const missingQuery = {
      $or: [
        { code: { $exists: false } },
        { code: null },
        { code: '' }
      ]
    };

    const products = await Product.find(missingQuery);
    console.log(`Found ${products.length} product(s) missing code`);

    for (const product of products) {
      try {
        // Triggers Product pre('validate') to generate a unique code
        // eslint-disable-next-line no-await-in-loop
        await product.save();
        updated += 1;
      } catch (err) {
        failed += 1;
        console.error(`Failed to backfill product ${product._id}:`, err?.message || err);
      }
    }

    console.log(`Backfill complete: updated ${updated}, failed ${failed}`);

    if (failed > 0) process.exitCode = 1;
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  }
};

backfillProductCodes();
