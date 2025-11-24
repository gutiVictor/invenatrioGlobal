# 📊 Informe de Comparación de Bases de Datos
## Sistema de Inventario con Trazabilidad de Equipos

**Fecha:** 2025-11-24  
**Comparación:** `database_init.sql` vs `database_init_new.sql`

---

## 🎯 Resumen Ejecutivo

La nueva base de datos (`database_init_new.sql`) representa una **evolución significativa** orientada específicamente a equipos de cómputo y oficina con **trazabilidad individual** y **gestión de mantenimiento**. Los cambios son **VIABLES y RECOMENDADOS** para una empresa mediana que requiere seguimiento detallado de activos tecnológicos.

### ✅ Recomendación: **IMPLEMENTAR LA NUEVA BD**

---

## 📋 Tabla Comparativa de Cambios

| Aspecto | BD Original | BD Nueva | Impacto |
|---------|-------------|----------|---------|
| **Tablas Totales** | 8 tablas | 13 tablas | ⬆️ +62% |
| **ENUMs** | 3 tipos | 6 tipos | ⬆️ +100% |
| **Trazabilidad** | ❌ No | ✅ Sí (serial_numbers) | 🔥 CRÍTICO |
| **Mantenimiento** | ❌ No | ✅ Sí (3 tablas) | 🔥 CRÍTICO |
| **Auditoría** | ❌ No | ✅ Sí (audit_logs) | ⭐ IMPORTANTE |
| **Enfoque** | Inventario general | Equipos IT específicos | 🎯 ESPECIALIZADO |

---

## 🆕 Nuevas Funcionalidades

### 1. **Trazabilidad Individual de Equipos** 🏷️

#### Nueva Tabla: `serial_numbers`
```sql
CREATE TABLE serial_numbers (
    id              SERIAL PRIMARY KEY,
    product_id      INT NOT NULL,
    serial          TEXT NOT NULL,
    status          sn_status DEFAULT 'available',
    warehouse_id    INT,
    movement_in_id  INT,
    movement_out_id INT,
    notes           TEXT
)
```

**Beneficios:**
- ✅ Seguimiento individual de cada laptop, desktop, monitor
- ✅ Historial completo de movimientos por equipo
- ✅ Estados: `available`, `sold`, `damaged`, `RMA`, `maintenance`
- ✅ Relación con movimientos de entrada/salida

**Caso de Uso:**
> "¿Dónde está la laptop con serial ABC123?"  
> "¿Cuándo se vendió el monitor XYZ456?"  
> "¿Qué equipos están en RMA?"

---

### 2. **Sistema de Mantenimiento Completo** 🔧

#### Nuevas Tablas:

**a) `maintenance_types`**
- Preventivo
- Correctivo
- Calibración

**b) `maintenance_orders`**
```sql
CREATE TABLE maintenance_orders (
    id              SERIAL PRIMARY KEY,
    asset_id        INT NOT NULL REFERENCES serial_numbers,
    type_id         INT NOT NULL,
    code            VARCHAR(20) UNIQUE,
    status          mo_status DEFAULT 'abierto',
    priority        priority DEFAULT 'media',
    planned_date    DATE,
    cost_parts      DECIMAL(10,2),
    cost_labor      DECIMAL(10,2),
    technician_id   INT
)
```

**c) `maintenance_items`**
- Detalle de tareas y repuestos por orden

**Beneficios:**
- ✅ Programación de mantenimientos preventivos
- ✅ Control de costos (repuestos + mano de obra)
- ✅ Asignación de técnicos
- ✅ Priorización de órdenes
- ✅ **Trigger automático**: crea mantenimiento preventivo al ingresar equipo nuevo

---

### 3. **Auditoría Completa** 📝

#### Nueva Tabla: `audit_logs`
```sql
CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    table_name  TEXT NOT NULL,
    record_id   INT NOT NULL,
    action      TEXT NOT NULL,
    old_values  JSONB,
    new_values  JSONB,
    changed_by  INT,
    changed_at  TIMESTAMP DEFAULT NOW()
)
```

**Beneficios:**
- ✅ Registro de todos los cambios
- ✅ Quién, qué, cuándo modificó
- ✅ Valores antes/después en formato JSON
- ✅ Cumplimiento normativo

