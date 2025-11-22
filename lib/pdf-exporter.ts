// NOTA: Este archivo requiere las siguientes dependencias:
// npm install jspdf jspdf-autotable
// 
// En bolt.new, agregar estas dependencias antes de usar este módulo

import { DetalleRow, ResumenRow } from './types';
import { formatARS, formatDate } from './formatters';
import { getNumeroLiquidacion } from './liquidacion-config-service';

// Tipos temporales para evitar errores de compilación
// Reemplazar con imports reales cuando se instalen las dependencias
declare const require: any;

let jsPDF: any;
let autoTable: any;

// Función para cargar las librerías dinámicamente
async function loadPDFLibraries() {
  if (typeof window === 'undefined') return;
  
  try {
    // Intentar cargar dinámicamente (solo funciona si están instaladas)
    const jsPDFModule = await import('jspdf');
    const autoTableModule = await import('jspdf-autotable');
    jsPDF = jsPDFModule.default;
    autoTable = autoTableModule.default;
  } catch (error) {
    console.warn('PDF libraries not available. Install jspdf and jspdf-autotable to enable PDF export.');
    throw new Error('Las librerías de PDF no están disponibles. Instale jspdf y jspdf-autotable.');
  }
}

/**
 * Exporta el detalle a PDF
 */
export async function exportDetalleToPDF(
  detalle: DetalleRow[], 
  instrumentador?: string,
  filename?: string
) {
  await loadPDFLibraries();
  
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(16);
  doc.text('Detalle de Liquidación - Instrumentadores', 14, 15);
  
  if (instrumentador) {
    doc.setFontSize(12);
    doc.text(`Instrumentador: ${instrumentador}`, 14, 25);
  }
  
  // Preparar datos para la tabla
  const tableData = detalle.map(d => [
    formatDate(d.fecha),
    d.hora || '',
    d.paciente.substring(0, 20), // Truncar nombres largos
    d.codigo,
    d.procedimiento.substring(0, 30), // Truncar procedimientos largos
    formatARS(d.valor),
    `${(d.factor * 100).toFixed(0)}%`,
    formatARS(d.importe)
  ]);
  
  // Tabla
  autoTable(doc, {
    head: [['Fecha', 'Hora', 'Paciente', 'Código', 'Procedimiento', 'Valor', 'Factor', 'Importe']],
    body: tableData,
    startY: instrumentador ? 30 : 20,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] }, // Azul
  });
  
  const finalFilename = filename || `detalle-${instrumentador || 'todos'}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(finalFilename);
}

/**
 * Exporta el resumen a PDF
 */
export async function exportResumenToPDF(resumen: ResumenRow[], filename?: string) {
  await loadPDFLibraries();
  
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text('Resumen por Instrumentador', 14, 15);
  
  const totalCantidad = resumen.reduce((sum, r) => sum + r.cantidad, 0);
  const totalMonto = resumen.reduce((sum, r) => sum + r.total, 0);
  
  const tableData = [
    ...resumen.map(r => [
      r.instrumentador,
      r.cantidad.toString(),
      formatARS(r.total)
    ]),
    ['TOTAL', totalCantidad.toString(), formatARS(totalMonto)]
  ];
  
  autoTable(doc, {
    head: [['Instrumentador', 'Cantidad', 'Total']],
    body: tableData,
    startY: 25,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  const finalFilename = filename || `resumen-instrumentadores-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(finalFilename);
}

/**
 * Exporta PDF individual por instrumentador - FORMATO OFICIAL OSDE
 * Replica el formato exacto del PDF de liquidación de OSDE
 */
