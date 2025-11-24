-- ========================================
-- SISTEMA DE INVENTARIO GLOBAL
-- Script de Inicialización de Base de Datos
-- PostgreSQL 14+
-- ========================================

-- INSTRUCCIONES:
-- 1. Primero crear la base de datos manualmente en pgAdmin
-- 2. Luego ejecutar este script en esa base de datos

-- ========================================
-- ENUMS
-- ========================================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'operator', 'viewer');
CREATE TYPE movement_type AS ENUM ('entrada', 'salida', 'transferencia', 'ajuste');
CREATE TYPE customer_type AS ENUM ('retail', 'wholesale', 'distributor');

-- ========================================
-- TABLA: users
-- Usuarios del sistema
-- ========================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active) WHERE active = true;

-- Comentarios
COMMENT ON TABLE users IS 'Usuarios del sistema con roles y permisos';
COMMENT ON COLUMN users.role IS 'admin, manager, operator, viewer';

-- ========================================
-- TABLA: categories
-- Categorías jerárquicas de productos
-- ========================================

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    parent_id INTEGER NULL REFERENCES categories(id) ON DELETE RESTRICT,
    level INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(active) WHERE active = true;

COMMENT ON TABLE categories IS 'Categorías y subcategorías de productos';
COMMENT ON COLUMN categories.parent_id IS 'Categoría padre (NULL = categoría raíz)';

-- ========================================
-- TABLA: warehouses
-- Almacenes y ubicaciones
-- ========================================

CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    address VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    phone VARCHAR(20) NULL,
    manager VARCHAR(100) NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE UNIQUE INDEX idx_warehouses_code ON warehouses(code);
CREATE INDEX idx_warehouses_active ON warehouses(active) WHERE active = true;

COMMENT ON TABLE warehouses IS 'Almacenes y ubicaciones de inventario';

-- ========================================
-- TABLA: suppliers
-- Proveedores
-- ========================================

CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    tax_id VARCHAR(50) NULL,
    email VARCHAR(150) NULL,
    phone VARCHAR(20) NULL,
    mobile VARCHAR(20) NULL,
    address VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    country VARCHAR(100) DEFAULT 'México',
    payment_terms_days INTEGER DEFAULT 30,
    contact_person VARCHAR(100) NULL,
    notes TEXT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE UNIQUE INDEX idx_suppliers_code ON suppliers(code);
CREATE INDEX idx_suppliers_active ON suppliers(active) WHERE active = true;

COMMENT ON TABLE suppliers IS 'Catálogo de proveedores';

-- ========================================
-- TABLA: customers
-- Clientes (opcional)
-- ========================================

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    tax_id VARCHAR(50) NULL,
    email VARCHAR(150) NULL,
    phone VARCHAR(20) NULL,
    address VARCHAR(255) NULL,
    customer_type customer_type DEFAULT 'retail',
    credit_limit DECIMAL(10,2) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE UNIQUE INDEX idx_customers_code ON customers(code);
CREATE INDEX idx_customers_type ON customers(customer_type);
CREATE INDEX idx_customers_active ON customers(active) WHERE active = true;

COMMENT ON TABLE customers IS 'Catálogo de clientes';

-- ========================================
-- TABLA: products
-- Catálogo de productos
-- ========================================

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    barcode VARCHAR(100) NULL UNIQUE,
    description TEXT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    supplier_id INTEGER NULL REFERENCES suppliers(id) ON DELETE SET NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_min INTEGER DEFAULT 0,
    stock_max INTEGER DEFAULT 0,
    image_url VARCHAR(500) NULL,
    unit VARCHAR(20) DEFAULT 'unidad',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_price_positive CHECK (price >= 0),
    CONSTRAINT chk_cost_positive CHECK (cost >= 0),
    CONSTRAINT chk_stock_min_positive CHECK (stock_min >= 0),
    CONSTRAINT chk_stock_limits CHECK (stock_max >= stock_min)
);

