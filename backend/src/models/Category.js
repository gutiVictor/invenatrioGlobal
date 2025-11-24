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
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
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
