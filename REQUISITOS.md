# Documento de Requisitos - Sistema de Inventario de Herramientas

## 1. INFORMACIÓN GENERAL DEL PROYECTO

### 1.1 Nombre del Proyecto
**Sistema de Inventario de Herramientas para Institución Educativa**

### 1.2 Descripción General
Sistema web para la gestión y control de inventario de herramientas en un entorno educativo (colegio/instituto). Permite administrar el préstamo, devolución y seguimiento de herramientas mediante códigos QR, con control de stock y registro de usuarios.

### 1.3 Objetivos del Sistema
- Digitalizar el control de inventario de herramientas
- Automatizar el proceso de préstamo y devolución mediante códigos QR
- Mantener registro detallado de préstamos y usuarios
- Controlar el stock disponible en tiempo real
- Facilitar la gestión administrativa de recursos educativos

### 1.4 Alcance
El sistema está diseñado para ser utilizado por personal docente y administrativo de una institución educativa para gestionar el inventario de herramientas y equipamiento utilizado en talleres y actividades prácticas.

---

## 2. STACK TECNOLÓGICO

### 2.1 Frontend
- **Framework**: Next.js 15.2.4 (React 19)
- **Lenguaje**: TypeScript 5.9.2
- **Estilos**: 
  - Tailwind CSS 4.1.9
  - CSS Modules
  - Tailwind Animate
- **Componentes UI**: 
  - Radix UI (conjunto completo de componentes accesibles)
  - Shadcn/ui
  - Lucide React (iconografía)
- **Gestión de Estado**: React Hooks + Context API
- **Formularios**: React Hook Form 7.60.0 + Zod 3.25.67 (validación)
- **Tema**: next-themes 0.4.6 (soporte modo oscuro/claro)

### 2.2 Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes (App Router)
- **ORM**: Prisma 6.14.0
- **Base de Datos**: MySQL (Hostinger Business)
- **Autenticación**: 
  - JWT (jsonwebtoken 9.0.2)
  - bcryptjs 3.0.2 (hash de contraseñas)

### 2.3 Funcionalidades Especiales
- **Códigos QR**: jsqr 1.4.0 (lectura de códigos QR)
- **Gráficos**: Recharts 2.15.4
- **Notificaciones**: Sonner 1.7.4 (toast notifications)
- **Fechas**: date-fns 4.1.0
- **Carruseles**: Embla Carousel React 8.5.1

### 2.4 Herramientas de Desarrollo
- **Package Manager**: npm / pnpm
- **Build Tool**: Next.js built-in
- **Linting**: ESLint
- **Deployment**: Vercel (configurado con vercel-build script)

---

## 3. MODELO DE DATOS

### 3.1 Entidades Principales

#### 3.1.1 User (Usuario)
Representa a los usuarios del sistema (profesores/administradores).

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `name` (String): Nombre del usuario
- `lastName` (String, opcional): Apellido del usuario
- `course` (String, opcional): Curso o área de trabajo
- `email` (String, único): Email para autenticación
- `password` (String): Contraseña hasheada
- `role` (Enum: ADMIN, PROFESOR): Rol del usuario
- `createdAt` (DateTime): Fecha de creación
- `updatedAt` (DateTime): Fecha de última actualización

**Relaciones:**
- Un usuario puede tener múltiples préstamos (loans)

#### 3.1.2 Tool (Herramienta)
Representa las herramientas del inventario.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `name` (String): Nombre de la herramienta
- `description` (String): Descripción detallada
- `category` (String): Categoría de la herramienta
- `qrCode` (String, único): Código QR único para identificación
- `status` (Enum: AVAILABLE, BORROWED, MAINTENANCE): Estado actual
- `location` (String): Ubicación física de la herramienta
- `quantity` (Int, default: 1): Cantidad total disponible
- `availableQuantity` (Int, default: 1): Cantidad disponible para préstamo
- `imageUrl` (String, opcional): URL de imagen de la herramienta
- `createdAt` (DateTime): Fecha de creación
- `updatedAt` (DateTime): Fecha de última actualización

**Relaciones:**
- Una herramienta puede tener múltiples préstamos (loans)

