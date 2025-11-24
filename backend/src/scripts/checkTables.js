const { sequelize } = require('../config/database');

async function checkTables() {
  try {
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('Tables in DB:', tables);
  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

checkTables();
