const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', maintenanceController.getAllMaintenances);
router.post('/', maintenanceController.createMaintenance);
router.put('/:id', maintenanceController.updateMaintenance);

module.exports = router;
