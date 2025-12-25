const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/mongodb');
const User = require('../models/User');

dotenv.config();

const usersToSeed = [
  {
    username: 'admin',
    email: 'admin@nexus.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    username: 'admin2',
    email: 'admin2@nexus.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    username: 'customer1',
    email: 'customer1@nexus.com',
    password: 'customer123',
    role: 'user'
  },
  {
    username: 'customer2',
    email: 'customer2@nexus.com',
    password: 'customer123',
    role: 'user'
  },
  {
    username: 'customer3',
    email: 'customer3@nexus.com',
    password: 'customer123',
    role: 'user'
  }
];

const seedUsers = async () => {
  let created = 0;
  let skipped = 0;
  let failed = 0;

  try {
    await connectDB();

    for (const u of usersToSeed) {
      // eslint-disable-next-line no-await-in-loop
      const existing = await User.findOne({ email: u.email }).select('_id email').lean();
      if (existing) {
        skipped += 1;
        continue;
      }

      try {
        // eslint-disable-next-line no-await-in-loop
        const hashed = await bcrypt.hash(u.password, 10);
        // eslint-disable-next-line no-await-in-loop
        await User.create({
          username: u.username,
          email: u.email,
          password: hashed,
          role: u.role
        });
        created += 1;
        console.log(`User created: ${u.email} / ${u.password} (${u.role})`);
      } catch (err) {
        failed += 1;
        console.error(`Failed to create user ${u.email}:`, err?.message || err);
      }
    }

    console.log(`Users seed complete: created ${created}, skipped ${skipped}, failed ${failed}`);
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

seedUsers();
