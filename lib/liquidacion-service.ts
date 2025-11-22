import { supabase } from './supabase';
import { ProcessedRow, DetalleRow, ResumenRow, FaltanteRow, TotalesData, Liquidacion, FaltanteLiquidacion } from './types';
import { aplicaPlusHorario } from './feriados-service';

interface NomencladorLookup {
  [codigo: string]: {
    complejidad: string | null;
    procedimiento: string;
  };
}

interface NomencladorPorDescripcion {
  [descripcionNormalizada: string]: {
    codigo: string;
    complejidad: string | null;
    procedimiento: string;
  };
}

interface ValoresLookup {
  [key: string]: number; // key: "complejidad|mes|anio|obra_social|modulo"
}

/**
 * Extrae la descripción quitando el código al inicio
 * Ejemplo: "130102 – ESCISIÓN AMPLIA..." → "ESCISIÓN AMPLIA..."
 */
function extraerDescripcion(texto: string): string {
  // Buscar el primer guión (- o –) y tomar todo lo que viene después
  const match = texto.match(/[-–—]\s*(.+)/);
  if (match) {
    return match[1].trim();
  }
  // Si no hay guión, intentar remover números y puntos al inicio
  return texto.replace(/^[\d\.\s]+/, '').trim();
}

/**
 * Normaliza texto para comparación (remueve acentos, espacios extras, convierte a mayúsculas)
 */
function normalizarTexto(texto: string): string {
  // Primero extraer solo la descripción sin el código
  const descripcion = extraerDescripcion(texto);
  
  return descripcion
    .toUpperCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/\s+/g, ' ') // Normalizar espacios múltiples
    .replace(/[^\w\s]/g, ''); // Remover caracteres especiales excepto espacios
}

/**
 * Carga el nomenclador completo (código → complejidad)
 */
async function loadNomenclador(): Promise<NomencladorLookup> {
  const { data, error } = await supabase
    .from('procedimientos')
    .select('codigo, procedimiento, complejidad')
    .eq('activo', true);
  
  if (error) {
    console.error('Error loading nomenclador:', error);
    throw new Error('Error al cargar el nomenclador');
  }
  
  const lookup: NomencladorLookup = {};
  data?.forEach((item: any) => {
    const codigoNormalizado = String(item.codigo).toUpperCase().trim();
    lookup[codigoNormalizado] = {
      complejidad: item.complejidad,
      procedimiento: item.procedimiento
    };
  });
  
  return lookup;
}

/**
 * Carga el nomenclador indexado por descripción normalizada
 */
async function loadNomencladorPorDescripcion(): Promise<NomencladorPorDescripcion> {
  const { data, error } = await supabase
    .from('procedimientos')
    .select('codigo, procedimiento, complejidad')
    .eq('activo', true);
  
  if (error) {
    console.error('Error loading nomenclador por descripción:', error);
    throw new Error('Error al cargar el nomenclador');
  }
  
  const lookup: NomencladorPorDescripcion = {};
  data?.forEach((item: any) => {
    const descripcionNormalizada = normalizarTexto(item.procedimiento);
    lookup[descripcionNormalizada] = {
      codigo: String(item.codigo).toUpperCase().trim(),
      complejidad: item.complejidad,
      procedimiento: item.procedimiento
    };
  });
  
  console.log(`Nomenclador por descripción cargado: ${Object.keys(lookup).length} procedimientos`);
  
  return lookup;
}

/**
 * Carga los valores para un mes/año específico
 * Permite mantener histórico de valores mensuales
 */
async function loadValores(
  mes: number, 
  anio: number, 
  obraSocial: string = 'OSDE', 
  modulo: string = 'instrumentadores'
): Promise<ValoresLookup> {
  const { data, error } = await supabase
    .from('valores_nomenclador')
    .select('complejidad, valor')
    .eq('mes', mes)
    .eq('anio', anio)
    .eq('obra_social', obraSocial)
    .eq('modulo', modulo);
  
  if (error) {
    console.error('Error loading valores:', error);
    throw new Error('Error al cargar los valores del nomenclador');
  }
  
  const lookup: ValoresLookup = {};
  data?.forEach((item: any) => {
    const complejidad = item.complejidad || 'SIN_COMPLEJIDAD';
    const key = `${complejidad}|${mes}|${anio}|${obraSocial}|${modulo}`;
    lookup[key] = item.valor;
  });
  
  console.log(`Valores cargados para ${mes}/${anio}: ${Object.keys(lookup).length} complejidades`);
  
  return lookup;
}