#### 3.1.3 Loan (Préstamo)
Registra los préstamos de herramientas.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `toolId` (String, FK): ID de la herramienta prestada
- `userId` (String, FK): ID del usuario que toma prestado
- `quantity` (Int, default: 1): Cantidad prestada
- `borrowedAt` (DateTime, default: now): Fecha y hora del préstamo
- `returnedAt` (DateTime, opcional): Fecha y hora de devolución
- `status` (Enum: ACTIVE, RETURNED, OVERDUE): Estado del préstamo
- `notes` (String, opcional): Notas adicionales

**Relaciones:**
- Pertenece a una herramienta (tool)
- Pertenece a un usuario (user)

#### 3.1.4 Category (Categoría)
Define las categorías de herramientas.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `name` (String, único): Nombre de la categoría
- `description` (String): Descripción de la categoría
- `color` (String): Color para identificación visual

---

## 4. REQUISITOS FUNCIONALES

### 4.1 Módulo de Autenticación

#### RF-001: Login de Usuario
**Descripción**: Los usuarios deben poder iniciar sesión con email y contraseña.

**Criterios de Aceptación:**
- El sistema valida email y contraseña contra la base de datos
- Las contraseñas se almacenan hasheadas con bcrypt
- Se genera un token JWT válido tras autenticación exitosa
- El token se almacena en localStorage del navegador
- Mensajes de error claros para credenciales inválidas

#### RF-002: Verificación de Sesión
**Descripción**: El sistema debe verificar automáticamente la sesión al cargar.

**Criterios de Aceptación:**
- Verificación automática del token JWT almacenado
- Redirección a login si el token es inválido o expiró
- Carga de datos del usuario autenticado

#### RF-003: Logout
**Descripción**: Los usuarios pueden cerrar sesión.

**Criterios de Aceptación:**
- Elimina el token JWT del localStorage
- Redirige al usuario a la página de login
- Limpia el estado de autenticación

### 4.2 Módulo de Gestión de Herramientas

#### RF-004: Visualizar Inventario
**Descripción**: Mostrar listado completo de herramientas con información detallada.

**Criterios de Aceptación:**
- Grid responsivo con tarjetas de herramientas
- Muestra: nombre, categoría, ubicación, estado, cantidad disponible
- Indicadores visuales del estado (disponible, prestada, mantenimiento)
- Filtrado por búsqueda en tiempo real
- Imágenes de herramientas cuando estén disponibles

#### RF-005: Agregar Herramienta
**Descripción**: Permitir el registro de nuevas herramientas al inventario.

**Criterios de Aceptación:**
- Formulario con campos: nombre, descripción, categoría, ubicación, cantidad
- Generación automática de código QR único
- Validación de campos obligatorios
- Imagen opcional de la herramienta
- Confirmación de creación exitosa

#### RF-006: Editar Herramienta
**Descripción**: Modificar información de herramientas existentes.

**Criterios de Aceptación:**
- Acceso a formulario de edición desde la tarjeta de herramienta
- Modificación de todos los campos excepto código QR
- Validación de datos
- Actualización en base de datos

#### RF-007: Eliminar Herramienta
**Descripción**: Eliminar herramientas del inventario.

**Criterios de Aceptación:**
- Confirmación antes de eliminar
- Verificación de que no tenga préstamos activos
- Eliminación en cascada de registros relacionados

#### RF-008: Generar Código QR
**Descripción**: Generar y visualizar código QR para cada herramienta.

**Criterios de Aceptación:**
- Código QR único por herramienta
- Visualización en modal
- Opción de descarga/impresión
- Formato compatible con scanners estándar

#### RF-009: Gestión de Stock
**Descripción**: Control de cantidades disponibles de herramientas.

**Criterios de Aceptación:**
- Registro de cantidad total y cantidad disponible
- Actualización automática al realizar préstamos/devoluciones
- Alertas cuando el stock disponible es bajo
- Prevención de préstamos si no hay stock disponible

### 4.3 Módulo de Préstamos

#### RF-010: Escanear QR para Préstamo
**Descripción**: Realizar préstamo mediante escaneo de código QR.

**Criterios de Aceptación:**
- Activación de cámara del dispositivo
- Reconocimiento automático del código QR
- Identificación de la herramienta asociada
- Formulario de préstamo con datos pre-cargados
- Validación de disponibilidad de stock

#### RF-011: Registro Manual de Préstamo
**Descripción**: Crear préstamo seleccionando herramienta y usuario manualmente.

