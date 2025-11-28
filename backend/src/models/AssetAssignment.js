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
    comment: 'Employee Name'
  },
  employee_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Employee ID from HR system for integration'
  },
  employee_email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: {
      isEmail: true
    },
    comment: 'Email address for notifications and contact'
  },
  employee_phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Phone number for contact'
  },
  job_title: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Job title or position of the employee'
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
  },
  physical_location: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Physical location where the asset is being used'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes about the assignment'
  },
  assigned_by: {
    type: DataTypes.STRING(150),
    allowNull: true,
    comment: 'User who authorized this assignment'
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'asset_assignments'
});

module.exports = AssetAssignment;
