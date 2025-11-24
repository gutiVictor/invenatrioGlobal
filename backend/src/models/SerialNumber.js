const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SerialNumber = sequelize.define('serial_numbers', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  serial: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'sold', 'damaged', 'RMA', 'maintenance'),
    defaultValue: 'available'
  },
  warehouse_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'warehouses',
      key: 'id'
    }
  },
  movement_in_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'inventory_movements',
      key: 'id'
    }
  },
  movement_out_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'inventory_movements',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  tableName: 'serial_numbers',
  indexes: [
    {
      unique: true,
      fields: ['product_id', 'serial']
    },
    {
      fields: ['status']
    },
    {
      fields: ['warehouse_id']
    }
  ]
});

module.exports = SerialNumber;
