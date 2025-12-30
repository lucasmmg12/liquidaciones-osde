import * as XLSX from 'xlsx';
import { ProcessedRow } from './types';
import { formatDate } from './formatters';

export interface RawRow {
  [key: string]: any; // Datos crudos del Excel
}

/**
 * Busca la fila de cabecera que contiene "Fecha de visita" u otras variantes
 * Retorna el índice de la fila (0-indexed)
 */
export function findHeaderRow(worksheet: XLSX.WorkSheet): number {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

  // Buscar en las primeras 50 filas
  const maxRows = Math.min(50, range.e.r + 1);

  // Patrones de búsqueda para la fila de cabecera
  const headerPatterns = [
    'fecha de visita',
    'fecha visita',
    'fecha',
    'codigo',
    'código',
    'procedimiento',
    'paciente',
    'instrumentador'
  ];

  // Primero buscar patrones específicos
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

    // Si encontramos al menos 3 coincidencias, probablemente es la cabecera
    if (matches >= 3) {
      console.log(`Fila de cabecera candidata en fila ${row}:`, rowValues);
      return row;
    }

    // También buscar específicamente "fecha de visita"
    if (rowValues.some(v => v.includes('fecha de visita') || v.includes('fecha visita'))) {
      console.log(`Fila de cabecera encontrada en fila ${row} (por "fecha de visita")`);
      return row;
    }
  }

  // Si no encontramos nada, intentar usar la primera fila con datos
  // (a veces la cabecera puede estar en la fila 0)
  console.log('No se encontró patrón claro de cabecera, usando fila 0 como cabecera');
  return 0;
}

/**
 * Busca una columna por múltiples variantes posibles
 */
function findColumn(row: RawRow, variants: string[]): string {
  for (const variant of variants) {
    // Buscar exacto
    if (row[variant] !== undefined && row[variant] !== null && String(row[variant]).trim() !== '') {
      return String(row[variant]).trim();
    }
    // Buscar case-insensitive
    const keys = Object.keys(row);
    const foundKey = keys.find(k => k.toLowerCase().trim() === variant.toLowerCase().trim());
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== '') {
      return String(row[foundKey]).trim();
    }
  }
  return '';
}

/**
 * Busca todas las columnas de procedimientos quirúrgicos (Procedimiento Quirúrgico, Procedimiento Quirúrgico 2, etc.)
 * Retorna un array de objetos con el valor y el índice (0 = primero, 1 = segundo, etc.)
 */
function findAllProcedimientosQuirurgicos(row: RawRow): Array<{ valor: string; indice: number }> {
  const procedimientos: Array<{ valor: string; indice: number }> = [];
  const keys = Object.keys(row);

  // Filtrar las claves que contengan "procedimiento" y "quirurgico" (case-insensitive, sin acentos)
  const procedimientoKeys = keys.filter(key => {
    const keyLower = key.toLowerCase().trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remover acentos para normalizar "quirúrgico" -> "quirurgico"

    // Buscar que contenga "procedimiento" y "quirurgico" (ya normalizado sin acentos)
    const tieneProcedimiento = keyLower.includes('procedimiento');
    const tieneQuirurgico = keyLower.includes('quirurgico');

    return tieneProcedimiento && tieneQuirurgico;
  });

  // Debug: mostrar las columnas encontradas (solo la primera vez que se encuentra algo)
  // Esto se manejará en normalizeRows para evitar spam en el log

  // Ordenar las claves para asegurar que "Procedimiento Quirúrgico" venga antes que "Procedimiento Quirúrgico 2", etc.
  procedimientoKeys.sort((a, b) => {
    const aLower = a.toLowerCase().trim();
    const bLower = b.toLowerCase().trim();

    // Extraer número si existe (ej: "Procedimiento Quirúrgico 2" -> 2, si no tiene número -> 1)
    const aNum = parseInt(aLower.match(/\d+/)?.[0] || '1');
    const bNum = parseInt(bLower.match(/\d+/)?.[0] || '1');
    return aNum - bNum;
  });

  // Extraer valores y asignar índices
  let indice = 0;
  for (const key of procedimientoKeys) {
    const valor = row[key];
    if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
      procedimientos.push({
        valor: String(valor).trim(),
        indice: indice++
      });
    }
  }

  return procedimientos;
}

/**
 * Extrae código y procedimiento de un valor de procedimiento quirúrgico
 * Maneja formatos como "200138-FIBRO", "00 - PROCEDIMIENTO", "123456 PROCEDIMIENTO"
 */
