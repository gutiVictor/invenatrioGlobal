const { Product, Category, Warehouse, InventoryMovement } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Obtener resumen general del dashboard
 */
const getSummary = async (req, res) => {
  try {
    // Total de equipos activos
    const totalEquipos = await Product.count({
      where: { active: true }
    });

    // Stock total disponible (suma de product_warehouse)
    const [stockResult] = await sequelize.query(`
      SELECT COALESCE(SUM(stock), 0) as total_stock
      FROM product_warehouse
    `);
    const equiposDisponibles = parseInt(stockResult[0]?.total_stock || 0);

    // Equipos con stock bajo
    const [stockBajoResult] = await sequelize.query(`
      SELECT COUNT(DISTINCT p.id) as count
      FROM products p
      LEFT JOIN product_warehouse pw ON p.id = pw.product_id
      WHERE p.active = true
      GROUP BY p.id, p.stock_min
      HAVING COALESCE(SUM(pw.stock), 0) < p.stock_min
    `);
    const stockBajo = stockBajoResult.length;

    // Mantenimientos próximos - DESHABILITADO
    const mantenimientosProximos = 0;

    // Movimientos del mes actual
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const movimientosMes = await InventoryMovement.count({
      where: {
        created_at: {
          [Op.gte]: startOfMonth
        }
      }
    });

    res.json({
      success: true,
      data: {
        total_equipos: totalEquipos,
        equipos_disponibles: equiposDisponibles,
        stock_bajo: stockBajo,
        mantenimientos_proximos: mantenimientosProximos,
        movimientos_mes: movimientosMes
      }
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen del dashboard'
    });
  }
};

/**
 * Obtener equipos por categoría
 */
const getEquiposPorCategoria = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        c.name as categoria,
        COALESCE(SUM(pw.stock), 0) as cantidad
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.active = true
      LEFT JOIN product_warehouse pw ON p.id = pw.product_id
      GROUP BY c.id, c.name
      HAVING COALESCE(SUM(pw.stock), 0) > 0
      ORDER BY cantidad DESC
    `);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error getting equipos por categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener equipos por categoría'
    });
  }
};

/**
 * Obtener equipos por almacén
 */
const getEquiposPorAlmacen = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        w.name as almacen,
        COALESCE(SUM(pw.stock), 0) as cantidad
      FROM warehouses w
      LEFT JOIN product_warehouse pw ON w.id = pw.warehouse_id
      WHERE w.active = true
      GROUP BY w.id, w.name
      ORDER BY cantidad DESC
    `);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error getting equipos por almacen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener equipos por almacén'
    });
  }
};

/**
 * Obtener productos con stock bajo
 */
const getStockBajo = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        p.id,
        p.name as producto,
        p.sku,
        COALESCE(SUM(pw.stock), 0) as stock_actual,
        p.stock_min,
        (p.stock_min - COALESCE(SUM(pw.stock), 0)) as diferencia
      FROM products p
      LEFT JOIN product_warehouse pw ON p.id = pw.product_id
      WHERE p.active = true
      GROUP BY p.id, p.name, p.sku, p.stock_min
      HAVING COALESCE(SUM(pw.stock), 0) < p.stock_min
      ORDER BY diferencia DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error getting stock bajo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos con stock bajo'
    });
  }
};

/**
 * Obtener mantenimientos próximos
 */
const getMantenimientosProximos = async (req, res) => {
  try {
    // DESHABILITADO - columnas no existen
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Error getting mantenimientos proximos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mantenimientos próximos'
    });
  }
};

/**
 * Obtener últimas entradas - SIMPLIFICADO
 */
const getUltimasEntradas = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        im.id,
        im.created_at as fecha,
        p.name as producto,
        p.sku,
        im.quantity as cantidad,
        w.name as almacen,
        im.reference as referencia
      FROM inventory_movements im
      LEFT JOIN products p ON im.product_id = p.id
      LEFT JOIN warehouses w ON im.warehouse_id = w.id
      WHERE im.type = 'entrada'
      ORDER BY im.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error getting ultimas entradas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener últimas entradas'
    });
  }
};

/**
 * Obtener últimas asignaciones - SIMPLIFICADO
 */
const getUltimasAsignaciones = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        im.id,
        im.created_at as fecha,
        p.name as producto,
        p.sku,
        im.quantity as cantidad,
        w.name as almacen,
        im.reference as referencia
      FROM inventory_movements im
      LEFT JOIN products p ON im.product_id = p.id
      LEFT JOIN warehouses w ON im.warehouse_id = w.id
      WHERE im.type = 'salida'
      ORDER BY im.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error getting ultimas asignaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener últimas asignaciones'
    });
  }
};

module.exports = {
  getSummary,
  getEquiposPorCategoria,
  getEquiposPorAlmacen,
  getStockBajo,
  getMantenimientosProximos,
  getUltimasEntradas,
  getUltimasAsignaciones
};
