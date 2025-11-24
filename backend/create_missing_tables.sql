-- Crear tipos ENUM si no existen
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sn_status') THEN
        CREATE TYPE sn_status AS ENUM ('available','sold','damaged','RMA','maintenance');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mo_status') THEN
        CREATE TYPE mo_status AS ENUM ('abierto','en_proceso','finalizado','cancelado');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority') THEN
        CREATE TYPE priority AS ENUM ('baja','media','alta','critica');
    END IF;
END $$;

-- 7. SERIAL_NUMBERS
CREATE TABLE IF NOT EXISTS serial_numbers (
    id              SERIAL PRIMARY KEY,
    product_id      INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    serial          TEXT NOT NULL,
    status          sn_status DEFAULT 'available',
    warehouse_id    INT REFERENCES warehouses(id) ON DELETE SET NULL,
    movement_in_id  INT REFERENCES inventory_movements(id) ON DELETE SET NULL,
    movement_out_id INT REFERENCES inventory_movements(id) ON DELETE SET NULL,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE (product_id, serial)
);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_status ON serial_numbers(status);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_warehouse ON serial_numbers(warehouse_id);

-- 10. MAINTENANCE_TYPES
CREATE TABLE IF NOT EXISTS maintenance_types (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(60) NOT NULL UNIQUE,
    description TEXT
);
INSERT INTO maintenance_types (name, description) VALUES
('Preventivo',  'Revisión periódica programada'),
('Correctivo',  'Reparación por falla'),
('Calibración', 'Ajuste de equipos de medición')
ON CONFLICT (name) DO NOTHING;

-- 11. MAINTENANCE_ORDERS
CREATE TABLE IF NOT EXISTS maintenance_orders (
    id              SERIAL PRIMARY KEY,
    asset_id        INT NOT NULL REFERENCES serial_numbers(id) ON DELETE RESTRICT,
    type_id         INT NOT NULL REFERENCES maintenance_types(id) ON DELETE RESTRICT,
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
CREATE UNIQUE INDEX IF NOT EXISTS idx_mo_code ON maintenance_orders(code);
CREATE INDEX IF NOT EXISTS idx_mo_asset ON maintenance_orders(asset_id);
CREATE INDEX IF NOT EXISTS idx_mo_status ON maintenance_orders(status);

-- 12. MAINTENANCE_ITEMS
CREATE TABLE IF NOT EXISTS maintenance_items (
    id          SERIAL PRIMARY KEY,
    order_id    INT NOT NULL REFERENCES maintenance_orders(id) ON DELETE CASCADE,
    product_id  INT REFERENCES products(id) ON DELETE SET NULL,
    quantity    INT DEFAULT 1,
    unit_cost   DECIMAL(10,2) DEFAULT 0,
    task        TEXT,
    done        BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- 13. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    table_name  TEXT NOT NULL,
    record_id   INT NOT NULL,
    action      TEXT NOT NULL,
    old_values  JSONB,
    new_values  JSONB,
    changed_by  INT REFERENCES users(id),
    changed_at  TIMESTAMP DEFAULT NOW()
);

-- 14. AUTO-Crear preventivo al ingresar un serial
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

DROP TRIGGER IF EXISTS trg_serial_preventive ON serial_numbers;
CREATE TRIGGER trg_serial_preventive
AFTER INSERT ON serial_numbers FOR EACH ROW
EXECUTE FUNCTION trg_create_preventive();
