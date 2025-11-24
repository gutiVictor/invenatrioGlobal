# 📦 Sistema de Inventario Global - Documentación Técnica

> Sistema de gestión de inventario robusto y escalable para empresas pequeñas y medianas

## 📋 Índice
- [Descripción General](#descripción-general)
- [Características Principales](#características-principales)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
- [Módulos del Sistema](#módulos-del-sistema)
- [API Documentation](#api-documentation)
- [Seguridad](#seguridad)
- [Testing](#testing)
- [Despliegue](#despliegue)
- [Roadmap](#roadmap)

---

## 🎯 Descripción General

Sistema integral de gestión de inventario diseñado para optimizar el control de productos, proveedores, clientes y movimientos de stock. Arquitectura modular que permite escalabilidad y fácil mantenimiento.

### Objetivos del Proyecto
- ✅ Control en tiempo real del inventario
- ✅ Gestión de múltiples almacenes/ubicaciones
- ✅ Trazabilidad completa de movimientos
- ✅ Reportes y analytics avanzados
- ✅ Sistema de alertas automáticas
- ✅ Multi-usuario con roles y permisos

---

## ✨ Características Principales

### Core Features
- **Gestión de Productos**
  - CRUD completo de productos
  - Categorización multinivel
  - Códigos de barras/QR
  - Control de variantes y SKUs
  - Imágenes y documentos adjuntos

- **Control de Stock**
  - Stock mínimo y máximo
  - Alertas de reabastecimiento
  - Múltiples ubicaciones/almacenes
  - Lotes y fechas de vencimiento
  - Inventario físico vs sistema

- **Movimientos de Inventario**
  - Entradas (compras, devoluciones)
  - Salidas (ventas, mermas)
  - Transferencias entre almacenes
  - Ajustes de inventario
  - Historial completo con trazabilidad

- **Gestión de Proveedores y Clientes**
  - Base de datos de contactos
  - Historial de transacciones
  - Términos de pago
  - Documentos asociados

- **Reportes y Analytics**
  - Dashboard ejecutivo
  - Reportes de movimientos
  - Análisis de rotación
  - Productos más/menos vendidos
  - Valorización de inventario
  - Exportación a Excel/PDF

### Features Avanzadas (Fase 2)
- 📊 Predicción de demanda con ML
- 🔔 Notificaciones push/email
- 📱 App móvil para escaneo
- 🔄 Integración con e-commerce
- 💰 Integración contable
- 📦 Órdenes de compra automáticas

---

## 🛠️ Stack Tecnológico

### Backend
```
- Runtime: Node.js v18+
- Framework: Express.js
- Database: PostgreSQL 14+ (Relacional)
- ORM: Prisma / Sequelize
- Cache: Redis (opcional para producción)
- File Storage: AWS S3 / Local Storage
```

### Frontend
```
- Framework: React 18+ con Vite
- State Management: Redux Toolkit / Zustand
- UI Library: Material-UI / Ant Design / Tailwind CSS
- Forms: React Hook Form + Zod
- Tables: TanStack Table (React Table v8)
- Charts: Recharts / Chart.js
- HTTP Client: Axios
```

### DevOps & Tools
```
- Version Control: Git + GitHub
- Container: Docker + Docker Compose
- CI/CD: GitHub Actions
- Testing: Jest + React Testing Library
- Linting: ESLint + Prettier
- Documentation: Swagger/OpenAPI
- Monitoring: PM2 / Winston (logs)
```

---

## 🏗️ Arquitectura del Sistema

### Arquitectura General
```
┌─────────────────┐
│   FRONTEND      │
│   (React SPA)   │
└────────┬────────┘
         │ HTTPS/REST
         ▼
┌─────────────────┐
│   API Gateway   │
│   (Express)     │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│ Auth   │ │Business│
│Service │ │ Logic  │
└────┬───┘ └───┬────┘
     │         │
     └────┬────┘
          ▼
    ┌──────────┐
    │PostgreSQL│
    └──────────┘
```

### Capas de la Aplicación

**1. Presentation Layer (Frontend)**
- Componentes React reutilizables
- Pages/Views con routing
- State management global
- Manejo de errores y loading states

**2. API Layer (Backend)**
- RESTful endpoints
- Autenticación JWT
- Validación de datos
- Rate limiting
- CORS configurado

**3. Business Logic Layer**
- Controladores
- Servicios de negocio
- Validaciones de negocio
- Cálculos y procesamiento

**4. Data Access Layer**
- Modelos de datos
- Repositorios
- Queries optimizados
- Migrations y seeds

**5. Database Layer**
- Esquema normalizado
- Índices optimizados
- Backups automáticos
- Auditoría de cambios

---

## 📁 Estructura del Proyecto

```
invenatrioGlobal/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuraciones
│   │   │   ├── database.js
│   │   │   ├── jwt.js
│   │   │   └── app.js
│   │   ├── models/           # Modelos de datos
│   │   │   ├── Product.js
│   │   │   ├── Category.js
│   │   │   ├── Movement.js
│   │   │   ├── Warehouse.js
│   │   │   ├── User.js
│   │   │   └── index.js
│   │   ├── controllers/      # Controladores
│   │   │   ├── productController.js
│   │   │   ├── inventoryController.js
│   │   │   ├── authController.js
│   │   │   └── reportController.js
│   │   ├── services/         # Lógica de negocio
│   │   │   ├── productService.js
│   │   │   ├── inventoryService.js
│   │   │   └── reportService.js
│   │   ├── middleware/       # Middlewares
│   │   │   ├── auth.js
│   │   │   ├── validate.js
│   │   │   ├── errorHandler.js
│   │   │   └── logger.js
│   │   ├── routes/           # Rutas API
│   │   │   ├── auth.routes.js
│   │   │   ├── products.routes.js
│   │   │   ├── inventory.routes.js
│   │   │   └── reports.routes.js
│   │   ├── utils/            # Utilidades
│   │   │   ├── validators.js
│   │   │   ├── helpers.js
│   │   │   └── constants.js
│   │   └── app.js            # Entrada principal
│   ├── tests/                # Tests
│   ├── migrations/           # Migraciones DB
│   ├── seeders/              # Datos de prueba
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   │   ├── common/
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   ├── Modal/
│   │   │   │   └── Table/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar/
│   │   │   │   ├── Sidebar/
│   │   │   │   └── Footer/
│   │   │   └── features/
│   │   │       ├── products/
│   │   │       ├── inventory/
│   │   │       └── reports/
│   │   ├── pages/            # Páginas
│   │   │   ├── Dashboard/
│   │   │   ├── Products/
│   │   │   ├── Inventory/
│   │   │   ├── Reports/
│   │   │   ├── Settings/
│   │   │   └── Login/
│   │   ├── services/         # API calls
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── productService.js
│   │   ├── store/            # State management
│   │   │   ├── slices/
│   │   │   └── store.js
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Utilidades
│   │   ├── styles/           # Estilos globales
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
├── README.md
└── docs/                     # Documentación adicional
    ├── API.md
    ├── DATABASE.md
    └── DEPLOYMENT.md
```

---

## 🚀 Instalación y Configuración

### Prerequisitos
- Node.js v18+
- PostgreSQL 14+
- Git
- Docker (opcional pero recomendado)

### Opción 1: Con Docker (Recomendado)

```bash
# Clonar el repositorio
git clone [URL_DEL_REPO]
cd invenatrioGlobal

# Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Editar archivos .env con tus credenciales

# Levantar servicios con Docker
docker-compose up -d

# Aplicar migraciones
docker-compose exec backend npm run migrate

# Cargar datos de prueba (opcional)
docker-compose exec backend npm run seed
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Database: localhost:5432

### Opción 2: Instalación Manual

#### Backend
```bash
cd backend

# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env
# Editar .env con tus credenciales

# Crear base de datos
createdb inventario_db

# Ejecutar migraciones
npm run migrate

# Iniciar en desarrollo
npm run dev

# Iniciar en producción
npm start
```

#### Frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env

# Iniciar en desarrollo
npm run dev

# Build para producción
npm run build
```

### Variables de Entorno

**Backend (.env)**
```env
# Server
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventario_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Sistema de Inventario
```

---

## 📦 Módulos del Sistema

### 1. Módulo de Autenticación
- Login/Logout
- Registro de usuarios
- Recuperación de contraseña
- Tokens JWT
- Roles y permisos (Admin, Manager, Operador, Viewer)

### 2. Módulo de Productos
- Crear/Editar/Eliminar productos
- Categorías y subcategorías
- Atributos personalizables
- Búsqueda y filtros avanzados
- Importación masiva (CSV/Excel)

### 3. Módulo de Inventario
- Vista consolidada de stock
- Movimientos de entrada/salida
- Transferencias entre almacenes
- Ajustes de inventario
- Historial de movimientos

### 4. Módulo de Reportes
- Dashboard con KPIs
- Reporte de ventas
- Reporte de compras
- Valorización de inventario
- Productos con bajo stock
- Exportación a PDF/Excel

### 5. Módulo de Configuración
- Gestión de usuarios
- Configuración de almacenes
- Categorías de productos
- Parámetros del sistema
- Backup y restauración

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### POST /auth/login
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Products Endpoints

#### GET /products
Query params: `page`, `limit`, `search`, `category`, `sort`

#### POST /products
```json
{
  "name": "Producto Ejemplo",
  "sku": "PROD-001",
  "description": "Descripción del producto",
  "category_id": 1,
  "price": 99.99,
  "cost": 50.00,
  "stock_min": 10,
  "stock_max": 100
}
```

#### GET /products/:id

#### PUT /products/:id

#### DELETE /products/:id

### Inventory Endpoints

#### GET /inventory
Ver stock actual por almacén

#### POST /inventory/movement
```json
{
  "type": "entrada|salida|transferencia|ajuste",
  "product_id": 1,
  "warehouse_id": 1,
  "quantity": 50,
  "reference": "COMP-001",
  "notes": "Compra a proveedor X"
}
```

#### GET /inventory/movements
Historial de movimientos

### Reports Endpoints

#### GET /reports/dashboard

#### GET /reports/stock-status

#### GET /reports/movements
Query params: `start_date`, `end_date`, `type`, `warehouse_id`

#### GET /reports/low-stock

---

## 🔒 Seguridad

### Implementaciones de Seguridad

1. **Autenticación y Autorización**
   - JWT tokens con expiración
   - Refresh tokens
   - Role-based access control (RBAC)
   - Password hashing con bcrypt (12+ rounds)

2. **Validación de Datos**
   - Validación en cliente y servidor
   - Sanitización de inputs
   - Protección contra SQL injection (ORM)
   - Validación de tipos con Zod/Joi

3. **Protección de API**
   - Rate limiting (express-rate-limit)
   - CORS configurado correctamente
   - Helmet.js para headers de seguridad
   - XSS protection
   - CSRF tokens

4. **Datos Sensibles**
   - Variables de entorno (.env)
   - Secrets en producción (AWS Secrets Manager)
   - Encriptación de datos sensibles
   - HTTPS obligatorio en producción

5. **Auditoría**
   - Logs de todas las operaciones críticas
   - Tracking de cambios en inventario
   - IP y timestamp en acciones

---

## 🧪 Testing

### Estrategia de Testing

```bash
# Backend - Unit & Integration Tests
cd backend
npm test                    # Todos los tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report

# Frontend - Component Tests
cd frontend
npm test
npm run test:e2e           # End-to-end tests con Playwright
```

### Coverage Mínimo Esperado
- Unit Tests: 80%+
- Integration Tests: 70%+
- E2E Critical Flows: 100%

---

## 🚢 Despliegue

### Desarrollo
```bash
docker-compose up
```

### Producción - Opciones

#### 1. Render / Railway (Fácil)
- Deploy automático desde GitHub
- PostgreSQL incluido
- SSL automático
- Escalado sencillo

#### 2. AWS / DigitalOcean (Control Total)
- EC2 / Droplet para aplicación
- RDS / Managed Database
- S3 para archivos
- CloudFront / CDN
- Load Balancer para escalado

#### 3. Vercel (Frontend) + Render (Backend)
- Frontend en Vercel
- Backend en Render
- DB en Supabase/Neon

### Checklist de Producción
- [ ] Variables de entorno configuradas
- [ ] SSL/HTTPS habilitado
- [ ] Backups automáticos de DB
- [ ] Monitoring configurado
- [ ] Logs centralizados
- [ ] Rate limiting activo
- [ ] CORS configurado correctamente
- [ ] Dominio personalizado
- [ ] Email service configurado

---

## 🗺️ Roadmap

### Fase 1 - MVP (4-6 semanas)
- [x] Definición de arquitectura
- [ ] Setup de proyecto (backend + frontend)
- [ ] Diseño de base de datos
- [ ] Autenticación y autorización
- [ ] CRUD de productos
- [ ] Gestión básica de inventario
- [ ] Dashboard principal
- [ ] Deploy en ambiente de desarrollo

### Fase 2 - Features Esenciales (4 semanas)
- [ ] Múltiples almacenes
- [ ] Sistema de reportes
- [ ] Exportación de datos
- [ ] Importación masiva
- [ ] Sistema de alertas
- [ ] Auditoría completa

### Fase 3 - Optimización (2-3 semanas)
- [ ] Optimización de queries
- [ ] Caching con Redis
- [ ] Tests completos
- [ ] Documentación final
- [ ] Deploy a producción

### Fase 4 - Features Avanzadas (Futuro)
- [ ] App móvil (React Native)
- [ ] Predicción de demanda con ML
- [ ] Integración con e-commerce
- [ ] API pública para integraciones
- [ ] Multi-tenancy (múltiples empresas)

---

## 👥 Equipo y Roles

### Roles Necesarios
- **Desarrollador Full Stack** (tú) - Core development
- **QA Tester** (opcional) - Testing y validación
- **Cliente/Product Owner** - Validación de requerimientos

---

## 📚 Recursos y Referencias

### Documentación
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Prisma Docs](https://www.prisma.io/docs/)

### Mejores Prácticas
- [REST API Best Practices](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Patterns](https://reactpatterns.com/)

---

## 📞 Soporte y Contacto

Para dudas o problemas:
- Email: [tu_email]
- GitHub Issues: [link_repo]/issues

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados © 2025

---

**Última actualización:** Noviembre 2025
**Versión:** 1.0.0-alpha
