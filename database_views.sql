-- =========================================================
--  VISTAS DE REPORTES - SISTEMA DE INVENTARIO
--  Vistas optimizadas para reportes y consultas frecuentes
-- =========================================================

/* VISTA 1: Stock Global por Producto */
CREATE OR REPLACE VIEW v_product_stock AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.brand,
    p.model,
    p.barcode,
    c.name as category,
    c.code as category_code,
    COALESCE(SUM(pw.stock), 0) as total_stock,
    COALESCE(SUM(pw.reserved), 0) as total_reserved,
    COALESCE(SUM(pw.stock - pw.reserved), 0) as total_available,
    p.stock_min,
    p.stock_max,
    p.price,
    p.cost,
    p.warranty_months,
    p.is_serializable,
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

COMMENT ON VIEW v_product_stock IS 'Vista consolidada de stock global por producto con valores de inventario';

/* VISTA 2: Trazabilidad de Equipos por Serial */
CREATE OR REPLACE VIEW v_assets_tracking AS
SELECT 
    sn.id,
    sn.serial,
    p.name as product_name,
    p.sku,
    p.brand,
    p.model,
    p.warranty_months,
    c.name as category,
    sn.status,
    w.name as warehouse,
    w.code as warehouse_code,
    w.type as warehouse_type,
    sn.notes,
    sn.created_at as registered_at,
    -- Información del último movimiento de entrada
    mi.created_at as last_entry_date,
    mi.reference as entry_reference,
    -- Información del último movimiento de salida
    mo.created_at as last_exit_date,
    mo.reference as exit_reference,
    -- Días desde el registro
    EXTRACT(DAY FROM NOW() - sn.created_at)::INT as days_since_registration
FROM serial_numbers sn
JOIN products p ON sn.product_id = p.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN warehouses w ON sn.warehouse_id = w.id
LEFT JOIN inventory_movements mi ON sn.movement_in_id = mi.id
LEFT JOIN inventory_movements mo ON sn.movement_out_id = mo.id;

COMMENT ON VIEW v_assets_tracking IS 'Vista de trazabilidad completa de equipos individuales por serial';

/* VISTA 3: Órdenes de Mantenimiento Activas */
CREATE OR REPLACE VIEW v_maintenance_active AS
SELECT 
    mo.id,
    mo.code,
    sn.serial,
    p.name as product_name,
    p.brand,
    p.model,
    mt.name as maintenance_type,
    mo.status,
    mo.priority,
    mo.planned_date,
    mo.start_date,
    mo.end_date,
    mo.cost_parts,
    mo.cost_labor,
    (mo.cost_parts + mo.cost_labor) as total_cost,
    mo.provider,
    u.name as technician,
    u.email as technician_email,
    mo.description,
    mo.notes,
    -- Días hasta el mantenimiento programado
    CASE 
        WHEN mo.planned_date IS NOT NULL THEN 
            EXTRACT(DAY FROM mo.planned_date - CURRENT_DATE)::INT
        ELSE NULL
    END as days_until_maintenance,
    -- Duración del mantenimiento (si ya finalizó)
    CASE 
        WHEN mo.start_date IS NOT NULL AND mo.end_date IS NOT NULL THEN
            EXTRACT(DAY FROM mo.end_date - mo.start_date)::INT
        ELSE NULL
    END as maintenance_duration_days,
    mo.created_at
FROM maintenance_orders mo
JOIN serial_numbers sn ON mo.asset_id = sn.id
JOIN products p ON sn.product_id = p.id
JOIN maintenance_types mt ON mo.type_id = mt.id
LEFT JOIN users u ON mo.technician_id = u.id
WHERE mo.status IN ('abierto', 'en_proceso')
ORDER BY 
    CASE mo.priority
        WHEN 'critica' THEN 1
        WHEN 'alta' THEN 2
        WHEN 'media' THEN 3
        WHEN 'baja' THEN 4
    END,
    mo.planned_date ASC NULLS LAST;

COMMENT ON VIEW v_maintenance_active IS 'Vista de órdenes de mantenimiento activas ordenadas por prioridad';

/* VISTA 4: Alertas de Stock Bajo */
CREATE OR REPLACE VIEW v_low_stock_alerts AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.brand,
    p.model,
    c.name as category,
    COALESCE(SUM(pw.stock), 0) as current_stock,
    p.stock_min,
    p.stock_min - COALESCE(SUM(pw.stock), 0) as quantity_needed,
    s.name as supplier,
    s.email as supplier_email,
    s.phone as supplier_phone,
    s.lead_time_days,
    p.cost,
    (p.stock_min - COALESCE(SUM(pw.stock), 0)) * p.cost as estimated_purchase_cost
FROM products p
LEFT JOIN product_warehouse pw ON p.id = pw.product_id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.active = true
GROUP BY p.id, p.name, p.sku, p.brand, p.model, c.name, p.stock_min, p.cost,
         s.name, s.email, s.phone, s.lead_time_days
HAVING COALESCE(SUM(pw.stock), 0) <= p.stock_min
ORDER BY quantity_needed DESC;

COMMENT ON VIEW v_low_stock_alerts IS 'Vista de productos con stock bajo o agotado que requieren reabastecimiento';

