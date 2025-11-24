const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function addMissingColumns() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Agregando campos faltantes a las tablas...\n');
    
    // Leer el archivo SQL (está en la raíz del proyecto)
    const sqlPath = path.join(__dirname, '..', '..', '..', 'add_missing_columns.sql');
    console.log(`📄 Leyendo: ${sqlPath}\n`);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar el SQL
    await client.query(sql);
    
    console.log('\n✅ Campos agregados exitosamente!');
    console.log('📊 Tablas actualizadas:');
    console.log('   - users: phone, email_verified_at, must_reset_password');
    console.log('   - products: brand, model, warranty_months, is_serializable, is_batchable, maintenance_cycle_days, created_by, updated_by');
    console.log('   - suppliers: state, postal_code, lead_time_days, created_by, updated_by, updated_at');
    console.log('\n🔄 Reinicia el backend para aplicar los cambios');
    
  } catch (error) {
    console.error('\n❌ Error al agregar campos:', error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

addMissingColumns();
