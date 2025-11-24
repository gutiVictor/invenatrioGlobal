const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Warehouse = sequelize.define('warehouses', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Campos básicos existentes
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  manager: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Obsoleto - usar manager_id'
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Nuevos campos de Fase 1
  
  // Ubicación completa
  state: {
    type: DataTypes.STRING(60),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(2),
    defaultValue: 'MX'
  },
  postal_code: {
    type: DataTypes.STRING(12),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: true
  },
  
  // Geolocalización
  timezone: {
    type: DataTypes.STRING(50),
    defaultValue: 'America/Mexico_City'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  
  // Lógica de negocio
  warehouse_type: {
    type: DataTypes.ENUM('CENTRAL', 'TRANSITO', 'DAÑADOS', 'VIRTUAL'),
    defaultValue: 'CENTRAL'
  },
  is_pickable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_saleable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Gestión
  manager_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  // Multi-tenant (futuro)
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  // Auditoría
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
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
  tableName: 'warehouses'
});

module.exports = Warehouse;
