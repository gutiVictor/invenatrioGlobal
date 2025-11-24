const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Asset = require('./Asset');
const Maintenance = require('./Maintenance');
const AssetAssignment = require('./AssetAssignment');
const Warehouse = require('./Warehouse');
const Supplier = require('./Supplier');

// Definir relaciones
Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products'
});

// Relación Product-Supplier
Product.belongsTo(Supplier, {
  foreignKey: 'supplier_id',
  as: 'supplier'
});

Supplier.hasMany(Product, {
  foreignKey: 'supplier_id',
  as: 'products'
});

// Relaciones de Activos
Product.hasMany(Asset, {
  foreignKey: 'product_id',
  as: 'assets'
});

Asset.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

Asset.hasMany(Maintenance, {
  foreignKey: 'asset_id',
  as: 'maintenances'
});

Maintenance.belongsTo(Asset, {
  foreignKey: 'asset_id',
  as: 'asset'
});

Asset.hasMany(AssetAssignment, {
  foreignKey: 'asset_id',
  as: 'assignments'
});

AssetAssignment.belongsTo(Asset, {
  foreignKey: 'asset_id',
  as: 'asset'
});

module.exports = {
  User,
  Category,
  Product,
  Asset,
  Maintenance,
  AssetAssignment,
  Warehouse,
  Supplier
};
