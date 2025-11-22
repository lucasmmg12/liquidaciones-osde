import { supabase } from './supabase';

export interface LiquidacionConfig {
  mes: number;
  anio: number;
  numero_liquidacion: number;
  obra_social: string;
  modulo: string;
}

/**
 * Obtiene el número de liquidación para un mes/año específico
 * Si no existe, lo calcula automáticamente basándose en la referencia (Agosto 2025 = 401)
 */
export async function getNumeroLiquidacion(
  mes: number,
  anio: number,
  obraSocial: string = 'OSDE',
  modulo: string = 'instrumentadores'
): Promise<number> {
  try {
    // Intentar obtener de la base de datos
    const { data, error } = await supabase
      .from('liquidaciones_config')
      .select('numero_liquidacion')
      .eq('mes', mes)
      .eq('anio', anio)
      .eq('obra_social', obraSocial)
      .eq('modulo', modulo)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error al obtener número de liquidación:', error);
      throw error;
    }

    if (data) {
      return data.numero_liquidacion;
    }

    // Si no existe, calcular automáticamente
    const numeroCalculado = calcularNumeroLiquidacion(mes, anio);
    
    // Guardar el número calculado para futuras referencias
    await setNumeroLiquidacion(mes, anio, numeroCalculado, obraSocial, modulo);
    
    return numeroCalculado;
  } catch (error) {
    console.error('Error en getNumeroLiquidacion:', error);
    // Fallback: calcular sin guardar
    return calcularNumeroLiquidacion(mes, anio);
  }
}

/**
 * Calcula el número de liquidación basándose en una fecha de referencia
 * Referencia: Agosto 2025 = 401
 */
function calcularNumeroLiquidacion(mes: number, anio: number): number {
  // Fecha de referencia: Agosto 2025 = 401
  const mesReferencia = 8;
  const anioReferencia = 2025;
  const numeroReferencia = 401;

  // Calcular la diferencia en meses
  const mesesDesdeReferencia = (anio - anioReferencia) * 12 + (mes - mesReferencia);
  
  return numeroReferencia + mesesDesdeReferencia;
}

/**
 * Establece o actualiza el número de liquidación para un mes/año
 */
export async function setNumeroLiquidacion(
  mes: number,
  anio: number,
  numeroLiquidacion: number,
  obraSocial: string = 'OSDE',
  modulo: string = 'instrumentadores'
): Promise<void> {
  const { error } = await supabase
    .from('liquidaciones_config')
    .upsert({
      mes,
      anio,
      numero_liquidacion: numeroLiquidacion,
      obra_social: obraSocial,
      modulo: modulo,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'mes,anio,obra_social,modulo'
    });

  if (error) {
    console.error('Error al guardar número de liquidación:', error);
    throw error;
  }
}

/**
 * Obtiene todas las configuraciones de liquidación
 */
export async function getAllLiquidacionesConfig(
  obraSocial: string = 'OSDE',
  modulo: string = 'instrumentadores'
): Promise<LiquidacionConfig[]> {
  const { data, error } = await supabase
    .from('liquidaciones_config')
    .select('*')
    .eq('obra_social', obraSocial)
    .eq('modulo', modulo)
    .order('anio', { ascending: false })
    .order('mes', { ascending: false });

  if (error) {
    console.error('Error al obtener configuraciones:', error);
    throw error;
  }

  return data || [];
}

/**
 * Genera números de liquidación automáticos para un rango de meses
 */
export async function generarNumerosAutomaticos(
  mesInicio: number,
  anioInicio: number,
  mesFin: number,
  anioFin: number,
  obraSocial: string = 'OSDE',
  modulo: string = 'instrumentadores'
): Promise<void> {
  const registros: any[] = [];
  
  let mesActual = mesInicio;
  let anioActual = anioInicio;
  
  while (anioActual < anioFin || (anioActual === anioFin && mesActual <= mesFin)) {
    const numero = calcularNumeroLiquidacion(mesActual, anioActual);
    
    registros.push({
      mes: mesActual,
      anio: anioActual,
      numero_liquidacion: numero,
      obra_social: obraSocial,
      modulo: modulo,
      updated_at: new Date().toISOString()
    });
    
    // Avanzar al siguiente mes
    mesActual++;
    if (mesActual > 12) {
      mesActual = 1;
      anioActual++;
    }
  }
  
  // Insertar todos los registros
  const { error } = await supabase
    .from('liquidaciones_config')
    .upsert(registros, {
      onConflict: 'mes,anio,obra_social,modulo'
    });
  
  if (error) {
    console.error('Error al generar números automáticos:', error);
    throw error;
  }
}

