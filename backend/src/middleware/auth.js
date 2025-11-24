const { verifyToken } = require('../config/jwt');
const { User } = require('../models');

/**
 * Middleware de autenticación
 * Verifica que el usuario tenga un token válido
 */
const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar token
    const decoded = verifyToken(token);

    // Buscar usuario
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    // Agregar usuario al request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

/**
 * Middleware de autorización por roles
 * @param {Array} roles - Roles permitidos
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para realizar esta acción'
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
