const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/mongodb');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

const productRoutes = require('./routes/productRoutes');

// Routes
app.use('/api/products', productRoutes);
app.get('/', (req, res) => {
  res.send('Nexus PC World API is running');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
