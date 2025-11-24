# 🚀 Backend - Sistema de Inventario Global

API REST construida con Node.js, Express y PostgreSQL.

## 📋 Requisitos Previos

- Node.js 18+
- PostgreSQL 14+ con la base de datos `inventario_db` creada
- npm o yarn

## 🔧 Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
# IMPORTANTE: Actualizar DB_PASSWORD con tu contraseña de PostgreSQL
```

### 3. Verificar que la base de datos existe

Asegúrate de haber ejecutado el script `database_init.sql` en PostgreSQL.

## ▶️ Ejecutar el Backend

### Modo Desarrollo (con nodemon)

```bash
npm run dev
```

### Modo Producción

```bash
npm start
```

El servidor estará disponible en: **http://localhost:3000**

## 📡 Endpoints Disponibles

### Autenticación

#### POST /api/auth/login
Login de usuario

**Request:**
```json
{
  "email": "admin@inventario.com",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Administrador",
      "email": "admin@inventario.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET /api/auth/profile
Obtener perfil del usuario autenticado

**Headers:**
```
Authorization: Bearer {token}
```

#### POST /api/auth/register
Registrar nuevo usuario (solo admin)

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@empresa.com",
  "password": "password123",
  "role": "operator"
}
```

### Productos

Todas las rutas requieren autenticación (header Authorization)

#### GET /api/products
Listar productos con paginación y búsqueda

**Query params:**
- `page`: número de página (default: 1)
- `limit`: productos por página (default: 20)
- `search`: búsqueda por nombre, SKU o barcode
- `category_id`: filtrar por categoría
- `active`: filtrar por activos (true/false/all)

**Ejemplo:**
```
GET /api/products?page=1&limit=10&search=laptop&active=true
```

#### GET /api/products/:id
Obtener un producto por ID

#### POST /api/products
Crear nuevo producto (admin y manager)

**Request:**
```json
{
  "name": "Laptop Dell XPS 15",
  "sku": "DELL-XPS15-001",
  "barcode": "7501234567890",
  "description": "Laptop de alto rendimiento",
  "category_id": 1,
  "price": 25000.00,
  "cost": 18000.00,
  "stock_min": 5,
  "stock_max": 20,
  "unit": "unidad"
}
```

#### PUT /api/products/:id
Actualizar producto (admin y manager)

#### DELETE /api/products/:id
Eliminar producto (solo admin) - Soft delete

## 🔐 Autenticación

El sistema usa **JWT (JSON Web Tokens)** para autenticación.

### Cómo usar:

1. Hacer login en `/api/auth/login`
2. Copiar el token del response
3. Incluir el token en el header de las peticiones:
   ```
   Authorization: Bearer {tu_token}
   ```

### Roles y Permisos

- **admin**: Acceso total
- **manager**: Gestionar productos e inventario
- **operator**: Registrar movimientos
- **viewer**: Solo lectura

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuraciones
│   │   ├── database.js  # Conexión PostgreSQL
│   │   └── jwt.js       # Configuración JWT
│   ├── controllers/     # Controladores
│   │   ├── authController.js
│   │   └── productController.js
│   ├── middleware/      # Middlewares
│   │   └── auth.js      # Autenticación y autorización
│   ├── models/          # Modelos Sequelize
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Product.js
│   │   └── index.js
│   ├── routes/          # Rutas
│   │   ├── auth.routes.js
│   │   ├── products.routes.js
│   │   └── index.js
│   └── app.js           # Aplicación principal
├── .env.example         # Variables de entorno ejemplo
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Probar la API

### Usando cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@inventario.com","password":"Admin123!"}'

# Listar productos (con token)
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer {tu_token}"
```

### Usando Postman / Thunder Client

1. Importar la colección de endpoints
2. Configurar variable de entorno `baseUrl`: http://localhost:3000
3. Hacer login y guardar el token
4. Probar los demás endpoints

## 🔍 Logs y Debugging

El servidor usa `morgan` para logs en desarrollo.

Ver logs en la consola:
- Peticiones HTTP
- Conexión a base de datos
- Errores

## ⚠️ Problemas Comunes

### Error: "Cannot connect to database"
- Verifica que PostgreSQL esté corriendo
- Revisa las credenciales en `.env`
- Asegúrate que la base de datos `inventario_db` existe

### Error: "Port 3000 already in use"
- Cambia el puerto en `.env`: `PORT=3001`
- O mata el proceso: `npx kill-port 3000`

### Error: "Token invalid"
- El token expiró (default: 7 días)
- Haz login nuevamente para obtener un nuevo token

## 📝 Próximos Pasos

- [ ] Implementar endpoints de categorías
- [ ] Implementar endpoints de almacenes
- [ ] Implementar endpoints de movimientos de inventario
- [ ] Implementar sistema de reportes
- [ ] Agregar tests unitarios
- [ ] Documentación con Swagger

## 📞 Soporte

Para problemas o dudas contactar al equipo de desarrollo.

---

**Última actualización:** Noviembre 2025
