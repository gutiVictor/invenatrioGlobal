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

// ===== NUEVAS RUTAS PARA ACTIVOS IT =====

// GET /api/dashboard/equipos-mantenimiento-proximo - Equipos próximos a mantenimiento (30 días)
router.get('/equipos-mantenimiento-proximo', dashboardController.getEquiposMantenimientoProximo);

// GET /api/dashboard/garantias-por-vencer - Garantías por vencer (60 días)
router.get('/garantias-por-vencer', dashboardController.getGarantiasPorVencer);

// GET /api/dashboard/equipos-reparacion-prolongada - Equipos en reparación >15 días
router.get('/equipos-reparacion-prolongada', dashboardController.getEquiposReparacionProlongada);

// GET /api/dashboard/asignaciones-vencidas - Asignaciones pasadas de fecha
router.get('/asignaciones-vencidas', dashboardController.getAsignacionesVencidas);

// GET /api/dashboard/equipos-por-estado - Distribución por estado
router.get('/equipos-por-estado', dashboardController.getEquiposPorEstado);

// GET /api/dashboard/valor-inventario - Valor total por estado
router.get('/valor-inventario', dashboardController.getValorInventario);

// ===== RUTAS EXISTENTES =====

// GET /api/dashboard/ultimas-entradas - Últimas 5 entradas
router.get('/ultimas-entradas', dashboardController.getUltimasEntradas);

// GET /api/dashboard/ultimas-asignaciones - Últimas 5 salidas
router.get('/ultimas-asignaciones', dashboardController.getUltimasAsignaciones);

module.exports = router;

