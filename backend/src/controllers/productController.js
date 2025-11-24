const { Product, Category } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtener todos los productos
 */
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      category_id,
      active = 'true'
    } = req.query;

    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
        { barcode: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (category_id) {
      where.category_id = category_id;
    }

    if (active !== 'all') {
      where.active = active === 'true';
    }

    // Consultar productos
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        products: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Obtener un producto por ID
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Crear nuevo producto
 */
const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      barcode,
      description,
      category_id,
      supplier_id,
      price,
      cost,
      stock_min,
      stock_max,
      image_url,
      unit,
      admission_date,
      active
    } = req.body;

    // Validar campos requeridos
    if (!name || !sku || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, SKU y categoría son requeridos'
      });
    }

    // Verificar que el SKU no exista
    const existingSku = await Product.findOne({ where: { sku } });
    if (existingSku) {
      return res.status(400).json({
        success: false,
        message: 'El SKU ya existe'
      });
    }

    // Verificar barcode si se proporciona
    if (barcode) {
      const existingBarcode = await Product.findOne({ where: { barcode } });
      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: 'El código de barras ya existe'
        });
      }
    }

    // Verificar que la categoría existe
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Crear producto
    console.log('Creating product with data:', {
      name, sku, barcode, category_id, supplier_id, price, cost, stock_min, stock_max, unit, admission_date
    });

    const product = await Product.create({
      name,
      sku,
      barcode: barcode || null,
      description,
      category_id,
      supplier_id: supplier_id || null,
      price: price || 0,
      cost: cost || 0,
      stock_min: stock_min || 0,
      stock_max: stock_max || null,
      image_url,
      unit: unit || 'unidad',
      admission_date: admission_date || new Date(),
      active: active !== undefined ? active : true
    });

    // Obtener producto con categoría
    const productWithCategory = await Product.findByPk(product.id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });

    res.status(201).json({
      success: true,
      data: productWithCategory,
      message: 'Producto creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear producto DETAILED:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor: ' + error.message
    });
  }
};

/**
 * Actualizar producto
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar SKU único si se está actualizando
    if (updateData.sku && updateData.sku !== product.sku) {
      const existingSku = await Product.findOne({
        where: { sku: updateData.sku }
      });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: 'El SKU ya existe'
        });
      }
    }

    // Verificar barcode único si se está actualizando
    if (updateData.barcode && updateData.barcode !== product.barcode) {
      const existingBarcode = await Product.findOne({
        where: { barcode: updateData.barcode }
      });
      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: 'El código de barras ya existe'
        });
      }
    }

    // Actualizar
    await product.update(updateData);

    // Obtener producto actualizado con categoría
    const updatedProduct = await Product.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Eliminar producto (soft delete)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Soft delete
    await product.update({ active: false });

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
