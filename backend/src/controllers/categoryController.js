const { Category } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtener todas las categorías
 */
const getAllCategories = async (req, res) => {
  try {
    const { active = 'true', search = '' } = req.query;
    
    const where = {};
    
    if (active !== 'all') {
      where.active = active === 'true';
    }

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const categories = await Category.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Obtener categoría por ID
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Crear nueva categoría
 */
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es requerido'
      });
    }

    const category = await Category.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Categoría creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Actualizar categoría
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, active } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    await category.update({
      name,
      description,
      active
    });

    res.json({
      success: true,
      data: category,
      message: 'Categoría actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Eliminar categoría (Soft Delete)
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar si tiene productos asociados antes de eliminar
    // Esto es opcional pero recomendado para integridad
    // const productsCount = await Product.count({ where: { category_id: id } });
    // if (productsCount > 0) { ... }

    await category.update({ active: false });

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
