const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

// Rutas públicas
router.post('/login', authController.login);

// Rutas protegidas
router.get('/profile', authenticate, authController.getProfile);

// Solo admin puede registrar usuarios
router.post('/register', authenticate, authorize('admin'), authController.register);

module.exports = router;