**Criterios de Aceptación:**
- Selección de herramienta desde el inventario
- Selección de usuario/profesor
- Ingreso de cantidad a prestar
- Campo de notas opcional
- Validación de stock disponible
- Registro de fecha y hora automática

#### RF-012: Préstamo Múltiple
**Descripción**: Realizar préstamo de múltiples herramientas simultáneamente.

**Criterios de Aceptación:**
- Selección de múltiples herramientas
- Ingreso de información del estudiante/usuario
- Cantidades independientes por herramienta
- Creación de registros de préstamo individuales
- Actualización de stock para todas las herramientas

#### RF-013: Devolver Herramienta
**Descripción**: Registrar devolución de herramientas prestadas.

**Criterios de Aceptación:**
- Identificación del préstamo activo
- Escaneo de QR o selección manual
- Registro de fecha y hora de devolución
- Actualización automática de stock disponible
- Cambio de estado del préstamo a RETURNED
- Cambio de estado de la herramienta si corresponde

#### RF-014: Ver Préstamos Activos
**Descripción**: Visualizar listado de todos los préstamos activos.

**Criterios de Aceptación:**
- Listado con: herramienta, usuario, fecha de préstamo, cantidad
- Filtrado por estado (activo, retornado, vencido)
- Opción de devolver desde el listado
- Indicadores visuales para préstamos vencidos
- Búsqueda y filtrado

#### RF-015: Historial de Préstamos
**Descripción**: Consultar historial completo de préstamos.

**Criterios de Aceptación:**
- Listado de todos los préstamos (activos e históricos)
- Información detallada: usuario, herramienta, fechas, notas
- Filtros por fecha, usuario, herramienta, estado
- Exportación de datos (futuro)

### 4.4 Módulo de Estadísticas

#### RF-016: Dashboard de Estadísticas
**Descripción**: Visualizar métricas clave del sistema.

**Criterios de Aceptación:**
- Total de herramientas en inventario
- Herramientas disponibles vs. prestadas
- Total de préstamos activos
- Usuarios registrados
- Gráficos visuales de estadísticas
- Actualización en tiempo real

#### RF-017: Actividad Reciente
**Descripción**: Mostrar las últimas actividades del sistema.

**Criterios de Aceptación:**
- Listado de últimos préstamos realizados
- Últimas devoluciones
- Herramientas agregadas recientemente
- Límite de registros mostrados (ej: últimos 10)
- Ordenamiento por fecha descendente

### 4.5 Módulo de Usuarios

#### RF-018: Listar Usuarios
**Descripción**: Visualizar todos los usuarios del sistema.

**Criterios de Aceptación:**
- Listado con nombre, email, rol
- Filtrado y búsqueda
- Indicador de usuarios activos

#### RF-019: Gestionar Usuarios (Administrador)
**Descripción**: Crear, editar y eliminar usuarios (solo ADMIN).

**Criterios de Aceptación:**
- Restricción por rol de usuario
- Formulario de creación con validación
- Asignación de roles (ADMIN, PROFESOR)
- Edición de información
- Eliminación con confirmación

### 4.6 Módulo de Categorías

#### RF-020: Gestionar Categorías
**Descripción**: Crear y administrar categorías de herramientas.

**Criterios de Aceptación:**
- Listado de categorías existentes
- Creación de nuevas categorías
- Asignación de color identificativo
- Edición y eliminación
- Validación de nombres únicos

### 4.7 Módulo de Configuración

#### RF-021: Configuración del Sistema
**Descripción**: Ajustes generales del sistema.

**Criterios de Aceptación:**
- Configuración de perfil de usuario
- Cambio de contraseña
- Preferencias de notificaciones
- Tema claro/oscuro
- Configuración de la institución (nombre, logo)

### 4.8 Módulo de Búsqueda

#### RF-022: Búsqueda Global
**Descripción**: Buscar herramientas en todo el inventario.

**Criterios de Aceptación:**
- Búsqueda por nombre, categoría, ubicación, descripción
- Resultados en tiempo real
- Resaltado de términos coincidentes
- Sin límite de caracteres

---

## 5. REQUISITOS NO FUNCIONALES

### 5.1 Rendimiento

