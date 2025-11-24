const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MaintenanceItem = sequelize.define('maintenance_items', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'maintenance_orders',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  unit_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  task: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  done: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  tableName: 'maintenance_items'
});

module.exports = MaintenanceItem;
