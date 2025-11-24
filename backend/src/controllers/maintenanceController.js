const { Maintenance, Asset, Product } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all maintenances
 */
const getAllMaintenances = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      asset_id
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (asset_id) where.asset_id = asset_id;

    const { count, rows } = await Maintenance.findAndCountAll({
      where,
      include: [{
        model: Asset,
        as: 'asset',
        attributes: ['id', 'serial_number', 'asset_tag'],
        include: [{
          model: Product,
          as: 'product',
          attributes: ['name']
        }]
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['scheduled_date', 'DESC']]
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
 * Create maintenance
 */
const createMaintenance = async (req, res) => {
  try {
    const {
      asset_id,
      type,
      status,
      scheduled_date,
      performed_by,
      description,
      cost
    } = req.body;

    const maintenance = await Maintenance.create({
      asset_id,
      type,
      status: status || 'scheduled',
      scheduled_date,
      performed_by,
      description,
      cost
    });

    // If status is in_progress, maybe update asset status to under_repair?
    if (status === 'in_progress') {
      await Asset.update({ status: 'under_repair' }, { where: { id: asset_id } });
    }

    res.status(201).json({ success: true, data: maintenance, message: 'Maintenance scheduled successfully' });
  } catch (error) {
    console.error('Error creating maintenance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update maintenance
 */
const updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const maintenance = await Maintenance.findByPk(id);
    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Maintenance not found' });
    }

    await maintenance.update(updateData);

    // Logic to update asset status based on maintenance completion
    if (updateData.status === 'completed') {
      // Check if asset was under repair, maybe move back to in_stock?
      // This logic depends on business rules, keeping it simple for now.
      const asset = await Asset.findByPk(maintenance.asset_id);
      if (asset && asset.status === 'under_repair') {
        await asset.update({ status: 'in_stock' });
      }
    }

    res.json({ success: true, data: maintenance, message: 'Maintenance updated successfully' });
  } catch (error) {
    console.error('Error updating maintenance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllMaintenances,
  createMaintenance,
  updateMaintenance
};
