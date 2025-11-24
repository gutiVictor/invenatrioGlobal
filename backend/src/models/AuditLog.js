const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('audit_logs', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  table_name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  record_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  old_values: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  new_values: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  changed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  changed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'audit_logs'
});

module.exports = AuditLog;
