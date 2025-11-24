-- ========================================
-- MIGRATION 002: Enhance Warehouses Table
-- Fecha: 2025-11-24
-- Descripción: Agrega campos de auditoría, ubicación y lógica de negocio
-- IMPORTANTE: Este script es IDEMPOTENTE (se puede ejecutar múltiples veces)
-- ========================================

BEGIN;

-- 1. Crear ENUM para warehouse_type (solo si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'warehouse_type') THEN
        CREATE TYPE warehouse_type AS ENUM ('CENTRAL', 'TRANSITO', 'DAÑADOS', 'VIRTUAL');
    END IF;
END $$;

-- 2. Campos de Auditoría
ALTER TABLE warehouses 
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

ALTER TABLE warehouses 
    ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);

ALTER TABLE warehouses 
    ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);

-- 3. Campos de Gestión
ALTER TABLE warehouses 
    ADD COLUMN IF NOT EXISTS manager_id INTEGER REFERENCES users(id);
    
COMMENT ON COLUMN warehouses.manager_id IS 'FK a users - Reemplaza el campo texto manager';

-- 4. Campos Multi-tenant (preparación futura)
ALTER TABLE warehouses 
    ADD COLUMN IF NOT EXISTS company_id INTEGER;
    
ALTER TABLE warehouses 
    ADD COLUMN IF NOT EXISTS branch_id INTEGER;
    
COMMENT ON COLUMN warehouses.company_id IS 'Para multi-tenant futuro (puede ser NULL por ahora)';
COMMENT ON COLUMN warehouses.branch_id IS 'Para múltiples sucursales (puede ser NULL por ahora)';

-- 5. Campos de Ubicación Completa
ALTER TABLE warehouses 
    ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'MX';
    
ALTER TABLE warehouses 
    ADD COLUMN IF NOT EXISTS state VARCHAR(60);
    
ALTER TABLE warehouses 
    ADD COLUMN IF NOT EXISTS postal_code VARCHAR(12);
    
ALTER TABLE warehouses 
    ADD COLUMN IF NOT EXISTS email VARCHAR(120);

-- 6. Campos de Geolocalización
ALTER TABLE warehouses 
    ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Mexico_City';
    
ALTER TABLE warehouses 
    ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
    
ALTER TABLE warehouses 
    ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- 7. Campos de Lógica de Negocio
ALTER TABLE warehouses 
    ADD COLUMN IF NOT EXISTS warehouse_type warehouse_type DEFAULT 'CENTRAL';
    
ALTER TABLE warehouses 
    ADD COLUMN IF NOT EXISTS is_pickable BOOLEAN DEFAULT TRUE;
    
ALTER TABLE warehouses 
    ADD COLUMN IF NOT EXISTS is_saleable BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN warehouses.warehouse_type IS 'Tipo de almacén: CENTRAL, TRANSITO, DAÑADOS, VIRTUAL';
COMMENT ON COLUMN warehouses.is_pickable IS 'Permite tomar inventario para pedidos';
COMMENT ON COLUMN warehouses.is_saleable IS 'Inventario disponible para venta';

-- 8. Índices para Performance
CREATE INDEX IF NOT EXISTS idx_warehouses_manager_id ON warehouses(manager_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_type ON warehouses(warehouse_type);
CREATE INDEX IF NOT EXISTS idx_warehouses_location ON warehouses(country, state);
CREATE INDEX IF NOT EXISTS idx_warehouses_updated_at ON warehouses(updated_at DESC);

-- 9. Trigger para updated_at (reutiliza función existente)
DROP TRIGGER IF EXISTS trg_warehouses_updated_at ON warehouses;

CREATE TRIGGER trg_warehouses_updated_at
    BEFORE UPDATE ON warehouses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- ========================================
-- VERIFICACIÓN
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '✅ Migración 002 completada';
    RAISE NOTICE '📊 Nuevos campos agregados a warehouses';
    RAISE NOTICE '⚠️  Campos multi-tenant (company_id, branch_id) están preparados pero en NULL';
    RAISE NOTICE '🔧 Los datos existentes NO fueron modificados';
END $$;
