const { sequelize } = require('../config/database');
const models = require('../models');

async function syncDatabase() {
  try {
    console.log('🔄 Sincronizando modelos con la base de datos...\n');
    
    // Sincronizar todos los modelos
    // alter: true modificará las tablas existentes para que coincidan con los modelos
    await sequelize.sync({ alter: true });
    
    console.log('\n✅ Sincronización completada exitosamente!');
    console.log('📊 Todos los modelos están sincronizados con la base de datos');
    console.log('\nCambios aplicados:');
    console.log('   - Campos nuevos agregados a tablas existentes');
    console.log('   - Tablas nuevas creadas si no existían');
    console.log('   - Índices actualizados');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante la sincronización:', error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  }
}

syncDatabase();
