const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');
const setupRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARES GLOBALES
// ========================================

// Seguridad (con configuración relajada para desarrollo)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS - Permitir todas las origenes en desarrollo
app.use(cors({
  origin: true, // Permitir todas las origenes en desarrollo
  credentials: true
}));

// Servir archivos estáticos
app.use(express.static('public'));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting - Configuración más permisiva para desarrollo
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Aumentado de 100 a 1000 para desarrollo
  message: {
    success: false,
    message: 'Demasiadas peticiones, por favor intenta más tarde'
  }
});

app.use('/api/', limiter);

// ========================================
// RUTAS
// ========================================

setupRoutes(app);

// ========================================
// MANEJO DE ERRORES GLOBAL
// ========================================

app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Error de clave única
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'El valor ya existe',
      field: err.errors[0]?.path
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
});

// ========================================
// INICIAR SERVIDOR
// ========================================

const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Base de datos: ${process.env.DB_NAME}`);
      console.log(`\n📡 Endpoints disponibles:`);
      console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
      console.log(`   - GET  http://localhost:${PORT}/api/auth/profile`);
      console.log(`   - GET  http://localhost:${PORT}/api/products`);
      console.log(`   - POST http://localhost:${PORT}/api/products`);
      console.log(`\n✅ Servidor listo para recibir peticiones\n`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar
startServer();

// Manejo graceful de cierre
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

module.exports = app;
