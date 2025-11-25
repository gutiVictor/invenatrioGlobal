const { MaintenanceOrder, MaintenanceType, SerialNumber, Product, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all maintenances with filters
 */
const getAllMaintenances = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type_id,
      asset_id
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (type_id) where.type_id = type_id;
    if (asset_id) where.asset_id = asset_id;

    const { count, rows } = await MaintenanceOrder.findAndCountAll({
      where,
      include: [
        {
          model: SerialNumber,
          as: 'asset',
          attributes: ['id', 'serial', 'status'],
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku', 'brand', 'model']
          }]
        },
        {
          model: MaintenanceType,
          as: 'type',
          attributes: ['id', 'name', 'description']
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['planned_date', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        maintenances: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting maintenances:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get maintenances by product ID (all serial numbers of that product)
 */
const getMaintenancesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { status, type_id } = req.query;

    // First get all serial numbers for this product
    const serialNumbers = await SerialNumber.findAll({
      where: { product_id: productId },
      attributes: ['id']
    });

    const serialNumberIds = serialNumbers.map(sn => sn.id);

    if (serialNumberIds.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const where = {
      asset_id: { [Op.in]: serialNumberIds }
    };

    if (status) where.status = status;
    if (type_id) where.type_id = type_id;

    const maintenances = await MaintenanceOrder.findAll({
      where,
      include: [
        {
          model: SerialNumber,
          as: 'asset',
          attributes: ['id', 'serial', 'status'],
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku']
          }]
        },
        {
          model: MaintenanceType,
          as: 'type',
          attributes: ['id', 'name', 'description']
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        }
      ],
      order: [['planned_date', 'DESC']]
    });

    res.json({
      success: true,
      data: maintenances
    });
  } catch (error) {
    console.error('Error getting maintenances by product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get single maintenance by ID
 */
const getMaintenanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const maintenance = await MaintenanceOrder.findByPk(id, {
      include: [
        {
          model: SerialNumber,
          as: 'asset',
          attributes: ['id', 'serial', 'status'],
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku', 'brand', 'model']
          }]
        },
        {
          model: MaintenanceType,
          as: 'type',
          attributes: ['id', 'name', 'description']
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Maintenance not found' });
    }

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Error getting maintenance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Create maintenance order
 */
const createMaintenance = async (req, res) => {
  try {
    const {
      asset_id,
      type_id,
      description,
      status,
      priority,
      planned_date,
      technician_id,
      provider,
      notes
    } = req.body;

    // Validate that serial number exists
    const serialNumber = await SerialNumber.findByPk(asset_id);
    if (!serialNumber) {
      return res.status(404).json({ success: false, message: 'Serial number not found' });
    }

    // Validate maintenance type exists
    const maintenanceType = await MaintenanceType.findByPk(type_id);
    if (!maintenanceType) {
      return res.status(404).json({ success: false, message: 'Maintenance type not found' });
    }

    // Generate unique code
    const timestamp = Date.now().toString().slice(-8);
    const code = `MNT-${timestamp}`;

    const maintenance = await MaintenanceOrder.create({
      asset_id,
      type_id,
      code,
      description,
      status: status || 'abierto',
      priority: priority || 'media',
      planned_date,
      technician_id,
      provider,
      notes,
      created_by: req.user.id
    });

    // If status is in_process, update serial number status to maintenance
    if (status === 'en_proceso') {
      await serialNumber.update({ status: 'maintenance' });
    }

    // Fetch the created maintenance with includes
    const createdMaintenance = await MaintenanceOrder.findByPk(maintenance.id, {
      include: [
        {
          model: SerialNumber,
          as: 'asset',
          attributes: ['id', 'serial', 'status'],
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku']
          }]
        },
        {
          model: MaintenanceType,
          as: 'type',
          attributes: ['id', 'name', 'description']
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({ 
      success: true, 
      data: createdMaintenance, 
      message: 'Maintenance scheduled successfully' 
    });
  } catch (error) {
    console.error('Error creating maintenance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update maintenance order
 */
const updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.user.id };

    const maintenance = await MaintenanceOrder.findByPk(id);
    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Maintenance not found' });
    }

    const oldStatus = maintenance.status;
    await maintenance.update(updateData);

    // Update serial number status based on maintenance status
    const serialNumber = await SerialNumber.findByPk(maintenance.asset_id);
    if (serialNumber) {
      if (updateData.status === 'en_proceso' && oldStatus !== 'en_proceso') {
        await serialNumber.update({ status: 'maintenance' });
      } else if (updateData.status === 'finalizado' && oldStatus !== 'finalizado') {
        await serialNumber.update({ status: 'available' });
      } else if (updateData.status === 'cancelado') {
        await serialNumber.update({ status: 'available' });
      }
    }

    // Set end_date if status is finalizado
    if (updateData.status === 'finalizado' && !maintenance.end_date) {
      await maintenance.update({ end_date: new Date() });
    }

    // Set start_date if status is en_proceso and not set
    if (updateData.status === 'en_proceso' && !maintenance.start_date) {
      await maintenance.update({ start_date: new Date() });
    }

    // Fetch updated maintenance with includes
    const updatedMaintenance = await MaintenanceOrder.findByPk(id, {
      include: [
        {
          model: SerialNumber,
          as: 'asset',
          attributes: ['id', 'serial', 'status'],
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku']
          }]
        },
        {
          model: MaintenanceType,
          as: 'type',
          attributes: ['id', 'name', 'description']
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({ 
      success: true, 
      data: updatedMaintenance, 
      message: 'Maintenance updated successfully' 
    });
  } catch (error) {
    console.error('Error updating maintenance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get all maintenance types
 */
const getMaintenanceTypes = async (req, res) => {
  try {
    const types = await MaintenanceType.findAll({
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Error getting maintenance types:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllMaintenances,
  getMaintenancesByProduct,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  getMaintenanceTypes
};
