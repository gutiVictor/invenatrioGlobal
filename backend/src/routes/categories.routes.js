const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas públicas (para usuarios autenticados)
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Rutas protegidas (Admin/Manager)
router.post('/', authorize('admin', 'manager'), categoryController.createCategory);
router.put('/:id', authorize('admin', 'manager'), categoryController.updateCategory);

// Rutas protegidas (Solo Admin)
router.delete('/:id', authorize('admin'), categoryController.deleteCategory);

module.exports = router;
