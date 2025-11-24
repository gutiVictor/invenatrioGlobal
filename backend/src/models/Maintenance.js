const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Maintenance = sequelize.define('maintenances', {
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
  type: {
    type: DataTypes.ENUM('preventive', 'corrective', 'upgrade'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  },
  scheduled_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  completion_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  performed_by: {
    type: DataTypes.STRING(150),
    allowNull: true,
    comment: 'Technician or Vendor name'
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'maintenances'
});

module.exports = Maintenance;