---

## 🔄 Mejoras en Tablas Existentes

### **USERS**
| Campo Nuevo | Propósito |
|-------------|-----------|
| `phone` | Contacto del usuario |
| `email_verified_at` | Verificación de email |
| `must_reset_password` | Seguridad forzada |

### **CATEGORIES**
| Campo Nuevo | Propósito |
|-------------|-----------|
| `code` | Código único (ej: COM, LAP, DSK) |
| `created_by` / `updated_by` | Auditoría |

### **WAREHOUSES**
| Campo Nuevo | Propósito |
|-------------|-----------|
| `type` | CENTRAL / DAÑADOS / TRANSITO |
| `state`, `postal_code`, `country` | Dirección completa |
| `manager_id` | Responsable del almacén |
| `is_pickable` | Si se puede retirar stock |
| `created_by` / `updated_by` | Auditoría |

### **SUPPLIERS**
| Campo Nuevo | Propósito |
|-------------|-----------|
| `state`, `postal_code`, `country` | Dirección completa |
| `lead_time_days` | Tiempo de entrega |
| `created_by` / `updated_by` | Auditoría |

### **PRODUCTS**
| Campo Nuevo | Propósito |
|-------------|-----------|
| `brand` | Marca del equipo |
| `model` | Modelo específico |
| `warranty_months` | Garantía (default 12 meses) |
| `is_serializable` | Si requiere serial (default TRUE) |
| `is_batchable` | Si maneja lotes |
| `created_by` / `updated_by` | Auditoría |

### **PRODUCT_WAREHOUSE**
| Campo Nuevo | Propósito |
|-------------|-----------|
| `location_zone` | Ubicación física (ej: A-12) |
| `last_count_date` | Último conteo físico |
| `updated_by` | Auditoría |

### **INVENTORY_MOVEMENTS**
| Campo Nuevo | Propósito |
|-------------|-----------|
| `unit_price` | Precio unitario |
| `total_cost` | Costo total |
| `movement_date` | Fecha del movimiento (separada de created_at) |
| `batch_code` | Código de lote |
| `serial_numbers` | Seriales involucrados |
| `expiration_date` | Fecha de vencimiento |
| `updated_by` | Auditoría |

### **CUSTOMERS**
| Campo Nuevo | Propósito |
|-------------|-----------|
| `state`, `postal_code`, `country` | Dirección completa |
| `payment_terms_days` | Términos de pago |
| `created_by` / `updated_by` | Auditoría |

---

## ❌ Elementos Eliminados

### 1. **ENUM `customer_type`**
- **Original:** `retail`, `wholesale`, `distributor`
- **Nueva:** ❌ Eliminado
- **Impacto:** ⚠️ BAJO - Puede agregarse si se necesita clasificación de clientes

### 2. **Vistas Precalculadas**
- **Original:** 4 vistas (`v_product_stock`, `v_low_stock_alerts`, `v_warehouse_stock`, `v_movements_monthly`)
- **Nueva:** ❌ Eliminadas
- **Impacto:** ⚠️ MEDIO - Deberán recrearse en el backend o agregarse después

---

## 🎯 Datos Iniciales

### BD Original
- 1 usuario admin
- 5 categorías genéricas (Electrónica, Ropa, Alimentos, Hogar, Deportes)
- 2 almacenes (Principal, Secundario)

### BD Nueva
- 1 usuario admin
- **6 categorías especializadas en IT:**
  - Cómputo (COM)
  - Laptops (LAP)
  - Desktops (DSK)
  - Monitores (MON)
  - Impresión (IMP)
  - Oficina (OFI)
- **2 almacenes especializados:**
  - Almacén Central (ALM-CEN)
  - Almacén Dañados (ALM-DAÑ) ← **Nuevo concepto**
- 1 proveedor de ejemplo
- 3 tipos de mantenimiento

---

## 🔍 Análisis de Viabilidad

### ✅ **VENTAJAS de la Nueva BD**

1. **Trazabilidad Total**
   - Cada equipo tiene un serial único
   - Historial completo de movimientos
   - Ubicación actual en tiempo real

