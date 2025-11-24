const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MaintenanceOrder = sequelize.define('maintenance_orders', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'serial_numbers',
      key: 'id'
    }
  },
  type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'maintenance_types',
      key: 'id'
    }
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('abierto', 'en_proceso', 'finalizado', 'cancelado'),
    defaultValue: 'abierto'
  },
  priority: {
    type: DataTypes.ENUM('baja', 'media', 'alta', 'critica'),
    defaultValue: 'media'
  },
  planned_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cost_parts: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  cost_labor: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  provider: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  technician_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'maintenance_orders',
  indexes: [
    {
      unique: true,
      fields: ['code']
    },
    {
      fields: ['asset_id']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = MaintenanceOrder;
