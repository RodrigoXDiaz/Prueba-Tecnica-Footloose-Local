# 🏪 Footloose - Backend API

> Sistema completo de gestión de catálogo de productos con autenticación, roles, notificaciones push y servicios de importación/exportación de datos.

[![NestJS](https://img.shields.io/badge/NestJS-10.3.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.0.0-FFCA28?logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Backend API desarrollado con **NestJS**, **TypeScript** y **Firebase** para la gestión de un catálogo de productos con funcionalidades avanzadas.

## 📑 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Arquitectura del Proyecto](#️-arquitectura-del-proyecto)
- [Stack Tecnológico](#-stack-tecnológico)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Ejecución](#-ejecución)
- [Documentación API](#-documentación-api)
- [Endpoints Principales](#-endpoints-principales)
- [Estructura de Módulos](#-estructura-de-módulos)
- [Principios SOLID](#-principios-solid-aplicados)
- [Seguridad](#️-seguridad)

---

## ✨ Características Principales

### 🔐 **Sistema de Autenticación Completo**
- Registro y login con Firebase Authentication
- Gestión de roles (`ADMIN` / `VENDEDOR`)
- JWT tokens automáticos con Firebase
- Guards personalizados para protección de rutas
- Decoradores para obtener usuario actual

### 📦 **Gestión de Productos (CRUD Completo)**
- Crear, leer, actualizar y eliminar productos
- Búsqueda por nombre con filtros avanzados
- Filtros por marca, color, talla y rango de precios
- Control de acceso basado en roles
- Validación automática de datos con `class-validator`
- Soporte para imágenes con Cloudinary

### 🔔 **Sistema de Notificaciones Push (Firebase FCM)**
- Notificaciones automáticas cuando bajan los precios
- Preferencias personalizables por usuario
- Seguir/dejar de seguir productos específicos
- Historial completo de notificaciones
- Notificaciones masivas para administradores
- Integración automática con eventos del sistema

### 📊 **Importación y Exportación de Datos**
- **Importación masiva desde Excel** con validación automática
- **Exportación a Excel** con formato profesional
- **Generación de PDF** de productos con diseño personalizado
- Carga de imágenes a Cloudinary
- Procesamiento por lotes

### 📧 **Sistema de Notificaciones por Email**
- Alertas automáticas de cambios de precio
- Notificaciones de seguimiento de productos
- Configuración SMTP con Nodemailer
- Plantillas HTML personalizadas

---

## 🏗️ Arquitectura del Proyecto

El proyecto sigue los principios de **Clean Architecture** y **SOLID**, con una estructura modular y escalable:

```
src/
├── core/                           # 🎯 Capa de Dominio (Núcleo)
│   ├── interfaces/                 # Contratos e interfaces del dominio
│   │   ├── auth.interface.ts       # Interfaces de autenticación
│   │   ├── base.interface.ts       # Interfaces base reutilizables
│   │   ├── product.interface.ts    # Interfaces de productos
│   │   └── services.interface.ts   # Interfaces de servicios
│   ├── exceptions/                 # Excepciones personalizadas del negocio
│   │   └── business.exception.ts   # Excepciones de lógica de negocio
│   ├── filters/                    # Filtros globales de excepciones
│   │   └── global-exception.filter.ts
│   └── interceptors/               # Interceptores globales
│       ├── logging.interceptor.ts  # Logging de requests/responses
│       └── transform.interceptor.ts # Transformación de respuestas
│
├── shared/                         # 🔧 Código Compartido
│   ├── firebase/                   # Configuración de Firebase
│   │   └── firebase.module.ts      # Módulo de Firebase
│   ├── dtos/                       # Data Transfer Objects
│   │   ├── create-product.dto.ts
│   │   ├── update-product.dto.ts
│   │   ├── filter-product.dto.ts
│   │   ├── register.dto.ts
│   │   └── login.dto.ts
│   ├── decorators/                 # Decoradores personalizados
│   │   ├── current-user.decorator.ts # Obtener usuario actual
│   │   ├── public.decorator.ts     # Marcar rutas públicas
│   │   └── roles.decorator.ts      # Definir roles requeridos
│   ├── guards/                     # Guards de autorización
│   │   ├── firebase-auth.guard.ts  # Guard de autenticación
│   │   └── roles.guard.ts          # Guard de roles
│   └── services/                   # Servicios compartidos
│       └── cloudinary.service.ts   # Servicio de Cloudinary
│
├── modules/                        # 📦 Módulos Funcionales
│   ├── auth/                       # Módulo de Autenticación
│   │   ├── auth.controller.ts      # Endpoints de auth
│   │   ├── auth.service.ts         # Lógica de autenticación
│   │   └── auth.module.ts
│   │
│   ├── products/                   # Módulo de Productos
│   │   ├── product.controller.ts   # Endpoints de productos
│   │   ├── product.service.ts      # Lógica de productos
│   │   ├── product.module.ts
│   │   └── repositories/
│   │       └── product.repository.ts # Acceso a datos
│   │
│   ├── notifications/              # Módulo de Notificaciones
│   │   ├── notification.controller.ts
│   │   ├── notification.service.ts # Lógica de notificaciones FCM
│   │   ├── notification.module.ts
│   │   └── dto/
│   │       ├── subscribe-notification.dto.ts
│   │       ├── follow-product.dto.ts
│   │       └── update-preferences.dto.ts
│   │
│   └── services/                   # Módulo de Servicios Adicionales
│       ├── services.controller.ts  # Endpoints de servicios
│       ├── excel.service.ts        # Importación/Exportación Excel
│       ├── pdf.service.ts          # Generación de PDFs
│       ├── notification.service.ts # Servicio de emails
│       └── services.module.ts
│
├── config/                         # ⚙️ Configuraciones
│   ├── firebase.config.ts          # Configuración de Firebase
│   └── cloudinary.config.ts        # Configuración de Cloudinary
│
├── app.module.ts                   # Módulo principal de la app
└── main.ts                         # Punto de entrada (Bootstrap)
```

### 🎨 **Patrones de Diseño Implementados**

- **Repository Pattern**: Abstracción del acceso a datos
- **Dependency Injection**: Inyección de dependencias en toda la aplicación
- **Decorator Pattern**: Decoradores personalizados para metadata
- **Guard Pattern**: Protección de rutas con guards
- **Interceptor Pattern**: Transformación de requests/responses
- **Event-Driven**: Sistema de eventos para notificaciones

---

## 🛠 Stack Tecnológico

### **Backend Framework**
- **NestJS 10.3**: Framework progresivo de Node.js
- **TypeScript 5.3**: Superset tipado de JavaScript
- **Node.js**: Entorno de ejecución

### **Base de Datos y Autenticación**
- **Firebase Admin SDK 12.0**: Administración de Firebase
- **Firebase Authentication**: Autenticación de usuarios
- **Firebase Firestore**: Base de datos NoSQL en tiempo real
- **Firebase Cloud Messaging (FCM)**: Notificaciones push

### **Servicios Externos**
- **Cloudinary 2.8**: Almacenamiento y gestión de imágenes
- **Nodemailer 6.9**: Envío de correos electrónicos

### **Librerías de Procesamiento**
- **ExcelJS 4.4**: Creación y lectura de archivos Excel
- **PDFKit 0.14**: Generación de documentos PDF
- **XLSX 0.18**: Procesamiento de hojas de cálculo

### **Validación y Transformación**
- **class-validator 0.14**: Validación de DTOs
- **class-transformer 0.5**: Transformación de objetos

### **Documentación**
- **Swagger/OpenAPI**: Documentación interactiva de API

### **Herramientas de Desarrollo**
- **ESLint**: Linting de código
- **Prettier**: Formateo de código
- **Jest**: Testing unitario y de integración



---

## 📦 Instalación

### **Prerrequisitos**

- Node.js v18 o superior
- npm o yarn
- Cuenta de Firebase
- Cuenta de Cloudinary (opcional, para imágenes)
- Servidor SMTP (opcional, para notificaciones por email)

### **Pasos de Instalación**

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd Prueba-Técnica-Footloose-Backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env con tus credenciales
```

4. **Configurar Firebase**
   
   a. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
   
   b. Activar servicios:
   - **Authentication** → Email/Password
   - **Firestore Database** → Modo de prueba
   - **Cloud Messaging** → Para notificaciones push
   
   c. Descargar credenciales:
   - Ve a **Configuración del proyecto** → **Cuentas de servicio**
   - Clic en **Generar nueva clave privada**
   - Guarda el archivo JSON como `firebase-service-account.json` en la raíz del proyecto
   
   d. Obtener Web API Key:
   - Ve a **Configuración del proyecto** → **General**
   - Copia el **Web API Key**
   - Agrégalo al archivo `.env` como `FIREBASE_WEB_API_KEY`

5. **Configurar Cloudinary** (Opcional)
   - Crea una cuenta en [Cloudinary](https://cloudinary.com/)
   - Obtén tus credenciales (Cloud Name, API Key, API Secret)
   - Agrégalas al archivo `.env`

---

## ⚙️ Configuración

### **Variables de Entorno (.env)**

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# ============================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ============================================
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# ============================================
# FIREBASE CONFIGURATION
# ============================================
# Ruta al archivo JSON de credenciales de Firebase (RECOMENDADO)
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Web API Key de Firebase (para autenticación)
# Obtenerlo en: Firebase Console → Project Settings → Web API Key
FIREBASE_WEB_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Storage Bucket de Firebase
# Formato: nombre-proyecto.appspot.com
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com

# ============================================
# CLOUDINARY (Para almacenamiento de imágenes)
# ============================================
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=tu-api-secret

# ============================================
# EMAIL NOTIFICATIONS (Nodemailer)
# ============================================
# Para Gmail, habilita "App Passwords" en tu cuenta
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password-de-16-caracteres
EMAIL_FROM=noreply@tuapp.com

# ============================================
# CORS (Orígenes permitidos)
# ============================================
CORS_ORIGIN=http://localhost:3000,http://localhost:8080
```

### **Archivo de Credenciales de Firebase**

El archivo `firebase-service-account.json` debe tener esta estructura:

```json
{
  "type": "service_account",
  "project_id": "tu-proyecto-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

> ⚠️ **IMPORTANTE**: Nunca subas este archivo a Git. Ya está incluido en `.gitignore`

---

## 🏃 Ejecución

### **Modo Desarrollo** (con hot-reload)
```bash
npm run start:dev
```

El servidor se iniciará en `http://localhost:3000` (o el puerto configurado en `.env`)

### **Modo Producción**
```bash
# Compilar el proyecto
npm run build

# Ejecutar versión compilada
npm run start:prod
```

### **Otros Comandos Disponibles**

```bash
# Iniciar sin watch mode
npm start

# Modo debug (con inspector de Node.js)
npm run start:debug

# Formatear código con Prettier
npm run format

# Linting con ESLint
npm run lint

# Tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:cov

# Tests end-to-end
npm run test:e2e
```

### **Verificación de Inicio**

Cuando el servidor inicie correctamente, verás:

```
[Nest] 12345  - 02/12/2025, 10:00:00     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 02/12/2025, 10:00:01     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 02/12/2025, 10:00:01     LOG [RoutesResolver] AuthController {/api/v1/auth}
[Nest] 12345  - 02/12/2025, 10:00:01     LOG [RoutesResolver] ProductController {/api/v1/products}
[Nest] 12345  - 02/12/2025, 10:00:01     LOG [NestApplication] Nest application successfully started

🚀 Servidor corriendo en: http://localhost:3000
📚 Documentación API: http://localhost:3000/api/docs
🔥 Firebase API Key: Configurada ✅
```

---

## 📚 Documentación API

### **Swagger UI (OpenAPI)**

Una vez iniciado el servidor, accede a la documentación interactiva en:

```
http://localhost:3000/api/docs
```

La documentación incluye:
- 📋 Lista completa de endpoints
- 🔍 Descripciones detalladas de cada endpoint
- 📥 Esquemas de request/response
- 🧪 Herramienta para probar endpoints directamente
- 🔐 Soporte para autenticación Bearer Token

### **Cómo Usar Swagger**

1. Registra un usuario en `POST /api/v1/auth/register`
2. Inicia sesión en `POST /api/v1/auth/login` para obtener el token
3. Clic en el botón **"Authorize"** (🔒) en la parte superior
4. Ingresa el token en el formato: `Bearer tu-token-aqui`
5. Ahora puedes probar todos los endpoints protegidos

---

## 🔐 Endpoints Principales

### **Authentication** (`/api/v1/auth`)

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| `POST` | `/register` | Registrar nuevo usuario | ❌ | - |
| `POST` | `/login` | Iniciar sesión | ❌ | - |
| `GET` | `/me` | Obtener perfil del usuario actual | ✅ | Cualquiera |

**Ejemplo de Registro:**
```json
POST /api/v1/auth/register
{
  "email": "usuario@example.com",
  "password": "Password123!",
  "displayName": "Juan Pérez",
  "role": "VENDEDOR"
}
```

**Ejemplo de Login:**
```json
POST /api/v1/auth/login
{
  "email": "usuario@example.com",
  "password": "Password123!"
}
```

---

### **Products** (`/api/v1/products`)

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| `GET` | `/` | Listar productos con filtros | ✅ | Cualquiera |
| `GET` | `/:id` | Obtener producto por ID | ✅ | Cualquiera |
| `POST` | `/` | Crear nuevo producto | ✅ | ADMIN |
| `PATCH` | `/:id` | Actualizar producto | ✅ | ADMIN |
| `DELETE` | `/:id` | Eliminar producto | ✅ | ADMIN |
| `PATCH` | `/:id/price` | Actualizar precio (notifica usuarios) | ✅ | ADMIN |

**Filtros Disponibles:**
```
GET /api/v1/products?search=nike&brand=Nike&color=Negro&minPrice=50&maxPrice=200&size=42
```

**Ejemplo de Creación:**
```json
POST /api/v1/products
{
  "name": "Zapato Deportivo Nike",
  "brand": "Nike",
  "model": "Air Max 270",
  "color": "Negro",
  "size": "42",
  "price": 149.99,
  "stock": 25,
  "description": "Zapato deportivo de alta calidad",
  "imageUrl": "https://cloudinary.com/..."
}
```

---

### **Notifications** (`/api/v1/notifications`)

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| `POST` | `/subscribe` | Suscribir usuario a notificaciones | ✅ | Cualquiera |
| `POST` | `/follow-product` | Seguir un producto | ✅ | Cualquiera |
| `DELETE` | `/unfollow-product/:productId` | Dejar de seguir producto | ✅ | Cualquiera |
| `PATCH` | `/preferences` | Actualizar preferencias | ✅ | Cualquiera |
| `GET` | `/history` | Obtener historial de notificaciones | ✅ | Cualquiera |
| `POST` | `/send` | Enviar notificación masiva | ✅ | ADMIN |

**Ejemplo de Suscripción:**
```json
POST /api/v1/notifications/subscribe
{
  "fcmToken": "token-del-dispositivo",
  "preferences": {
    "priceDrops": true,
    "newDiscounts": true,
    "stockAlerts": false,
    "generalNews": false
  }
}
```

---

### **Services** (`/api/v1/services`)

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| `POST` | `/import/excel` | Importar productos desde Excel | ✅ | ADMIN |
| `GET` | `/export/excel` | Exportar productos a Excel | ✅ | Cualquiera |
| `GET` | `/pdf/product/:id` | Generar PDF de producto | ✅ | Cualquiera |
| `POST` | `/pdf/product/:id/upload` | Generar y subir PDF a Firebase | ✅ | ADMIN |
| `POST` | `/upload-image` | Subir imagen a Cloudinary | ✅ | ADMIN |

**Ejemplo de Importación Excel:**
```bash
POST /api/v1/services/import/excel
Content-Type: multipart/form-data

file: productos.xlsx
```

---

## 📖 Estructura de Módulos

### **🔐 Auth Module** (`src/modules/auth`)

Gestión completa de autenticación y usuarios.

**Responsabilidades:**
- Registro de nuevos usuarios con Firebase Auth
- Login y generación de tokens JWT
- Validación de tokens en cada request
- Gestión de roles (ADMIN/VENDEDOR)
- Almacenamiento de información de usuarios en Firestore

**Archivos principales:**
- `auth.controller.ts`: Endpoints de autenticación
- `auth.service.ts`: Lógica de negocio de autenticación
- `auth.module.ts`: Configuración del módulo

---

### **📦 Products Module** (`src/modules/products`)

CRUD completo de productos con filtros avanzados.

**Responsabilidades:**
- Crear, leer, actualizar y eliminar productos
- Búsqueda y filtrado de productos
- Validación de datos de productos
- Control de acceso por roles
- Integración con eventos para notificaciones

**Archivos principales:**
- `product.controller.ts`: Endpoints de productos
- `product.service.ts`: Lógica de negocio
- `product.repository.ts`: Acceso a Firestore
- `product.module.ts`: Configuración del módulo

---

### **🔔 Notifications Module** (`src/modules/notifications`)

Sistema de notificaciones push con Firebase Cloud Messaging.

**Responsabilidades:**
- Suscripción de usuarios a notificaciones
- Gestión de tokens FCM
- Seguimiento de productos
- Envío de notificaciones automáticas
- Historial de notificaciones

**Archivos principales:**
- `notification.controller.ts`: Endpoints de notificaciones
- `notification.service.ts`: Lógica de FCM y preferencias
- `notification.module.ts`: Configuración del módulo
- `dto/`: DTOs para notificaciones

---

### **⚙️ Services Module** (`src/modules/services`)

Servicios adicionales de importación, exportación y generación de documentos.

**Responsabilidades:**
- Importación masiva desde Excel
- Exportación a Excel con formato
- Generación de PDFs personalizados
- Envío de emails con Nodemailer
- Integración con Cloudinary

**Archivos principales:**
- `services.controller.ts`: Endpoints de servicios
- `excel.service.ts`: Procesamiento de Excel
- `pdf.service.ts`: Generación de PDFs
- `notification.service.ts`: Envío de emails
- `services.module.ts`: Configuración del módulo

---

## 🎯 Principios SOLID Aplicados

Este proyecto implementa los 5 principios SOLID de forma rigurosa:

### **1️⃣ Single Responsibility Principle (SRP)**
*"Una clase debe tener una única responsabilidad"*

✅ **Implementación:**
- `ProductService`: Solo gestiona lógica de productos
- `ExcelService`: Solo procesa archivos Excel
- `PdfService`: Solo genera PDFs
- `CloudinaryService`: Solo maneja carga de imágenes
- Cada servicio tiene una única razón para cambiar

### **2️⃣ Open/Closed Principle (OCP)**
*"Abierto para extensión, cerrado para modificación"*

✅ **Implementación:**
- Interfaces en `core/interfaces/` definen contratos
- Nuevos repositorios pueden implementar `IRepository<T>`
- Nuevos guards pueden extender funcionalidad sin modificar existentes
- Decoradores permiten agregar comportamiento sin modificar clases

### **3️⃣ Liskov Substitution Principle (LSP)**
*"Las subclases deben ser sustituibles por sus clases base"*

✅ **Implementación:**
- Todos los guards implementan `CanActivate` de forma consistente
- Repositorios son intercambiables si implementan la misma interfaz
- Filtros de excepción siguen el contrato `ExceptionFilter`

### **4️⃣ Interface Segregation Principle (ISP)**
*"Muchas interfaces específicas mejor que una general"*

✅ **Implementación:**
- `auth.interface.ts`: Solo interfaces de autenticación
- `product.interface.ts`: Solo interfaces de productos
- `services.interface.ts`: Solo interfaces de servicios
- No hay interfaces "gordas" con métodos innecesarios

### **5️⃣ Dependency Inversion Principle (DIP)**
*"Depender de abstracciones, no de implementaciones"*

✅ **Implementación:**
- Inyección de dependencias en todos los servicios
- Dependencia de interfaces, no implementaciones concretas
- `@Inject()` con tokens para abstraer proveedores
- Firebase y Cloudinary son inyectados, no instanciados directamente

---

## 🛡️ Seguridad

El proyecto implementa múltiples capas de seguridad:

### **🔐 Autenticación**
- Firebase Authentication con JWT tokens
- Tokens verificados en cada request protegido
- Decorador `@Public()` para rutas sin autenticación
- Guard global `FirebaseAuthGuard`

### **👥 Autorización**
- Sistema de roles (ADMIN/VENDEDOR)
- Guard `RolesGuard` para verificar permisos
- Decorador `@Roles()` para especificar roles requeridos
- Control de acceso granular por endpoint

### **✅ Validación de Datos**
- `class-validator` en todos los DTOs
- Validación automática con `ValidationPipe`
- Whitelist para ignorar propiedades no permitidas
- Transformación automática de tipos

### **🔒 Protección de Credenciales**
- `.gitignore` configurado para excluir archivos sensibles
- Variables de entorno para credenciales
- Firebase Service Account protegido
- Contraseñas nunca expuestas en logs

### **🌐 CORS**
- Configuración de orígenes permitidos
- Control de métodos HTTP
- Headers autorizados especificados

### **🚨 Manejo de Errores**
- Filtro global de excepciones
- Sanitización de errores en producción
- Mensajes de error consistentes
- No se expone información sensible del sistema

### **📝 Logging**
- Interceptor de logging para requests/responses
- No se loguean contraseñas ni tokens
- Trazabilidad de operaciones críticas

---

## 📄 Documentación Adicional

En la carpeta `docs/` encontrarás documentación detallada sobre:

### **📊 EXCEL_TEMPLATE.md**
- Formato exacto del archivo Excel para importación
- Columnas requeridas y opcionales
- Ejemplos de datos válidos
- Guía paso a paso

### **🔔 NOTIFICATIONS.md**
- Configuración completa del sistema de notificaciones FCM
- Estructura de colecciones en Firestore
- Ejemplos de uso del API
- Integración con frontend
- Testing de notificaciones

### **📄 PDF_DESIGN.md**
- Diseño visual de los PDFs generados
- Layout y estructura
- Colores y tipografías
- Ejemplos visuales

---

## 🧪 Testing

El proyecto incluye configuración para testing con Jest:

```bash
# Tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Coverage completo
npm run test:cov

# Tests de integración
npm run test:e2e
```

### **Estructura de Tests**

```
src/
├── modules/
│   ├── auth/
│   │   └── auth.service.spec.ts
│   ├── products/
│   │   └── product.service.spec.ts
│   └── ...
test/
└── app.e2e-spec.ts
```

---

## 📊 Colecciones de Firestore

El sistema crea automáticamente estas colecciones:

### **`users`**
```typescript
{
  email: string,
  displayName: string,
  role: 'ADMIN' | 'VENDEDOR',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### **`products`**
```typescript
{
  name: string,
  brand: string,
  model: string,
  color: string,
  size: string,
  price: number,
  stock: number,
  description?: string,
  imageUrl?: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: string
}
```

### **`user_notifications`**
```typescript
{
  userId: string,
  fcmToken: string,
  preferences: {
    priceDrops: boolean,
    newDiscounts: boolean,
    stockAlerts: boolean,
    generalNews: boolean
  },
  subscribedProducts: string[],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### **`notification_history`**
```typescript
{
  userId: string,
  type: 'price_drop' | 'discount' | 'stock' | 'news',
  title: string,
  body: string,
  productId?: string,
  oldPrice?: number,
  newPrice?: number,
  sentAt: Timestamp,
  read: boolean
}
```

---

## 🚀 Características Avanzadas

### **🎨 Diseño de PDFs Personalizado**
- Layout profesional con colores de marca
- Información completa del producto
- Códigos QR opcionales
- Imágenes de productos integradas
- Descarga directa o almacenamiento en Firebase Storage

### **📊 Sistema de Eventos**
- Event Emitter para desacoplar módulos
- Eventos de cambio de precio
- Notificaciones automáticas asíncronas
- Arquitectura reactiva

### **🔍 Búsqueda y Filtrado Avanzado**
- Búsqueda por texto en nombre
- Filtros múltiples combinables
- Rangos de precio
- Paginación lista para implementar

### **📱 Notificaciones Push**
- Firebase Cloud Messaging (FCM)
- Preferencias personalizables
- Seguimiento de productos individuales
- Historial completo
- Notificaciones masivas para admins

### **🎯 Interceptores Globales**
- **LoggingInterceptor**: Log de todas las requests/responses
- **TransformInterceptor**: Formato consistente de respuestas

### **🛡️ Guards Personalizados**
- **FirebaseAuthGuard**: Autenticación automática
- **RolesGuard**: Control de acceso por roles

---

## 💡 Buenas Prácticas Implementadas

✅ **Clean Architecture**: Separación clara de capas  
✅ **SOLID Principles**: Código mantenible y escalable  
✅ **Dependency Injection**: Desacoplamiento de componentes  
✅ **DTOs con Validación**: Datos siempre validados  
✅ **Swagger Documentation**: API documentada automáticamente  
✅ **TypeScript Strict**: Type safety completo  
✅ **ESLint + Prettier**: Código consistente  
✅ **Git Ignore**: Archivos sensibles protegidos  
✅ **Environment Variables**: Configuración segura  
✅ **Error Handling**: Manejo global de errores  
✅ **Logging**: Trazabilidad de operaciones  
✅ **Repository Pattern**: Abstracción de datos  

---

## 🔧 Troubleshooting

### **Error: Firebase API Key no configurada**
```
Solución: Verifica que FIREBASE_WEB_API_KEY esté en .env con un valor válido
```

### **Error: Cannot connect to Firebase**
```
Solución: Verifica que firebase-service-account.json exista y sea válido
```

### **Error: Cloudinary upload failed**
```
Solución: Verifica las credenciales de Cloudinary en .env
```

### **Error: SMTP authentication failed**
```
Solución: Para Gmail, genera una "App Password" en tu cuenta
```

### **Puerto 3000 ya en uso**
```
Solución: Cambia el puerto en .env o libera el puerto actual
```

---

## 📝 Notas Importantes

⚠️ **Configuración Requerida**: Firebase debe estar configurado antes de ejecutar  
⚠️ **Credenciales**: Nunca subas `firebase-service-account.json` a Git  
⚠️ **CORS**: Configura los orígenes permitidos en producción  
⚠️ **Roles**: El primer usuario debe ser creado con rol ADMIN manualmente  
⚠️ **Firestore**: Asegúrate de que las reglas de Firestore permitan escritura

---

## 🤝 Contribución

Este proyecto fue desarrollado siguiendo las mejores prácticas de la industria:

- ✅ TypeScript estricto
- ✅ ESLint y Prettier configurados
- ✅ Clean Architecture
- ✅ Principios SOLID
- ✅ Documentación completa
- ✅ API REST bien diseñada
- ✅ Swagger/OpenAPI
- ✅ Testing ready

---

## 📞 Soporte

Si tienes preguntas o encuentras problemas:

1. Revisa la documentación en `docs/`
2. Verifica la configuración de Firebase
3. Consulta la documentación de Swagger en `/api/docs`
4. Revisa los logs del servidor para errores específicos

---

## 📜 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 🎓 Desarrollado por

**Footloose Developer Team**  
Prueba Técnica - Backend con NestJS y Firebase

---

<div align="center">

**⭐ Si este proyecto te fue útil, no olvides darle una estrella ⭐**

Hecho con ❤️ usando NestJS, TypeScript y Firebase

</div>