2. **Gestión de Mantenimiento**
   - Programación de mantenimientos preventivos
   - Control de costos
   - Asignación de técnicos
   - Trigger automático al ingresar equipos

3. **Auditoría Robusta**
   - Registro de todos los cambios
   - Cumplimiento normativo
   - Trazabilidad de responsables

4. **Especialización en IT**
   - Campos específicos: `brand`, `model`, `warranty_months`
   - Categorías predefinidas para equipos
   - Almacén de dañados

5. **Mejor Control de Almacenes**
   - Tipos de almacén (CENTRAL, DAÑADOS, TRANSITO)
   - Zonas de ubicación
   - Fechas de conteo físico

6. **Campos de Auditoría**
   - `created_by` / `updated_by` en todas las tablas críticas
   - Mejor trazabilidad de cambios

---

### ⚠️ **CONSIDERACIONES**

1. **Migración de Datos**
   - Si ya tienes datos en la BD original, necesitarás un script de migración
   - Los productos existentes deberán clasificarse como serializables o no

2. **Vistas Eliminadas**
   - Deberás recrear las vistas de reportes:
     - Stock global por producto
     - Alertas de stock bajo
     - Stock por almacén
     - Movimientos mensuales

3. **Complejidad Aumentada**
   - Más tablas = más joins en consultas
   - Requiere capacitación del equipo
   - Mayor carga en el backend

4. **Trigger Automático de Mantenimiento**
   - El trigger `trg_serial_preventive` crea automáticamente una orden de mantenimiento
   - Requiere que exista el campo `maintenance_cycle_days` en `products` (⚠️ **NO ESTÁ DEFINIDO**)

5. **Campo Faltante**
   ```sql
   -- LÍNEA 278 del trigger hace referencia a:
   SELECT COALESCE(maintenance_cycle_days,180) INTO v_cycle FROM products...
   ```
   - ⚠️ **PROBLEMA:** El campo `maintenance_cycle_days` NO existe en la tabla `products`
   - 🔧 **SOLUCIÓN:** Agregar el campo a la tabla `products`

---

## 🛠️ Correcciones Necesarias

### 1. **Agregar Campo Faltante en Products**

```sql
ALTER TABLE products 
ADD COLUMN maintenance_cycle_days INT DEFAULT 180;

COMMENT ON COLUMN products.maintenance_cycle_days IS 'Días entre mantenimientos preventivos';
```

### 2. **Recrear Vistas de Reportes** (Opcional pero Recomendado)

```sql
-- Vista: Stock Global por Producto
CREATE OR REPLACE VIEW v_product_stock AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.brand,
    p.model,
    c.name as category,
    COALESCE(SUM(pw.stock), 0) as total_stock,
    COALESCE(SUM(pw.reserved), 0) as total_reserved,
    p.stock_min,
    p.stock_max,
    p.price,
    p.cost
FROM products p
LEFT JOIN product_warehouse pw ON p.id = pw.product_id
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.active = true
GROUP BY p.id, p.name, p.sku, p.brand, p.model, c.name, p.stock_min, p.stock_max, p.price, p.cost;

-- Vista: Equipos por Serial
CREATE OR REPLACE VIEW v_assets_tracking AS
SELECT 
    sn.id,
    sn.serial,
    p.name as product_name,
    p.brand,
    p.model,
    sn.status,
    w.name as warehouse,
    w.code as warehouse_code,
    sn.notes,
    sn.created_at
FROM serial_numbers sn
JOIN products p ON sn.product_id = p.id
LEFT JOIN warehouses w ON sn.warehouse_id = w.id;

-- Vista: Órdenes de Mantenimiento Activas
CREATE OR REPLACE VIEW v_maintenance_active AS
SELECT 
    mo.id,
    mo.code,
    sn.serial,
    p.name as product_name,
    mt.name as maintenance_type,
    mo.status,
    mo.priority,
    mo.planned_date,
    mo.cost_parts + mo.cost_labor as total_cost,
    u.name as technician
FROM maintenance_orders mo
JOIN serial_numbers sn ON mo.asset_id = sn.id
JOIN products p ON sn.product_id = p.id
JOIN maintenance_types mt ON mo.type_id = mt.id
LEFT JOIN users u ON mo.technician_id = u.id
WHERE mo.status IN ('abierto', 'en_proceso');
```