function extractCodigoYProcedimiento(valor: string): { codigo: string; procedimiento: string } {
  if (!valor) return { codigo: '', procedimiento: '' };

  // Intentar con guión (corto, largo, en md)
  const separatorMatch = valor.match(/\s*[-–—]\s*/);
  if (separatorMatch) {
    const parts = valor.split(separatorMatch[0]);
    if (parts.length >= 2) {
      return {
        codigo: parts[0].trim(),
        procedimiento: parts.slice(1).join(' ').trim()
      };
    }
  }

  // Si no hay guión, intentar separar por el primer espacio después de un número largo
  // o simplemente tomar el primer "token" como código si parece serlo
  const tokens = valor.trim().split(/\s+/);
  if (tokens.length >= 2) {
    const firstToken = tokens[0];
    // Si el primer token parece un código (comienza con número y es razonablemente corto o largo)
    if (/^[\d\.]+$/.test(firstToken)) {
      return {
        codigo: firstToken,
        procedimiento: tokens.slice(1).join(' ')
      };
    }
  }

  return {
    codigo: valor.trim(),
    procedimiento: valor.trim()
  };
}

/**
 * Normaliza las filas: si hay múltiples procedimientos quirúrgicos en una fila,
 * crea una fila por cada procedimiento
 * El primer procedimiento se pagará al 100%, los siguientes al 50%
 */
export function normalizeRows(rawRows: RawRow[]): ProcessedRow[] {
  const normalized: ProcessedRow[] = [];

  // Si no hay filas, retornar vacío
  if (!rawRows || rawRows.length === 0) {
    return normalized;
  }

  // Debug: mostrar las columnas disponibles en la primera fila
  let columnasProcedimientosQuirurgicosEncontradas = false;

  if (rawRows.length > 0) {
    const allKeys = Object.keys(rawRows[0]);
    console.log('Total de columnas en el Excel:', allKeys.length);
    console.log('Todas las columnas:', allKeys);

    // Buscar columnas que contengan "procedimiento" (para debug)
    const columnasConProcedimiento = allKeys.filter(k =>
      k.toLowerCase().includes('procedimiento')
    );
    console.log('Columnas que contienen "procedimiento":', columnasConProcedimiento);

    // Buscar columnas de procedimientos quirúrgicos en la primera fila
    const primeraFila = rawRows[0];
    const procedimientosPrimeraFila = findAllProcedimientosQuirurgicos(primeraFila);
    if (procedimientosPrimeraFila.length > 0) {
      console.log('✓ Columnas de procedimientos quirúrgicos detectadas correctamente');
      columnasProcedimientosQuirurgicosEncontradas = true;
    } else {
      console.log('⚠ No se encontraron columnas de procedimientos quirúrgicos en la primera fila');
      console.log('  Buscando columnas que contengan "procedimiento" y "quirurgico" (sin acentos)');
    }

    console.log('Total de filas a procesar:', rawRows.length);
  }

  for (const row of rawRows) {
    // Buscar columnas con múltiples variantes (datos comunes a todos los procedimientos)
    const fechaRaw = findColumn(row, [
      'Fecha de visita', 'Fecha Visita', 'Fecha', 'FECHA', 'FECHA DE VISITA',
      'Fecha de Cirugía', 'Fecha Cirugía', 'Fecha Procedimiento'
    ]);

    // Formatear fecha a dd/mm/yyyy
    const fecha = fechaRaw ? formatDate(fechaRaw) : '';

    const hora = findColumn(row, [
      'Hora de comienzo', 'Hora', 'HORA', 'Hora de visita', 'Hora Visita', 'Hora de Cirugía',
      'Hora Finalización', 'Hora Finalizacion'
    ]);

    const paciente = findColumn(row, [
      'Paciente', 'PACIENTE', 'Nombre', 'NOMBRE', 'Nombre Paciente', 'Paciente Nombre'
    ]);

    const cirujano = findColumn(row, [
      'Cirujano', 'CIRUJANO', 'Médico', 'MEDICO', 'Medico', 'Doctor', 'DOCTOR',
      'Cirujano Principal', 'Médico Cirujano'
    ]);

    const instrumentador = findColumn(row, [
      'Instrumentador/a', 'Instrumentador', 'INSTRUMENTADOR', 'Instrumentadora', 'INSTRUMENTADORA',
      'Instrumentista'
    ]);

    // Buscar obra social en columna "Cliente"
    const obraSocial = findColumn(row, [
      'Cliente', 'CLIENTE', 'Obra Social', 'Obra social', 'OBRA SOCIAL',
      'ObraSocial', 'Obra_Social'
    ]);

    // Buscar TODOS los procedimientos quirúrgicos en esta fila
    const procedimientosQuirurgicos = findAllProcedimientosQuirurgicos(row);

    // Debug: mostrar información de la fila actual
    if (rawRows.indexOf(row) < 5) { // Solo mostrar las primeras 5 filas para no saturar el log
      console.log(`Fila ${rawRows.indexOf(row) + 1}: ${procedimientosQuirurgicos.length} procedimientos quirúrgicos encontrados`);
    }

    // Si encontramos procedimientos quirúrgicos, crear una fila por cada uno
    if (procedimientosQuirurgicos.length > 0) {
      for (const procQuirurgico of procedimientosQuirurgicos) {
        const { codigo, procedimiento } = extractCodigoYProcedimiento(procQuirurgico.valor);

        // Si el código está vacío, saltar este procedimiento
        if (!codigo || codigo === '') {
          continue;
        }

        normalized.push({
          fecha: fecha,
          hora: hora || undefined,
          paciente: paciente,
          codigo: codigo.toUpperCase().trim(),
          procedimiento: procedimiento || codigo,
          cirujano: cirujano,
          instrumentador: instrumentador,
          obra_social: obraSocial || undefined,
          orden_en_fila: procQuirurgico.indice, // 0 = primer procedimiento de la fila (100%), >0 = siguientes (50%)
          // Mantener otros campos del row original
          ...Object.keys(row).reduce((acc, key) => {
            const keyLower = key.toLowerCase().trim();
            const isMainField = [
              'fecha', 'hora', 'paciente', 'codigo', 'código', 'procedimiento',
              'descripcion', 'descripción', 'cirujano', 'medico', 'médico',
              'instrumentador', 'instrumentadora', 'proceso', 'cliente', 'obra social'
            ].some(field => keyLower.includes(field));

            if (!isMainField) {
              acc[key] = row[key];
            }
            return acc;
          }, {} as any)
        });
      }
    }
    // Si no encontramos procedimientos quirúrgicos, saltar esta fila
    else {
      // Debug: solo para las primeras filas
      if (rawRows.indexOf(row) < 3) {
        console.log(`Fila ${rawRows.indexOf(row) + 1}: No se encontraron procedimientos quirúrgicos, saltando fila`);
      }
      continue; // Saltar esta fila si no tiene procedimientos quirúrgicos
    }
  }

  console.log(`Procesadas ${normalized.length} filas válidas de ${rawRows.length} filas totales`);
  console.log(`Promedio de procedimientos por fila: ${(normalized.length / rawRows.length).toFixed(2)}`);

  return normalized;
}

