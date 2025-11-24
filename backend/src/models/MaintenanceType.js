const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MaintenanceType = sequelize.define('maintenance_types', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: false,
  tableName: 'maintenance_types'
});

module.exports = MaintenanceType;
