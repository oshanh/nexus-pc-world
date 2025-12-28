const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/mongodb');
const Category = require('../models/Category');

dotenv.config();

const categories = [
  {
    name: 'Desktop',
    subcategories: ['Normal PC', 'Middle-End PC', 'High-End PC']
  },
  {
    name: 'Laptop',
    subcategories: ['Normal Lap', 'Middle-End Lap', 'Gaming Lap']
  },
  {
    name: 'Accessory',
    subcategories: ['Cpu', 'Ram', 'Storage', 'VGA', 'Keyboard', 'Mouse', 'Headset', 'Monitors', 'Mouse Pads', 'HDMI Cables']
  }
];

const seedCategories = async () => {
  try {
    await connectDB();

    // Upsert categories by name; do not overwrite existing categories/subcategories.
    const ops = categories.map((c) => ({
      updateOne: {
        filter: { name: c.name },
        update: { $setOnInsert: c },
        upsert: true
      }
    }));

    const result = await Category.bulkWrite(ops);
    console.log(
      `Categories upsert result: inserted ${result.upsertedCount || 0}, matched ${result.matchedCount || 0}, modified ${result.modifiedCount || 0}`
    );
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

seedCategories();
