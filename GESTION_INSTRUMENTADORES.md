# Gestión de Instrumentadores - Documentación

## Resumen

Se ha creado un sistema completo para gestionar la base de datos de instrumentadores (personas) del equipo. Esta funcionalidad permite:

1. **Importar instrumentadores** desde archivos Excel
2. **Editar instrumentadores** existentes directamente en una tabla interactiva
3. **Agregar instrumentadores** individuales mediante un formulario
4. **Buscar y filtrar** instrumentadores
5. **Activar/desactivar** instrumentadores

## Archivos Creados

### 1. Base de Datos
- `supabase/migrations/20251122000000_create_instrumentadores_table.sql`
  - Crea la tabla `instrumentadores` con todos los campos necesarios
  - Incluye políticas RLS para acceso público
  - Índices para optimizar búsquedas

### 2. Tipos y Servicios
- `lib/types.ts` - Se agregó el tipo `Instrumentador`
- `lib/instrumentadores-service.ts` - Servicio completo de CRUD para instrumentadores
- `lib/instrumentadores-excel-processor.ts` - Procesador de archivos Excel de instrumentadores

### 3. Componentes UI
- `components/instrumentadores-table.tsx` - Tabla interactiva con edición inline
- `components/import-instrumentadores-modal.tsx` - Modal para importar desde Excel
- `components/add-instrumentador-form.tsx` - Formulario para agregar instrumentadores

### 4. Páginas
- `app/admin/instrumentadores/page.tsx` - Página principal de gestión
- `app/page.tsx` - Actualizada para incluir enlaces al nuevo módulo

## Estructura de la Tabla `instrumentadores`

```sql
CREATE TABLE instrumentadores (
  id uuid PRIMARY KEY,
  nombre text NOT NULL,                  -- Nombre completo (obligatorio)
  matricula_provincial text,             -- Matrícula provincial
  cuit text,                            -- CUIT
  especialidad text,                    -- Especialidad
  grupo_personal text,                  -- Grupo de personal
  perfil text,                          -- Perfil
  activo boolean DEFAULT true,          -- Estado activo/inactivo
  created_at timestamptz,
  updated_at timestamptz
);
```

## Formato del Archivo Excel para Importación

El archivo Excel debe tener las siguientes columnas (solo **Nombre** es obligatorio):

| Columna | Obligatorio | Ejemplo | Descripción |
|---------|-------------|---------|-------------|
| **Nombre** | ✅ Sí | Juan Pérez | Nombre completo del instrumentador |
| Mat. provinc / Matricula Provincial | ❌ No | 12345 | Matrícula provincial |
| CUIT | ❌ No | 20-12345678-9 | CUIT del instrumentador |
| Especialidad | ❌ No | Instrumentador | Especialidad |
| Grupo personal | ❌ No | Grupo A | Grupo de personal |
| Perfil | ❌ No | Senior | Perfil del instrumentador |
| Activo | ❌ No | Sí / No | Estado (por defecto: Sí) |

**Notas importantes:**
- El sistema detecta automáticamente la fila de cabecera
- Las columnas pueden tener nombres variados (ej: "Nombre", "NOMBRE", "nombre")
- El sistema es flexible con acentos y mayúsculas/minúsculas
- Búsqueda inteligente: "Mat. provincia", "Mat. provinc", "Matricula provincial", etc. funcionan
- Si un instrumentador ya existe (mismo nombre), se actualizará con los nuevos datos
- Los campos opcionales pueden estar vacíos

## Cómo Usar el Sistema

### 1. Acceder al Módulo

Desde la página principal, hacer clic en **"Instrumentadores"** → **"Gestionar Instrumentadores"**

O navegar directamente a: `/admin/instrumentadores`

### 2. Importar desde Excel

1. Hacer clic en el botón **"Importar Excel"**
2. Seleccionar el archivo Excel con los datos
3. Revisar el resultado de la importación
4. Los instrumentadores se agregarán o actualizarán automáticamente

### 3. Agregar Instrumentador Individual

1. Hacer clic en el botón **"Agregar"**
2. Completar el formulario (solo Nombre es obligatorio)
3. Hacer clic en **"Guardar"**

### 4. Editar Instrumentador

1. En la tabla, hacer clic en el ícono de **lápiz** (editar)
2. Modificar los campos deseados
3. Hacer clic en el ícono de **guardar** (check)
4. Para cancelar, hacer clic en el ícono de **X**

### 5. Desactivar Instrumentador

1. En la tabla, hacer clic en el ícono de **basura** (eliminar)
2. Confirmar la acción
3. El instrumentador se marcará como inactivo (no se elimina permanentemente)

### 6. Buscar y Filtrar

- **Barra de búsqueda**: Busca por nombre, matrícula, CUIT o especialidad
- **Switch "Incluir inactivos"**: Muestra u oculta instrumentadores inactivos

## Flujo de Trabajo Recomendado

### Primera Vez
1. Preparar un archivo Excel con todos los instrumentadores
2. Importar el archivo usando el botón "Importar Excel"
3. Revisar que todos se hayan importado correctamente

### Mantenimiento Diario
- Agregar nuevos instrumentadores individualmente con el botón "Agregar"
- Editar datos directamente en la tabla cuando sea necesario
- Desactivar instrumentadores que ya no trabajan en el equipo

### Actualizaciones Masivas
- Actualizar el archivo Excel con los cambios
- Reimportar el archivo (los existentes se actualizarán automáticamente)

## Configuración Inicial

### 1. Ejecutar la Migración

Asegúrese de ejecutar la migración de base de datos:

```bash
# Si usa Supabase CLI
supabase db push

# O ejecute el archivo SQL manualmente en Supabase Dashboard
# project/supabase/migrations/20251122000000_create_instrumentadores_table.sql
```

### 2. Verificar Conexión

La aplicación debe estar conectada a Supabase. Verificar que el archivo `lib/supabase.ts` tenga las credenciales correctas.

## Características Técnicas

### Seguridad
- Row Level Security (RLS) habilitado
- Políticas públicas para operaciones CRUD (ajustar según necesidades)

### Rendimiento
- Índices en campos `nombre` y `activo` para búsquedas rápidas
- Búsqueda case-insensitive
- Carga lazy de datos

### UX
- Edición inline en la tabla
- Validación de formularios
- Mensajes de éxito/error con toast notifications
- Confirmación antes de eliminar
- Búsqueda en tiempo real
- Indicadores de carga

## Integración con Liquidaciones

Este módulo es independiente del módulo de liquidaciones, pero en el futuro se puede:

1. Validar que los instrumentadores en las liquidaciones existan en la base de datos
2. Autocompletar nombres de instrumentadores al procesar liquidaciones
3. Generar reportes por instrumentador con datos personales
4. Vincular liquidaciones históricas con datos actualizados de instrumentadores

## Próximos Pasos Sugeridos

- [ ] Agregar validación de CUIT (formato argentino)
- [ ] Agregar foto/avatar para cada instrumentador
- [ ] Exportar lista de instrumentadores a Excel
- [ ] Historial de cambios en datos de instrumentadores
- [ ] Integrar con el módulo de liquidaciones para autocompletar
- [ ] Dashboard con estadísticas de instrumentadores activos/inactivos

## Soporte

Para cualquier problema o sugerencia, revisar:
- Logs de la consola del navegador
- Logs de Supabase Dashboard
- Verificar políticas RLS en Supabase