---

## 📊 Comparación de Casos de Uso

| Caso de Uso | BD Original | BD Nueva |
|-------------|-------------|----------|
| "¿Cuántas laptops tengo?" | ✅ Sí | ✅ Sí |
| "¿Dónde está la laptop serial ABC123?" | ❌ No | ✅ Sí |
| "¿Qué equipos necesitan mantenimiento?" | ❌ No | ✅ Sí |
| "¿Quién vendió el equipo XYZ?" | ⚠️ Parcial | ✅ Sí |
| "¿Cuánto cuesta mantener los equipos?" | ❌ No | ✅ Sí |
| "¿Qué equipos están en RMA?" | ❌ No | ✅ Sí |
| "Historial completo de un equipo" | ❌ No | ✅ Sí |
| "Alertas de stock bajo" | ✅ Sí (vista) | ⚠️ Requiere recrear vista |
| "Inventario valorizado" | ✅ Sí (vista) | ⚠️ Requiere recrear vista |

---

## 🎯 Recomendaciones Finales

### ✅ **IMPLEMENTAR LA NUEVA BD** con las siguientes acciones:

1. **Agregar campo faltante:**
   ```sql
   ALTER TABLE products ADD COLUMN maintenance_cycle_days INT DEFAULT 180;
   ```

2. **Recrear vistas de reportes** (ver sección anterior)

3. **Planificar migración de datos** si ya tienes información en la BD original:
   - Exportar productos, categorías, almacenes
   - Adaptar al nuevo esquema
   - Generar seriales para equipos existentes

4. **Actualizar el Backend:**
   - Modelos de Sequelize/TypeORM
   - Controladores para nuevas tablas
   - Endpoints para mantenimiento
   - Endpoints para trazabilidad de seriales

5. **Actualizar el Frontend:**
   - Formularios para serial numbers
   - Módulo de órdenes de mantenimiento
   - Dashboard de equipos
   - Reportes de auditoría

6. **Capacitación:**
   - Entrenar al equipo en el nuevo flujo
   - Documentar procesos de mantenimiento
   - Definir responsables

---

## 📈 Impacto en el Sistema

### **Backend** (Estimado: 3-5 días)
- ✅ Crear modelos para 5 nuevas tablas
- ✅ Crear controladores y rutas
- ✅ Implementar lógica de mantenimiento
- ✅ Implementar trazabilidad de seriales

### **Frontend** (Estimado: 5-7 días)
- ✅ Módulo de Serial Numbers
- ✅ Módulo de Órdenes de Mantenimiento
- ✅ Dashboard de equipos
- ✅ Reportes de auditoría
- ✅ Actualizar formularios existentes

### **Testing** (Estimado: 2-3 días)
- ✅ Pruebas de triggers
- ✅ Pruebas de trazabilidad
- ✅ Pruebas de mantenimiento
- ✅ Pruebas de migración

---

## ✅ Conclusión

La nueva base de datos es **SUPERIOR** para un sistema de inventario de equipos de cómputo y oficina en una empresa mediana. Ofrece:

- 🏷️ **Trazabilidad completa** de cada equipo
- 🔧 **Gestión profesional de mantenimiento**
- 📝 **Auditoría robusta**
- 🎯 **Especialización en IT**

### **Veredicto: IMPLEMENTAR** ✅

**Prioridad:** ALTA  
**Complejidad:** MEDIA  
**ROI:** ALTO  
**Tiempo estimado:** 10-15 días de desarrollo completo

---

## 📎 Próximos Pasos

1. ✅ Revisar y aprobar este informe
2. ⬜ Agregar campo `maintenance_cycle_days` a la tabla `products`
3. ⬜ Recrear vistas de reportes
4. ⬜ Crear script de migración (si aplica)
5. ⬜ Actualizar modelos del backend
6. ⬜ Actualizar componentes del frontend
7. ⬜ Realizar pruebas exhaustivas
8. ⬜ Capacitar al equipo
9. ⬜ Desplegar en producción

---

**Elaborado por:** Antigravity AI  
**Fecha:** 2025-11-24  
**Versión:** 1.0
