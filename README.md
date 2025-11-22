# 🏥 Sistema de Liquidaciones Médicas | Grow Labs

## 👥 Módulo de Instrumentadores

Sistema profesional **exclusivo** para la gestión de liquidaciones de **instrumentadores médicos** y nomencladores para **todas las obras sociales**. Plataforma unificada que permite gestionar liquidaciones de manera eficiente y precisa.

## 🏥 Obras Sociales Soportadas

- ✅ OSDE
- ✅ Swiss Medical
- ✅ PAMI
- ✅ Sancor Salud
- ✅ Y más...

## ✨ Características Principales

### 📊 Gestión de Liquidaciones
- Procesamiento automático de archivos Excel
- Cálculo de liquidaciones por instrumentador
- Detección automática de período (mes/año)
- Reglas de negocio: Primer procedimiento 100%, restantes 50%
- Plus del 20% por horarios especiales

### 👥 Gestión de Instrumentadores
- Base de datos completa del equipo
- Importación masiva desde Excel
- Edición inline en tabla interactiva
- Búsqueda y filtrado avanzado
- Gestión de activos/inactivos

### 📚 Nomenclador Inteligente
- Gestión de códigos y valores por mes/año
- Soporte multi-obra social
- Copia de valores entre períodos
- Control de versiones
- Gestión de faltantes

### 📤 Exportaciones
- Excel completo con detalle y resumen
- PDFs individuales por instrumentador
- Resumen consolidado en PDF

## 🎨 Diseño

Interfaz moderna con estética **Grow Labs**:
- 🌃 Tema oscuro profesional
- ✨ Efectos glassmorphism
- 💫 Animaciones suaves
- 🎨 Gradientes verde-esmeralda
- 📱 Totalmente responsive

## 🛠️ Tecnologías

- **Framework**: Next.js 13 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + Custom CSS
- **UI Components**: Radix UI + shadcn/ui
- **Base de Datos**: Supabase (PostgreSQL)
- **Procesamiento**: XLSX (Excel)
- **Exportación PDF**: jsPDF + autoTable

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase

### Instalación

```bash
# Clonar repositorio
git clone [tu-repo]

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Ejecutar migraciones SQL en Supabase Dashboard

# Iniciar servidor de desarrollo
npm run dev
```

### Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_de_supabase
```

## 📁 Estructura del Proyecto

```
project/
├── app/                          # Next.js App Router
│   ├── admin/
│   │   ├── instrumentadores/     # Gestión de instrumentadores
│   │   └── nomenclador/          # Gestión de nomenclador
│   ├── instrumentadores/         # Liquidaciones
│   └── globals.css              # Estilos globales
├── components/                   # Componentes React
│   ├── ui/                      # Componentes UI base
│   ├── Footer.tsx               # Footer con branding
│   ├── instrumentadores-table.tsx
│   └── ...
├── lib/                         # Lógica de negocio
│   ├── types.ts                 # Tipos TypeScript
│   ├── instrumentadores-service.ts
│   ├── liquidacion-service.ts
│   └── ...
└── supabase/
    └── migrations/              # Migraciones SQL
```

## 🗄️ Base de Datos

### Tablas Principales

- `instrumentadores` - Personal de instrumentadores
- `procedimientos` - Códigos de procedimientos médicos
- `valores_nomenclador` - Valores por complejidad/mes/año/OS
- `liquidaciones` - Tracking de corridas
- `faltantes_liquidacion` - Códigos sin valor asignado

## 📖 Uso

### 1. Importar Instrumentadores
1. Ir a "Gestión de Instrumentadores"
2. Click en "Importar Excel"
3. Seleccionar archivo con columnas: Nombre, Mat. Provincial, CUIT, etc.

### 2. Configurar Nomenclador
1. Ir a "Nomenclador"
2. Agregar códigos de procedimientos
3. Configurar valores por mes/año/obra social

### 3. Procesar Liquidación
1. Ir a "Liquidaciones"
2. Cargar Excel con procedimientos
3. Seleccionar mes/año
4. Click en "Procesar"
5. Revisar detalle, resumen y faltantes
6. Exportar resultados

## 🤝 Contribuir

Este es un proyecto privado desarrollado por **Grow Labs** para clientes específicos.

## 📄 Licencia

© 2025 Grow Labs. Todos los derechos reservados.

## 🌟 Desarrollado por

**Grow Labs** - Donde tus ideas crecen
- 🌐 Web: [growsanjuan.com](https://www.growsanjuan.com)
- 📱 Instagram: [@growsanjuan](https://www.instagram.com/growsanjuan/)
- 💬 WhatsApp: [Contacto](https://api.whatsapp.com/send/?phone=5492643229503)
- 💼 LinkedIn: [Lucas Marinero](https://www.linkedin.com/in/lucas-marinero-182521308/)

---

**Tecnología de vanguardia al servicio de la salud** 🏥✨
