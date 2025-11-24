const { sequelize } = require('./src/config/database');

async function fixConstraint() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Drop the foreign key constraint
    await sequelize.query('ALTER TABLE products DROP CONSTRAINT IF EXISTS products_supplier_id_fkey');
    console.log('✅ Constraint products_supplier_id_fkey dropped');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

fixConstraint();
