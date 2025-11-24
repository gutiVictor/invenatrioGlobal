const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_change_this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

async function debugLogin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const email = 'admin@inventario.com';
    const password = 'Admin123!';

    console.log('Login attempt for:', email);

    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    console.log('User found:', user ? 'YES' : 'NO');

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return;
    }

    // Actualizar last_login
    console.log('Attempting to update last_login...');
    try {
        await user.update({ last_login: new Date() });
        console.log('✅ Last login updated');
    } catch (err) {
        console.error('❌ Error updating last_login:', err);
    }

    // Generar token
    console.log('Attempting to generate token...');
    try {
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });
        console.log('✅ Token generated:', token);
    } catch (err) {
        console.error('❌ Error generating token:', err);
    }

  } catch (error) {
    console.error('❌ Global Error:', error);
  } finally {
    await sequelize.close();
  }
}

debugLogin();
