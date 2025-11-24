-- =========================================================
--  SCRIPT CONSOLIDADO DE MIGRACIÓN
--  PostgreSQL 14+
--  Sistema de Inventario con Trazabilidad y Mantenimiento
-- =========================================================
--
--  INSTRUCCIONES DE USO:
--  1. Crear la base de datos manualmente en pgAdmin o psql:
--     CREATE DATABASE inventario_global;
--  
--  2. Conectarse a la base de datos:
--     \c inventario_global
--  
--  3. Ejecutar este script:
--     \i migration_complete.sql
--     O desde psql: psql -U postgres -d inventario_global -f migration_complete.sql
--
-- =========================================================

\echo '========================================='
\echo 'INICIANDO MIGRACIÓN DE BASE DE DATOS'
\echo '========================================='

-- =========================================================
-- PARTE 1: ENUMS
-- =========================================================
\echo 'Creando tipos ENUM...'

CREATE TYPE user_role      AS ENUM ('admin','manager','operator','viewer');
CREATE TYPE movement_type  AS ENUM ('entrada','salida','transferencia','ajuste');
CREATE TYPE warehouse_type AS ENUM ('CENTRAL','DAÑADOS','TRANSITO');
CREATE TYPE sn_status      AS ENUM ('available','sold','damaged','RMA','maintenance');
CREATE TYPE mo_status      AS ENUM ('abierto','en_proceso','finalizado','cancelado');
CREATE TYPE priority       AS ENUM ('baja','media','alta','critica');

\echo '✓ Tipos ENUM creados'

-- =========================================================
-- PARTE 2: TABLAS PRINCIPALES
-- =========================================================
\echo 'Creando tablas principales...'

/* 1. USERS */
CREATE TABLE users (
    id                   SERIAL PRIMARY KEY,
    name                 VARCHAR(100) NOT NULL,
    email                VARCHAR(150) NOT NULL UNIQUE,
    password_hash        VARCHAR(255) NOT NULL,
    role                 user_role DEFAULT 'viewer',
    active               BOOLEAN DEFAULT TRUE,
    last_login           TIMESTAMP,
    phone                VARCHAR(25),
    email_verified_at    TIMESTAMP,
    must_reset_password  BOOLEAN DEFAULT TRUE,
    created_at           TIMESTAMP DEFAULT NOW(),
    updated_at           TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);

/* 2. CATEGORIES */
CREATE TABLE categories (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    description  TEXT,
    parent_id    INT REFERENCES categories ON DELETE RESTRICT,
    level        INT DEFAULT 0,
    code         VARCHAR(20) UNIQUE,
    active       BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT NOW(),
    updated_at   TIMESTAMP DEFAULT NOW(),
    created_by   INT REFERENCES users(id),
    updated_by   INT REFERENCES users(id)
);
CREATE INDEX idx_categories_parent ON categories(parent_id);

/* 3. WAREHOUSES */
CREATE TABLE warehouses (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    code          VARCHAR(20) NOT NULL UNIQUE,
    address       VARCHAR(255),
    city          VARCHAR(100),
    state         VARCHAR(60),
    postal_code   VARCHAR(12),
    country       VARCHAR(2),
    phone         VARCHAR(20),
    manager_id    INT REFERENCES users(id),
    type          warehouse_type DEFAULT 'CENTRAL',
    is_pickable   BOOLEAN DEFAULT TRUE,
    active        BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW(),
    created_by    INT REFERENCES users(id),
    updated_by    INT REFERENCES users(id)
);
CREATE UNIQUE INDEX idx_warehouses_code ON warehouses(code);

/* 4. SUPPLIERS */
CREATE TABLE suppliers (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(200) NOT NULL,
    code                VARCHAR(20) NOT NULL UNIQUE,
    tax_id              VARCHAR(50),
    email               VARCHAR(150),
    phone               VARCHAR(20),
    mobile              VARCHAR(20),
    address             VARCHAR(255),
    city                VARCHAR(100),
    state               VARCHAR(60),
    postal_code         VARCHAR(12),
    country             VARCHAR(2),
    payment_terms_days  INT DEFAULT 30,
    lead_time_days      INT DEFAULT 7,
    contact_person      VARCHAR(100),
    notes               TEXT,
    active              BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    created_by          INT REFERENCES users(id),
    updated_by          INT REFERENCES users(id)
);
CREATE UNIQUE INDEX idx_suppliers_code ON suppliers(code);