/**
 * Procesa el archivo Excel crudo y retorna filas normalizadas
 */
export async function processRawExcel(file: File): Promise<ProcessedRow[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Buscar Sheet1 o la primera hoja
    const sheetName = workbook.SheetNames.find((name: string) =>
      name.toLowerCase().includes('sheet1') ||
      name.toLowerCase().includes('hoja1') ||
      name.toLowerCase().includes('datos')
    ) || workbook.SheetNames[0];

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
      range: headerRow, // Empieza desde la fila de cabecera
      defval: null,
      raw: false // Convertir valores a strings cuando sea posible
    }) as RawRow[];

    console.log(`Fila de cabecera encontrada en índice: ${headerRow}`);
    console.log(`Filas leídas después de la cabecera: ${jsonData.length}`);

    if (jsonData.length === 0) {
      throw new Error('No se encontraron datos después de la fila de cabecera. Verifique que el archivo tenga datos.');
    }

    // Mostrar primera fila para debug
    if (jsonData.length > 0) {
      console.log('Primera fila de datos:', jsonData[0]);
      console.log('Claves de la primera fila:', Object.keys(jsonData[0]));
    }

    // Normalizar filas (una prestación por fila)
    const normalized = normalizeRows(jsonData);

    if (normalized.length === 0) {
      // Proporcionar más información sobre el error
      const sampleRow = jsonData[0];
      const availableColumns = sampleRow ? Object.keys(sampleRow).join(', ') : 'ninguna';
      throw new Error(
        `No se pudieron procesar filas válidas del archivo. ` +
        `Se encontraron ${jsonData.length} filas pero ninguna tenía un código válido. ` +
        `Columnas disponibles: ${availableColumns}. ` +
        `Verifique que exista una columna con "Código" o "Codigo" con valores.`
      );
    }

    return normalized;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al procesar el archivo Excel: ' + String(error));
  }
}

