const { Warehouse } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtener todos los almacenes
 */
const getAllWarehouses = async (req, res) => {
  try {
    const { active = 'true', search = '' } = req.query;

    const where = {};

    if (active !== 'all') {
      where.active = active === 'true';
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const warehouses = await Warehouse.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: warehouses
    });
  } catch (error) {
    console.error('Error al obtener almacenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Obtener almacén por ID
 */
const getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;

    const warehouse = await Warehouse.findByPk(id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Almacén no encontrado'
      });
    }

    res.json({
      success: true,
      data: warehouse
    });
  } catch (error) {
    console.error('Error al obtener almacén:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Crear almacén
 */
const createWarehouse = async (req, res) => {
  try {
    // Extraer todos los campos del body
    const {
      name, code, address, city, state, country, postal_code,
      phone, email, manager_id, warehouse_type,
      is_pickable, is_saleable, latitude, longitude, timezone
    } = req.body;

    const userId = req.user ? req.user.id : null;

    // Validaciones básicas
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y código son requeridos'
      });
    }

    // Validar código único
    const existingCode = await Warehouse.findOne({ where: { code } });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: 'El código de almacén ya existe'
      });
    }

    const warehouse = await Warehouse.create({
      name,
      code,
      address,
      city,
      state,
      country,
      postal_code,
      phone,
      email,
      manager_id,
      warehouse_type: warehouse_type || 'CENTRAL',
      is_pickable: is_pickable !== undefined ? is_pickable : true,
      is_saleable: is_saleable !== undefined ? is_saleable : true,
      latitude,
      longitude,
      timezone,
      created_by: userId,
      updated_by: userId
    });

    res.status(201).json({
      success: true,
      data: warehouse,
      message: 'Almacén creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear almacén:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Actualizar almacén
 */
const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user ? req.user.id : null;

    const warehouse = await Warehouse.findByPk(id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Almacén no encontrado'
      });
    }

    // Validar código único si cambia
    if (updateData.code && updateData.code !== warehouse.code) {
      const existingCode = await Warehouse.findOne({ 
        where: { 
          code: updateData.code,
          id: { [Op.ne]: id }
        } 
      });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: 'El código de almacén ya existe'
        });
      }
    }

    await warehouse.update({
      ...updateData,
      updated_by: userId
    });

    res.json({
      success: true,
      data: warehouse,
      message: 'Almacén actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar almacén:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Eliminar almacén (soft delete)
 */
const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const warehouse = await Warehouse.findByPk(id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Almacén no encontrado'
      });
    }

    await warehouse.update({
      active: false,
      updated_by: userId
    });

    res.json({
      success: true,
      message: 'Almacén eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar almacén:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

module.exports = {
  getAllWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
};