/* 5. PRODUCTS */
CREATE TABLE products (
    id                      SERIAL PRIMARY KEY,
    name                    VARCHAR(200) NOT NULL,
    sku                     VARCHAR(50) NOT NULL UNIQUE,
    barcode                 VARCHAR(100) UNIQUE,
    description             TEXT,
    category_id             INT NOT NULL REFERENCES categories ON DELETE RESTRICT,
    supplier_id             INT REFERENCES suppliers ON DELETE SET NULL,
    brand                   VARCHAR(100),
    model                   VARCHAR(100),
    warranty_months         INT DEFAULT 12,
    price                   DECIMAL(10,2) DEFAULT 0,
    cost                    DECIMAL(10,2) DEFAULT 0,
    stock_min               INT DEFAULT 0,
    stock_max               INT DEFAULT 0,
    unit                    VARCHAR(20) DEFAULT 'unidad',
    is_serializable         BOOLEAN DEFAULT TRUE,
    is_batchable            BOOLEAN DEFAULT FALSE,
    maintenance_cycle_days  INT DEFAULT 180,
    image_url               VARCHAR(500),
    active                  BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMP DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW(),
    created_by              INT REFERENCES users(id),
    updated_by              INT REFERENCES users(id),
    CONSTRAINT chk_price_positive CHECK (price >= 0),
    CONSTRAINT chk_cost_positive  CHECK (cost >= 0),
    CONSTRAINT chk_stock_limits   CHECK (stock_max >= stock_min)
);
CREATE UNIQUE INDEX idx_products_sku ON products(sku);
COMMENT ON COLUMN products.maintenance_cycle_days IS 'Días entre mantenimientos preventivos (default 180 días = 6 meses)';

/* 6. PRODUCT_WAREHOUSE */
CREATE TABLE product_warehouse (
    id                  SERIAL PRIMARY KEY,
    product_id          INT NOT NULL REFERENCES products ON DELETE RESTRICT,
    warehouse_id        INT NOT NULL REFERENCES warehouses ON DELETE RESTRICT,
    stock               INT NOT NULL DEFAULT 0,
    reserved            INT DEFAULT 0,
    location_zone       VARCHAR(20),
    last_count_date     TIMESTAMP,
    last_movement_date  TIMESTAMP DEFAULT NOW(),
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    updated_by          INT REFERENCES users(id),
    CONSTRAINT chk_stock_positive CHECK (stock >= 0),
    CONSTRAINT chk_reserved_valid CHECK (reserved <= stock),
    CONSTRAINT uk_product_warehouse UNIQUE (product_id, warehouse_id)
);

/* 7. CUSTOMERS */
CREATE TABLE customers (
    id                 SERIAL PRIMARY KEY,
    name               VARCHAR(200) NOT NULL,
    code               VARCHAR(20) NOT NULL UNIQUE,
    tax_id             VARCHAR(50),
    email              VARCHAR(150),
    phone              VARCHAR(20),
    address            VARCHAR(255),
    city               VARCHAR(100),
    state              VARCHAR(60),
    postal_code        VARCHAR(12),
    country            VARCHAR(2),
    payment_terms_days INT DEFAULT 0,
    credit_limit       DECIMAL(10,2) DEFAULT 0,
    active             BOOLEAN DEFAULT TRUE,
    created_at         TIMESTAMP DEFAULT NOW(),
    updated_at         TIMESTAMP DEFAULT NOW(),
    created_by         INT REFERENCES users(id),
    updated_by         INT REFERENCES users(id)
);
CREATE UNIQUE INDEX idx_customers_code ON customers(code);