/**
 * Calcula el factor según la regla: primer procedimiento de la fila 100%, restantes 50%
 * Considera el orden dentro de la fila original del Excel
 */
function calculateFactor(
  ordenEnFila: number | undefined,
  instrumentador: string,
  fecha: string,
  detalleAnterior: DetalleRow[]
): number {
  // Si es el primer procedimiento de la fila (orden_en_fila === 0)
  if (ordenEnFila === 0) {
    // Verificar si ya hay otros procedimientos del mismo instrumentador/fecha procesados
    // Si es el primero de TODOS los procedimientos de ese instrumentador/fecha → 100%
    // Si ya hay otros procedimientos de otras filas → 50%
    const count = detalleAnterior.filter(
      d => d.instrumentador === instrumentador && d.fecha === fecha
    ).length;
    
    return count === 0 ? 1.0 : 0.5;
  }
  
  // Si NO es el primer procedimiento de la fila (orden_en_fila > 0), siempre 50%
  return 0.5;
}

/**
 * Crea o actualiza una liquidación en la BD
 */
async function saveLiquidacion(
  mes: number,
  anio: number,
  obraSocial: string,
  modulo: string,
  totales: TotalesData
): Promise<string> {
  const { data, error } = await supabase
    .from('liquidaciones')
    .insert({
      mes,
      anio,
      obra_social: obraSocial,
      modulo,
      total_procedimientos: totales.procedimientos,
      total_liquidado: totales.liquidado,
      codigos_faltantes: totales.faltantes,
      created_by: 'admin'
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('Error saving liquidacion:', error);
    throw new Error('Error al guardar la liquidación');
  }
  
  return data.id;
}

/**
 * Guarda los faltantes en la BD
 */
async function saveFaltantes(
  liquidacionId: string,
  faltantes: FaltanteRow[]
): Promise<void> {
  if (faltantes.length === 0) return;
  
  const faltantesToInsert = faltantes.map(f => ({
    liquidacion_id: liquidacionId,
    codigo: f.codigo,
    procedimiento: f.procedimiento,
    ocurrencias: f.ocurrencias,
    resuelto: false
  }));
  
  const { error } = await supabase
    .from('faltantes_liquidacion')
    .insert(faltantesToInsert);
  
  if (error) {
    console.error('Error saving faltantes:', error);
    throw new Error('Error al guardar los faltantes');
  }
}

/**
 * Procesa la liquidación completa
 */
export async function processLiquidacion(
  processedRows: ProcessedRow[],
  mes: number,
  anio: number,
  obraSocial: string = 'OSDE',
  modulo: string = 'instrumentadores'
): Promise<{
  detalle: DetalleRow[];
  resumen: ResumenRow[];
  faltantes: FaltanteRow[];
  totales: TotalesData;
  liquidacionId: string;
}> {
  // Cargar diccionarios
  const nomenclador = await loadNomenclador();
  const nomencladorPorDescripcion = await loadNomencladorPorDescripcion();
  const valores = await loadValores(mes, anio, obraSocial, modulo);
  
  const detalle: DetalleRow[] = [];
  const faltantesMap = new Map<string, { procedimiento: string; ocurrencias: number }>();
  
  // Estadísticas de búsqueda
  let encontradosPorCodigo = 0;
  let encontradosPorDescripcion = 0;
  let noEncontrados = 0;
  let filtradosPorInstrumentador = 0;
  
  // Procesar cada fila
  for (const row of processedRows) {
    const codigoNormalizado = row.codigo.toUpperCase().trim();
    
    // Validar que tenga código
    if (!codigoNormalizado) {
      continue;
    }
    
    // FILTRAR: Excluir registros sin instrumentador o con "sin instrumentador"
    const instrumentador = (row.instrumentador || '').trim().toUpperCase();
    if (!instrumentador || instrumentador === '' || instrumentador === 'SIN INSTRUMENTADOR') {
      filtradosPorInstrumentador++;
      continue;
    }
    
    let nomencladorItem = nomenclador[codigoNormalizado];
    let codigoFinal = codigoNormalizado;
    
    // Si no se encuentra por código, buscar por descripción del procedimiento
    if (!nomencladorItem && row.procedimiento) {
      const descripcionNormalizada = normalizarTexto(row.procedimiento);
      const itemPorDescripcion = nomencladorPorDescripcion[descripcionNormalizada];
      
      if (itemPorDescripcion) {
        console.log(`✓ Código ${codigoNormalizado} no encontrado, pero se encontró por descripción: "${row.procedimiento}" → código oficial: ${itemPorDescripcion.codigo}`);
        nomencladorItem = {
          complejidad: itemPorDescripcion.complejidad,
          procedimiento: itemPorDescripcion.procedimiento
        };
        codigoFinal = itemPorDescripcion.codigo;
        encontradosPorDescripcion++;
      }
    } else if (nomencladorItem) {
      encontradosPorCodigo++;
    }
    
    if (!nomencladorItem) {
      // Faltante: no existe en nomenclador ni por código ni por descripción
      console.log(`✗ No se encontró: código=${codigoNormalizado}, procedimiento="${row.procedimiento}"`);
      noEncontrados++;
      
      const existing = faltantesMap.get(codigoNormalizado);
      if (existing) {
        existing.ocurrencias++;
      } else {
        faltantesMap.set(codigoNormalizado, {
          procedimiento: row.procedimiento || codigoNormalizado,
          ocurrencias: 1
        });
      }
      continue;
    }
    
    // Buscar valor según complejidad
    const complejidad = nomencladorItem.complejidad || 'SIN_COMPLEJIDAD';
    const valorKey = `${complejidad}|${mes}|${anio}|${obraSocial}|${modulo}`;
    const valor = valores[valorKey];
    
    if (!valor && valor !== 0) {
      // Faltante: no tiene valor asignado para esta complejidad/mes
      const existing = faltantesMap.get(codigoNormalizado);
      if (existing) {
        existing.ocurrencias++;
      } else {
        faltantesMap.set(codigoNormalizado, {
          procedimiento: nomencladorItem.procedimiento,
          ocurrencias: 1
        });
      }
      continue;
    }
    
    // Calcular factor base (primer procedimiento de la fila 100%, restantes 50%)
    let factor = calculateFactor(row.orden_en_fila, row.instrumentador, row.fecha, detalle);
    
    // Verificar si aplica plus del 20% por horario especial
    const tienePlusHorario = aplicaPlusHorario(row.fecha, row.hora);
    
    // Sumar el 20% al factor si corresponde (no multiplicar el importe)
    if (tienePlusHorario) {
      factor = factor + 0.20;
    }
    
    // Calcular importe con el factor final (que ya incluye el plus si corresponde)
    const importeBase = valor * factor;
    
    // Crear fila de detalle (usar codigoFinal que puede ser el oficial si se encontró por descripción)
    detalle.push({
      fecha: row.fecha,
      hora: row.hora,
      paciente: row.paciente,
      codigo: codigoFinal, // Usar el código oficial si se encontró por descripción
      procedimiento: nomencladorItem.procedimiento,
      cirujano: row.cirujano,
      instrumentador: row.instrumentador,
      complejidad: complejidad === 'SIN_COMPLEJIDAD' ? '' : complejidad,
      valor: valor,
      factor: factor,
      plusHorario: tienePlusHorario,
      importe: importeBase,
      obra_social: obraSocial
    });
  }
  
  // Mostrar estadísticas de búsqueda
  console.log('=== Estadísticas de búsqueda en nomenclador ===');
  console.log(`Encontrados por código: ${encontradosPorCodigo}`);
  console.log(`Encontrados por descripción: ${encontradosPorDescripcion}`);
  console.log(`No encontrados: ${noEncontrados}`);
  console.log(`Filtrados sin instrumentador: ${filtradosPorInstrumentador}`);
  console.log(`Total procesado: ${encontradosPorCodigo + encontradosPorDescripcion + noEncontrados + filtradosPorInstrumentador}`);
  
  // Calcular resumen por instrumentador
  const resumenMap = new Map<string, { cantidad: number; total: number }>();
  detalle.forEach(d => {
    const existing = resumenMap.get(d.instrumentador);
    if (existing) {
      existing.cantidad++;
      existing.total += d.importe;
    } else {
      resumenMap.set(d.instrumentador, { cantidad: 1, total: d.importe });
    }
  });
  
  const resumen: ResumenRow[] = Array.from(resumenMap.entries())
    .map(([instrumentador, data]) => ({
      instrumentador,
      cantidad: data.cantidad,
      total: data.total
    }))
    .sort((a, b) => a.instrumentador.localeCompare(b.instrumentador));
  
  // Convertir faltantes a array
  const faltantes: FaltanteRow[] = Array.from(faltantesMap.entries())
    .map(([codigo, data]) => ({
      codigo,
      procedimiento: data.procedimiento,
      ocurrencias: data.ocurrencias
    }))
    .sort((a, b) => a.codigo.localeCompare(b.codigo));
  
  // Totales
  const totales: TotalesData = {
    procedimientos: detalle.length,
    liquidado: detalle.reduce((sum, d) => sum + d.importe, 0),
    faltantes: faltantes.length
  };
  
  // Guardar liquidación en BD
  const liquidacionId = await saveLiquidacion(mes, anio, obraSocial, modulo, totales);
  
  // Guardar faltantes en BD
  await saveFaltantes(liquidacionId, faltantes);
  
  return { detalle, resumen, faltantes, totales, liquidacionId };
}

/**
 * Resuelve un faltante asignándole complejidad y valor
 */
export async function resolverFaltante(
  codigo: string,
  procedimiento: string,
  complejidad: string,
  mes: number,
  anio: number,
  valor: number,
  obraSocial: string = 'OSDE',
  modulo: string = 'instrumentadores'
): Promise<void> {
  // 1. Crear o actualizar procedimiento
  const { data: existingProc } = await supabase
    .from('procedimientos')
    .select('id')
    .eq('codigo', codigo.toUpperCase().trim())
    .maybeSingle();
  
  if (existingProc) {
    // Actualizar procedimiento existente
    await supabase
      .from('procedimientos')
      .update({
        procedimiento,
        complejidad: complejidad || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingProc.id);
  } else {
    // Crear nuevo procedimiento
    await supabase
      .from('procedimientos')
      .insert({
        codigo: codigo.toUpperCase().trim(),
        procedimiento,
        complejidad: complejidad || null,
        activo: true
      });
  }
  
  // 2. Crear o actualizar valor
  const complejidadKey = complejidad || 'SIN_COMPLEJIDAD';
  const { data: existingValor } = await supabase
    .from('valores_nomenclador')
    .select('id')
    .eq('complejidad', complejidadKey)
    .eq('mes', mes)
    .eq('anio', anio)
    .eq('obra_social', obraSocial)
    .eq('modulo', modulo)
    .maybeSingle();
  
  if (existingValor) {
    await supabase
      .from('valores_nomenclador')
      .update({
        valor,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingValor.id);
  } else {
    await supabase
      .from('valores_nomenclador')
      .insert({
        complejidad: complejidadKey,
        mes,
        anio,
        obra_social: obraSocial,
        modulo,
        valor
      });
  }
  
  // 3. Marcar faltantes como resueltos
  await supabase
    .from('faltantes_liquidacion')
    .update({
      resuelto: true,
      complejidad_asignada: complejidad || null
    })
    .eq('codigo', codigo.toUpperCase().trim())
    .eq('resuelto', false);
}

