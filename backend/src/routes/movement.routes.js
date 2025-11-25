const express = require('express');
const router = express.Router();
const movementController = require('../controllers/movementController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', movementController.getAllMovements);
router.get('/summary', movementController.getMonthlySummary);
router.get('/product/:productId', movementController.getProductMovements);
router.get('/:id', movementController.getMovementById);
router.post('/', movementController.createMovement);

module.exports = router;