#### RNF-001: Tiempo de Respuesta
- Las operaciones de lectura deben completarse en menos de 2 segundos
- Las operaciones de escritura en menos de 3 segundos
- La carga inicial de la aplicación en menos de 5 segundos

#### RNF-002: Capacidad
- Soporte para al menos 1,000 herramientas en inventario
- Soporte para al menos 100 usuarios concurrentes
- Historial de préstamos sin límite temporal

### 5.2 Seguridad

#### RNF-003: Autenticación
- Contraseñas hasheadas con bcrypt (factor de costo 10+)
- Tokens JWT con expiración configurable
- Sesiones invalidables desde el servidor

#### RNF-004: Autorización
- Control de acceso basado en roles (ADMIN, PROFESOR)
- Validación de permisos en cada endpoint
- Protección contra CSRF y XSS

#### RNF-005: Protección de Datos
- Comunicación HTTPS obligatoria
- Validación de datos en frontend y backend
- Sanitización de inputs

### 5.3 Usabilidad

#### RNF-006: Interfaz de Usuario
- Diseño responsivo (móvil, tablet, desktop)
- Interfaz intuitiva y minimalista
- Soporte para tema claro y oscuro
- Accesibilidad WCAG 2.1 nivel AA

#### RNF-007: Experiencia de Usuario
- Feedback inmediato en todas las acciones
- Mensajes de error descriptivos
- Confirmaciones para acciones destructivas
- Indicadores de carga para operaciones largas

### 5.4 Disponibilidad

#### RNF-008: Disponibilidad del Sistema
- Disponibilidad objetivo: 99% (menos de 7.2 horas de downtime/mes)
- Backup automático de base de datos
- Plan de recuperación ante desastres

### 5.5 Mantenibilidad

#### RNF-009: Código
- Código TypeScript con tipado estricto
- Componentes reutilizables
- Documentación inline
- Estructura modular

#### RNF-010: Base de Datos
- Migraciones versionadas con Prisma
- Seed scripts para datos iniciales
- Índices optimizados para consultas frecuentes

### 5.6 Compatibilidad

#### RNF-011: Navegadores
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Soporte para navegadores móviles

#### RNF-012: Dispositivos
- Smartphones (iOS/Android)
- Tablets
- Computadoras de escritorio
- Cámaras para escaneo QR

### 5.7 Escalabilidad

#### RNF-013: Arquitectura
- Arquitectura preparada para crecimiento
- Separación frontend/backend
- Base de datos normalizada
- API RESTful

---

## 6. CASOS DE USO PRINCIPALES

### 6.1 CU-001: Prestar Herramienta mediante QR

**Actor Principal**: Profesor/Administrador

**Precondiciones**:
- Usuario autenticado
- Herramienta registrada con código QR
- Stock disponible > 0

**Flujo Principal**:
1. Usuario hace clic en "Escanear Código QR"
2. Sistema activa la cámara
3. Usuario escanea código QR de la herramienta
4. Sistema identifica la herramienta y muestra sus datos
5. Sistema muestra opciones: Prestar, Ver detalles
6. Usuario selecciona "Prestar"
7. Sistema muestra formulario con datos pre-cargados
8. Usuario confirma el préstamo
9. Sistema crea el registro de préstamo
10. Sistema actualiza el stock disponible
11. Sistema muestra confirmación

**Flujos Alternativos**:
- 3a. Código QR no reconocido → Mostrar error y opción de reintentar
- 4a. Herramienta no encontrada → Ofrecer registro manual
- 6a. Stock no disponible → Mostrar mensaje y cancelar operación

### 6.2 CU-002: Devolver Herramienta

**Actor Principal**: Profesor/Administrador

**Precondiciones**:
- Usuario autenticado
- Existe préstamo activo de la herramienta

**Flujo Principal**:
1. Usuario accede a "Ver Préstamos"
2. Sistema muestra listado de préstamos activos
3. Usuario selecciona préstamo a devolver
4. Usuario hace clic en "Devolver"
5. Sistema solicita confirmación
6. Usuario confirma la devolución
7. Sistema actualiza el préstamo (estado RETURNED, fecha devolución)
8. Sistema incrementa stock disponible
9. Sistema actualiza estado de herramienta si corresponde
10. Sistema muestra confirmación

