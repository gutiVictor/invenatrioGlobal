const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('products', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  barcode: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  warranty_months: {
    type: DataTypes.INTEGER,
    defaultValue: 12,
    validate: {
      min: 0
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  stock_min: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  stock_max: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  unit: {
    type: DataTypes.STRING(20),
    defaultValue: 'unidad'
  },
  is_serializable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_batchable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  maintenance_cycle_days: {
    type: DataTypes.INTEGER,
    defaultValue: 180,
    validate: {
      min: 0
    }
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
  tableName: 'products'
});

module.exports = Product;
