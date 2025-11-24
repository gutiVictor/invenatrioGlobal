# ✅ Resumen de Modelos Actualizados - Fase 2

## Modelos Actualizados (3)

### 1. `User.js` ✅
**Campos agregados:**
- `phone` (VARCHAR(25)) - Teléfono del usuario
- `email_verified_at` (DATE) - Fecha de verificación de email
- `must_reset_password` (BOOLEAN) - Forzar cambio de contraseña

### 2. `Product.js` ✅
**Campos agregados:**
- `brand` (VARCHAR(100)) - Marca del producto
- `model` (VARCHAR(100)) - Modelo del producto
- `warranty_months` (INTEGER, default 12) - Meses de garantía
- `is_serializable` (BOOLEAN, default true) - Si requiere número de serie
- `is_batchable` (BOOLEAN, default false) - Si maneja lotes
- `maintenance_cycle_days` (INTEGER, default 180) - Días entre mantenimientos
- `created_by` (INTEGER) - Usuario que creó el registro
- `updated_by` (INTEGER) - Usuario que actualizó el registro

**Campos eliminados:**
- `admission_date` - No existe en la nueva BD

### 3. `Supplier.js` ✅
**Campos agregados:**
- `state` (VARCHAR(60)) - Estado/provincia
- `postal_code` (VARCHAR(12)) - Código postal
- `lead_time_days` (INTEGER, default 7) - Días de entrega
- `created_by` (INTEGER) - Usuario que creó el registro
- `updated_by` (INTEGER) - Usuario que actualizó el registro

**Campos modificados:**
- `country` - Cambiado de VARCHAR(100) a VARCHAR(2) para códigos ISO
- `updatedAt` - Habilitado (antes estaba en false)

---

## Modelos que Ya Tenían los Campos Necesarios (2)

### 4. `Warehouse.js` ✅
Ya tenía todos los campos de la nueva BD:
- `state`, `postal_code`, `country`
- `manager_id`, `warehouse_type`, `is_pickable`
- `created_by`, `updated_by`

### 5. `Category.js` ✅
Ya tenía todos los campos de la nueva BD:
- `code`, `created_by`, `updated_by`

---

## Modelos Nuevos Creados (5)

### 6. `SerialNumber.js` ✅
**Tabla:** `serial_numbers`  
**Propósito:** Trazabilidad individual de equipos

**Campos:**
- `id` - PK
- `product_id` - FK a products
- `serial` - Número de serie (TEXT)
- `status` - ENUM('available', 'sold', 'damaged', 'RMA', 'maintenance')
- `warehouse_id` - FK a warehouses
- `movement_in_id` - FK a inventory_movements (entrada)
- `movement_out_id` - FK a inventory_movements (salida)
- `notes` - Notas adicionales
- `created_at` - Timestamp

**Índices:**
- UNIQUE (product_id, serial)
- INDEX (status)
- INDEX (warehouse_id)

---

### 7. `MaintenanceType.js` ✅
**Tabla:** `maintenance_types`  
**Propósito:** Catálogo de tipos de mantenimiento

**Campos:**
- `id` - PK
- `name` - VARCHAR(60) UNIQUE (Preventivo, Correctivo, Calibración)
- `description` - TEXT

**Sin timestamps**

---

### 8. `MaintenanceOrder.js` ✅
**Tabla:** `maintenance_orders`  
**Propósito:** Órdenes de mantenimiento

**Campos:**
- `id` - PK
- `asset_id` - FK a serial_numbers
- `type_id` - FK a maintenance_types
- `code` - VARCHAR(20) UNIQUE
- `description` - TEXT
- `status` - ENUM('abierto', 'en_proceso', 'finalizado', 'cancelado')
- `priority` - ENUM('baja', 'media', 'alta', 'critica')
- `planned_date` - DATE
- `start_date` - TIMESTAMP
- `end_date` - TIMESTAMP
- `cost_parts` - DECIMAL(10,2)
- `cost_labor` - DECIMAL(10,2)
- `provider` - VARCHAR(100)
- `technician_id` - FK a users
- `notes` - TEXT
- `created_by` - FK a users
- `updated_by` - FK a users
- `created_at`, `updated_at` - Timestamps

**Índices:**
- UNIQUE (code)
- INDEX (asset_id)
- INDEX (status)

---

### 9. `MaintenanceItem.js` ✅
**Tabla:** `maintenance_items`  
**Propósito:** Detalle de tareas y repuestos por orden

**Campos:**
- `id` - PK
- `order_id` - FK a maintenance_orders (ON DELETE CASCADE)
- `product_id` - FK a products (repuesto usado)
- `quantity` - INTEGER
- `unit_cost` - DECIMAL(10,2)
- `task` - TEXT (descripción de la tarea)
- `done` - BOOLEAN
- `created_at` - Timestamp

---

### 10. `AuditLog.js` ✅
**Tabla:** `audit_logs`  
**Propósito:** Registro de auditoría

**Campos:**
- `id` - BIGINT PK
- `table_name` - TEXT
- `record_id` - INTEGER
- `action` - TEXT
- `old_values` - JSONB
- `new_values` - JSONB
- `changed_by` - FK a users
- `changed_at` - TIMESTAMP

**Sin timestamps automáticos**

---

## Relaciones Configuradas en `index.js`

### Product
- `belongsTo` Category
- `belongsTo` Supplier
- `hasMany` SerialNumber
- `hasMany` MaintenanceItem

### SerialNumber
- `belongsTo` Product
- `belongsTo` Warehouse
- `hasMany` MaintenanceOrder

### MaintenanceOrder
- `belongsTo` SerialNumber (as 'asset')
- `belongsTo` MaintenanceType (as 'type')
- `belongsTo` User (as 'technician')
- `belongsTo` User (as 'creator')
- `hasMany` MaintenanceItem

### MaintenanceItem
- `belongsTo` MaintenanceOrder
- `belongsTo` Product

### Warehouse
- `belongsTo` User (as 'manager')
- `hasMany` SerialNumber

### User
- `hasMany` MaintenanceOrder (as 'assignedMaintenances')
- `hasMany` Warehouse (as 'managedWarehouses')
- `hasMany` AuditLog

### AuditLog
- `belongsTo` User

---

## Próximos Pasos

Ahora que los modelos están listos, el siguiente paso es crear los controladores y rutas para las nuevas entidades:

1. **Controladores a crear:**
   - `serialNumber.controller.js`
   - `maintenance.controller.js`
   - `audit.controller.js`

2. **Rutas a crear:**
   - `serialNumber.routes.js`
   - `maintenance.routes.js`
   - `audit.routes.js`

---

**Fecha:** 2025-11-24  
**Estado:** ✅ MODELOS COMPLETADOS
