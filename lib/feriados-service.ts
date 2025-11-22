/**
 * Servicio para gestión de feriados nacionales
 * Los feriados se almacenan en localStorage para que el usuario pueda configurarlos
 */

export interface Feriado {
  fecha: string; // Formato: YYYY-MM-DD
  descripcion: string;
}

const STORAGE_KEY = 'osde_feriados_nacionales';

/**
 * Obtiene la lista de feriados desde localStorage
 */
export function getFeriados(): Feriado[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error al cargar feriados:', error);
  }
  
  // Retornar feriados por defecto si no hay datos
  return getFeriadosDefecto();
}

/**
 * Guarda la lista de feriados en localStorage
 */
export function saveFeriados(feriados: Feriado[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feriados));
  } catch (error) {
    console.error('Error al guardar feriados:', error);
    throw new Error('No se pudieron guardar los feriados');
  }
}

/**
 * Agrega un nuevo feriado
 */
export function addFeriado(fecha: string, descripcion: string): void {
  const feriados = getFeriados();
  
  // Evitar duplicados
  if (feriados.some(f => f.fecha === fecha)) {
    throw new Error('Ya existe un feriado para esta fecha');
  }
  
  feriados.push({ fecha, descripcion });
  feriados.sort((a, b) => a.fecha.localeCompare(b.fecha));
  saveFeriados(feriados);
}

/**
 * Elimina un feriado
 */
export function removeFeriado(fecha: string): void {
  const feriados = getFeriados();
  const filtered = feriados.filter(f => f.fecha !== fecha);
  saveFeriados(filtered);
}

/**
 * Verifica si una fecha es feriado
 */
export function esFeriado(fecha: string): boolean {
  const feriados = getFeriados();
  return feriados.some(f => f.fecha === fecha);
}

/**
 * Retorna feriados nacionales por defecto para Argentina 2024-2026
 */
function getFeriadosDefecto(): Feriado[] {
  return [
    // 2024
    { fecha: '2024-01-01', descripcion: 'Año Nuevo' },
    { fecha: '2024-02-12', descripcion: 'Carnaval' },
    { fecha: '2024-02-13', descripcion: 'Carnaval' },
    { fecha: '2024-03-24', descripcion: 'Día Nacional de la Memoria' },
    { fecha: '2024-03-29', descripcion: 'Viernes Santo' },
    { fecha: '2024-04-02', descripcion: 'Día del Veterano' },
    { fecha: '2024-05-01', descripcion: 'Día del Trabajador' },
    { fecha: '2024-05-25', descripcion: 'Revolución de Mayo' },
    { fecha: '2024-06-20', descripcion: 'Paso a la Inmortalidad del Gral. Belgrano' },
    { fecha: '2024-07-09', descripcion: 'Día de la Independencia' },
    { fecha: '2024-08-17', descripcion: 'Paso a la Inmortalidad del Gral. San Martín' },
    { fecha: '2024-10-12', descripcion: 'Día del Respeto a la Diversidad Cultural' },
    { fecha: '2024-11-18', descripcion: 'Día de la Soberanía Nacional' },
    { fecha: '2024-12-08', descripcion: 'Inmaculada Concepción de María' },
    { fecha: '2024-12-25', descripcion: 'Navidad' },
    
    // 2025
    { fecha: '2025-01-01', descripcion: 'Año Nuevo' },
    { fecha: '2025-03-03', descripcion: 'Carnaval' },
    { fecha: '2025-03-04', descripcion: 'Carnaval' },
    { fecha: '2025-03-24', descripcion: 'Día Nacional de la Memoria' },
    { fecha: '2025-04-02', descripcion: 'Día del Veterano' },
    { fecha: '2025-04-18', descripcion: 'Viernes Santo' },
    { fecha: '2025-05-01', descripcion: 'Día del Trabajador' },
    { fecha: '2025-05-25', descripcion: 'Revolución de Mayo' },
    { fecha: '2025-06-20', descripcion: 'Paso a la Inmortalidad del Gral. Belgrano' },
    { fecha: '2025-07-09', descripcion: 'Día de la Independencia' },
    { fecha: '2025-08-17', descripcion: 'Paso a la Inmortalidad del Gral. San Martín' },
    { fecha: '2025-10-12', descripcion: 'Día del Respeto a la Diversidad Cultural' },
    { fecha: '2025-11-24', descripcion: 'Día de la Soberanía Nacional' },
    { fecha: '2025-12-08', descripcion: 'Inmaculada Concepción de María' },
    { fecha: '2025-12-25', descripcion: 'Navidad' },
    
    // 2026
    { fecha: '2026-01-01', descripcion: 'Año Nuevo' },
    { fecha: '2026-02-16', descripcion: 'Carnaval' },
    { fecha: '2026-02-17', descripcion: 'Carnaval' },
    { fecha: '2026-03-24', descripcion: 'Día Nacional de la Memoria' },
    { fecha: '2026-04-02', descripcion: 'Día del Veterano' },
    { fecha: '2026-04-03', descripcion: 'Viernes Santo' },
    { fecha: '2026-05-01', descripcion: 'Día del Trabajador' },
    { fecha: '2026-05-25', descripcion: 'Revolución de Mayo' },
    { fecha: '2026-06-20', descripcion: 'Paso a la Inmortalidad del Gral. Belgrano' },
    { fecha: '2026-07-09', descripcion: 'Día de la Independencia' },
    { fecha: '2026-08-17', descripcion: 'Paso a la Inmortalidad del Gral. San Martín' },
    { fecha: '2026-10-12', descripcion: 'Día del Respeto a la Diversidad Cultural' },
    { fecha: '2026-11-23', descripcion: 'Día de la Soberanía Nacional' },
    { fecha: '2026-12-08', descripcion: 'Inmaculada Concepción de María' },
    { fecha: '2026-12-25', descripcion: 'Navidad' },
  ];
}

