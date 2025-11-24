const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET - Obtener todos los productos
router.get('/', productController.getAllProducts);

// GET - Obtener un producto por ID
router.get('/:id', productController.getProductById);

// POST - Crear producto (solo admin y manager)
router.post('/', authorize('admin', 'manager'), productController.createProduct);

// PUT - Actualizar producto (solo admin y manager)
router.put('/:id', authorize('admin', 'manager'), productController.updateProduct);

// DELETE - Eliminar producto (solo admin)
router.delete('/:id', authorize('admin'), productController.deleteProduct);

module.exports = router;
