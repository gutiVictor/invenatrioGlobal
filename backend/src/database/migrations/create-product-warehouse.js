const { sequelize } = require('../../config/database');

async function createProductWarehouseTable() {
  try {
    console.log('Creating product_warehouse table...');
    
    // Crear tabla product_warehouse
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS product_warehouse (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
        stock INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id, warehouse_id)
      );
    `);
    
    console.log('✓ Table created');
    
    // Crear índices
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_product_warehouse_product ON product_warehouse(product_id);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_product_warehouse_warehouse ON product_warehouse(warehouse_id);
    `);
    
    console.log('✓ Indexes created');
    
    // Crear función del trigger
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION update_product_warehouse_stock()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Entrada: incrementa stock
        IF NEW.type = 'entrada' THEN
          INSERT INTO product_warehouse (product_id, warehouse_id, stock)
          VALUES (NEW.product_id, NEW.warehouse_id, NEW.quantity)
          ON CONFLICT (product_id, warehouse_id)
          DO UPDATE SET 
            stock = product_warehouse.stock + NEW.quantity,
            updated_at = CURRENT_TIMESTAMP;
        
        -- Salida: decrementa stock
        ELSIF NEW.type = 'salida' THEN
          UPDATE product_warehouse
          SET stock = stock - NEW.quantity,
              updated_at = CURRENT_TIMESTAMP
          WHERE product_id = NEW.product_id 
            AND warehouse_id = NEW.warehouse_id;
        
        -- Transferencia: decrementa origen, incrementa destino
        ELSIF NEW.type = 'transferencia' THEN
          -- Decrementar almacén origen
          UPDATE product_warehouse
          SET stock = stock - NEW.quantity,
              updated_at = CURRENT_TIMESTAMP
          WHERE product_id = NEW.product_id 
            AND warehouse_id = NEW.warehouse_id;
          
          -- Incrementar almacén destino
          INSERT INTO product_warehouse (product_id, warehouse_id, stock)
          VALUES (NEW.product_id, NEW.destination_warehouse_id, NEW.quantity)
          ON CONFLICT (product_id, warehouse_id)
          DO UPDATE SET 
            stock = product_warehouse.stock + NEW.quantity,
            updated_at = CURRENT_TIMESTAMP;
        
        -- Ajuste: establece stock exacto
        ELSIF NEW.type = 'ajuste' THEN
          INSERT INTO product_warehouse (product_id, warehouse_id, stock)
          VALUES (NEW.product_id, NEW.warehouse_id, NEW.quantity)
          ON CONFLICT (product_id, warehouse_id)
          DO UPDATE SET 
            stock = NEW.quantity,
            updated_at = CURRENT_TIMESTAMP;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    console.log('✓ Trigger function created');
    
    // Crear trigger
    await sequelize.query(`
      DROP TRIGGER IF EXISTS trg_update_product_warehouse ON inventory_movements;
    `);
    
    await sequelize.query(`
      CREATE TRIGGER trg_update_product_warehouse
        AFTER INSERT ON inventory_movements
        FOR EACH ROW
        EXECUTE FUNCTION update_product_warehouse_stock();
    `);
    
    console.log('✓ Trigger created');
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Register some inventory movements (Entrada)');
    console.log('2. The trigger will automatically update product_warehouse');
    console.log('3. Dashboard will show the data\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

createProductWarehouseTable();