/* 8. INVENTORY_MOVEMENTS */
CREATE TABLE inventory_movements (
    id                SERIAL PRIMARY KEY,
    type              movement_type NOT NULL,
    product_id        INT NOT NULL REFERENCES products ON DELETE RESTRICT,
    warehouse_id      INT NOT NULL REFERENCES warehouses ON DELETE RESTRICT,
    warehouse_dest_id INT REFERENCES warehouses ON DELETE RESTRICT,
    quantity          INT NOT NULL,
    unit_cost         DECIMAL(10,2),
    unit_price        DECIMAL(10,2),
    total_cost        DECIMAL(12,2),
    movement_date     DATE DEFAULT CURRENT_DATE,
    reference         VARCHAR(100),
    notes             TEXT,
    batch_code        VARCHAR(40),
    serial_numbers    TEXT,
    expiration_date   DATE,
    customer_id       INT REFERENCES customers ON DELETE SET NULL,
    supplier_id       INT REFERENCES suppliers ON DELETE SET NULL,
    created_by        INT NOT NULL REFERENCES users ON DELETE RESTRICT,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW(),
    updated_by        INT REFERENCES users(id),
    CONSTRAINT chk_quantity_nonzero CHECK (quantity <> 0),
    CONSTRAINT chk_transfer_has_dest CHECK (type != 'transferencia' OR warehouse_dest_id IS NOT NULL)
);
CREATE INDEX idx_movements_product_date ON inventory_movements(product_id, movement_date);

/* 9. SERIAL_NUMBERS */
CREATE TABLE serial_numbers (
    id              SERIAL PRIMARY KEY,
    product_id      INT NOT NULL REFERENCES products ON DELETE RESTRICT,
    serial          TEXT NOT NULL,
    status          sn_status DEFAULT 'available',
    warehouse_id    INT REFERENCES warehouses ON DELETE SET NULL,
    movement_in_id  INT REFERENCES inventory_movements ON DELETE SET NULL,
    movement_out_id INT REFERENCES inventory_movements ON DELETE SET NULL,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE (product_id, serial)
);
CREATE INDEX idx_serial_numbers_status ON serial_numbers(status);
CREATE INDEX idx_serial_numbers_warehouse ON serial_numbers(warehouse_id);

/* 10. MAINTENANCE_TYPES */
CREATE TABLE maintenance_types (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(60) NOT NULL UNIQUE,
    description TEXT
);

/* 11. MAINTENANCE_ORDERS */
CREATE TABLE maintenance_orders (
    id              SERIAL PRIMARY KEY,
    asset_id        INT NOT NULL REFERENCES serial_numbers ON DELETE RESTRICT,
    type_id         INT NOT NULL REFERENCES maintenance_types ON DELETE RESTRICT,
    code            VARCHAR(20) NOT NULL UNIQUE,
    description     TEXT,
    status          mo_status DEFAULT 'abierto',
    priority        priority DEFAULT 'media',
    planned_date    DATE,
    start_date      TIMESTAMP,
    end_date        TIMESTAMP,
    cost_parts      DECIMAL(10,2) DEFAULT 0,
    cost_labor      DECIMAL(10,2) DEFAULT 0,
    provider        VARCHAR(100),
    technician_id   INT REFERENCES users(id),
    notes           TEXT,
    created_by      INT NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    updated_by      INT REFERENCES users(id)
);
CREATE UNIQUE INDEX idx_mo_code ON maintenance_orders(code);
CREATE INDEX idx_mo_asset ON maintenance_orders(asset_id);
CREATE INDEX idx_mo_status ON maintenance_orders(status);

/* 12. MAINTENANCE_ITEMS */
CREATE TABLE maintenance_items (
    id          SERIAL PRIMARY KEY,
    order_id    INT NOT NULL REFERENCES maintenance_orders ON DELETE CASCADE,
    product_id  INT REFERENCES products ON DELETE SET NULL,
    quantity    INT DEFAULT 1,
    unit_cost   DECIMAL(10,2) DEFAULT 0,
    task        TEXT,
    done        BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW()
);

/* 13. AUDIT_LOGS */
CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    table_name  TEXT NOT NULL,
    record_id   INT NOT NULL,
    action      TEXT NOT NULL,
    old_values  JSONB,
    new_values  JSONB,
    changed_by  INT REFERENCES users(id),
    changed_at  TIMESTAMP DEFAULT NOW()
);

\echo '✓ Tablas principales creadas'

