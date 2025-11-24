const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('categories', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  code: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: true
  },
  slug: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'categories'
});

// Relación auto-referencial
Category.belongsTo(Category, {
  foreignKey: 'parent_id',
  as: 'parent'
});

Category.hasMany(Category, {
  foreignKey: 'parent_id',
  as: 'subcategories'
});

module.exports = Category;
