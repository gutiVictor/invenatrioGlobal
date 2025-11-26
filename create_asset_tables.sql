-- Migration: Add Assets IT Management Tables
-- Description: Creates tables for IT asset tracking, assignments, and maintenance

-- =============================================
-- TABLE: assets
-- =============================================
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    asset_tag VARCHAR(50) UNIQUE,
    status VARCHAR(20) DEFAULT 'in_stock' CHECK (status IN ('in_use', 'in_stock', 'under_repair', 'retired', 'stolen', 'disposed')),
    condition VARCHAR(20) DEFAULT 'new' CHECK (condition IN ('new', 'good', 'fair', 'poor', 'broken')),
    acquisition_date DATE,
    purchase_price DECIMAL(10, 2),
    warranty_expiry_date DATE,
    retirement_date DATE,
    location VARCHAR(200),
    specs JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_assets_product_id ON assets(product_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_serial_number ON assets(serial_number);

-- =============================================
-- TABLE: asset_assignments
-- =============================================
CREATE TABLE IF NOT EXISTS asset_assignments (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    assigned_to VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    return_date DATE,
    expected_return_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'returned')),
    condition_on_assign VARCHAR(100),
    condition_on_return VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_asset_assignments_asset_id ON asset_assignments(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_status ON asset_assignments(status);

-- =============================================
-- TABLE: maintenances
-- =============================================
CREATE TABLE IF NOT EXISTS maintenances (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('preventive', 'corrective', 'upgrade')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    scheduled_date DATE NOT NULL,
    completion_date DATE,
    performed_by VARCHAR(150),
    cost DECIMAL(10, 2) DEFAULT 0,
    description TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_maintenances_asset_id ON maintenances(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenances_status ON maintenances(status);
CREATE INDEX IF NOT EXISTS idx_maintenances_scheduled_date ON maintenances(scheduled_date);

-- =============================================
-- TRIGGERS: Update updated_at timestamp
-- =============================================

-- Trigger for assets
CREATE OR REPLACE FUNCTION update_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_assets_updated_at ON assets;
CREATE TRIGGER trigger_update_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_assets_updated_at();

-- Trigger for asset_assignments
CREATE OR REPLACE FUNCTION update_asset_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_asset_assignments_updated_at ON asset_assignments;
CREATE TRIGGER trigger_update_asset_assignments_updated_at
    BEFORE UPDATE ON asset_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_asset_assignments_updated_at();

-- Trigger for maintenances
CREATE OR REPLACE FUNCTION update_maintenances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_maintenances_updated_at ON maintenances;
CREATE TRIGGER trigger_update_maintenances_updated_at
    BEFORE UPDATE ON maintenances
    FOR EACH ROW
    EXECUTE FUNCTION update_maintenances_updated_at();

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Uncomment the following lines to insert sample data

/*
-- Insert sample assets (assuming product_id 1 exists)
INSERT INTO assets (product_id, serial_number, asset_tag, status, condition, acquisition_date, purchase_price, warranty_expiry_date, location, specs)
VALUES 
    (1, 'SN001-LAPTOP-2024', 'TAG-001', 'in_use', 'good', '2024-01-15', 1500000, '2026-01-15', 'Oficina Principal', '{"ram": "16GB", "cpu": "Intel i7", "storage": "512GB SSD"}'),
    (1, 'SN002-LAPTOP-2024', 'TAG-002', 'in_stock', 'new', '2024-02-20', 1500000, '2026-02-20', 'Almacén Central', '{"ram": "16GB", "cpu": "Intel i7", "storage": "512GB SSD"}'),
    (1, 'SN003-LAPTOP-2023', 'TAG-003', 'under_repair', 'fair', '2023-06-10', 1200000, '2025-06-10', 'Taller de Reparación', '{"ram": "8GB", "cpu": "Intel i5", "storage": "256GB SSD"}');

-- Insert sample assignments
INSERT INTO asset_assignments (asset_id, assigned_to, department, assigned_date, expected_return_date, status, condition_on_assign)
VALUES 
    (1, 'Juan Pérez', 'Desarrollo', '2024-03-01', '2024-12-31', 'active', 'good');

-- Insert sample maintenances
INSERT INTO maintenances (asset_id, type, status, scheduled_date, description, cost)
VALUES 
    (1, 'preventive', 'scheduled', CURRENT_DATE + 15, 'Mantenimiento preventivo trimestral', 50000),
    (2, 'preventive', 'scheduled', CURRENT_DATE + 25, 'Revisión inicial antes de asignación', 30000);
*/

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('assets', 'asset_assignments', 'maintenances')
ORDER BY table_name;

-- Count records in each table
SELECT 
    'assets' as table_name, COUNT(*) as record_count FROM assets
UNION ALL
SELECT 
    'asset_assignments' as table_name, COUNT(*) as record_count FROM asset_assignments
UNION ALL
SELECT 
    'maintenances' as table_name, COUNT(*) as record_count FROM maintenances;
