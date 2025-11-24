const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { authenticate, authorize } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas públicas (para usuarios autenticados)
router.get('/', warehouseController.getAllWarehouses);
router.get('/:id', warehouseController.getWarehouseById);

// Rutas protegidas (solo admin y manager)
router.post('/', authorize('admin', 'manager'), warehouseController.createWarehouse);
router.put('/:id', authorize('admin', 'manager'), warehouseController.updateWarehouse);
router.delete('/:id', authorize('admin'), warehouseController.deleteWarehouse);

module.exports = router;
