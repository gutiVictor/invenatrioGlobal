const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../config/jwt');

/**
 * Login de usuario
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    console.log('Login attempt for:', email);

    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    console.log('User found:', user ? 'YES' : 'NO');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si está activo
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo. Contacte al administrador'
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Actualizar last_login
    await user.update({ last_login: new Date() });
    console.log('Last login updated');

    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    console.log('Token generated');

    // Responder
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Error en login DETAILED:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor: ' + error.message
    });
  }
};

/**
 * Obtener datos del usuario autenticado
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Registrar nuevo usuario (solo admin)
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validar campos
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y contraseña son requeridos'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Hash de la contraseña
    const password_hash = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password_hash,
      role: role || 'viewer'
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'Usuario creado exitosamente'
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

module.exports = {
  login,
  getProfile,
  register
};
