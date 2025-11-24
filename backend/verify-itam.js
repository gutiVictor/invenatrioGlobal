const { sequelize } = require('./src/config/database');
const { Product, Category, Asset, Maintenance, AssetAssignment } = require('./src/models');

async function verifyITAM() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Use force: true for new tables to avoid ALTER TABLE syntax errors with Sequelize/Postgres
    // This will drop and recreate these tables, which is fine for this verification script
    await Asset.sync({ force: true });
    await Maintenance.sync({ force: true });
    await AssetAssignment.sync({ force: true });
    console.log('✅ New models synced (recreated)');

    // 1. Create Category
    const [category] = await Category.findOrCreate({
      where: { name: 'Laptops' },
      defaults: { description: 'Portable computers' }
    });
    console.log('✅ Category created/found:', category.name);

    // 2. Create Product
    const [product] = await Product.findOrCreate({
      where: { sku: 'DELL-LAT-5420' },
      defaults: {
        name: 'Dell Latitude 5420',
        category_id: category.id,
        price: 1200,
        cost: 1000,
        stock_min: 5
      }
    });
    console.log('✅ Product created/found:', product.name);

    // 3. Create Asset
    const asset = await Asset.create({
      product_id: product.id,
      serial_number: `SN-${Date.now()}`, // Unique SN
      asset_tag: `IT-${Date.now()}`,
      status: 'in_stock',
      condition: 'new',
      acquisition_date: new Date(),
      specs: { ram: '16GB', cpu: 'i7', storage: '512GB SSD' }
    });
    console.log('✅ Asset created:', asset.serial_number);

    // 4. Assign Asset
    const assignment = await AssetAssignment.create({
      asset_id: asset.id,
      assigned_to: 'John Doe',
      department: 'Engineering',
      assigned_date: new Date(),
      status: 'active'
    });
    await asset.update({ status: 'in_use' });
    console.log('✅ Asset assigned to:', assignment.assigned_to);

    // 5. Create Maintenance
    const maintenance = await Maintenance.create({
      asset_id: asset.id,
      type: 'preventive',
      status: 'scheduled',
      scheduled_date: new Date(Date.now() + 86400000), // Tomorrow
      description: 'Annual cleaning'
    });
    console.log('✅ Maintenance scheduled:', maintenance.description);

    // 6. Verify History
    const assetWithHistory = await Asset.findByPk(asset.id, {
      include: ['assignments', 'maintenances']
    });
    
    console.log('\n--- Asset History ---');
    console.log('Assignments:', assetWithHistory.assignments.length);
    console.log('Maintenances:', assetWithHistory.maintenances.length);

    if (assetWithHistory.assignments.length === 1 && assetWithHistory.maintenances.length === 1) {
      console.log('\n✅ VERIFICATION SUCCESSFUL');
    } else {
      console.error('\n❌ VERIFICATION FAILED: Missing history');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

verifyITAM();
