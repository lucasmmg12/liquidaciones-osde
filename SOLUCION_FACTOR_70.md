# 🔧 Solución: Factor 70% no se aplicaba

## 📋 Problema Identificado

El sistema **NO estaba detectando** los feriados y fines de semana, por lo tanto **no se aplicaba el plus del 20%** para generar el factor 70% (50% + 20%).

### Causa Raíz

**Incompatibilidad de formatos de fecha**:

- **Excel Processor** (`lib/excel-processor.ts`): Generaba fechas en formato **`dd/mm/yyyy`**
  - Ejemplo: `22/11/2025`

- **Feriados Service** (`lib/feriados-service.ts`): Esperaba fechas en formato **`YYYY-MM-DD`**
  - Ejemplo: `2025-11-22`

Como los formatos no coincidían:
- ❌ La función `esFeriado()` nunca encontraba coincidencias
- ❌ La creación del objeto `Date` fallaba silenciosamente
- ❌ El plus del 20% NUNCA se aplicaba

## ✅ Solución Implementada

Se agregó una función de conversión automática de fechas en `lib/feriados-service.ts`:

```typescript
function convertirFecha(fecha: string): string {
  // Si ya está en formato YYYY-MM-DD, retornar tal cual
  if (/^\d{4}-\d{2}-\d{2}/.test(fecha)) {
    return fecha.split('T')[0];
  }
  
  // Si está en formato dd/mm/yyyy, convertir a YYYY-MM-DD
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fecha)) {
    const [dia, mes, anio] = fecha.split('/');
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }
  
  return fecha;
}
```

La función `aplicaPlusHorario()` ahora:
1. ✅ Acepta fechas en **ambos formatos** (`dd/mm/yyyy` y `YYYY-MM-DD`)
2. ✅ Convierte automáticamente al formato ISO antes de procesar
3. ✅ Detecta correctamente feriados y fines de semana
4. ✅ Aplica el plus del 20% cuando corresponde

## 🎯 Resultado Esperado

Ahora el sistema debe mostrar correctamente:

### Factor 120% (1.20)
- **Primer procedimiento** (100%) en:
  - Feriados (TODO el día: 00:00 - 23:59)
  - Domingos (TODO el día: 00:00 - 23:59)
  - Sábados (desde 13:00 hasta 23:59)

### Factor 70% (0.70)
- **Segundo/tercer/etc. procedimiento** (50%) en:
  - Feriados (TODO el día: 00:00 - 23:59)
  - Domingos (TODO el día: 00:00 - 23:59)
  - Sábados (desde 13:00 hasta 23:59)

## 🔍 Verificación

Para verificar que funciona correctamente:

1. Procesa un archivo Excel con procedimientos en **sábado >= 13:00**, **domingo** o **feriado**
2. Abre la consola del navegador (F12 → Console)
3. Deberías ver mensajes como:
   ```
   ✓ Aplicando plus por FERIADO: 22/11/2025 (2025-11-22)
   ✓ Aplicando plus por DOMINGO: 24/11/2025 10:00 (2025-11-24)
   ✓ Aplicando plus por SÁBADO >= 13:00: 23/11/2025 15:00 (2025-11-23)
   🔥 PLUS APLICADO: Factor antes=0.5, Factor después=0.7
   ```

4. En la tabla de detalle deberías ver:
   - **Factor: 120%** para primeros procedimientos en horarios especiales
   - **Factor: 70%** para segundos/terceros procedimientos en horarios especiales
   - Badge naranja **"+20%"** en la columna de hora

## 📝 Archivos Modificados

1. **`lib/feriados-service.ts`**:
   - Agregada función `convertirFecha()` para normalizar formatos
   - Modificada función `aplicaPlusHorario()` para usar conversión automática
   - Mejorados los logs de depuración

2. **`lib/liquidacion-service.ts`**:
   - Agregados logs de depuración para verificar aplicación del plus
   - Confirmada la lógica correcta: `factor = factorBase + 0.20`

## 🚀 Estado

✅ **Corrección aplicada y compilada exitosamente**

El sistema ahora debería funcionar correctamente. Si aún no se detectan los feriados/fines de semana, verifica:

1. Que las fechas en el Excel estén en formato correcto
2. Que las horas estén en formato HH:MM (por ejemplo: 13:00, 15:30)
3. Los mensajes en la consola del navegador para más información

