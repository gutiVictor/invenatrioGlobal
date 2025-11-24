const { Warehouse } = require('../models');

async function check() {
  try {
    const count = await Warehouse.count();
    console.log(`Total warehouses: ${count}`);
    const warehouses = await Warehouse.findAll();
    console.log(JSON.stringify(warehouses, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

check();
