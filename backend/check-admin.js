const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const email = 'admin@inventario.com';
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log('❌ Admin user NOT found');
    } else {
      console.log('✅ Admin user found:', user.email);
      console.log('   Role:', user.role);
      console.log('   Active:', user.active);
      
      const isMatch = await bcrypt.compare('Admin123!', user.password_hash);
      console.log('   Password Match:', isMatch ? 'YES' : 'NO');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkAdmin();