/**
 * Convierte fecha de dd/mm/yyyy a YYYY-MM-DD
 */
function convertirFecha(fecha: string): string {
  // Si ya está en formato YYYY-MM-DD, retornar tal cual
  if (/^\d{4}-\d{2}-\d{2}/.test(fecha)) {
    return fecha.split('T')[0]; // Remover hora si existe
  }
  
  // Si está en formato dd/mm/yyyy, convertir
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fecha)) {
    const [dia, mes, anio] = fecha.split('/');
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }
  
  // Si no coincide ningún formato, devolver tal cual
  return fecha;
}

/**
 * Determina si se debe aplicar el plus del 20% por horario especial
 * 
 * Reglas:
 * - Feriados: TODO EL DÍA (00:00 a 23:59) - Se toma por el horario de comienzo
 * - Fines de semana: Sábado desde 13:00 hasta Domingo 23:59
 * 
 * @param fecha Fecha en formato dd/mm/yyyy o YYYY-MM-DD
 * @param hora Hora en formato HH:MM o HH:MM:SS
 * @returns true si aplica el plus del 20%
 */
export function aplicaPlusHorario(fecha: string, hora?: string): boolean {
  if (!fecha) return false;
  
  try {
    // Convertir fecha a formato YYYY-MM-DD
    const fechaISO = convertirFecha(fecha);
    const fechaObj = new Date(fechaISO + 'T00:00:00');
    const diaSemana = fechaObj.getDay(); // 0=Domingo, 6=Sábado
    
    // FERIADO: TODO EL DÍA (00:00 - 23:59)
    // Los feriados tienen prioridad y aplican sin importar la hora
    if (esFeriado(fechaISO)) {
      console.log(`✓ Aplicando plus por FERIADO: ${fecha} (${fechaISO})`);
      return true;
    }
    
    // Si no tiene hora, no aplicar plus para fines de semana
    if (!hora) return false;
    
    // Extraer hora en formato de 24hs
    const horaMatch = hora.match(/^(\d{1,2}):(\d{2})/);
    if (!horaMatch) return false;
    
    const horas = parseInt(horaMatch[1], 10);
    const minutos = parseInt(horaMatch[2], 10);
    const horaDecimal = horas + minutos / 60;
    
    // DOMINGO: Todo el día (0:00 - 23:59)
    if (diaSemana === 0) {
      console.log(`✓ Aplicando plus por DOMINGO: ${fecha} ${hora} (${fechaISO})`);
      return true;
    }
    
    // SÁBADO: Desde 13:00 (13:00 - 23:59)
    if (diaSemana === 6 && horaDecimal >= 13) {
      console.log(`✓ Aplicando plus por SÁBADO >= 13:00: ${fecha} ${hora} (${fechaISO})`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error al verificar plus horario:', error, 'fecha:', fecha);
    return false;
  }
}

/**
 * Restaura los feriados por defecto
 */
export function restaurarFeriadosDefecto(): void {
  saveFeriados(getFeriadosDefecto());
}

