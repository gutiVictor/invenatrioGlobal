-- Script para agregar campos faltantes a las tablas existentes
-- Este script es seguro de ejecutar múltiples veces (usa IF NOT EXISTS donde sea posible)

-- 1. Agregar campos a la tabla users (si no existen)
DO $$
BEGIN
    -- phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(25);
    END IF;
    
    -- email_verified_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verified_at') THEN
        ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP;
    END IF;
    
    -- must_reset_password
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='must_reset_password') THEN
        ALTER TABLE users ADD COLUMN must_reset_password BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 2. Agregar campos a la tabla products
DO $$
BEGIN
    -- brand
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='brand') THEN
        ALTER TABLE products ADD COLUMN brand VARCHAR(100);
    END IF;
    
    -- model
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='model') THEN
        ALTER TABLE products ADD COLUMN model VARCHAR(100);
    END IF;
    
    -- warranty_months
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='warranty_months') THEN
        ALTER TABLE products ADD COLUMN warranty_months INT DEFAULT 12;
    END IF;
    
    -- is_serializable
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_serializable') THEN
        ALTER TABLE products ADD COLUMN is_serializable BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- is_batchable
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_batchable') THEN
        ALTER TABLE products ADD COLUMN is_batchable BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- maintenance_cycle_days
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='maintenance_cycle_days') THEN
        ALTER TABLE products ADD COLUMN maintenance_cycle_days INT DEFAULT 180;
    END IF;
    
    -- created_by
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='created_by') THEN
        ALTER TABLE products ADD COLUMN created_by INT REFERENCES users(id);
    END IF;
    
    -- updated_by
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='updated_by') THEN
        ALTER TABLE products ADD COLUMN updated_by INT REFERENCES users(id);
    END IF;
END $$;

-- 3. Agregar campos a la tabla suppliers
DO $$
BEGIN
    -- state
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='suppliers' AND column_name='state') THEN
        ALTER TABLE suppliers ADD COLUMN state VARCHAR(60);
    END IF;
    
    -- postal_code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='suppliers' AND column_name='postal_code') THEN
        ALTER TABLE suppliers ADD COLUMN postal_code VARCHAR(12);
    END IF;
    
    -- lead_time_days
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='suppliers' AND column_name='lead_time_days') THEN
        ALTER TABLE suppliers ADD COLUMN lead_time_days INT DEFAULT 7;
    END IF;
    
    -- created_by
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='suppliers' AND column_name='created_by') THEN
        ALTER TABLE suppliers ADD COLUMN created_by INT REFERENCES users(id);
    END IF;
    
    -- updated_by
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='suppliers' AND column_name='updated_by') THEN
        ALTER TABLE suppliers ADD COLUMN updated_by INT REFERENCES users(id);
    END IF;
    
    -- Agregar updated_at si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='suppliers' AND column_name='updated_at') THEN
        ALTER TABLE suppliers ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Campos agregados exitosamente a las tablas existentes';
END $$;
