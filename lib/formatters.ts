export function formatARS(value: number): string {
  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return formatted.replace('.', '_').replace(',', '.').replace('_', ',');
}

export function formatDate(date: Date | string | number): string {
  let d: Date;
  
  if (typeof date === 'number') {
    // Si es un número serial de Excel, convertir
    d = excelDateToJSDate(date);
  } else if (typeof date === 'string') {
    // Si es string, intentar varios formatos
    // Formato dd/mm/yyyy ya correcto
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date)) {
      return date;
    }
    // Formato yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
      const parts = date.split(/[-T]/);
      d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      d = new Date(date);
    }
  } else {
    d = date;
  }
  
  // Validar que sea una fecha válida
  if (isNaN(d.getTime())) {
    return String(date); // Devolver el valor original si no se puede parsear
  }
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Convierte un número serial de Excel a fecha de JavaScript
 */
function excelDateToJSDate(serial: number): Date {
  // Excel cuenta desde 1/1/1900 (serial 1)
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  
  const fractional_day = serial - Math.floor(serial) + 0.0000001;
  let total_seconds = Math.floor(86400 * fractional_day);
  
  const seconds = total_seconds % 60;
  total_seconds -= seconds;
  
  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;
  
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}
