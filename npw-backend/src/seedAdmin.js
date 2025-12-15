const dotenv = require('dotenv');
const connectDB = require('./config/mongodb');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();
    const email = 'admin@nexus.com';
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const hashed = await bcrypt.hash('admin123', 10);
    const admin = new User({ username: 'admin', email, password: hashed, role: 'admin' });
    await admin.save();
    console.log('Admin user created: admin@nexus.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
