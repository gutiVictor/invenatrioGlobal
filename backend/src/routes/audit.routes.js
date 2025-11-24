const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate } = require('../middleware/auth');

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// Rutas de Audit Logs
router.get('/', auditController.getAuditLogs);
router.get('/stats', auditController.getAuditStats);
router.get('/:id', auditController.getAuditLogById);
router.get('/table/:table_name', auditController.getLogsByTable);
router.get('/table/:table_name/record/:record_id', auditController.getLogsByRecord);
router.get('/user/:user_id', auditController.getLogsByUser);
router.post('/', auditController.createAuditLog);

module.exports = router;
