import * as XLSX from 'xlsx';
import { DetalleRow, ResumenRow } from './types';
import { formatARS, formatDate } from './formatters';

/**
 * Exporta el detalle a Excel
 */
export function exportDetalleToExcel(detalle: DetalleRow[], filename: string = 'detalle-liquidacion.xlsx') {
  // Preparar datos para Excel
  const data = detalle.map(d => ({
    'Fecha': formatDate(d.fecha),
    'Hora': d.hora || '',
    'Paciente': d.paciente,
    'Código': d.codigo,
    'Procedimiento': d.procedimiento,
    'Cirujano': d.cirujano,
    'Instrumentador': d.instrumentador,
    'Complejidad': d.complejidad || '',
    'Valor': d.valor,
    'Factor': `${(d.factor * 100).toFixed(0)}%`,
    'Importe': d.importe,
    'Obra Social': d.obra_social || 'OSDE'
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  
  // Ajustar ancho de columnas
  const colWidths = [
    { wch: 12 }, // Fecha
    { wch: 8 },  // Hora
    { wch: 25 }, // Paciente
    { wch: 10 }, // Código
    { wch: 40 }, // Procedimiento
    { wch: 20 }, // Cirujano
    { wch: 25 }, // Instrumentador
    { wch: 15 }, // Complejidad
    { wch: 12 }, // Valor
    { wch: 10 }, // Factor
    { wch: 12 }, // Importe
    { wch: 12 }  // Obra Social
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Detalle');
  XLSX.writeFile(wb, filename);
}

/**
 * Exporta el resumen a Excel con totales
 */
export function exportResumenToExcel(resumen: ResumenRow[], filename: string = 'resumen-liquidacion.xlsx') {
  // Calcular totales
  const totalCantidad = resumen.reduce((sum, r) => sum + r.cantidad, 0);
  const totalMonto = resumen.reduce((sum, r) => sum + r.total, 0);

  // Preparar datos
  const data = [
    ...resumen.map(r => ({
      'Instrumentador': r.instrumentador,
      'Cantidad': r.cantidad,
      'Total': r.total
    })),
    {
      'Instrumentador': 'TOTAL',
      'Cantidad': totalCantidad,
      'Total': totalMonto
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  
  // Ajustar ancho de columnas
  ws['!cols'] = [
    { wch: 30 }, // Instrumentador
    { wch: 12 }, // Cantidad
    { wch: 15 }  // Total
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Resumen');
  XLSX.writeFile(wb, filename);
}

/**
 * Exporta detalle y resumen en un solo archivo Excel con múltiples hojas
 */
export function exportLiquidacionCompleta(
  detalle: DetalleRow[],
  resumen: ResumenRow[],
  filename: string = 'liquidacion-completa.xlsx'
) {
  const wb = XLSX.utils.book_new();

  // Hoja de Detalle
  const detalleData = detalle.map(d => ({
    'Fecha': formatDate(d.fecha),
    'Hora': d.hora || '',
    'Paciente': d.paciente,
    'Código': d.codigo,
    'Procedimiento': d.procedimiento,
    'Cirujano': d.cirujano,
    'Instrumentador': d.instrumentador,
    'Complejidad': d.complejidad || '',
    'Valor': d.valor,
    'Factor': `${(d.factor * 100).toFixed(0)}%`,
    'Importe': d.importe
  }));
  const wsDetalle = XLSX.utils.json_to_sheet(detalleData);
  wsDetalle['!cols'] = [
    { wch: 12 }, { wch: 8 }, { wch: 25 }, { wch: 10 },
    { wch: 40 }, { wch: 20 }, { wch: 25 }, { wch: 15 },
    { wch: 12 }, { wch: 10 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle');

  // Hoja de Resumen
  const totalCantidad = resumen.reduce((sum, r) => sum + r.cantidad, 0);
  const totalMonto = resumen.reduce((sum, r) => sum + r.total, 0);
  const resumenData = [
    ...resumen.map(r => ({
      'Instrumentador': r.instrumentador,
      'Cantidad': r.cantidad,
      'Total': r.total
    })),
    {
      'Instrumentador': 'TOTAL',
      'Cantidad': totalCantidad,
      'Total': totalMonto
    }
  ];
  const wsResumen = XLSX.utils.json_to_sheet(resumenData);
  wsResumen['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  XLSX.writeFile(wb, filename);
}

