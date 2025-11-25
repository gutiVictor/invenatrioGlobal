const authRoutes = require('./auth.routes');
const productRoutes = require('./products.routes');
const categoryRoutes = require('./categories.routes');
const assetRoutes = require('./assets.routes');
const maintenanceRoutes = require('./maintenance.routes');
const warehouseRoutes = require('./warehouses.routes');
const supplierRoutes = require('./suppliers.routes');
const serialNumberRoutes = require('./serialNumber.routes');
const movementRoutes = require('./movement.routes');
const auditRoutes = require('./audit.routes');
const dashboardRoutes = require('./dashboard.routes');

const setupRoutes = (app) => {
  // Ruta de bienvenida
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'API Sistema de Inventario Global',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        products: '/api/products',
        categories: '/api/categories',
        assets: '/api/assets',
        maintenance: '/api/maintenance',
        warehouses: '/api/warehouses',
        suppliers: '/api/suppliers',
        serialNumbers: '/api/serial-numbers',
        movements: '/api/movements',
        audit: '/api/audit',
        dashboard: '/api/dashboard'
      }
    });
  });

  // Rutas de API
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/assets', assetRoutes);
  app.use('/api/maintenance', maintenanceRoutes);
  app.use('/api/warehouses', warehouseRoutes);
  app.use('/api/suppliers', supplierRoutes);
  app.use('/api/serial-numbers', serialNumberRoutes);
  app.use('/api/movements', movementRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // Ruta 404
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Ruta no encontrada'
    });
  });
};

module.exports = setupRoutes;
