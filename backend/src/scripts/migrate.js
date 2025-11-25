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

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migración de base de datos...\n');
    
    // Leer el archivo SQL (usando el script sin comandos psql)
    const sqlPath = path.join(__dirname, '..', '..', '..', 'database_init_clean.sql');
    console.log(`📄 Leyendo: ${sqlPath}\n`);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar el SQL
    await client.query(sql);
    
    console.log('\n✅ Migración completada exitosamente!');
    console.log('📊 Base de datos actualizada con:');
    console.log('   - 13 tablas');
    console.log('   - 5 vistas de reportes');
    console.log('   - 2 triggers automáticos');
    console.log('   - Datos iniciales');
    
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
