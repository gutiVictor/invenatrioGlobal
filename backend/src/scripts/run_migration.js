const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, 'migration_categories.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected.');

    console.log('Executing migration...');
    await sequelize.query(sql);
    console.log('Migration executed successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
