# Configuración de Base de Datos

## Problema Actual

El proyecto no puede conectarse a la base de datos porque **las tablas no existen**. Las migraciones SQL necesitan ser aplicadas manualmente a tu proyecto de Supabase.

## Solución: Aplicar Migraciones

### Paso 1: Acceder al Dashboard de Supabase

1. Ve a https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto: `muhiwkvohidjkbmwbsfu`

### Paso 2: Abrir el SQL Editor

1. En el menú lateral izquierdo, haz clic en **"SQL Editor"**
2. Haz clic en **"+ New query"** para crear una nueva consulta

### Paso 3: Ejecutar la Primera Migración

1. Copia TODO el contenido del archivo:
   ```
   supabase/migrations/20251112231958_create_nomenclador_tables.sql
   ```

2. Pégalo en el editor SQL

3. Haz clic en **"Run"** o presiona `Ctrl+Enter` (Windows/Linux) o `Cmd+Enter` (Mac)

4. Deberías ver un mensaje de éxito

### Paso 4: Ejecutar la Segunda Migración

1. Crea una nueva consulta SQL (haz clic en **"+ New query"** nuevamente)

2. Copia TODO el contenido del archivo:
   ```
   supabase/migrations/20251113000000_create_liquidacion_tables.sql
   ```

3. Pégalo en el editor SQL

4. Haz clic en **"Run"** o presiona `Ctrl+Enter` (Windows/Linux) o `Cmd+Enter` (Mac)

5. Deberías ver un mensaje de éxito

### Paso 5: Verificar la Conexión

Después de aplicar las migraciones, ejecuta este comando en tu terminal:

```bash
npm run check-db
```

Este script verificará que todas las tablas se hayan creado correctamente.

## Estructura de Base de Datos

Una vez aplicadas las migraciones, tendrás las siguientes tablas:

### Nomenclador (Tablas Antiguas - Compatibilidad)
- `nomenclador_instrumentadores`: Códigos y procedimientos
- `nomenclador_versiones`: Historial de cambios de valores

### Modelo Nuevo (Tablas Principales)
- `procedimientos`: Códigos → Complejidad
- `valores_nomenclador`: Complejidad → Valor (por mes/año/obra social)
- `liquidaciones`: Tracking de corridas de liquidación
- `faltantes_liquidacion`: Códigos faltantes por liquidación

## Datos de Prueba

Las migraciones incluyen datos de ejemplo:
- 3 procedimientos de muestra (Colecistectomía, Colangiografía, Nefrectomía)
- Los valores se migran automáticamente del nomenclador antiguo al nuevo

## Solución de Problemas

### Error: "Could not find the table"
- Las tablas no existen todavía
- Sigue los pasos arriba para aplicar las migraciones

### Error: "Policy violation" o "Permission denied"
- Las políticas RLS están habilitadas
- Las migraciones configuran acceso público (anon + authenticated)
- Verifica que las políticas se hayan creado correctamente

### Error de conexión
- Verifica que tu archivo `.env` tenga las credenciales correctas
- Verifica que la URL y la key sean válidas

## Próximos Pasos

Una vez que las tablas estén creadas:

1. Tu aplicación podrá conectarse a la base de datos
2. Podrás procesar archivos Excel de liquidación
3. Los faltantes se guardarán automáticamente
4. Podrás gestionar el nomenclador desde la interfaz web
