# 📄 PDF Profesional de Productos - Footloose

## 🎨 Diseño del PDF

### **Layout del Documento:**

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (Morado Oscuro #2D1B4E)                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  FOOTLOOSE (Rojo + Blanco)                      │  │
│  │  Catálogo Profesional de Productos              │  │
│  │                         Fecha: 29 de noviembre...│  │
│  │                         Documento #BD0FF112     │  │
│  └──────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│         ┌───────────────────────────┐                  │
│         │                           │                  │
│         │   IMAGEN DEL PRODUCTO     │                  │
│         │   (200x200px con borde)   │                  │
│         │                           │                  │
│         └───────────────────────────┘                  │
│                                                         │
│              Nike Air Max 90                           │
│           Nike - Air Max 90                            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐  │
│  │  INFORMACIÓN DEL PRODUCTO (Rojo #E31E24)       │  │
│  ├───────────────────────┬─────────────────────────┤  │
│  │ Código                │ bd0ff112-4a39-4daf...   │  │
│  ├───────────────────────┼─────────────────────────┤  │
│  │ Marca                 │ Nike                     │  │
│  ├───────────────────────┼─────────────────────────┤  │
│  │ Modelo                │ Air Max 90               │  │
│  ├───────────────────────┼─────────────────────────┤  │
│  │ Color                 │ Negro                    │  │
│  ├───────────────────────┼─────────────────────────┤  │
│  │ Talla                 │ 42                       │  │
│  ├───────────────────────┼─────────────────────────┤  │
│  │ Precio                │ S/ 149.99                │  │
│  ├───────────────────────┼─────────────────────────┤  │
│  │ Stock Disponible      │ 25                       │  │
│  ├───────────────────────┼─────────────────────────┤  │
│  │ Estado                │ ACTIVO                   │  │
│  └───────────────────────┴─────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  DESCRIPCIÓN (Morado #2D1B4E)                   │  │
│  ├─────────────────────────────────────────────────┤  │
│  │  Zapatilla deportiva de alta calidad con       │  │
│  │  diseño moderno y comodidad excepcional...     │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  FOOTER (Gris Claro #F5F5F5)                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  FOOTLOOSE - Catálogo de Productos              │  │
│  │  Fecha de creación: 29/11/2025                  │  │
│  │  Documento confidencial para uso empresarial    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🎨 Paleta de Colores

- **Rojo Primario**: `#E31E24` (Logo y encabezados de tabla)
- **Morado Oscuro**: `#2D1B4E` (Header y títulos)
- **Gris Claro**: `#F5F5F5` (Filas alternas de tabla y footer)
- **Gris Oscuro**: `#333333` (Texto principal)
- **Blanco**: `#FFFFFF` (Texto en fondos oscuros)

## ✨ Características

### **1. Header Profesional:**
- Logo FOOTLOOSE (FOOT en rojo + LOOSE en blanco)
- Fondo morado oscuro (#2D1B4E)
- Fecha formateada en español
- Número de documento con ID del producto

### **2. Imagen del Producto:**
- Descarga automática desde Cloudinary u otra URL
- Dimensiones: 200x200px
- Borde rojo (#E31E24) de 2px
- Centrado en la página
- Fallback si la imagen no carga

### **3. Título del Producto:**
- Nombre en grande (22pt, negrita)
- Subtítulo con marca y modelo (14pt)
- Centrado y en color morado

### **4. Tabla de Información:**
- **Header rojo** con texto blanco
- **Filas alternas** (gris claro y blanco)
- **2 columnas**: Etiqueta (negrita, morado) | Valor (normal, gris oscuro)
- **Bordes sutiles** (#DDDDDD)
- **Datos incluidos**:
  - Código completo del producto
  - Marca, Modelo, Color, Talla
  - Precio en Soles (S/)
  - Stock disponible
  - Estado (ACTIVO/INACTIVO)

### **5. Sección de Descripción:**
- **Header morado** con título en blanco
- **Caja blanca** con borde gris
- Texto justificado
- Altura fija de 60px

### **6. Footer Profesional:**
- Fondo gris claro
- Nombre de la empresa
- Fecha de creación del producto
- Aviso de confidencialidad
- Texto pequeño (7-8pt)

## 🚀 Uso

### **Generar PDF:**

```bash
GET http://localhost:3000/api/v1/services/pdf/product/{productId}
Authorization: Bearer YOUR_TOKEN
```

**Respuesta:**
- Descarga automática del archivo PDF
- Nombre: `producto-{productId}.pdf`
- Content-Type: `application/pdf`

### **Subir PDF a Firebase Storage:**

```bash
POST http://localhost:3000/api/v1/services/pdf/product/{productId}/upload
Authorization: Bearer YOUR_TOKEN
```

**Respuesta:**
```json
{
  "success": true,
  "message": "PDF generado y subido exitosamente",
  "url": "https://storage.googleapis.com/..."
}
```

## 📋 Ejemplo de Datos

**Producto de ejemplo:**
- Nombre: Nike Air Max 90
- Marca: Nike
- Modelo: Air Max 90
- Color: Negro/Blanco
- Talla: 42
- Precio: S/ 149.99
- Stock: 25 unidades
- Estado: ACTIVO
- Imagen: URL de Cloudinary

**Resultado:**
PDF profesional de 1 página con toda la información organizada en tabla, imagen del producto cargada correctamente, y diseño corporativo de Footloose.

## 🎯 Mejoras Implementadas

✅ **Logo de Footloose** con tipografía bicolor  
✅ **Descarga de imágenes** desde URLs externas (Cloudinary)  
✅ **Tabla profesional** con filas alternas y bordes  
✅ **Paleta de colores** corporativa  
✅ **Formato de moneda** en Soles Peruanos (S/)  
✅ **Diseño responsive** que se adapta al contenido  
✅ **Footer con información** de confidencialidad  
✅ **Manejo de errores** si la imagen no carga  

## 📱 Compatibilidad

- ✅ Visualización en navegadores web
- ✅ Impresión en tamaño A4
- ✅ Compatible con lectores de PDF estándar
- ✅ Optimizado para uso empresarial

---

**Nota:** El PDF se genera dinámicamente con los datos actuales del producto en la base de datos.
