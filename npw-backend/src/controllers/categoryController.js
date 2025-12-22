const Category = require('../models/Category');
const Product = require('../models/Product');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load categories' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, subcategories } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Category already exists' });
    const cat = new Category({ name, subcategories: Array.isArray(subcategories) ? subcategories : [] });
    await cat.save();
    return res.status(201).json({ category: cat });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create category' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subcategories } = req.body;
    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    if (name) cat.name = name;
    if (Array.isArray(subcategories)) cat.subcategories = subcategories;
    await cat.save();
    return res.json({ category: cat });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update category' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    // Optionally clear category/subCategory in products referencing this category
    await Product.updateMany({ category: cat.name }, { $unset: { category: "", subCategory: "" } }).catch(() => {});
    await cat.deleteOne();
    return res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete category' });
  }
};

const addSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { sub } = req.body;
    if (!sub) return res.status(400).json({ message: 'Subcategory is required' });
    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    if (!cat.subcategories.includes(sub)) cat.subcategories.push(sub);
    await cat.save();
    return res.json({ category: cat });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to add subcategory' });
  }
};

const removeSubcategory = async (req, res) => {
  try {
    const { id, sub } = req.params;
    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    cat.subcategories = cat.subcategories.filter(s => s !== sub);
    await cat.save();
    // Clear subCategory on products that referenced this subcategory
    await Product.updateMany({ subCategory: sub }, { $unset: { subCategory: "" } }).catch(() => {});
    return res.json({ category: cat });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to remove subcategory' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  removeSubcategory
};