**Flujos Alternativos**:
- 2a. Alternativamente, escaneo de QR para identificar préstamo
- 4a. Devolución parcial de cantidad → Solicitar cantidad a devolver

### 6.3 CU-003: Agregar Nueva Herramienta

**Actor Principal**: Administrador

**Precondiciones**:
- Usuario autenticado con rol ADMIN

**Flujo Principal**:
1. Usuario hace clic en "Agregar Herramienta"
2. Sistema muestra formulario de creación
3. Usuario ingresa datos: nombre, descripción, categoría, ubicación, cantidad
4. Usuario opcionalmente carga imagen
5. Usuario hace clic en "Guardar"
6. Sistema valida los datos
7. Sistema genera código QR único
8. Sistema crea la herramienta en base de datos
9. Sistema muestra código QR generado
10. Sistema muestra confirmación

**Flujos Alternativos**:
- 6a. Datos inválidos → Mostrar errores de validación
- 6b. Categoría no existe → Ofrecer crear categoría

### 6.4 CU-004: Realizar Préstamo Múltiple

**Actor Principal**: Profesor/Administrador

**Precondiciones**:
- Usuario autenticado
- Múltiples herramientas con stock disponible

**Flujo Principal**:
1. Usuario hace clic en "Préstamo Múltiple"
2. Sistema muestra modal con inventario disponible
3. Usuario selecciona múltiples herramientas
4. Usuario especifica cantidad para cada herramienta
5. Usuario ingresa datos del estudiante (nombre, apellido, curso)
6. Usuario hace clic en "Confirmar Préstamo"
7. Sistema valida disponibilidad de stock para todas
8. Sistema crea registros de préstamo individuales
9. Sistema actualiza stock de todas las herramientas
10. Sistema muestra resumen de préstamos creados

**Flujos Alternativos**:
- 7a. Stock insuficiente para alguna herramienta → Mostrar error específico
- 7b. Datos incompletos → Mostrar validaciones

---

## 7. ARQUITECTURA DEL SISTEMA

### 7.1 Estructura de Directorios

```
sistema-de-inventario-main/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Endpoints de autenticación
│   │   ├── tools/                # Endpoints de herramientas
│   │   ├── loans/                # Endpoints de préstamos
│   │   ├── users/                # Endpoints de usuarios
│   │   ├── categories/           # Endpoints de categorías
│   │   └── settings/             # Endpoints de configuración
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout principal
│   ├── loading.tsx               # Loading UI
│   └── page.tsx                  # Página principal (Dashboard)
├── components/                   # Componentes React
│   ├── ui/                       # Componentes UI base (Shadcn)
│   ├── add-tool-modal.tsx
│   ├── bulk-loan-modal.tsx
│   ├── dashboard-stats.tsx
│   ├── inventory-overview.tsx
│   ├── loan-modal.tsx
│   ├── loans-modal.tsx
│   ├── login-form.tsx
│   ├── protected-route.tsx
│   ├── qr-generator.tsx
│   ├── qr-scanner.tsx
│   ├── qr-scan-result.tsx
│   ├── recent-activity.tsx
│   ├── return-modal.tsx
│   ├── settings-modal.tsx
│   └── stock-management-modal.tsx
├── contexts/                     # Context API
│   └── auth-context.tsx          # Contexto de autenticación
├── hooks/                        # Custom Hooks
│   ├── use-mobile.ts
│   └── use-toast.ts
├── lib/                          # Utilidades y configuración
│   ├── config.ts                 # Configuración general
│   ├── data.ts                   # Gestión de datos
│   ├── db.ts                     # Cliente Prisma
│   ├── env.ts                    # Variables de entorno
│   └── utils.ts                  # Funciones auxiliares
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # Esquema de base de datos
│   ├── seed.ts                   # Datos iniciales
│   ├── dev.db                    # Base de datos local (SQLite dev)
│   └── migrations/               # Migraciones
├── public/                       # Archivos estáticos
├── scripts/                      # Scripts auxiliares
└── types/                        # Definiciones TypeScript
```

### 7.2 Flujo de Datos

```
Usuario → Frontend (Next.js) → API Routes → Prisma ORM → MySQL Database
                    ↓
              localStorage (JWT Token)
```

### 7.3 Patrones de Diseño

