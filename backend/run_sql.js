const { sequelize } = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function runSql() {
  try {
    const sqlPath = path.join(__dirname, 'create_missing_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing SQL...');
    await sequelize.query(sql);
    console.log('SQL executed successfully');
  } catch (error) {
    console.error('Error executing SQL:', error);
  }
}

runSql();
