const { Supplier } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtener todos los proveedores
 */
const getAllSuppliers = async (req, res) => {
  try {
    const { active = 'true', search = '' } = req.query;

    const where = {};

    if (active !== 'all') {
      where.active = active === 'true';
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { contact: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const suppliers = await Supplier.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Obtener proveedor por ID
 */
const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    res.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Crear proveedor
 */
const createSupplier = async (req, res) => {
  try {
    const { 
      name, code, tax_id, email, phone, mobile, 
      address, city, country, payment_terms_days, 
      contact_person, notes 
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y código son requeridos'
      });
    }

    // Validar código único
    const existingCode = await Supplier.findOne({ where: { code } });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: 'El código de proveedor ya existe'
      });
    }

    const supplier = await Supplier.create({
      name,
      code,
      tax_id,
      email,
      phone,
      mobile,
      address,
      city,
      country,
      payment_terms_days,
      contact_person,
      notes
    });

    res.status(201).json({
      success: true,
      data: supplier,
      message: 'Proveedor creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Actualizar proveedor
 */
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    await supplier.update(updateData);

    res.json({
      success: true,
      data: supplier,
      message: 'Proveedor actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Eliminar proveedor (soft delete)
 */
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    await supplier.update({ active: false });

    res.json({
      success: true,
      message: 'Proveedor eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
