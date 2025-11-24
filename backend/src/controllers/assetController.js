const { Asset, Product, Maintenance, AssetAssignment } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all assets with filtering
 */
const getAllAssets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status,
      condition,
      product_id
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { serial_number: { [Op.iLike]: `%${search}%` } },
        { asset_tag: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status) where.status = status;
    if (condition) where.condition = condition;
    if (product_id) where.product_id = product_id;

    const { count, rows } = await Asset.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'image_url']
        },
        {
          model: AssetAssignment,
          as: 'assignments',
          where: { status: 'active' },
          required: false,
          limit: 1
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        assets: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting assets:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get asset by ID with full history
 */
const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await Asset.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product'
        },
        {
          model: Maintenance,
          as: 'maintenances',
          limit: 5,
          order: [['scheduled_date', 'DESC']]
        },
        {
          model: AssetAssignment,
          as: 'assignments',
          limit: 5,
          order: [['assigned_date', 'DESC']]
        }
      ]
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    res.json({ success: true, data: asset });
  } catch (error) {
    console.error('Error getting asset:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Create new asset
 */
const createAsset = async (req, res) => {
  try {
    const {
      product_id,
      serial_number,
      asset_tag,
      status,
      condition,
      acquisition_date,
      purchase_price,
      warranty_expiry_date,
      location,
      specs,
      notes
    } = req.body;

    // Check for duplicate serial number
    const existingSerial = await Asset.findOne({ where: { serial_number } });
    if (existingSerial) {
      return res.status(400).json({ success: false, message: 'Serial number already exists' });
    }

    // Check for duplicate asset tag if provided
    if (asset_tag) {
      const existingTag = await Asset.findOne({ where: { asset_tag } });
      if (existingTag) {
        return res.status(400).json({ success: false, message: 'Asset tag already exists' });
      }
    }

    const asset = await Asset.create({
      product_id,
      serial_number,
      asset_tag,
      status,
      condition,
      acquisition_date,
      purchase_price,
      warranty_expiry_date,
      location,
      specs,
      notes
    });

    res.status(201).json({ success: true, data: asset, message: 'Asset created successfully' });
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update asset
 */
const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Check uniqueness constraints if changing
    if (updateData.serial_number && updateData.serial_number !== asset.serial_number) {
      const existingSerial = await Asset.findOne({ where: { serial_number: updateData.serial_number } });
      if (existingSerial) {
        return res.status(400).json({ success: false, message: 'Serial number already exists' });
      }
    }

    if (updateData.asset_tag && updateData.asset_tag !== asset.asset_tag) {
      const existingTag = await Asset.findOne({ where: { asset_tag: updateData.asset_tag } });
      if (existingTag) {
        return res.status(400).json({ success: false, message: 'Asset tag already exists' });
      }
    }

    await asset.update(updateData);

    res.json({ success: true, data: asset, message: 'Asset updated successfully' });
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Delete asset
 */
const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findByPk(id);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Instead of hard delete, maybe mark as disposed?
    // For now, we'll allow delete but it might fail if there are constraints
    await asset.destroy();

    res.json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Assign asset to user
 */
const assignAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, department, expected_return_date, condition_on_assign } = req.body;

    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    if (asset.status === 'in_use') {
      return res.status(400).json({ success: false, message: 'Asset is already in use' });
    }

    // Create assignment
    await AssetAssignment.create({
      asset_id: id,
      assigned_to,
      department,
      assigned_date: new Date(),
      expected_return_date,
      condition_on_assign,
      status: 'active'
    });

    // Update asset status
    await asset.update({ status: 'in_use' });

    res.json({ success: true, message: 'Asset assigned successfully' });
  } catch (error) {
    console.error('Error assigning asset:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Return asset
 */
const returnAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { condition_on_return, notes } = req.body;

    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Find active assignment
    const assignment = await AssetAssignment.findOne({
      where: { asset_id: id, status: 'active' }
    });

    if (!assignment) {
      return res.status(400).json({ success: false, message: 'Asset is not currently assigned' });
    }

    // Close assignment
    await assignment.update({
      status: 'returned',
      return_date: new Date(),
      condition_on_return
    });

    // Update asset status
    await asset.update({ 
      status: 'in_stock',
      condition: condition_on_return || asset.condition // Update condition if provided
    });

    res.json({ success: true, message: 'Asset returned successfully' });
  } catch (error) {
    console.error('Error returning asset:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  assignAsset,
  returnAsset
};
