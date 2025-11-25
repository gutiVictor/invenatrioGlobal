const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('customers', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  tax_id: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(60),
    allowNull: true
  },
  postal_code: {
    type: DataTypes.STRING(12),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(2),
    allowNull: true
  },
  payment_terms_days: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  credit_limit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
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
  tableName: 'customers',
  indexes: [
    {
      unique: true,
      fields: ['code']
    },
    {
      fields: ['active']
    }
  ]
});

module.exports = Customer;
