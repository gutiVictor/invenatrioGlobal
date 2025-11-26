const { sequelize } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function createAssetTables() {
  try {
    console.log('🚀 Iniciando creación de tablas de activos IT...\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../../../create_asset_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar el SQL
    await sequelize.query(sql);

    console.log('✅ Tablas creadas exitosamente!\n');

    // Verificar que las tablas existen
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('assets', 'asset_assignments', 'maintenances')
      ORDER BY table_name;
    `);

    console.log('📋 Tablas verificadas:');
    tables.forEach(table => {
      console.log(`   ✓ ${table.table_name}`);
    });

    // Contar registros
    const [counts] = await sequelize.query(`
      SELECT 
        'assets' as table_name, COUNT(*) as record_count FROM assets
      UNION ALL
      SELECT 
        'asset_assignments' as table_name, COUNT(*) as record_count FROM asset_assignments
      UNION ALL
      SELECT 
        'maintenances' as table_name, COUNT(*) as record_count FROM maintenances;
    `);

    console.log('\n📊 Registros en cada tabla:');
    counts.forEach(count => {
      console.log(`   ${count.table_name}: ${count.record_count} registros`);
    });

    console.log('\n✨ Migración completada con éxito!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear las tablas:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createAssetTables();
