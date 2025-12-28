const Product = require('../models/Product');

const parseOptionalDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const normalizeCode = (code) => {
  if (typeof code !== 'string') return null;
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return null;
  // Accept only the same format enforced by the schema: NPW-XXXXXX
  if (!/^NPW-[A-Z0-9]{6}$/.test(trimmed)) return null;
  return trimmed;
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: { $ne: false } }).select('-stockHistory');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get inactive products (admin)
// @route   GET /api/products/inactive
// @access  Private/Admin
const getInactiveProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: false }).select('-stockHistory');
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('-stockHistory');
    if (product && product.isActive === false) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { price, code } = req.body;

    // Prevent clients from injecting stock history; use the stock-in endpoint instead.
    if (req.body && Object.hasOwn(req.body, 'stockHistory')) {
      delete req.body.stockHistory;
    }

    if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
      return res.status(400).json({ message: 'Invalid price. Price must be a non-negative number.' });
    }

    if (code !== undefined) {
      const normalized = normalizeCode(code);
      if (!normalized) {
        return res.status(400).json({ message: 'Invalid code. Code must match format NPW-XXXXXX.' });
      }
      req.body.code = normalized;
    }

    const product = new Product(req.body);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    // Prevent clients from injecting stock history; use the stock-in endpoint instead.
    if (req.body && Object.hasOwn(req.body, 'stockHistory')) {
      delete req.body.stockHistory;
    }

    if (req.body && Object.hasOwn(req.body, 'isActive') && typeof req.body.isActive !== 'boolean') {
      return res.status(400).json({ message: 'Invalid isActive. Must be a boolean.' });
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      const { price, code } = req.body;
      if (price !== undefined && (typeof price !== 'number' || Number.isNaN(price) || price < 0)) {
        return res.status(400).json({ message: 'Invalid price. Price must be a non-negative number.' });
      }

      if (code !== undefined) {
        const normalized = normalizeCode(code);
        if (!normalized) {
          return res.status(400).json({ message: 'Invalid code. Code must match format NPW-XXXXXX.' });
        }
        req.body.code = normalized;
      }

      Object.assign(product, req.body);
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Stock in (add stock + record history)
// @route   POST /api/products/:id/stock-in
// @access  Private/Admin
const stockInProduct = async (req, res) => {
  try {
    const quantity = Number(req.body?.quantity);
    const sellingUnitPrice = Number(req.body?.sellingUnitPrice);
    const buyingUnitPrice = req.body?.buyingUnitPrice === undefined || req.body?.buyingUnitPrice === null || req.body?.buyingUnitPrice === ''
      ? undefined
      : Number(req.body.buyingUnitPrice);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity. Quantity must be a positive number.' });
    }
    if (!Number.isFinite(sellingUnitPrice) || sellingUnitPrice < 0) {
      return res.status(400).json({ message: 'Invalid sellingUnitPrice. Must be a non-negative number.' });
    }
    if (buyingUnitPrice !== undefined && (!Number.isFinite(buyingUnitPrice) || buyingUnitPrice < 0)) {
      return res.status(400).json({ message: 'Invalid buyingUnitPrice. Must be a non-negative number if provided.' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const date = parseOptionalDate(req.body?.date) || new Date();

    const record = {
      date,
      quantity,
      sellingUnitPrice
    };

    if (buyingUnitPrice !== undefined) {
      record.buyingUnitPrice = buyingUnitPrice;
    }

    product.stockHistory = Array.isArray(product.stockHistory) ? product.stockHistory : [];
    product.stockHistory.unshift(record);

    product.stock = Number(product.stock || 0) + quantity;
    // Keep product.price as the current selling price.
    product.price = sellingUnitPrice;

    await product.save();

    const productJson = product.toJSON();
    delete productJson.stockHistory;

    return res.status(201).json({ product: productJson, record });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// @desc    Get stock-in history
// @route   GET /api/products/:id/stock-in/history
// @access  Private/Admin
const getStockInHistory = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('stockHistory');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json({ history: product.stockHistory || [] });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getInactiveProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  stockInProduct,
  getStockInHistory
};