- **Component-Based Architecture**: Componentes React reutilizables
- **Context API**: Gestión de estado global (autenticación)
- **Server-Side Rendering**: Next.js App Router
- **RESTful API**: Endpoints organizados por recurso
- **Repository Pattern**: Prisma ORM como capa de acceso a datos
- **Protected Routes**: HOC para rutas autenticadas

---

## 8. CONFIGURACIÓN Y DEPLOYMENT

### 8.1 Variables de Entorno

```env
# Base de datos MySQL
DB_HOST=tu-host-mysql.hostinger.com
DB_PORT=3306
DB_USER=tu-usuario-mysql
DB_PASSWORD=tu-contraseña-mysql
DB_NAME=sistema-inventario

# Construir URL de conexión Prisma
DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# JWT Secret
JWT_SECRET=sistema-inventario-secret-key-2024
```

### 8.2 Scripts NPM

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Producción
npm run build            # Construye para producción
npm start                # Inicia servidor de producción
npm run vercel-build     # Build para Vercel con Prisma generate

# Base de datos
npx prisma generate      # Genera cliente Prisma
npx prisma migrate dev   # Ejecuta migraciones (desarrollo)
npx prisma migrate deploy # Ejecuta migraciones (producción)
npx prisma db seed       # Ejecuta seed de datos iniciales

# Otras utilidades
npm run lint             # Ejecuta linting
```

### 8.3 Requisitos del Servidor

**Desarrollo:**
- Node.js 18+
- npm 9+ o pnpm
- MySQL 8.0+ (o SQLite para desarrollo local)

**Producción:**
- Hosting compatible con Next.js (Vercel recomendado)
- MySQL Database (Hostinger Business configurado)
- Node.js 18+
- Variables de entorno configuradas

---

## 9. MIGRACIÓN Y DATOS INICIALES

### 9.1 Migraciones Existentes

1. **20250826235924_init**: Creación inicial de tablas
2. **20250904053806_add_stock_system**: Sistema de stock (quantity, availableQuantity)
3. **20251029010011_update_schema**: Actualización de esquema
4. **20251029014147_add_image_url_to_tools**: Campo imageUrl en herramientas

### 9.2 Seed Data

El archivo `prisma/seed.ts` contiene datos iniciales:
- Usuario administrador por defecto
- Categorías básicas de herramientas
- Herramientas de ejemplo
- Préstamos de ejemplo

---

## 10. MEJORAS FUTURAS (ROADMAP)

### 10.1 Corto Plazo
- [ ] Sistema de notificaciones por email
- [ ] Alertas de herramientas vencidas
- [ ] Exportación de reportes (PDF, Excel)
- [ ] Impresión masiva de códigos QR
- [ ] Dashboard con más métricas y gráficos

### 10.2 Mediano Plazo
- [ ] App móvil nativa (React Native)
- [ ] Sistema de reservas anticipadas
- [ ] Gestión de mantenimiento preventivo
- [ ] Integración con calendario institucional
- [ ] Historial de reparaciones

### 10.3 Largo Plazo
- [ ] Integración con sistema académico
- [ ] API pública para integraciones
- [ ] Machine Learning para predicción de demanda
- [ ] Sistema de multas/penalizaciones
- [ ] Gamificación para estudiantes

---

## 11. GLOSARIO

- **QR Code**: Código de respuesta rápida que identifica unívocamente una herramienta
- **Stock**: Cantidad total de unidades de una herramienta
- **Stock Disponible**: Cantidad de unidades disponibles para préstamo
- **Préstamo Activo**: Préstamo que no ha sido devuelto
- **JWT**: JSON Web Token, mecanismo de autenticación
- **Seed**: Datos iniciales para poblar la base de datos
- **Migration**: Script de cambios en la estructura de la base de datos
- **CRUD**: Create, Read, Update, Delete (operaciones básicas)

---

## 12. CONTACTO Y SOPORTE

Para consultas sobre el sistema:
- Documentación técnica: Ver archivos README y DATABASE_CONFIG.md
- Configuración de base de datos: Ver DATABASE_CONFIG.md
- Tareas pendientes: Ver TODO.md

---

**Documento Versión**: 1.0  
**Fecha de Creación**: 26 de Noviembre de 2025  
**Última Actualización**: 26 de Noviembre de 2025  
**Estado**: Completo
