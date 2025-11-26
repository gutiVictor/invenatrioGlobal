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
        COUNT(a.id) as cantidad
      FROM categories c
      INNER JOIN products p ON c.id = p.category_id
      INNER JOIN assets a ON p.id = a.product_id
      WHERE a.status NOT IN ('retired', 'disposed', 'stolen')
      GROUP BY c.id, c.name
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
 * Obtener equipos próximos a mantenimiento (30 días)
 */
const getEquiposMantenimientoProximo = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        m.id,
        a.serial_number,
        p.name as producto,
        m.scheduled_date as fecha_programada,
        m.type as tipo_mantenimiento,
        (m.scheduled_date::date - CURRENT_DATE) as dias_restantes
      FROM maintenances m
      INNER JOIN assets a ON m.asset_id = a.id
      INNER JOIN products p ON a.product_id = p.id
      WHERE m.status = 'scheduled'
        AND m.scheduled_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + 30)
      ORDER BY m.scheduled_date ASC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error getting equipos mantenimiento proximo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener equipos próximos a mantenimiento'
    });
  }
};

/**
 * Obtener garantías por vencer (60 días)
 */
const getGarantiasPorVencer = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        a.id,
        a.serial_number,
        a.asset_tag,
        p.name as producto,
        a.warranty_expiry_date as fecha_vencimiento,
        (a.warranty_expiry_date::date - CURRENT_DATE) as dias_restantes,
        a.purchase_price as valor
      FROM assets a
      INNER JOIN products p ON a.product_id = p.id
      WHERE a.warranty_expiry_date IS NOT NULL
        AND a.warranty_expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + 60)
        AND a.status NOT IN ('retired', 'disposed', 'stolen')
      ORDER BY a.warranty_expiry_date ASC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error getting garantias por vencer:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener garantías por vencer'
    });
  }
};

/**
 * Obtener equipos en reparación prolongada (>15 días)
 */
const getEquiposReparacionProlongada = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        a.id,
        a.serial_number,
        a.asset_tag,
        p.name as producto,
        a.location as ubicacion,
        (CURRENT_DATE - a.updated_at::date) as dias_en_reparacion,
        a.notes as notas
      FROM assets a
      INNER JOIN products p ON a.product_id = p.id
      WHERE a.status = 'under_repair'
        AND a.updated_at::date < (CURRENT_DATE - 15)
      ORDER BY a.updated_at ASC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error getting equipos reparacion prolongada:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener equipos en reparación prolongada'
    });
  }
};

/**
 * Obtener asignaciones vencidas
 */
const getAsignacionesVencidas = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        aa.id,
        a.serial_number,
        p.name as producto,
        aa.assigned_to as asignado_a,
        aa.department as departamento,
        aa.expected_return_date as fecha_esperada,
        (CURRENT_DATE - aa.expected_return_date::date) as dias_retraso
      FROM asset_assignments aa
      INNER JOIN assets a ON aa.asset_id = a.id
      INNER JOIN products p ON a.product_id = p.id
      WHERE aa.status = 'active'
        AND aa.expected_return_date IS NOT NULL
        AND aa.expected_return_date < CURRENT_DATE
      ORDER BY aa.expected_return_date ASC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error getting asignaciones vencidas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener asignaciones vencidas'
    });
  }
};

/**
 * Obtener equipos por estado
 */
const getEquiposPorEstado = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        a.status as estado,
        COUNT(*) as cantidad
      FROM assets a
      GROUP BY a.status
      ORDER BY cantidad DESC
    `);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error getting equipos por estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener equipos por estado'
    });
  }
};

/**
 * Obtener valor total del inventario
 */
const getValorInventario = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        a.status as estado,
        COUNT(*) as cantidad,
        COALESCE(SUM(a.purchase_price), 0) as valor_total
      FROM assets a
      WHERE a.purchase_price IS NOT NULL
      GROUP BY a.status
      ORDER BY valor_total DESC
    `);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error getting valor inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener valor del inventario'
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
  getEquiposMantenimientoProximo,
  getGarantiasPorVencer,
  getEquiposReparacionProlongada,
  getAsignacionesVencidas,
  getEquiposPorEstado,
  getValorInventario,
  getUltimasEntradas,
  getUltimasAsignaciones
};

