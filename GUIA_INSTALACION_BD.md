# 🗄️ Guía de Instalación de Base de Datos PostgreSQL

## 📋 Paso a Paso para Crear la Base de Datos

### ✅ Paso 1: Crear la Base de Datos en pgAdmin

1. **Abre pgAdmin 4** (ya lo tienes abierto según veo en tu imagen)

2. **Conecta al servidor PostgreSQL 18**
   - En el panel izquierdo, haz clic en: **Servers → PostgreSQL 18**
   - Te pedirá la contraseña que configuraste durante la instalación
   - Ingresa la contraseña

3. **Crear nueva base de datos**
   - Haz clic derecho en **"Databases"**
   - Selecciona: **Create → Database...**
   
4. **Configurar la base de datos:**
   - **Database name**: `inventario_db`
   - **Owner**: `postgres` (o el usuario que quieras)
   - **Encoding**: `UTF8`
   - **Template**: `template0`
   - **Collation**: Dejar por defecto
   - Clic en **"Save"**

---

### ✅ Paso 2: Ejecutar el Script SQL

1. **Selecciona la base de datos creada**
   - En el panel izquierdo, expande **"Databases"**
   - Haz clic en **"inventario_db"**

2. **Abrir Query Tool**
   - Con `inventario_db` seleccionada
   - Clic en el menú superior: **Tools → Query Tool**
   - O presiona el icono de rayo ⚡ en la barra de herramientas

3. **Cargar el script**
   - En la ventana Query Tool que se abrió
   - Clic en el icono de carpeta 📁 (**Open File**)
   - Navega a: `G:\WEB\invenatrioGlobal\database_init.sql`
   - Selecciona y abre el archivo

4. **Ejecutar el script**
   - Verifica que el contenido del script esté visible
   - Clic en el botón **▶ Execute/Refresh** (F5)
   - O presiona `F5`

5. **Verificar que se ejecutó correctamente**
   - En el panel inferior verás: ✅ mensajes de éxito
   - Si hay errores ❌, cópialos y me los pasas

---

### ✅ Paso 3: Verificar las Tablas Creadas

1. **Refrescar la vista**
   - En el panel izquierdo, haz clic derecho en **"inventario_db"**
   - Selecciona **"Refresh"**

2. **Ver las tablas**
   - Expande: **inventario_db → Schemas → public → Tables**
   - Deberías ver 8 tablas:
     - ✅ `categories`
     - ✅ `customers`
     - ✅ `inventory_movements`
     - ✅ `product_warehouse`
     - ✅ `products`
     - ✅ `suppliers`
     - ✅ `users`
     - ✅ `warehouses`

3. **Ver las Vistas**
   - Expande: **inventario_db → Schemas → public → Views**
   - Deberías ver 4 vistas:
     - ✅ `v_low_stock_alerts`
     - ✅ `v_movements_monthly`
     - ✅ `v_product_stock`
     - ✅ `v_warehouse_stock`

---

### ✅ Paso 4: Verificar Datos Iniciales

Ejecuta esta consulta en Query Tool para verificar:

```sql
-- Ver usuario admin creado
SELECT * FROM users;

-- Ver categorías creadas
SELECT * FROM categories;

-- Ver almacenes creados
SELECT * FROM warehouses;
```

Deberías ver:
- **1 usuario**: admin@inventario.com
- **5 categorías**: Electrónica, Ropa, Alimentos, Hogar, Deportes
- **2 almacenes**: ALM-01, ALM-02

---

## 🔑 Credenciales de Acceso

### Usuario Administrador del Sistema:
- **Email**: `admin@inventario.com`
- **Password**: `Admin123!`
- **Rol**: admin

⚠️ **IMPORTANTE**: Cambiar esta contraseña en producción

---

## 🎯 Datos de Conexión para el Backend

Guarda estos datos para cuando configures el backend:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventario_db
DB_USER=postgres
DB_PASSWORD=[tu_contraseña_de_postgres]
```

---

## ⚠️ Solución de Problemas Comunes

### Error: "Extension does not exist"
Si ves este error, es porque falta una extensión. No es crítico para iniciar.

### Error: "Permission denied"
Asegúrate de estar conectado como usuario con permisos (postgres).

### Error: "Database already exists"
Si la base de datos ya existe, puedes:
1. Eliminarla: `DROP DATABASE inventario_db;`
2. O usar otra con diferente nombre

### No se ven las tablas después de ejecutar
1. Verifica que el script se ejecutó sin errores
2. Refresca la vista (clic derecho → Refresh)
3. Asegúrate de estar viendo el schema "public"

---

## 📊 Consultas Útiles de Verificación

```sql
-- Ver todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Ver todas las vistas creadas
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public';

-- Contar registros en cada tabla
SELECT 
    'users' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'warehouses', COUNT(*) FROM warehouses;
```

---

## ✅ Checklist de Verificación

Marca lo que has completado:

- [ ] PostgreSQL instalado
- [ ] pgAdmin 4 funcionando
- [ ] Base de datos `inventario_db` creada
- [ ] Script `database_init.sql` ejecutado sin errores
- [ ] 8 tablas visibles en pgAdmin
- [ ] 4 vistas creadas
- [ ] Usuario admin existe
- [ ] 5 categorías creadas
- [ ] 2 almacenes creados
- [ ] Guardadas credenciales de conexión

---

## 🚀 Próximos Pasos

Una vez completada la base de datos:

1. ✅ Configurar el proyecto Backend (Node.js + Express)
2. ✅ Conectar el backend con PostgreSQL
3. ✅ Crear las APIs REST
4. ✅ Configurar el Frontend (React)
5. ✅ Conectar Frontend con Backend

---

**¿Necesitas ayuda con algún paso?** Envíame un screenshot si encuentras algún error.
