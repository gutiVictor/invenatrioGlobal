const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InventoryMovement = sequelize.define('inventory_movements', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('entrada', 'salida', 'transferencia', 'ajuste'),
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  warehouse_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'warehouses',
      key: 'id'
    }
  },
  warehouse_dest_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'warehouses',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notZero(value) {
        if (value === 0) {
          throw new Error('Quantity cannot be zero');
        }
      }
    }
  },
  unit_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  total_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  movement_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  reference: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  batch_code: {
    type: DataTypes.STRING(40),
    allowNull: true
  },
  serial_numbers: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expiration_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'suppliers',
      key: 'id'
    }
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'inventory_movements',
  indexes: [
    {
      fields: ['product_id', 'movement_date']
    },
    {
      fields: ['type']
    },
    {
      fields: ['warehouse_id']
    },
    {
      fields: ['movement_date']
    }
  ]
});

module.exports = InventoryMovement;