-- Índices
CREATE UNIQUE INDEX idx_products_sku ON products(sku);
CREATE UNIQUE INDEX idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_active ON products(active) WHERE active = true;

COMMENT ON TABLE products IS 'Catálogo de productos';
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - Código único';
COMMENT ON COLUMN products.unit IS 'unidad, caja, kg, litro, etc.';

-- ========================================
-- TABLA: product_warehouse
-- Stock por almacén
-- ========================================

CREATE TABLE product_warehouse (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    stock INTEGER NOT NULL DEFAULT 0,
    reserved INTEGER DEFAULT 0,
    last_movement_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_stock_positive CHECK (stock >= 0),
    CONSTRAINT chk_reserved_positive CHECK (reserved >= 0),
    CONSTRAINT chk_reserved_valid CHECK (reserved <= stock),
    CONSTRAINT uk_product_warehouse UNIQUE (product_id, warehouse_id)
);

-- Índices
CREATE INDEX idx_pw_product ON product_warehouse(product_id);
CREATE INDEX idx_pw_warehouse ON product_warehouse(warehouse_id);
CREATE INDEX idx_pw_stock ON product_warehouse(stock);
CREATE INDEX idx_pw_low_stock ON product_warehouse(stock) WHERE stock > 0;

COMMENT ON TABLE product_warehouse IS 'Stock actual de cada producto en cada almacén';
COMMENT ON COLUMN product_warehouse.reserved IS 'Cantidad reservada para pedidos';

-- ========================================
-- TABLA: inventory_movements
-- Movimientos de inventario
-- ========================================

CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    type movement_type NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    warehouse_dest_id INTEGER NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2) NULL,
    reference VARCHAR(100) NULL,
    notes TEXT NULL,
    customer_id INTEGER NULL REFERENCES customers(id) ON DELETE SET NULL,
    supplier_id INTEGER NULL REFERENCES suppliers(id) ON DELETE SET NULL,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_quantity_nonzero CHECK (quantity <> 0),
    CONSTRAINT chk_unit_cost_positive CHECK (unit_cost IS NULL OR unit_cost >= 0),
    CONSTRAINT chk_transfer_has_dest CHECK (
        type != 'transferencia' OR warehouse_dest_id IS NOT NULL
    )
);

-- Índices
CREATE INDEX idx_movements_product ON inventory_movements(product_id);
CREATE INDEX idx_movements_warehouse ON inventory_movements(warehouse_id);
CREATE INDEX idx_movements_type ON inventory_movements(type);
CREATE INDEX idx_movements_date ON inventory_movements(created_at DESC);
CREATE INDEX idx_movements_reference ON inventory_movements(reference);
CREATE INDEX idx_movements_created_by ON inventory_movements(created_by);

COMMENT ON TABLE inventory_movements IS 'Registro de todos los movimientos de inventario';
COMMENT ON COLUMN inventory_movements.type IS 'entrada, salida, transferencia, ajuste';
COMMENT ON COLUMN inventory_movements.warehouse_dest_id IS 'Almacén destino (solo para transferencias)';

-- ========================================
-- FUNCIONES Y TRIGGERS
-- ========================================

-- Función: Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Productos
CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Users
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Product Warehouse
CREATE TRIGGER trg_product_warehouse_updated_at
BEFORE UPDATE ON product_warehouse
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Función: Actualizar Stock Después de Movimiento
-- ========================================

CREATE OR REPLACE FUNCTION update_stock_after_movement()
RETURNS TRIGGER AS $$
DECLARE
    v_warehouse_id INTEGER;
    v_quantity INTEGER;
