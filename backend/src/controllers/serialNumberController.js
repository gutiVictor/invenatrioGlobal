const { SerialNumber, Product, Warehouse, MaintenanceOrder } = require('../models');

// Obtener todos los seriales con filtros
exports.getAllSerialNumbers = async (req, res) => {
  try {
    const { status, warehouse_id, product_id, search } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (warehouse_id) where.warehouse_id = warehouse_id;
    if (product_id) where.product_id = product_id;
    if (search) {
      where.serial = { [Op.iLike]: `%${search}%` };
    }

    const serialNumbers = await SerialNumber.findAll({
      where,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'brand', 'model']
        },
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(serialNumbers);
  } catch (error) {
    console.error('Error al obtener seriales:', error);
    res.status(500).json({ message: 'Error al obtener números de serie', error: error.message });
  }
};

// Obtener un serial por ID
exports.getSerialNumberById = async (req, res) => {
  try {
    const { id } = req.params;

    const serialNumber = await SerialNumber.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'brand', 'model', 'warranty_months']
        },
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['id', 'name', 'code', 'city']
        },
        {
          model: MaintenanceOrder,
          as: 'maintenanceOrders',
          limit: 10,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!serialNumber) {
      return res.status(404).json({ message: 'Número de serie no encontrado' });
    }

    res.json(serialNumber);
  } catch (error) {
    console.error('Error al obtener serial:', error);
    res.status(500).json({ message: 'Error al obtener número de serie', error: error.message });
  }
};

// Buscar serial por número
exports.findBySerial = async (req, res) => {
  try {
    const { serial } = req.params;

    const serialNumber = await SerialNumber.findOne({
      where: { serial },
      include: [
        {
          model: Product,
          as: 'product'
        },
        {
          model: Warehouse,
          as: 'warehouse'
        },
        {
          model: MaintenanceOrder,
          as: 'maintenanceOrders',
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!serialNumber) {
      return res.status(404).json({ message: 'Número de serie no encontrado' });
    }

    res.json(serialNumber);
  } catch (error) {
    console.error('Error al buscar serial:', error);
    res.status(500).json({ message: 'Error al buscar número de serie', error: error.message });
  }
};

// Crear nuevo serial
exports.createSerialNumber = async (req, res) => {
  try {
    const { product_id, serial, warehouse_id, notes } = req.body;

    // Validar que el producto existe
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar que el serial no exista para ese producto
    const existing = await SerialNumber.findOne({
      where: { product_id, serial }
    });

    if (existing) {
      return res.status(400).json({ message: 'El número de serie ya existe para este producto' });
    }

    const serialNumber = await SerialNumber.create({
      product_id,
      serial,
      warehouse_id,
      notes,
      status: 'available'
    });

    const created = await SerialNumber.findByPk(serialNumber.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Warehouse, as: 'warehouse' }
      ]
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error al crear serial:', error);
    res.status(500).json({ message: 'Error al crear número de serie', error: error.message });
  }
};

// Actualizar estado de serial
exports.updateSerialStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, warehouse_id, notes } = req.body;

    const serialNumber = await SerialNumber.findByPk(id);
    if (!serialNumber) {
      return res.status(404).json({ message: 'Número de serie no encontrado' });
    }

    await serialNumber.update({
      status: status || serialNumber.status,
      warehouse_id: warehouse_id !== undefined ? warehouse_id : serialNumber.warehouse_id,
      notes: notes !== undefined ? notes : serialNumber.notes
    });

    const updated = await SerialNumber.findByPk(id, {
      include: [
        { model: Product, as: 'product' },
        { model: Warehouse, as: 'warehouse' }
      ]
    });

    res.json(updated);
  } catch (error) {
    console.error('Error al actualizar serial:', error);
    res.status(500).json({ message: 'Error al actualizar número de serie', error: error.message });
  }
};

// Eliminar serial
exports.deleteSerialNumber = async (req, res) => {
  try {
    const { id } = req.params;

    const serialNumber = await SerialNumber.findByPk(id);
    if (!serialNumber) {
      return res.status(404).json({ message: 'Número de serie no encontrado' });
    }

    // Verificar que no tenga órdenes de mantenimiento activas
    const activeOrders = await MaintenanceOrder.count({
      where: {
        asset_id: id,
        status: ['abierto', 'en_proceso']
      }
    });

    if (activeOrders > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar. El equipo tiene órdenes de mantenimiento activas' 
      });
    }

    await serialNumber.destroy();
    res.json({ message: 'Número de serie eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar serial:', error);
    res.status(500).json({ message: 'Error al eliminar número de serie', error: error.message });
  }
};

// Obtener historial de un serial
exports.getSerialHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const serialNumber = await SerialNumber.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product'
        },
        {
          model: MaintenanceOrder,
          as: 'maintenanceOrders',
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!serialNumber) {
      return res.status(404).json({ message: 'Número de serie no encontrado' });
    }

    res.json({
      serial: serialNumber,
      history: serialNumber.maintenanceOrders
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ message: 'Error al obtener historial', error: error.message });
  }
};
