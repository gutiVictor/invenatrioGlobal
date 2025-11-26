const { sequelize } = require('../config/database');

async function createSampleAssets() {
  try {
    console.log('🚀 Creando datos de prueba para activos IT...\n');

    // Obtener productos existentes
    const [products] = await sequelize.query(`
      SELECT id, name FROM products WHERE active = true LIMIT 5
    `);

    if (products.length === 0) {
      console.log('❌ No hay productos en la base de datos. Crea productos primero.');
      process.exit(1);
    }

    console.log(`📦 Encontrados ${products.length} productos:`);
    products.forEach(p => console.log(`   - ${p.name} (ID: ${p.id})`));
    console.log('');

    // Crear activos de prueba
    const assetsData = [
      {
        product_id: products[0].id,
        serial_number: 'SN-2024-001-LAPTOP',
        asset_tag: 'IT-LAP-001',
        status: 'in_use',
        condition: 'good',
        acquisition_date: '2024-01-15',
        purchase_price: 1500000,
        warranty_expiry_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 días
        location: 'Oficina Principal - Piso 2',
        specs: JSON.stringify({ ram: '16GB', cpu: 'Intel i7-1165G7', storage: '512GB SSD', os: 'Windows 11 Pro' })
      },
      {
        product_id: products[1]?.id || products[0].id,
        serial_number: 'SN-2024-002-LAPTOP',
        asset_tag: 'IT-LAP-002',
        status: 'in_stock',
        condition: 'new',
        acquisition_date: '2024-02-20',
        purchase_price: 1800000,
        warranty_expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 180 días
        location: 'Almacén Central',
        specs: JSON.stringify({ ram: '32GB', cpu: 'Intel i9-12900H', storage: '1TB SSD', os: 'Windows 11 Pro' })
      },
      {
        product_id: products[2]?.id || products[0].id,
        serial_number: 'SN-2023-003-LAPTOP',
        asset_tag: 'IT-LAP-003',
        status: 'under_repair',
        condition: 'fair',
        acquisition_date: '2023-06-10',
        purchase_price: 1200000,
        warranty_expiry_date: '2025-06-10',
        location: 'Taller de Reparación',
        specs: JSON.stringify({ ram: '8GB', cpu: 'Intel i5-1135G7', storage: '256GB SSD', os: 'Windows 10 Pro' })
      },
      {
        product_id: products[3]?.id || products[0].id,
        serial_number: 'SN-2024-004-DESKTOP',
        asset_tag: 'IT-DES-001',
        status: 'in_use',
        condition: 'good',
        acquisition_date: '2024-03-01',
        purchase_price: 2500000,
        warranty_expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días
        location: 'Oficina Desarrollo',
        specs: JSON.stringify({ ram: '64GB', cpu: 'AMD Ryzen 9 5950X', storage: '2TB NVMe', os: 'Windows 11 Pro' })
      }
    ];

    console.log('💾 Insertando activos...');
    for (const asset of assetsData) {
      await sequelize.query(`
        INSERT INTO assets (product_id, serial_number, asset_tag, status, condition, acquisition_date, purchase_price, warranty_expiry_date, location, specs, created_at, updated_at)
        VALUES (:product_id, :serial_number, :asset_tag, :status, :condition, :acquisition_date, :purchase_price, :warranty_expiry_date, :location, :specs, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, {
        replacements: asset
      });
      console.log(`   ✓ ${asset.serial_number} - ${asset.status}`);
    }

    // Obtener IDs de activos creados
    const [assets] = await sequelize.query(`
      SELECT id, serial_number, status FROM assets ORDER BY id DESC LIMIT 4
    `);

    console.log('\n📋 Creando asignaciones...');
    // Crear asignaciones (solo para activos en uso)
    const inUseAssets = assets.filter(a => a.status === 'in_use');
    
    for (const asset of inUseAssets) {
      const assignmentDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 días atrás
      const expectedReturnDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 10 días vencido
      
      await sequelize.query(`
        INSERT INTO asset_assignments (asset_id, assigned_to, department, assigned_date, expected_return_date, status, condition_on_assign, created_at, updated_at)
        VALUES (:asset_id, :assigned_to, :department, :assigned_date, :expected_return_date, 'active', 'good', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, {
        replacements: {
          asset_id: asset.id,
          assigned_to: 'Juan Pérez',
          department: 'Desarrollo',
          assigned_date: assignmentDate.toISOString().split('T')[0],
          expected_return_date: expectedReturnDate
        }
      });
      console.log(`   ✓ Asignado ${asset.serial_number} a Juan Pérez (VENCIDO)`);
    }

    console.log('\n🔧 Creando mantenimientos programados...');
    // Crear mantenimientos próximos
    const maintenanceDates = [
      { days: 10, type: 'preventive', description: 'Mantenimiento preventivo trimestral' },
      { days: 20, type: 'preventive', description: 'Limpieza y actualización de software' },
      { days: 25, type: 'corrective', description: 'Revisión de batería' }
    ];

    for (let i = 0; i < Math.min(3, assets.length); i++) {
      const maint = maintenanceDates[i];
      const scheduledDate = new Date(Date.now() + maint.days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      await sequelize.query(`
        INSERT INTO maintenances (asset_id, type, status, scheduled_date, description, cost, created_at, updated_at)
        VALUES (:asset_id, :type, 'scheduled', :scheduled_date, :description, 50000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, {
        replacements: {
          asset_id: assets[i].id,
          type: maint.type,
          scheduled_date: scheduledDate,
          description: maint.description
        }
      });
      console.log(`   ✓ Mantenimiento ${maint.type} programado para ${assets[i].serial_number} en ${maint.days} días`);
    }

    // Actualizar fecha de updated_at del activo en reparación para que sea hace 20 días
    const repairAsset = assets.find(a => a.status === 'under_repair');
    if (repairAsset) {
      const oldDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
      await sequelize.query(`
        UPDATE assets SET updated_at = :updated_at WHERE id = :id
      `, {
        replacements: {
          id: repairAsset.id,
          updated_at: oldDate
        }
      });
      console.log(`   ✓ Activo en reparación marcado como hace 20 días`);
    }

    console.log('\n✨ Datos de prueba creados exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - ${assetsData.length} activos creados`);
    console.log(`   - ${inUseAssets.length} asignaciones activas (vencidas)`);
    console.log(`   - 3 mantenimientos programados`);
    console.log(`   - 1 equipo en reparación prolongada`);
    console.log(`   - ${inUseAssets.length + 1} garantías por vencer`);
    
    console.log('\n🎯 Ahora recarga el dashboard para ver las alertas!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear datos de prueba:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createSampleAssets();
