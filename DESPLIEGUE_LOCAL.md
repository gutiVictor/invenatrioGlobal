# 🚀 Guía de Despliegue Local

## Estado Actual

✅ **Fase 1 COMPLETADA:** Scripts SQL listos
✅ **Fase 2 COMPLETADA:** Backend actualizado (modelos, controladores, rutas)

---

## Pasos para Desplegar

### 1. Preparar Base de Datos

**Opción A: Base de Datos Nueva**
```sql
-- Conectarse a PostgreSQL
psql -U postgres

-- Crear la base de datos
CREATE DATABASE inventario_db;

-- Salir
\q
```

**Opción B: Base de Datos Existente**
Si ya tienes `inventario_db`, asegúrate de hacer un backup primero:
```bash
pg_dump -U postgres inventario_db > backup_$(date +%Y%m%d).sql
```

### 2. Ejecutar Migración

**Opción A: Usando el script Node.js (Recomendado)**
```bash
cd backend
node src/scripts/migrate.js
```

**Opción B: Usando psql directamente**
```bash
psql -U postgres -d inventario_db -f migration_complete.sql
```

### 3. Iniciar Backend

```bash
cd backend
npm run dev
```

El backend estará disponible en: `http://localhost:3000`

### 4. Iniciar Frontend

```bash
cd frontend
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

---

## Verificación

### Backend
Visita: `http://localhost:3000/`

Deberías ver:
```json
{
  "success": true,
  "message": "API Sistema de Inventario Global",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "products": "/api/products",
    "categories": "/api/categories",
    "assets": "/api/assets",
    "maintenance": "/api/maintenance",
    "warehouses": "/api/warehouses",
    "suppliers": "/api/suppliers",
    "serialNumbers": "/api/serial-numbers",
    "audit": "/api/audit"
  }
}
```

### Frontend
Visita: `http://localhost:5173/`

---

## Credenciales por Defecto

**Usuario:** admin@empresa.com  
**Password:** Admin123!

⚠️ **IMPORTANTE:** Cambiar la contraseña en producción

---

## Troubleshooting

### Error: "Database does not exist"
```bash
createdb -U postgres inventario_db
```

### Error: "Port 3000 already in use"
Cambia el puerto en `backend/.env`:
```
PORT=3001
```

### Error: "Cannot connect to database"
Verifica las credenciales en `backend/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventario_db
DB_USER=postgres
DB_PASSWORD=tu_password
```

---

## Archivos Importantes

- `migration_complete.sql` - Script de migración completo
- `backend/src/scripts/migrate.js` - Script Node.js para migración
- `backend/.env` - Configuración del backend
- `frontend/.env` - Configuración del frontend

---

**Siguiente paso:** Ejecuta la migración y luego inicia los servidores