/* VISTA 5: Inventario Valorizado por Almacén */
CREATE OR REPLACE VIEW v_warehouse_stock AS
SELECT 
    w.id as warehouse_id,
    w.name as warehouse,
    w.code as warehouse_code,
    w.type as warehouse_type,
    w.city,
    um.name as manager,
    COUNT(DISTINCT pw.product_id) as products_count,
    SUM(pw.stock) as total_units,
    SUM(pw.reserved) as total_reserved,
    SUM(pw.stock - pw.reserved) as total_available,
    SUM(pw.stock * p.cost) as inventory_value_cost,
    SUM(pw.stock * p.price) as inventory_value_price,
    SUM(pw.stock * p.price) - SUM(pw.stock * p.cost) as potential_profit,
    -- Conteo de equipos serializados
    (SELECT COUNT(*) FROM serial_numbers sn WHERE sn.warehouse_id = w.id) as serialized_assets_count
FROM warehouses w
LEFT JOIN product_warehouse pw ON w.id = pw.warehouse_id
LEFT JOIN products p ON pw.product_id = p.id
LEFT JOIN users um ON w.manager_id = um.id
WHERE w.active = true AND (p.active = true OR p.id IS NULL)
GROUP BY w.id, w.name, w.code, w.type, w.city, um.name;

COMMENT ON VIEW v_warehouse_stock IS 'Vista de inventario valorizado por almacén con métricas financieras';

/* VISTA 6: Movimientos Mensuales */
CREATE OR REPLACE VIEW v_movements_monthly AS
SELECT 
    DATE_TRUNC('month', movement_date)::DATE as month,
    type,
    COUNT(*) as total_movements,
    SUM(ABS(quantity)) as total_quantity,
    SUM(COALESCE(total_cost, ABS(quantity) * COALESCE(unit_cost, 0))) as total_value,
    AVG(COALESCE(unit_cost, 0)) as avg_unit_cost
FROM inventory_movements
WHERE movement_date >= DATE_TRUNC('month', NOW() - INTERVAL '12 months')
GROUP BY DATE_TRUNC('month', movement_date), type
ORDER BY month DESC, type;

COMMENT ON VIEW v_movements_monthly IS 'Vista de movimientos de inventario agregados por mes y tipo';

/* VISTA 7: Próximos Mantenimientos Programados */
CREATE OR REPLACE VIEW v_maintenance_upcoming AS
SELECT 
    mo.id,
    mo.code,
    sn.serial,
    p.name as product_name,
    p.brand,
    p.model,
    mt.name as maintenance_type,
    mo.priority,
    mo.planned_date,
    EXTRACT(DAY FROM mo.planned_date - CURRENT_DATE)::INT as days_until,
    u.name as technician,
    mo.description,
    CASE 
        WHEN mo.planned_date < CURRENT_DATE THEN 'vencido'
        WHEN mo.planned_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'urgente'
        WHEN mo.planned_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'proximo'
        ELSE 'programado'
    END as urgency_status
FROM maintenance_orders mo
JOIN serial_numbers sn ON mo.asset_id = sn.id
JOIN products p ON sn.product_id = p.id
JOIN maintenance_types mt ON mo.type_id = mt.id
LEFT JOIN users u ON mo.technician_id = u.id
WHERE mo.status = 'abierto'
  AND mo.planned_date IS NOT NULL
ORDER BY mo.planned_date ASC;

COMMENT ON VIEW v_maintenance_upcoming IS 'Vista de mantenimientos próximos con indicador de urgencia';

/* VISTA 8: Historial de Auditoría Reciente */
CREATE OR REPLACE VIEW v_audit_recent AS
SELECT 
    al.id,
    al.table_name,
    al.record_id,
    al.action,
    al.old_values,
    al.new_values,
    u.name as changed_by_user,
    u.email as changed_by_email,
    al.changed_at,
    EXTRACT(DAY FROM NOW() - al.changed_at)::INT as days_ago
FROM audit_logs al
LEFT JOIN users u ON al.changed_by = u.id
WHERE al.changed_at >= NOW() - INTERVAL '30 days'
ORDER BY al.changed_at DESC;

COMMENT ON VIEW v_audit_recent IS 'Vista de cambios de auditoría de los últimos 30 días';

-- =========================================================
-- MENSAJE DE CONFIRMACIÓN
-- =========================================================
DO $$ BEGIN
    RAISE NOTICE '✅ Vistas de reportes creadas exitosamente';
    RAISE NOTICE '📊 Total de vistas: 8';
    RAISE NOTICE '   - v_product_stock (Stock global)';
    RAISE NOTICE '   - v_assets_tracking (Trazabilidad)';
    RAISE NOTICE '   - v_maintenance_active (Mantenimientos activos)';
    RAISE NOTICE '   - v_low_stock_alerts (Alertas de stock)';
    RAISE NOTICE '   - v_warehouse_stock (Inventario por almacén)';
    RAISE NOTICE '   - v_movements_monthly (Movimientos mensuales)';
    RAISE NOTICE '   - v_maintenance_upcoming (Próximos mantenimientos)';
    RAISE NOTICE '   - v_audit_recent (Auditoría reciente)';
END $$;
