const authRoutes = require('./auth.routes');
const productRoutes = require('./products.routes');
const categoryRoutes = require('./categories.routes');
const assetRoutes = require('./assets.routes');
const maintenanceRoutes = require('./maintenance.routes');
const warehouseRoutes = require('./warehouses.routes');
const supplierRoutes = require('./suppliers.routes');

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
        suppliers: '/api/suppliers'
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

  // Ruta 404
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Ruta no encontrada'
    });
  });
};

module.exports = setupRoutes;
