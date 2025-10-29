# Rediseño Institucional del Sistema de Inventario

## Información Recopilada
- **Proyecto**: Sistema de inventario de herramientas para colegio en Next.js
- **Archivos principales**:
  - `app/page.tsx`: Dashboard principal con header, stats, acciones rápidas y grid de contenido
  - `app/globals.css`: Estilos globales con Tailwind CSS y variables CSS
  - `app/layout.tsx`: Layout raíz con fuentes Geist
  - Componentes: `dashboard-stats.tsx`, `inventory-overview.tsx`, `recent-activity.tsx`

## Plan de Rediseño

### 1. Actualizar Estilos Globales (`app/globals.css`)
- Cambiar colores a paleta institucional (blanco, gris suave, azul/celeste)
- Configurar tipografía formal (Inter, Roboto, Montserrat)
- Ajustar variables CSS para tema institucional
- Agregar estilos base para contenedores y elementos

### 2. Rediseñar Layout Principal (`app/page.tsx`)
- Implementar cuadrícula responsiva: 4 columnas escritorio, 2 tablet, 1 móvil
- Reorganizar header con navegación minimalista
- Rediseñar tarjetas de acciones rápidas con estilo institucional
- Ajustar espaciados y simetría visual
- Asegurar elementos contenidos en bloques

### 3. Actualizar Componentes
- **DashboardStats**: Rediseñar tarjetas con sombras suaves, bordes redondeados
- **InventoryOverview**: Ajustar grid responsivo, imágenes recortadas, botones centrados
- **RecentActivity**: Estilo coherente con el resto

### 4. Mejoras de Responsividad
- Verificar breakpoints para 4/2/1 columnas
- Asegurar botones y elementos proporcionales en todos los dispositivos
- Optimizar imágenes y contenedores

### 5. Animaciones y Detalles Finales
- Agregar animaciones sutiles y discretas
- Verificar coherencia estética en toda la aplicación
- Asegurar accesibilidad y usabilidad

## Dependencias
- No se requieren nuevas dependencias
- Utilizar componentes UI existentes
- Mantener funcionalidad actual

## Pruebas
- Verificar en diferentes dispositivos
- Comprobar responsividad
- Validar accesibilidad
