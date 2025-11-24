const express = require('express');
const router = express.Router();
const serialNumberController = require('../controllers/serialNumberController');
const { authenticate } = require('../middleware/auth');

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// Rutas de Serial Numbers
router.get('/', serialNumberController.getAllSerialNumbers);
router.get('/:id', serialNumberController.getSerialNumberById);
router.get('/search/:serial', serialNumberController.findBySerial);
router.get('/:id/history', serialNumberController.getSerialHistory);
router.post('/', serialNumberController.createSerialNumber);
router.put('/:id', serialNumberController.updateSerialStatus);
router.delete('/:id', serialNumberController.deleteSerialNumber);

module.exports = router;
