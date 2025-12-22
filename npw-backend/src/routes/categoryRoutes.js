const express = require('express');
const router = express.Router();
const csrfProtection = require('../middleware/csrfMiddleware');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const controller = require('../controllers/categoryController');

// Public read
router.get('/', controller.getCategories);

// Admin CRUD
router.post('/', csrfProtection, verifyToken, requireAdmin, controller.createCategory);
router.put('/:id', csrfProtection, verifyToken, requireAdmin, controller.updateCategory);
router.delete('/:id', csrfProtection, verifyToken, requireAdmin, controller.deleteCategory);

// Subcategories management
router.post('/:id/subcategories', csrfProtection, verifyToken, requireAdmin, controller.addSubcategory);
router.delete('/:id/subcategories/:sub', csrfProtection, verifyToken, requireAdmin, controller.removeSubcategory);

module.exports = router;
