const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AssetAssignment = sequelize.define('asset_assignments', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'assets',
      key: 'id'
    }
  },
  assigned_to: {
    type: DataTypes.STRING(150),
    allowNull: false,
    comment: 'Employee Name or ID'
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  assigned_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  return_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  expected_return_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'returned'),
    defaultValue: 'active'
  },
  condition_on_assign: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  condition_on_return: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'asset_assignments'
});

module.exports = AssetAssignment;
