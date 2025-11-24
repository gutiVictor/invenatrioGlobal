const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticate } = require('../middleware/auth');

// Apply auth middleware
router.use(authenticate);

router.get('/', assetController.getAllAssets);
router.get('/:id', assetController.getAssetById);
router.post('/', assetController.createAsset);
router.put('/:id', assetController.updateAsset);
router.delete('/:id', assetController.deleteAsset);

// Custom actions
router.post('/:id/assign', assetController.assignAsset);
router.post('/:id/return', assetController.returnAsset);

module.exports = router;
