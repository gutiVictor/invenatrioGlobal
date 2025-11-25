const { InventoryMovement, Product, Warehouse, User, Supplier } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Get all inventory movements with filters
 */
const getAllMovements = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      product_id,
      warehouse_id,
      start_date,
      end_date
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (type) where.type = type;
    if (product_id) where.product_id = product_id;
    if (warehouse_id) where.warehouse_id = warehouse_id;

    if (start_date && end_date) {
      where.movement_date = {
        [Op.between]: [start_date, end_date]
      };
    } else if (start_date) {
      where.movement_date = {
        [Op.gte]: start_date
      };
    } else if (end_date) {
      where.movement_date = {
        [Op.lte]: end_date
      };
    }

    const { count, rows } = await InventoryMovement.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'unit']
        },
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Warehouse,
          as: 'warehouseDest',
          attributes: ['id', 'name', 'code'],
          required: false
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name', 'code'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['movement_date', 'DESC'], ['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        movements: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting movements:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get movement by ID
 */
const getMovementById = async (req, res) => {
  try {
    const { id } = req.params;

    const movement = await InventoryMovement.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'unit', 'brand', 'model']
        },
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Warehouse,
          as: 'warehouseDest',
          attributes: ['id', 'name', 'code'],
          required: false
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Supplier,
          as: 'supplier',
          required: false
        }
      ]
    });

    if (!movement) {
      return res.status(404).json({ success: false, message: 'Movement not found' });
    }

    res.json({
      success: true,
      data: movement
    });
  } catch (error) {
    console.error('Error getting movement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Create inventory movement
 */
const createMovement = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      type,
      product_id,
      warehouse_id,
      warehouse_dest_id,
      quantity,
      unit_cost,
      unit_price,
      movement_date,
      reference,
      notes,
      batch_code,
      serial_numbers,
      expiration_date,
      customer_id,
      supplier_id
    } = req.body;

    // Validations
    if (!type || !product_id || !warehouse_id || !quantity) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Type, product, warehouse, and quantity are required' 
      });
    }

    if (quantity === 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Quantity cannot be zero' 
      });
    }

    // Validate product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Validate warehouse exists
    const warehouse = await Warehouse.findByPk(warehouse_id);
    if (!warehouse) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    // For transferencia, validate destination warehouse
    if (type === 'transferencia') {
      if (!warehouse_dest_id) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false, 
          message: 'Destination warehouse is required for transfers' 
        });
      }

      if (warehouse_id === warehouse_dest_id) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false, 
          message: 'Destination warehouse must be different from origin warehouse' 
        });
      }

      const warehouseDest = await Warehouse.findByPk(warehouse_dest_id);
      if (!warehouseDest) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Destination warehouse not found' });
      }
    }

    // For salida and transferencia, check stock availability
    if (type === 'salida' || type === 'transferencia') {
      const [productWarehouse] = await sequelize.query(
        `SELECT stock FROM product_warehouse WHERE product_id = :product_id AND warehouse_id = :warehouse_id`,
        {
          replacements: { product_id, warehouse_id },
          type: sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      const availableStock = productWarehouse?.stock || 0;
      const requiredQuantity = Math.abs(quantity);

      if (availableStock < requiredQuantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock. Available: ${availableStock}, Required: ${requiredQuantity}` 
        });
      }
    }

    // Calculate total cost
    const total_cost = unit_cost ? (Math.abs(quantity) * parseFloat(unit_cost)).toFixed(2) : null;

    // Create movement
    const movement = await InventoryMovement.create({
      type,
      product_id,
      warehouse_id,
      warehouse_dest_id: type === 'transferencia' ? warehouse_dest_id : null,
      quantity,
      unit_cost,
      unit_price,
      total_cost,
      movement_date: movement_date || new Date(),
      reference,
      notes,
      batch_code,
      serial_numbers,
      expiration_date,
      customer_id,
      supplier_id,
      created_by: req.user.id
    }, { transaction });

    await transaction.commit();

    // Fetch created movement with includes
    const createdMovement = await InventoryMovement.findByPk(movement.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'unit']
        },
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Warehouse,
          as: 'warehouseDest',
          attributes: ['id', 'name', 'code'],
          required: false
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json({ 
      success: true, 
      data: createdMovement, 
      message: 'Movement created successfully' 
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating movement:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Get product movement history
 */
const getProductMovements = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 50 } = req.query;

    const movements = await InventoryMovement.findAll({
      where: { product_id: productId },
      include: [
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Warehouse,
          as: 'warehouseDest',
          attributes: ['id', 'name', 'code'],
          required: false
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        }
      ],
      limit: parseInt(limit),
      order: [['movement_date', 'DESC'], ['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: movements
    });
  } catch (error) {
    console.error('Error getting product movements:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get monthly summary
 */
const getMonthlySummary = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month } = req.query;

    let dateFilter = {};
    if (month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      dateFilter = {
        movement_date: {
          [Op.between]: [startDate, endDate]
        }
      };
    } else {
      dateFilter = {
        movement_date: {
          [Op.gte]: new Date(year, 0, 1),
          [Op.lte]: new Date(year, 11, 31)
        }
      };
    }

    const summary = await InventoryMovement.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.fn('ABS', sequelize.col('quantity'))), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('total_cost')), 'total_value']
      ],
      where: dateFilter,
      group: ['type'],
      raw: true
    });

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllMovements,
  getMovementById,
  createMovement,
  getProductMovements,
  getMonthlySummary
};