BEGIN
    -- Para ENTRADAS: incrementar stock en warehouse_id
    IF NEW.type = 'entrada' THEN
        v_warehouse_id := NEW.warehouse_id;
        v_quantity := ABS(NEW.quantity);
        
        INSERT INTO product_warehouse (product_id, warehouse_id, stock, last_movement_date)
        VALUES (NEW.product_id, v_warehouse_id, v_quantity, NOW())
        ON CONFLICT (product_id, warehouse_id) 
        DO UPDATE SET 
            stock = product_warehouse.stock + v_quantity,
            last_movement_date = NOW();
    
    -- Para SALIDAS: decrementar stock en warehouse_id
    ELSIF NEW.type = 'salida' THEN
        v_warehouse_id := NEW.warehouse_id;
        v_quantity := ABS(NEW.quantity);
        
        UPDATE product_warehouse
        SET stock = stock - v_quantity,
            last_movement_date = NOW()
        WHERE product_id = NEW.product_id 
          AND warehouse_id = v_warehouse_id;
          
        -- Validar que no quede negativo
        IF (SELECT stock FROM product_warehouse 
            WHERE product_id = NEW.product_id AND warehouse_id = v_warehouse_id) < 0 THEN
            RAISE EXCEPTION 'Stock insuficiente para la salida';
        END IF;
    
    -- Para TRANSFERENCIAS: decrementar origen, incrementar destino
    ELSIF NEW.type = 'transferencia' THEN
        -- Decrementar origen
        UPDATE product_warehouse
        SET stock = stock - ABS(NEW.quantity),
            last_movement_date = NOW()
        WHERE product_id = NEW.product_id 
          AND warehouse_id = NEW.warehouse_id;
          
        IF (SELECT stock FROM product_warehouse 
            WHERE product_id = NEW.product_id AND warehouse_id = NEW.warehouse_id) < 0 THEN
            RAISE EXCEPTION 'Stock insuficiente en almacén origen';
        END IF;
        
        -- Incrementar destino
        INSERT INTO product_warehouse (product_id, warehouse_id, stock, last_movement_date)
        VALUES (NEW.product_id, NEW.warehouse_dest_id, ABS(NEW.quantity), NOW())
        ON CONFLICT (product_id, warehouse_id) 
        DO UPDATE SET 
            stock = product_warehouse.stock + ABS(NEW.quantity),
            last_movement_date = NOW();
    
    -- Para AJUSTES: puede ser positivo o negativo
    ELSIF NEW.type = 'ajuste' THEN
        IF NEW.quantity > 0 THEN
            -- Ajuste positivo
            INSERT INTO product_warehouse (product_id, warehouse_id, stock, last_movement_date)
            VALUES (NEW.product_id, NEW.warehouse_id, NEW.quantity, NOW())
            ON CONFLICT (product_id, warehouse_id) 
            DO UPDATE SET 
                stock = product_warehouse.stock + NEW.quantity,
                last_movement_date = NOW();
        ELSE
            -- Ajuste negativo
            UPDATE product_warehouse
            SET stock = stock + NEW.quantity, -- quantity ya es negativo
                last_movement_date = NOW()
            WHERE product_id = NEW.product_id 
              AND warehouse_id = NEW.warehouse_id;
              
            IF (SELECT stock FROM product_warehouse 
                WHERE product_id = NEW.product_id AND warehouse_id = NEW.warehouse_id) < 0 THEN
                RAISE EXCEPTION 'Ajuste negativo excede stock disponible';
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Actualizar stock después de insertar movimiento
CREATE TRIGGER trg_update_stock
AFTER INSERT ON inventory_movements
FOR EACH ROW
EXECUTE FUNCTION update_stock_after_movement();

-- ========================================
-- VISTAS
-- ========================================

-- Vista: Stock Global por Producto
CREATE OR REPLACE VIEW v_product_stock AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.barcode,
    c.name as category,
    COALESCE(SUM(pw.stock), 0) as total_stock,
    COALESCE(SUM(pw.reserved), 0) as total_reserved,
    COALESCE(SUM(pw.stock - pw.reserved), 0) as total_available,
    p.stock_min,
    p.stock_max,
    p.price,
    p.cost,
    COALESCE(SUM(pw.stock), 0) * p.cost as inventory_value,
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
GROUP BY p.id, p.name, p.sku, p.barcode, c.name, p.stock_min, p.stock_max, p.price, p.cost;

