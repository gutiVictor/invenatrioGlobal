-- Migration: Add fields to categories table

-- Add updated_at
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add created_by (nullable for now, as existing records might not have it)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Add updated_by
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Add code (unique)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS code VARCHAR(20);
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_code ON categories(code);

-- Add slug (unique)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(100);
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Add metadata (JSONB for flexibility)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create trigger for updated_at if it doesn't exist (it might already exist from init script)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_categories_updated_at') THEN
        CREATE TRIGGER trg_categories_updated_at
        BEFORE UPDATE ON categories
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
