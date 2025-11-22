import * as XLSX from 'xlsx';
import { Instrumentador } from './types';

/**
 * Interfaz para datos crudos del Excel de instrumentadores
 */
interface RawInstrumentadorRow {
  [key: string]: any;
}

/**
 * Busca una columna por múltiples variantes posibles
 */
function findColumn(row: RawInstrumentadorRow, variants: string[]): string {
  const keys = Object.keys(row);
  
  for (const variant of variants) {
    // Buscar exacto
    if (row[variant] !== undefined && row[variant] !== null) {
      const value = String(row[variant]).trim();
      if (value !== '' && value.toLowerCase() !== 'null' && value.toLowerCase() !== 'undefined') {
        return value;
      }
    }
    
    // Buscar case-insensitive exacto
    const foundKey = keys.find(k => k.toLowerCase().trim() === variant.toLowerCase().trim());
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
      const value = String(row[foundKey]).trim();
      if (value !== '' && value.toLowerCase() !== 'null' && value.toLowerCase() !== 'undefined') {
        return value;
      }
    }
    
    // Buscar coincidencia parcial (contiene el texto)
    const partialKey = keys.find(k => {
      const keyNormalized = k.toLowerCase().trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Remover acentos
      const variantNormalized = variant.toLowerCase().trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Remover acentos
      return keyNormalized.includes(variantNormalized) || variantNormalized.includes(keyNormalized);
    });
    
    if (partialKey && row[partialKey] !== undefined && row[partialKey] !== null) {
      const value = String(row[partialKey]).trim();
      if (value !== '' && value.toLowerCase() !== 'null' && value.toLowerCase() !== 'undefined') {
        return value;
      }
    }
  }
  return '';
}

/**
 * Busca la fila de cabecera en el Excel
 */
function findHeaderRow(worksheet: XLSX.WorkSheet): number {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  
  // Buscar en las primeras 20 filas
  const maxRows = Math.min(20, range.e.r + 1);
  
  // Patrones de búsqueda para la fila de cabecera
  const headerPatterns = [
    'nombre',
    'matricula',
    'matrícula',
    'cuit',
    'especialidad',
    'grupo',
    'perfil'
  ];
  
  for (let row = 0; row < maxRows; row++) {
    let matches = 0;
    const rowValues: string[] = [];
    
    for (let col = 0; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellAddress];
      if (cell && cell.v) {
        const cellValue = String(cell.v).toLowerCase().trim();
        rowValues.push(cellValue);
        
        // Contar coincidencias con patrones
        if (headerPatterns.some(pattern => cellValue.includes(pattern))) {
          matches++;
        }
      }
    }
    
    // Si encontramos al menos 2 coincidencias, probablemente es la cabecera
    if (matches >= 2) {
      console.log(`Fila de cabecera encontrada en fila ${row}:`, rowValues);
      return row;
    }
  }
  
  console.log('No se encontró patrón claro de cabecera, usando fila 0');
  return 0;
}

/**
 * Normaliza un valor booleano
 */
function normalizeBoolean(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  
  const strValue = String(value).toLowerCase().trim();
  return strValue === 'si' || 
         strValue === 'sí' || 
         strValue === 'yes' || 
         strValue === 'true' || 
         strValue === '1' || 
         strValue === 'activo';
}

/**
 * Procesa una fila del Excel y la convierte en un objeto Instrumentador parcial
 */