-- Vista: Alertas de Stock Bajo
CREATE OR REPLACE VIEW v_low_stock_alerts AS
SELECT 
    p.id,
    p.name,
    p.sku,
    c.name as category,
    COALESCE(SUM(pw.stock), 0) as current_stock,
    p.stock_min,
    p.stock_min - COALESCE(SUM(pw.stock), 0) as quantity_needed,
    s.name as supplier,
    s.email as supplier_email
FROM products p
LEFT JOIN product_warehouse pw ON p.id = pw.product_id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.active = true
GROUP BY p.id, p.name, p.sku, c.name, p.stock_min, s.name, s.email
HAVING COALESCE(SUM(pw.stock), 0) <= p.stock_min
ORDER BY quantity_needed DESC;

-- Vista: Stock por Almacén
CREATE OR REPLACE VIEW v_warehouse_stock AS
SELECT 
    w.id as warehouse_id,
    w.name as warehouse,
    w.code as warehouse_code,
    COUNT(DISTINCT pw.product_id) as products_count,
    SUM(pw.stock) as total_units,
    SUM(pw.stock * p.cost) as inventory_value_cost,
    SUM(pw.stock * p.price) as inventory_value_price
FROM warehouses w
LEFT JOIN product_warehouse pw ON w.id = pw.warehouse_id
LEFT JOIN products p ON pw.product_id = p.id
WHERE w.active = true AND p.active = true
GROUP BY w.id, w.name, w.code;

-- Vista: Movimientos Mensuales
CREATE OR REPLACE VIEW v_movements_monthly AS
SELECT 
    DATE_TRUNC('month', created_at)::DATE as month,
    type,
    COUNT(*) as total_movements,
    SUM(ABS(quantity)) as total_quantity,
    SUM(ABS(quantity) * COALESCE(unit_cost, 0)) as total_value
FROM inventory_movements
WHERE created_at >= DATE_TRUNC('month', NOW() - INTERVAL '12 months')
GROUP BY DATE_TRUNC('month', created_at), type
ORDER BY month DESC, type;

-- ========================================
-- DATOS INICIALES
-- ========================================

-- Usuario Administrador por Defecto
-- Password: Admin123! (cambiar en producción)
INSERT INTO users (name, email, password_hash, role) 
VALUES (
    'Administrador', 
    'admin@inventario.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKlXb5KxP.2RnZO', -- Admin123!
    'admin'
);

-- Categorías Iniciales
INSERT INTO categories (name, description, level) VALUES
('Electrónica', 'Productos electrónicos y tecnología', 0),
('Ropa y Accesorios', 'Vestimenta y complementos', 0),
('Alimentos', 'Productos alimenticios', 0),
('Hogar', 'Artículos para el hogar', 0),
('Deportes', 'Artículos deportivos', 0);

-- Almacén Principal
INSERT INTO warehouses (name, code, address, city) VALUES
('Almacén Principal', 'ALM-01', 'Av. Principal 123', 'Ciudad de México'),
('Almacén Secundario', 'ALM-02', 'Calle Secundaria 456', 'Guadalajara');

-- ========================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ========================================

-- Para búsquedas rápidas en reportes
CREATE INDEX idx_movements_date_type ON inventory_movements(created_at DESC, type);
CREATE INDEX idx_movements_product_date ON inventory_movements(product_id, created_at DESC);

-- Para dashboard
CREATE INDEX idx_pw_stock_positive ON product_warehouse(stock) WHERE stock > 0;

-- ========================================
-- FIN DEL SCRIPT
-- ========================================

-- Verificar creación
SELECT 
    schemaname, 
    tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Mensaje de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Base de datos inicializada correctamente';
    RAISE NOTICE '📊 Tablas creadas: 8';
    RAISE NOTICE '👤 Usuario admin creado: admin@inventario.com';
    RAISE NOTICE '🔑 Password temporal: Admin123! (CAMBIAR EN PRODUCCIÓN)';
    RAISE NOTICE '🏢 Almacenes creados: 2';
    RAISE NOTICE '📦 Categorías creadas: 5';
END $$;