-- =========================================================
-- PARTE 3: FUNCIONES Y TRIGGERS
-- =========================================================
\echo 'Creando funciones y triggers...'

/* Trigger: Auto-crear mantenimiento preventivo */
CREATE OR REPLACE FUNCTION trg_create_preventive()
RETURNS TRIGGER AS $$
DECLARE
    v_cycle INT;
BEGIN
    SELECT COALESCE(maintenance_cycle_days,180) INTO v_cycle FROM products WHERE id = NEW.product_id;
    INSERT INTO maintenance_orders (asset_id, type_id, code, description, planned_date, status, priority, created_by)
    VALUES (
        NEW.id,
        (SELECT id FROM maintenance_types WHERE name = 'Preventivo'),
        'AUTO-' || TO_CHAR(NOW(),'YYYY-MM-') || NEW.serial,
        'Preventivo inicial',
        CURRENT_DATE + v_cycle,
        'abierto',
        'media',
        1
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_serial_preventive
AFTER INSERT ON serial_numbers FOR EACH ROW
EXECUTE FUNCTION trg_create_preventive();

/* Trigger: Actualizar stock automáticamente */
CREATE OR REPLACE FUNCTION update_stock_after_movement()
RETURNS TRIGGER AS $$
DECLARE
    v_qty INT := ABS(NEW.quantity);
BEGIN
    IF NEW.type = 'entrada' THEN
        INSERT INTO product_warehouse(product_id, warehouse_id, stock, last_movement_date)
        VALUES (NEW.product_id, NEW.warehouse_id, v_qty, NOW())
        ON CONFLICT (product_id, warehouse_id)
        DO UPDATE SET stock = product_warehouse.stock + v_qty, last_movement_date = NOW();
    ELSIF NEW.type = 'salida' THEN
        UPDATE product_warehouse SET stock = stock - v_qty, last_movement_date = NOW()
        WHERE product_id = NEW.product_id AND warehouse_id = NEW.warehouse_id;
        IF (SELECT stock FROM product_warehouse WHERE product_id = NEW.product_id AND warehouse_id = NEW.warehouse_id) < 0 THEN
            RAISE EXCEPTION 'Stock insuficiente';
        END IF;
    ELSIF NEW.type = 'transferencia' THEN
        UPDATE product_warehouse SET stock = stock - v_qty, last_movement_date = NOW()
        WHERE product_id = NEW.product_id AND warehouse_id = NEW.warehouse_id;
        INSERT INTO product_warehouse(product_id, warehouse_id, stock, last_movement_date)
        VALUES (NEW.product_id, NEW.warehouse_dest_id, v_qty, NOW())
        ON CONFLICT (product_id, warehouse_id)
        DO UPDATE SET stock = product_warehouse.stock + v_qty, last_movement_date = NOW();
    ELSIF NEW.type = 'ajuste' THEN
        INSERT INTO product_warehouse(product_id, warehouse_id, stock, last_movement_date)
        VALUES (NEW.product_id, NEW.warehouse_id, NEW.quantity, NOW())
        ON CONFLICT (product_id, warehouse_id)
        DO UPDATE SET stock = product_warehouse.stock + NEW.quantity, last_movement_date = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stock
AFTER INSERT ON inventory_movements FOR EACH ROW
EXECUTE FUNCTION update_stock_after_movement();

\echo '✓ Funciones y triggers creados'

-- =========================================================
-- PARTE 4: VISTAS DE REPORTES
-- =========================================================
\echo 'Creando vistas de reportes...'

/* Vista: Stock global por producto */
CREATE OR REPLACE VIEW v_product_stock AS
SELECT 
    p.id, p.name, p.sku, p.brand, p.model, p.barcode,
    c.name as category, c.code as category_code,
    COALESCE(SUM(pw.stock), 0) as total_stock,
    COALESCE(SUM(pw.reserved), 0) as total_reserved,
    COALESCE(SUM(pw.stock - pw.reserved), 0) as total_available,
    p.stock_min, p.stock_max, p.price, p.cost, p.warranty_months, p.is_serializable,
    COALESCE(SUM(pw.stock), 0) * p.cost as inventory_value_cost,
    COALESCE(SUM(pw.stock), 0) * p.price as inventory_value_price,
    CASE 
        WHEN COALESCE(SUM(pw.stock), 0) = 0 THEN 'sin_stock'
        WHEN COALESCE(SUM(pw.stock), 0) <= p.stock_min THEN 'bajo'
        WHEN COALESCE(SUM(pw.stock), 0) >= p.stock_max THEN 'alto'
        ELSE 'normal'
    END as stock_status
FROM products p
LEFT JOIN product_warehouse pw ON p.id = pw.product_id
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.active = true
GROUP BY p.id, p.name, p.sku, p.brand, p.model, p.barcode, c.name, c.code, 
         p.stock_min, p.stock_max, p.price, p.cost, p.warranty_months, p.is_serializable;

/* Vista: Trazabilidad de equipos */
CREATE OR REPLACE VIEW v_assets_tracking AS
SELECT 
    sn.id, sn.serial, p.name as product_name, p.sku, p.brand, p.model, p.warranty_months,
    c.name as category, sn.status, w.name as warehouse, w.code as warehouse_code, w.type as warehouse_type,
    sn.notes, sn.created_at as registered_at,
    mi.created_at as last_entry_date, mi.reference as entry_reference,
    mo.created_at as last_exit_date, mo.reference as exit_reference,
    EXTRACT(DAY FROM NOW() - sn.created_at)::INT as days_since_registration
FROM serial_numbers sn
JOIN products p ON sn.product_id = p.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN warehouses w ON sn.warehouse_id = w.id
LEFT JOIN inventory_movements mi ON sn.movement_in_id = mi.id
LEFT JOIN inventory_movements mo ON sn.movement_out_id = mo.id;

/* Vista: Mantenimientos activos */
CREATE OR REPLACE VIEW v_maintenance_active AS
SELECT 
    mo.id, mo.code, sn.serial, p.name as product_name, p.brand, p.model,
    mt.name as maintenance_type, mo.status, mo.priority, mo.planned_date, mo.start_date, mo.end_date,
    mo.cost_parts, mo.cost_labor, (mo.cost_parts + mo.cost_labor) as total_cost,
    mo.provider, u.name as technician, u.email as technician_email, mo.description, mo.notes,
    CASE WHEN mo.planned_date IS NOT NULL THEN EXTRACT(DAY FROM mo.planned_date - CURRENT_DATE)::INT ELSE NULL END as days_until_maintenance,
    CASE WHEN mo.start_date IS NOT NULL AND mo.end_date IS NOT NULL THEN EXTRACT(DAY FROM mo.end_date - mo.start_date)::INT ELSE NULL END as maintenance_duration_days,
    mo.created_at
FROM maintenance_orders mo
JOIN serial_numbers sn ON mo.asset_id = sn.id
JOIN products p ON sn.product_id = p.id
JOIN maintenance_types mt ON mo.type_id = mt.id
LEFT JOIN users u ON mo.technician_id = u.id
WHERE mo.status IN ('abierto', 'en_proceso')
ORDER BY CASE mo.priority WHEN 'critica' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 WHEN 'baja' THEN 4 END, mo.planned_date ASC NULLS LAST;

/* Vista: Alertas de stock bajo */
CREATE OR REPLACE VIEW v_low_stock_alerts AS
SELECT 
    p.id, p.name, p.sku, p.brand, p.model, c.name as category,
    COALESCE(SUM(pw.stock), 0) as current_stock, p.stock_min,
    p.stock_min - COALESCE(SUM(pw.stock), 0) as quantity_needed,
    s.name as supplier, s.email as supplier_email, s.phone as supplier_phone, s.lead_time_days, p.cost,
    (p.stock_min - COALESCE(SUM(pw.stock), 0)) * p.cost as estimated_purchase_cost
FROM products p
LEFT JOIN product_warehouse pw ON p.id = pw.product_id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.active = true
GROUP BY p.id, p.name, p.sku, p.brand, p.model, c.name, p.stock_min, p.cost, s.name, s.email, s.phone, s.lead_time_days
HAVING COALESCE(SUM(pw.stock), 0) <= p.stock_min
ORDER BY quantity_needed DESC;

/* Vista: Inventario por almacén */
CREATE OR REPLACE VIEW v_warehouse_stock AS
SELECT 
    w.id as warehouse_id, w.name as warehouse, w.code as warehouse_code, w.type as warehouse_type, w.city, um.name as manager,
    COUNT(DISTINCT pw.product_id) as products_count,
    SUM(pw.stock) as total_units, SUM(pw.reserved) as total_reserved, SUM(pw.stock - pw.reserved) as total_available,
    SUM(pw.stock * p.cost) as inventory_value_cost, SUM(pw.stock * p.price) as inventory_value_price,
    SUM(pw.stock * p.price) - SUM(pw.stock * p.cost) as potential_profit,
    (SELECT COUNT(*) FROM serial_numbers sn WHERE sn.warehouse_id = w.id) as serialized_assets_count
FROM warehouses w
LEFT JOIN product_warehouse pw ON w.id = pw.warehouse_id
LEFT JOIN products p ON pw.product_id = p.id
LEFT JOIN users um ON w.manager_id = um.id
WHERE w.active = true AND (p.active = true OR p.id IS NULL)
GROUP BY w.id, w.name, w.code, w.type, w.city, um.name;

\echo '✓ Vistas de reportes creadas'

-- =========================================================
-- PARTE 5: DATOS INICIALES
-- =========================================================
\echo 'Insertando datos iniciales...'

/* Usuario administrador */
INSERT INTO users (name, email, password_hash, role, email_verified_at, must_reset_password) VALUES
('Administrador','admin@empresa.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKlXb5KxP.2RnZO','admin',NOW(),TRUE);

/* Almacenes */
INSERT INTO warehouses (name,code,address,city,state,country,type,manager_id,created_by) VALUES
('Almacén Central','ALM-CEN','Av 123','Ciudad de México','CDMX','MX','CENTRAL',1,1),
('Almacén Dañados','ALM-DAÑ','Subsuelo','Ciudad de México','CDMX','MX','DAÑADOS',1,1);

/* Categorías */
INSERT INTO categories (name,description,level,code,created_by) VALUES
('Computo','Equipos de cómputo',0,'COM',1),
('Laptops','Portátiles',1,'LAP',1),
('Desktops','Equipos de escritorio',1,'DSK',1),
('Monitores','Pantallas',1,'MON',1),
('Impresión','Impresoras y consumibles',0,'IMP',1),
('Oficina','Mobiliario y papelería',0,'OFI',1);

/* Proveedor de ejemplo */
INSERT INTO suppliers (name,code,tax_id,email,phone,city,country,lead_time_days,payment_terms_days,contact_person,created_by) VALUES
('Proveedor Local SA','PRV-LOCAL','PLO123456','ventas@proveedor.com','5555555555','Ciudad de México','MX',5,15,'Juan Pérez',1);

/* Tipos de mantenimiento */
INSERT INTO maintenance_types (name, description) VALUES
('Preventivo',  'Revisión periódica programada'),
('Correctivo',  'Reparación por falla'),
('Calibración', 'Ajuste de equipos de medición');

\echo '✓ Datos iniciales insertados'

-- =========================================================
-- PARTE 6: VALIDACIÓN
-- =========================================================
\echo ''
\echo '========================================='
\echo 'VALIDANDO INSTALACIÓN'
\echo '========================================='

SELECT 
    schemaname, 
    tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

\echo ''
\echo '========================================='
\echo '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE'
\echo '========================================='
\echo ''
\echo '📊 Resumen:'
\echo '   - Tablas creadas: 13'
\echo '   - Vistas creadas: 5'
\echo '   - Triggers creados: 2'
\echo '   - Usuario admin: admin@empresa.com'
\echo '   - Password: Admin123! (CAMBIAR EN PRODUCCIÓN)'
\echo '   - Almacenes: 2'
\echo '   - Categorías: 6'
\echo '   - Proveedor: 1'
\echo '   - Tipos de mantenimiento: 3'
\echo ''
\echo '🔧 Próximos pasos:'
\echo '   1. Cambiar password del administrador'
\echo '   2. Actualizar modelos del backend'
\echo '   3. Actualizar componentes del frontend'
\echo '   4. Realizar pruebas'
\echo ''
\echo '========================================='
