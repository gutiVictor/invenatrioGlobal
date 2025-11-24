const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Warehouse = require('./Warehouse');
const Supplier = require('./Supplier');

// Nuevos modelos de trazabilidad y mantenimiento
const SerialNumber = require('./SerialNumber');
const MaintenanceType = require('./MaintenanceType');
const MaintenanceOrder = require('./MaintenanceOrder');
const MaintenanceItem = require('./MaintenanceItem');
const AuditLog = require('./AuditLog');

// ========================================
// RELACIONES DE MODELOS
// ========================================

// Relación Product-Category
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

// Relación Product-SerialNumber
Product.hasMany(SerialNumber, {
  foreignKey: 'product_id',
  as: 'serialNumbers'
});

SerialNumber.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

// Relación SerialNumber-Warehouse
SerialNumber.belongsTo(Warehouse, {
  foreignKey: 'warehouse_id',
  as: 'warehouse'
});

Warehouse.hasMany(SerialNumber, {
  foreignKey: 'warehouse_id',
  as: 'serialNumbers'
});

// Relación SerialNumber-MaintenanceOrder
SerialNumber.hasMany(MaintenanceOrder, {
  foreignKey: 'asset_id',
  as: 'maintenanceOrders'
});

MaintenanceOrder.belongsTo(SerialNumber, {
  foreignKey: 'asset_id',
  as: 'asset'
});

// Relación MaintenanceOrder-MaintenanceType
MaintenanceOrder.belongsTo(MaintenanceType, {
  foreignKey: 'type_id',
  as: 'type'
});

MaintenanceType.hasMany(MaintenanceOrder, {
  foreignKey: 'type_id',
  as: 'orders'
});

// Relación MaintenanceOrder-User (técnico)
MaintenanceOrder.belongsTo(User, {
  foreignKey: 'technician_id',
  as: 'technician'
});

User.hasMany(MaintenanceOrder, {
  foreignKey: 'technician_id',
  as: 'assignedMaintenances'
});

// Relación MaintenanceOrder-User (creador)
MaintenanceOrder.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

// Relación MaintenanceOrder-MaintenanceItem
MaintenanceOrder.hasMany(MaintenanceItem, {
  foreignKey: 'order_id',
  as: 'items'
});

MaintenanceItem.belongsTo(MaintenanceOrder, {
  foreignKey: 'order_id',
  as: 'order'
});

// Relación MaintenanceItem-Product
MaintenanceItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

Product.hasMany(MaintenanceItem, {
  foreignKey: 'product_id',
  as: 'maintenanceItems'
});

// Relación Warehouse-User (manager)
Warehouse.belongsTo(User, {
  foreignKey: 'manager_id',
  as: 'managerUser'
});

User.hasMany(Warehouse, {
  foreignKey: 'manager_id',
  as: 'managedWarehouses'
});

// Relación AuditLog-User
AuditLog.belongsTo(User, {
  foreignKey: 'changed_by',
  as: 'user'
});

User.hasMany(AuditLog, {
  foreignKey: 'changed_by',
  as: 'auditLogs'
});

// ========================================
// EXPORTAR MODELOS
// ========================================

module.exports = {
  User,
  Category,
  Product,
  Warehouse,
  Supplier,
  SerialNumber,
  MaintenanceType,
  MaintenanceOrder,
  MaintenanceItem,
  AuditLog
};
