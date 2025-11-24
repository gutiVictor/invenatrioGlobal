const bcrypt = require('bcryptjs');
const { User } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function resetAdminPassword() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Generar hash de la contraseña
    const password = 'Admin123!';
    const passwordHash = await bcrypt.hash(password, 12);
    console.log('🔑 Hash generado:', passwordHash);

    // Buscar o crear usuario admin
    const [user, created] = await User.findOrCreate({
      where: { email: 'admin@inventario.com' },
      defaults: {
        name: 'Administrador',
        email: 'admin@inventario.com',
        password_hash: passwordHash,
        role: 'admin',
        active: true
      }
    });

    if (!created) {
      // Actualizar password si ya existía
      await user.update({ password_hash: passwordHash });
      console.log('✅ Password del admin actualizado');
    } else {
      console.log('✅ Usuario admin creado');
    }

    console.log('\n📧 Email: admin@inventario.com');
    console.log('🔐 Password: Admin123!');
    console.log('\n✅ Ahora puedes hacer login con estas credenciales\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetAdminPassword();
