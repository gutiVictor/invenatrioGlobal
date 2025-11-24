const { sequelize } = require('../config/database');
const { User, MaintenanceType } = require('../models');

async function checkData() {
  try {
    console.log('Checking required data for trigger...');
    
    // Check User 1
    const user = await sequelize.query('SELECT * FROM users WHERE id = 1', { type: sequelize.QueryTypes.SELECT });
    console.log('User ID 1:', user.length > 0 ? 'EXISTS' : 'MISSING');
    if(user.length > 0) console.log(user[0]);

    // Check Maintenance Type 'Preventivo'
    const type = await sequelize.query("SELECT * FROM maintenance_types WHERE name = 'Preventivo'", { type: sequelize.QueryTypes.SELECT });
    console.log("Maintenance Type 'Preventivo':", type.length > 0 ? 'EXISTS' : 'MISSING');
    if(type.length > 0) console.log(type[0]);

  } catch (error) {
    console.error('Error checking data:', error);
  }
}

checkData();
