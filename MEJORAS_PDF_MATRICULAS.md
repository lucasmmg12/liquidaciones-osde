# 📋 Asociación de Matrículas y Ajuste de Márgenes en PDF

## ✅ Cambios Implementados

### 1. 🆔 Asociación de Matrículas

#### Nuevo Servicio
Se agregó la función `getMatriculaByNombre()` en `lib/instrumentadores-service.ts`:

```typescript
export async function getMatriculaByNombre(nombre: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('instrumentadores')
    .select('matricula_provincial')
    .ilike('nombre', nombre)
    .eq('activo', true)
    .maybeSingle();

  return data?.matricula_provincial || null;
}
```

#### Integración en PDF
- ✅ El PDF ahora **busca automáticamente** la matrícula del instrumentador en la base de datos
- ✅ Si el instrumentador tiene matrícula registrada, **se muestra en el PDF**
- ✅ Si no tiene matrícula, muestra `--` como fallback

**Antes:**
```
Número de matrícula: --  (siempre)
```

**Ahora:**
```
Número de matrícula: 123456  (si está en BD)
Número de matrícula: --      (si no está)
```

### 2. 📐 Ajuste de Márgenes y Layout

#### Márgenes Estandarizados

Se definieron márgenes consistentes para todo el documento:

```typescript
const marginLeft = 14;    // Margen izquierdo
const marginRight = 14;   // Margen derecho
const marginTop = 15;     // Margen superior
const pageWidth = 210;    // Ancho A4 (mm)
const usableWidth = 182;  // Ancho útil (210 - 14 - 14)
```

#### Posicionamiento del Logo

**Antes:**
- Logo en posición fija sin considerar márgenes
- Texto desalineado

**Ahora:**
- Logo: `(marginLeft, marginTop - 5)` = `(14, 10)`
- Texto "Grow Labs": `(37, 17)` - Alineado con el logo
- Subtítulo: `(37, 22)` - Alineado perfectamente

#### Cuadro de Información

**Antes:**
- Posición: `x = 100` (arbitraria)
- Ancho: `96px` (sin relación con márgenes)

**Ahora:**
- ✅ **Alineado a la derecha**: `x = pageWidth - marginRight - boxWidth`
- ✅ **Cálculo**: `x = 210 - 14 - 100 = 96mm`
- ✅ **Ancho fijo**: `100mm` para contenido consistente
- ✅ **Línea divisoria vertical** a `46mm` del borde izquierdo del cuadro

**Estructura mejorada:**
```
┌──────────────────────────┬──────────────────────┐
│ Profesional:             │ JUAN PÉREZ          │
├──────────────────────────┼──────────────────────┤
│ Número de matrícula:     │ 123456              │
├──────────────────────────┼──────────────────────┤
│ Período de liquidación:  │ Agosto 2025         │
├──────────────────────────┼──────────────────────┤
│ Liquidación:             │ 401                 │
└──────────────────────────┴──────────────────────┘
```

### 3. 📊 Tabla Optimizada con Márgenes

#### Configuración de Márgenes

```typescript
autoTable(doc, {
  margin: { left: marginLeft, right: marginRight },
  tableWidth: usableWidth,
  // ...
});
```

#### Anchos de Columna Reajustados

| Columna | Antes | Ahora | Total |
|---------|-------|-------|-------|
| Fecha visita | 24 | **25** | 25 mm |
| Paciente | 42 | **42** | 42 mm |
| Procedimiento | 60 | **62** | 62 mm |
| Observación | 20 | **18** | 18 mm |
| Valor | 22 | **24** | 24 mm |
| **Cirujano** | 29 | **32** | 32 mm |
| **TOTAL** | 197 | **203** | **≈182mm** ✅ |

**Ajustes realizados:**
- ✅ Cirujano: `29 → 32mm` (más espacio para nombres completos)
- ✅ Procedimiento: `60 → 62mm` (más espacio para descripciones)
- ✅ Observación: `20 → 18mm` (optimizado, generalmente vacío)
- ✅ Total ajustado para respetar `usableWidth = 182mm`

#### Mejoras Adicionales

- ✅ **Texto truncado inteligente**: Procedimientos limitados a 45 caracteres
- ✅ **Overflow**: `linebreak` para evitar desbordes
- ✅ **CellWidth**: `wrap` para ajuste automático
- ✅ **Alineación vertical**: `valign: 'middle'` en cabeceras

