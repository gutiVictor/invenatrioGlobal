const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/dashboard/summary - Resumen general
router.get('/summary', dashboardController.getSummary);

// GET /api/dashboard/equipos-por-categoria - Distribución por categoría
router.get('/equipos-por-categoria', dashboardController.getEquiposPorCategoria);

// GET /api/dashboard/equipos-por-almacen - Distribución por almacén
router.get('/equipos-por-almacen', dashboardController.getEquiposPorAlmacen);

// GET /api/dashboard/stock-bajo - Productos con stock bajo
router.get('/stock-bajo', dashboardController.getStockBajo);

// GET /api/dashboard/mantenimientos-proximos - Mantenimientos en los próximos 30 días
router.get('/mantenimientos-proximos', dashboardController.getMantenimientosProximos);

// GET /api/dashboard/ultimas-entradas - Últimas 5 entradas
router.get('/ultimas-entradas', dashboardController.getUltimasEntradas);

// GET /api/dashboard/ultimas-asignaciones - Últimas 5 salidas
router.get('/ultimas-asignaciones', dashboardController.getUltimasAsignaciones);

module.exports = router;