export async function exportPDFPorInstrumentador(
  detalle: DetalleRow[], 
  mes: number, 
  anio: number,
  numeroLiquidacion?: string | number
) {
  await loadPDFLibraries();
  
  // Obtener el número de liquidación de la BD si no se proporciona
  let numeroFinal: string;
  if (numeroLiquidacion) {
    numeroFinal = String(numeroLiquidacion);
  } else {
    try {
      const numero = await getNumeroLiquidacion(mes, anio);
      numeroFinal = String(numero);
    } catch (error) {
      console.error('Error al obtener número de liquidación, usando valor por defecto:', error);
      numeroFinal = '401'; // Fallback
    }
  }
  
  const instrumentadores = [...new Set(detalle.map(d => d.instrumentador))];
  const nombreMes = new Date(anio, mes - 1).toLocaleString('es-AR', { month: 'long' });
  const nombreMesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
  
  for (const instrumentador of instrumentadores) {
    const detalleInstrumentador = detalle.filter(d => d.instrumentador === instrumentador);
    
    const doc = new jsPDF();
    let yPos = 15;
    
    // === LOGO Y ENCABEZADO IZQUIERDO ===
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 102, 204); // Azul institucional
    doc.text('OSDE', 14, yPos);
    yPos += 5;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Desde 1974', 14, yPos);
    
    // === CUADRO DE INFORMACIÓN (DERECHA) ===
    const boxStartX = 110;
    const boxStartY = 10;
    const boxWidth = 86;
    const rowHeight = 8;
    
    // Dibujar cuadro
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(boxStartX, boxStartY, boxWidth, rowHeight * 4);
    
    // Líneas horizontales internas
    doc.line(boxStartX, boxStartY + rowHeight, boxStartX + boxWidth, boxStartY + rowHeight);
    doc.line(boxStartX, boxStartY + rowHeight * 2, boxStartX + boxWidth, boxStartY + rowHeight * 2);
    doc.line(boxStartX, boxStartY + rowHeight * 3, boxStartX + boxWidth, boxStartY + rowHeight * 3);
    
    // Contenido del cuadro
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    
    // Fila 1: Profesional
    doc.text('Profesional:', boxStartX + 2, boxStartY + 5);
    doc.setFont(undefined, 'normal');
    doc.text(instrumentador, boxStartX + 28, boxStartY + 5);
    
    // Fila 2: Número de matrícula
    doc.setFont(undefined, 'bold');
    doc.text('Número de matrícula:', boxStartX + 2, boxStartY + rowHeight + 5);
    doc.setFont(undefined, 'normal');
    doc.text('--', boxStartX + 42, boxStartY + rowHeight + 5);
    
    // Fila 3: Período de liquidación
    doc.setFont(undefined, 'bold');
    doc.text('Período de liquidación:', boxStartX + 2, boxStartY + rowHeight * 2 + 5);
    doc.setFont(undefined, 'normal');
    doc.text(`${nombreMesCapitalizado} ${anio}`, boxStartX + 44, boxStartY + rowHeight * 2 + 5);
    
    // Fila 4: Liquidación
    doc.setFont(undefined, 'bold');
    doc.text('Liquidación:', boxStartX + 2, boxStartY + rowHeight * 3 + 5);
    doc.setFont(undefined, 'normal');
    doc.text(numeroFinal, boxStartX + 26, boxStartY + rowHeight * 3 + 5);
    
    // === TABLA DE DETALLE ===
    yPos = boxStartY + rowHeight * 4 + 10;
    
    const tableData = detalleInstrumentador.map(d => [
      formatDate(d.fecha),
      d.paciente.toUpperCase(),
      `${d.codigo} - ${d.procedimiento}`,
      '', // Observación vacía por defecto
      formatARS(d.importe),
      d.cirujano.toUpperCase()
    ]);
    
    autoTable(doc, {
      head: [[
        'Fecha visita', 
        'Paciente', 
        'Procedimiento quirúrgico',
        'Observación',
        'Valor',
        'Cirujano'
      ]],
      body: tableData,
      startY: yPos,
      styles: { 
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [220, 230, 241],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 22, halign: 'center' },   // Fecha visita
        1: { cellWidth: 45 },                      // Paciente
        2: { cellWidth: 50 },                      // Procedimiento
        3: { cellWidth: 25, halign: 'center' },   // Observación
        4: { cellWidth: 25, halign: 'right' },    // Valor
        5: { cellWidth: 30 }                       // Cirujano
      },
      theme: 'grid',
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.1
    });
    
    // === GUARDAR ARCHIVO ===
    const nombreArchivo = `Liquidacion_${instrumentador.replace(/[^a-zA-Z0-9\s]/g, '_').replace(/\s+/g, '_')}_${nombreMesCapitalizado}_${anio}.pdf`;
    doc.save(nombreArchivo);
    
    // Pequeña pausa entre PDFs para evitar bloqueos del navegador
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