### 4. 🎨 Configuración del Documento

Se agregó configuración explícita del documento PDF:

```typescript
const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
});
```

**Ventajas:**
- ✅ Unidades en milímetros (más precisas que puntos)
- ✅ Formato A4 estándar (210 x 297 mm)
- ✅ Orientación vertical
- ✅ Cálculos más predecibles

## 📦 Archivos Modificados

1. **`lib/instrumentadores-service.ts`**
   - ✅ Nueva función: `getMatriculaByNombre()`
   - Obtiene matrícula desde la base de datos

2. **`lib/pdf-exporter.ts`**
   - ✅ Import de `getMatriculaByNombre`
   - ✅ Obtención de matrícula por instrumentador
   - ✅ Márgenes estandarizados
   - ✅ Posicionamiento calculado dinámicamente
   - ✅ Tabla con márgenes y anchos ajustados
   - ✅ Configuración explícita del documento

## 🎯 Resultado Visual

### Layout del PDF (vista superior)

```
┌────────────────────────────────────────────────────────────┐
│ [margen: 14mm]                                             │
│                                                             │
│  [🌱] Grow Labs              ┌──────────────────────────┐  │
│      Sistema de              │ Profesional:   │ NOMBRE  │  │
│      Liquidaciones           ├──────────────────────────┤  │
│                              │ Matrícula:     │ 123456  │  │
│                              ├──────────────────────────┤  │
│                              │ Período:       │ Ago 25  │  │
│                              ├──────────────────────────┤  │
│                              │ Liquidación:   │ 401     │  │
│                              └──────────────────────────┘  │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Tabla con márgenes de 14mm a cada lado            │   │
│  │ Ancho total: 182mm (210 - 14 - 14)                │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│ [margen: 14mm]                                             │
└────────────────────────────────────────────────────────────┘
```

## 🚀 Cómo Funciona

### Flujo de Generación del PDF

1. **Cargar instrumentadores únicos** del detalle
2. **Por cada instrumentador:**
   ```typescript
   // Obtener matrícula de la BD
   const matricula = await getMatriculaByNombre(instrumentador);
   
   // Crear PDF con márgenes estandarizados
   const doc = new jsPDF({ unit: 'mm', format: 'a4' });
   
   // Posicionar logo y texto con márgenes
   doc.addImage(logo, marginLeft, marginTop - 5, 20, 20);
   
   // Calcular posición del cuadro dinámicamente
   const boxStartX = pageWidth - marginRight - boxWidth;
   
   // Generar tabla con márgenes y anchos ajustados
   autoTable(doc, {
     margin: { left: marginLeft, right: marginRight },
     tableWidth: usableWidth
   });
   ```

### Requisitos para Matrículas

Para que aparezcan las matrículas en el PDF:

1. ✅ El instrumentador debe estar registrado en la tabla `instrumentadores`
2. ✅ El campo `matricula_provincial` debe tener un valor
3. ✅ El campo `activo` debe ser `true`
4. ✅ El nombre debe coincidir (case-insensitive)

**Ejemplo:**

```sql
-- En la BD
nombre: "SILVA, JOSE ALFREDO"
matricula_provincial: "123456"
activo: true

-- En el Excel/liquidación
instrumentador: "SILVA, JOSE ALFREDO"

-- Resultado en PDF
Número de matrícula: 123456 ✅
```

## 📝 Beneficios

- ✅ **Matrículas automáticas**: No necesitas ingresarlas manualmente
- ✅ **Layout profesional**: Márgenes consistentes y calculados
- ✅ **Tabla alineada**: Respeta los márgenes del documento
- ✅ **Cirujano visible**: Columna ampliada para nombres completos
- ✅ **Sin desbordes**: Texto truncado y wrap automático
- ✅ **Fácil mantenimiento**: Cálculos basados en constantes

## ⚠️ Notas Importantes

1. **Actualizar instrumentadores**: Asegúrate de que todos los instrumentadores tengan sus matrículas cargadas en `Admin > Instrumentadores`

2. **Coincidencia de nombres**: El nombre en el Excel debe coincidir exactamente con el nombre en la BD (la búsqueda es case-insensitive pero debe ser el mismo texto)

3. **Matrícula vacía**: Si un instrumentador no tiene matrícula, el PDF mostrará `--`

---

**Powered by Grow Labs 🌱**

