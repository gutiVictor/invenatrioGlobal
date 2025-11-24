const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Asset = sequelize.define('assets', {
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
  serial_number: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  asset_tag: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    comment: 'Internal inventory tag'
  },
  status: {
    type: DataTypes.ENUM('in_use', 'in_stock', 'under_repair', 'retired', 'stolen', 'disposed'),
    defaultValue: 'in_stock'
  },
  condition: {
    type: DataTypes.ENUM('new', 'good', 'fair', 'poor', 'broken'),
    defaultValue: 'new'
  },
  acquisition_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  purchase_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  warranty_expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  retirement_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Physical location or Warehouse ID'
  },
  specs: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Technical specifications (RAM, CPU, etc.)'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'assets'
});

module.exports = Asset;