function processInstrumentadorRow(
  row: RawInstrumentadorRow
): Omit<Instrumentador, 'id' | 'created_at' | 'updated_at'> | null {
  // Buscar nombre (campo requerido)
  const nombre = findColumn(row, [
    'Nombre',
    'NOMBRE',
    'nombre',
    'Apellido y Nombre',
    'Apellido y nombre',
    'Instrumentador',
    'Instrumentador/a'
  ]);
  
  // Si no hay nombre, saltar esta fila
  if (!nombre) {
    return null;
  }
  
  // Buscar otros campos
  const matricula = findColumn(row, [
    'Mat. provincia',
    'Mat. provinc',
    'Matricula provincial',
    'Matrícula provincial',
    'Matricula',
    'Matrícula',
    'MAT. PROVINC',
    'MAT. PROVINCIA',
    'Mat provincial',
    'Mat. Provincial',
    'Mat Provincial'
  ]);
  
  const cuit = findColumn(row, [
    'CUIT',
    'cuit',
    'Cuit',
    'C.U.I.T.',
    'CUIL',
    'cuil'
  ]);
  
  const especialidad = findColumn(row, [
    'Especialidad',
    'ESPECIALIDAD',
    'especialidad',
    'Esp.',
    'Esp'
  ]);
  
  const grupoPersonal = findColumn(row, [
    'Grupo personal',
    'Grupo Personal',
    'GRUPO PERSONAL',
    'grupo personal',
    'Grupo',
    'GRUPO'
  ]);
  
  const perfil = findColumn(row, [
    'Perfil',
    'PERFIL',
    'perfil',
    'Profile'
  ]);
  
  const activo = findColumn(row, [
    'Activo',
    'ACTIVO',
    'activo',
    'Estado',
    'ESTADO',
    'estado',
    'Active'
  ]);
  
  return {
    nombre: nombre,
    apellido: '',
    email: null,
    telefono: null,
    matricula_provincial: matricula || null,
    cuit: cuit || null,
    especialidad: especialidad || null,
    grupo_personal: grupoPersonal || null,
    perfil: perfil || null,
    activo: activo ? normalizeBoolean(activo) : true
  };
}

/**
 * Procesa el archivo Excel de instrumentadores y retorna un array de instrumentadores
 */
export async function processInstrumentadoresExcel(
  file: File
): Promise<Omit<Instrumentador, 'id' | 'created_at' | 'updated_at'>[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Buscar la primera hoja
    const sheetName = workbook.SheetNames[0];
    
    if (!sheetName) {
      throw new Error('No se encontró ninguna hoja en el archivo Excel');
    }
    
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet['!ref']) {
      throw new Error('La hoja está vacía');
    }
    
    // Encontrar fila de cabecera
    const headerRow = findHeaderRow(worksheet);
    
    // Leer datos desde la fila de cabecera
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      range: headerRow,
      defval: null,
      raw: false
    }) as RawInstrumentadorRow[];
    
    console.log(`Fila de cabecera encontrada en índice: ${headerRow}`);
    console.log(`Filas leídas después de la cabecera: ${jsonData.length}`);
    
    if (jsonData.length === 0) {
      throw new Error('No se encontraron datos después de la fila de cabecera');
    }
    
    // Mostrar primera fila para debug
    if (jsonData.length > 0) {
      console.log('Primera fila de datos:', jsonData[0]);
      console.log('Claves de la primera fila:', Object.keys(jsonData[0]));
    }
    
    // Procesar filas
    const instrumentadores: Omit<Instrumentador, 'id' | 'created_at' | 'updated_at'>[] = [];
    
    for (const row of jsonData) {
      const instrumentador = processInstrumentadorRow(row);
      if (instrumentador) {
        instrumentadores.push(instrumentador);
      }
    }
    
    console.log(`Procesados ${instrumentadores.length} instrumentadores de ${jsonData.length} filas`);
    
    if (instrumentadores.length === 0) {
      const sampleRow = jsonData[0];
      const availableColumns = sampleRow ? Object.keys(sampleRow).join(', ') : 'ninguna';
      throw new Error(
        `No se pudieron procesar instrumentadores válidos del archivo. ` +
        `Se encontraron ${jsonData.length} filas pero ninguna tenía un nombre válido. ` +
        `Columnas disponibles: ${availableColumns}. ` +
        `Verifique que exista una columna con "Nombre" con valores.`
      );
    }
    
    return instrumentadores;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al procesar el archivo Excel: ' + String(error));
  }
}

