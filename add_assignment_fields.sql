-- =====================================================
-- Migración: Agregar campos adicionales a asset_assignments
-- Fecha: 2025-11-28
-- Descripción: Mejora del sistema de asignación con más datos del empleado
-- =====================================================

-- Agregar nuevos campos para información del empleado
ALTER TABLE asset_assignments 
ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS employee_email VARCHAR(150),
ADD COLUMN IF NOT EXISTS employee_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS job_title VARCHAR(100),
ADD COLUMN IF NOT EXISTS physical_location VARCHAR(200),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS assigned_by VARCHAR(150);

-- Comentarios para documentación
COMMENT ON COLUMN asset_assignments.employee_id IS 'Employee ID from HR system for integration';
COMMENT ON COLUMN asset_assignments.employee_email IS 'Email address for notifications and contact';
COMMENT ON COLUMN asset_assignments.employee_phone IS 'Phone number for contact';
COMMENT ON COLUMN asset_assignments.job_title IS 'Job title or position of the employee';
COMMENT ON COLUMN asset_assignments.physical_location IS 'Physical location where the asset is being used';
COMMENT ON COLUMN asset_assignments.notes IS 'Additional notes about the assignment';
COMMENT ON COLUMN asset_assignments.assigned_by IS 'User who authorized this assignment';

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_asset_assignments_employee_id ON asset_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_employee_email ON asset_assignments(employee_email);

-- Constraint para validar formato de email (solo si no es NULL)
ALTER TABLE asset_assignments DROP CONSTRAINT IF EXISTS chk_employee_email;
ALTER TABLE asset_assignments
ADD CONSTRAINT chk_employee_email 
CHECK (employee_email IS NULL OR employee_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Verificar que la migración se ejecutó correctamente
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'asset_assignments'
AND column_name IN ('employee_id', 'employee_email', 'employee_phone', 'job_title', 'physical_location', 'notes', 'assigned_by')
ORDER BY ordinal_position;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Migración completada: 7 nuevos campos agregados a asset_assignments';
    RAISE NOTICE '📋 Campos agregados: employee_id, employee_email, employee_phone, job_title, physical_location, notes, assigned_by';
    RAISE NOTICE '🔍 Índices creados para employee_id y employee_email';
END $$;
