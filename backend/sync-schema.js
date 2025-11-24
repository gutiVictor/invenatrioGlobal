const { sequelize } = require('./src/config/database');
const { Product } = require('./src/models');

async function syncSchema() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync Product model to add new column
    await Product.sync({ alter: true });
    console.log('✅ Product table updated successfully');

  } catch (error) {
    console.error('❌ Error syncing schema:', error);
  } finally {
    await sequelize.close();
  }
}

syncSchema();
