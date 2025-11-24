const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticate, authorize } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas públicas (para usuarios autenticados)
router.get('/', supplierController.getAllSuppliers);
router.get('/:id', supplierController.getSupplierById);

// Rutas protegidas (solo admin y manager)
router.post('/', authorize('admin', 'manager'), supplierController.createSupplier);
router.put('/:id', authorize('admin', 'manager'), supplierController.updateSupplier);
router.delete('/:id', authorize('admin'), supplierController.deleteSupplier);

module.exports = router;
