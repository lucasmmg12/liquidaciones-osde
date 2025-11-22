'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Kpis } from '@/components/kpis';
import { FileDrop } from '@/components/file-drop';
import { DetalleTable } from '@/components/detalle-table';
import { ResumenTable } from '@/components/resumen-table';
import { FaltantesTable } from '@/components/faltantes-table';
import { ArrowLeft, Settings, Download, FileText, Info, AlertCircle } from 'lucide-react';
import { DetalleRow, ResumenRow, FaltanteRow, TotalesData } from '@/lib/types';
import { processRawExcel } from '@/lib/excel-processor';
import { processLiquidacion } from '@/lib/liquidacion-service';
import { exportLiquidacionCompleta, exportDetalleToExcel, exportResumenToExcel } from '@/lib/excel-exporter';
import { exportPDFPorInstrumentador, exportResumenToPDF } from '@/lib/pdf-exporter';
import { FaltantesManager } from '@/components/faltantes-manager';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import Footer from '@/components/Footer';

export default function InstrumentadoresPage() {
  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [processed, setProcessed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [detalle, setDetalle] = useState<DetalleRow[]>([]);
  const [resumen, setResumen] = useState<ResumenRow[]>([]);
  const [faltantes, setFaltantes] = useState<FaltanteRow[]>([]);
  const [totales, setTotales] = useState<TotalesData>({ procedimientos: 0, liquidado: 0, faltantes: 0 });
  const [liquidacionId, setLiquidacionId] = useState<string | null>(null);
  const [showFaltantesManager, setShowFaltantesManager] = useState(false);
  
  // Mes y año actual por defecto
  const currentDate = new Date();
  const [mes, setMes] = useState<number>(currentDate.getMonth() + 1);
  const [anio, setAnio] = useState<number>(currentDate.getFullYear());
  const [periodoDetectado, setPeriodoDetectado] = useState<boolean>(false);
  const [valoresDisponibles, setValoresDisponibles] = useState<boolean>(true);
  const [checkingValores, setCheckingValores] = useState<boolean>(false);
  
  const { toast } = useToast();

  // Detectar mes/año automáticamente cuando se carga un archivo
  const detectarPeriodo = async (file: File) => {
    try {
      const processedRows = await processRawExcel(file);
      
      if (processedRows.length > 0) {
        // Analizar todas las fechas del archivo
        const fechas = processedRows
          .map(row => {
            const fechaStr = row.fecha;
            // Intentar parsear diferentes formatos de fecha
            let fecha: Date | null = null;
            
            if (fechaStr) {
              // Formato dd/mm/yyyy
              if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fechaStr)) {
                const [dia, mes, anio] = fechaStr.split('/').map(Number);
                fecha = new Date(anio, mes - 1, dia);
              }
              // Formato ISO
              else {
                fecha = new Date(fechaStr);
              }
            }
            
            return fecha;
          })
          .filter((f): f is Date => f !== null && !isNaN(f.getTime()));
        
        if (fechas.length > 0) {
          // Tomar la fecha más común o la primera
          const primeraFecha = fechas[0];
          const mesDetectado = primeraFecha.getMonth() + 1;
          const anioDetectado = primeraFecha.getFullYear();
          
          setMes(mesDetectado);
          setAnio(anioDetectado);
          setPeriodoDetectado(true);
          
          toast({
            title: 'Período detectado',
            description: `Se detectó el período: ${new Date(anioDetectado, mesDetectado - 1).toLocaleString('es-AR', { month: 'long' })} ${anioDetectado}`,
          });
        }
      }
    } catch (error) {
      console.error('Error detectando período:', error);
      // No mostrar error al usuario, simplemente no detectar
    }
  };

  const handleFileSelect = (file: File | null) => {
    setSheetFile(file);
    setPeriodoDetectado(false);
    if (file) {
      detectarPeriodo(file);
    }
  };

  // Verificar si hay valores para el mes/año seleccionado
  const verificarValoresDisponibles = async (mesParam: number, anioParam: number) => {
    setCheckingValores(true);
    try {
      const { data, error } = await supabase
        .from('valores_nomenclador')
        .select('id')
        .eq('mes', mesParam)
        .eq('anio', anioParam)
        .eq('obra_social', 'OSDE')
        .eq('modulo', 'instrumentadores')
        .limit(1);

      if (error) {
        console.error('Error checking valores:', error);
        setValoresDisponibles(true); // Asumir que hay para no bloquear
        return;
      }

      setValoresDisponibles(data && data.length > 0);
    } catch (error) {
      console.error('Error checking valores:', error);
      setValoresDisponibles(true); // Asumir que hay para no bloquear
    } finally {
      setCheckingValores(false);
    }
  };

  // Verificar valores cuando cambia el mes/año
  useEffect(() => {
    verificarValoresDisponibles(mes, anio);
  }, [mes, anio]);

  const handleReloadAfterResolve = async () => {
    // Recargar la liquidación después de resolver faltantes
    if (!sheetFile) return;
    
    try {
      const processedRows = await processRawExcel(sheetFile);
      const result = await processLiquidacion(processedRows, mes, anio, 'OSDE', 'instrumentadores');
      
      setDetalle(result.detalle);
      setResumen(result.resumen);
      setFaltantes(result.faltantes);
      setTotales(result.totales);
      setLiquidacionId(result.liquidacionId);
      
      toast({
        title: 'Liquidación actualizada',
        description: 'Los faltantes resueltos se han incorporado al nomenclador',
      });
    } catch (error) {
      console.error('Error reloading:', error);
    }
  };

  const handleProcess = async () => {
    if (!sheetFile) return;
    
    setProcessing(true);
    try {
      // 1. Procesar Excel crudo
      const processedRows = await processRawExcel(sheetFile);
      
      // 2. Procesar liquidación
      const result = await processLiquidacion(processedRows, mes, anio, 'OSDE', 'instrumentadores');
      
      // 3. Actualizar estado
      setDetalle(result.detalle);
      setResumen(result.resumen);
      setFaltantes(result.faltantes);
      setTotales(result.totales);
      setLiquidacionId(result.liquidacionId);
      setProcessed(true);
      
      toast({
        title: 'Procesamiento exitoso',
        description: `Se procesaron ${result.detalle.length} procedimientos. ${result.faltantes.length} códigos faltantes.`,
      });
    } catch (error) {
      console.error('Error processing:', error);
      toast({
        title: 'Error al procesar',
        description: error instanceof Error ? error.message : 'Error desconocido al procesar el archivo',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleExportXlsx = () => {
    try {
      const filename = `liquidacion-instrumentadores-${mes}-${anio}.xlsx`;
      exportLiquidacionCompleta(detalle, resumen, filename);
      toast({
        title: 'Exportación exitosa',
        description: `Archivo ${filename} descargado`,
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: 'Error',
        description: 'No se pudo exportar a Excel',
        variant: 'destructive',
      });
    }
  };

  const handleExportPdf = async () => {
    try {
      await exportPDFPorInstrumentador(detalle, mes, anio);
      toast({
        title: 'Exportación exitosa',
        description: 'PDFs individuales por instrumentador descargados',
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo exportar a PDF. Asegúrese de que jspdf y jspdf-autotable estén instalados.',
        variant: 'destructive',
      });
    }
  };

  const handleExportResumenPdf = async () => {
    try {
      await exportResumenToPDF(resumen);
      toast({
        title: 'Exportación exitosa',
        description: 'Resumen PDF descargado',
      });
    } catch (error) {
      console.error('Error exporting resumen to PDF:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo exportar el resumen a PDF',
        variant: 'destructive',
      });
    }
  };

  const handleDetalleUpdate = (index: number, field: keyof DetalleRow, value: any) => {
    const newDetalle = [...detalle];
    newDetalle[index] = {
      ...newDetalle[index],
      [field]: value,
    };
    
    // Si se editó el factor, recalcular el importe
    if (field === 'factor') {
      const row = newDetalle[index];
      let importeBase = row.valor * value;
      
      // Aplicar plus del 20% si corresponde
      if (row.plusHorario) {
        importeBase = importeBase * 1.20;
      }
      
      newDetalle[index].importe = importeBase;
    }
    
    setDetalle(newDetalle);
    
    // Recalcular resumen
    const nuevoResumen = calcularResumen(newDetalle);
    setResumen(nuevoResumen);
    
    // Recalcular totales
    const nuevosTotales = {
      procedimientos: newDetalle.length,
      liquidado: newDetalle.reduce((sum, d) => sum + d.importe, 0),
      faltantes: faltantes.length,
    };
    setTotales(nuevosTotales);
  };

  const calcularResumen = (detalleData: DetalleRow[]): ResumenRow[] => {
    const resumenMap = new Map<string, { cantidad: number; total: number }>();
    
    detalleData.forEach((row) => {
      const existing = resumenMap.get(row.instrumentador);
      if (existing) {
        existing.cantidad++;
        existing.total += row.importe;
      } else {
        resumenMap.set(row.instrumentador, {
          cantidad: 1,
          total: row.importe,
        });
      }
    });
    
    return Array.from(resumenMap.entries()).map(([instrumentador, data]) => ({
      instrumentador,
      cantidad: data.cantidad,
      total: data.total,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header con estética Grow Labs */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  className="glass-effect-dark border-green-500/30 hover:bg-green-500/20 hover:border-green-400 text-white"
                >
                  <ArrowLeft className="h-5 w-5 text-green-400" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Liquidaciones
                </h1>
                <p className="text-gray-400 text-sm mt-1">Procesamiento de procedimientos quirúrgicos</p>
              </div>
            </div>
            <Link href="/admin/nomenclador">
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50 border-0"
              >
                <Settings className="h-4 w-4 mr-2" />
                Nomenclador
              </Button>
            </Link>
          </div>

        <div className="space-y-6">
          <FileDrop onFileSelect={handleFileSelect} selectedFile={sheetFile} />

          <Card className="glass-effect border-green-500/30 glow-green p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mes">Mes</Label>
                <Select value={mes.toString()} onValueChange={(value) => { setMes(parseInt(value)); setPeriodoDetectado(false); }}>
                  <SelectTrigger id="mes">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {new Date(2000, m - 1).toLocaleString('es-AR', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="anio">Año</Label>
                <Select value={anio.toString()} onValueChange={(value) => { setAnio(parseInt(value)); setPeriodoDetectado(false); }}>
                  <SelectTrigger id="anio">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {periodoDetectado && (
              <div className="mt-3 text-sm text-green-600 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Período detectado automáticamente desde el archivo
              </div>
            )}
            {!checkingValores && !valoresDisponibles && (
              <Alert className="mt-3" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>No hay valores configurados para {new Date(anio, mes - 1).toLocaleString('es-AR', { month: 'long' })} {anio}</strong>
                  <br />
                  Debe ir a <Link href="/admin/nomenclador" className="underline font-semibold">Nomenclador → Valores</Link> y crear/copiar los valores antes de procesar liquidaciones de este período.
                </AlertDescription>
              </Alert>
            )}
          </Card>

          <Button
            onClick={handleProcess}
            disabled={!sheetFile || processing || !valoresDisponibles}
            className="w-full"
            size="lg"
          >
            {processing ? 'Procesando...' : !valoresDisponibles ? 'Configure valores en el Nomenclador primero' : 'Procesar'}
          </Button>
          
          {!valoresDisponibles && sheetFile && (
            <div className="text-sm text-center text-slate-600">
              💡 Tip: Puede usar "Copiar desde mes anterior" en el Nomenclador para ahorrar tiempo
            </div>
          )}

          {processed && (
            <>
              <Kpis
                totalProcedimientos={totales.procedimientos}
                totalLiquidado={totales.liquidado}
                codigosFaltantes={totales.faltantes}
              />

              <Card>
                <Tabs defaultValue="detalle" className="w-full">
                  <div className="border-b px-6 pt-6">
                    <TabsList className="w-full justify-start">
                      <TabsTrigger value="detalle">Detalle</TabsTrigger>
                      <TabsTrigger value="resumen">Resumen por Instrumentador</TabsTrigger>
                      <TabsTrigger value="faltantes">Faltantes</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="detalle" className="p-6">
                    <Alert className="mb-4">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Regla:</strong> Primer procedimiento 100%, restantes 50%
                      </AlertDescription>
                    </Alert>
                    <DetalleTable data={detalle} onUpdate={handleDetalleUpdate} />
                  </TabsContent>

                  <TabsContent value="resumen" className="p-6">
                    <ResumenTable data={resumen} />
                  </TabsContent>

                  <TabsContent value="faltantes" className="p-6">
                    {faltantes.length > 0 ? (
                      <>
                        <Alert className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Se encontraron {faltantes.length} códigos faltantes. Estos códigos no tienen complejidad/valor asignado en el nomenclador.
                          </AlertDescription>
                        </Alert>
                        <div className="mb-4">
                          <Button onClick={() => setShowFaltantesManager(true)}>
                            Gestionar Faltantes
                          </Button>
                        </div>
                        <FaltantesTable data={faltantes} />
                      </>
                    ) : (
                      <div className="text-center py-8 text-slate-600">
                        No hay códigos faltantes. Todos los procedimientos fueron liquidados correctamente.
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </Card>

              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Button onClick={handleExportXlsx} variant="outline" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Descargar Excel Completo
                  </Button>
                  <Button onClick={handleExportPdf} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    PDF por Instrumentador
                  </Button>
                </div>
                <Button onClick={handleExportResumenPdf} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Resumen PDF
                </Button>
              </div>
            </>
          )}
        </div>

          <FaltantesManager
            open={showFaltantesManager}
            onClose={() => setShowFaltantesManager(false)}
            faltantes={faltantes}
            mes={mes}
            anio={anio}
            onResolve={handleReloadAfterResolve}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
