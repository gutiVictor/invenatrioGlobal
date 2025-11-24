const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');

async function runMigration() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conectado exitosamente');

    const migrationPath = path.join(__dirname, '002_enhance_warehouses.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`No se encontró el archivo de migración: ${migrationPath}`);
    }

    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Ejecutando migración 002_enhance_warehouses.sql...');
    await sequelize.query(migrationSql);
    
    console.log('✅ Migración ejecutada exitosamente');
    console.log('');
    console.log('📋 Resumen:');
    console.log('  - Campos de auditoría: updated_at, created_by, updated_by');
    console.log('  - Campos de ubicación: country, state, postal_code, email');
    console.log('  - Campos de lógica: warehouse_type, is_pickable, is_saleable');
    console.log('  - Campos futuros: company_id, branch_id (NULL permitido)');
    console.log('');
    console.log('⚠️  NOTA: Los datos existentes NO fueron modificados');
    console.log('⚠️  NOTA: Aún NO se actualizó el backend ni el frontend');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
