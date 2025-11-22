'use client';

import { useState } from 'react';
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
  
  const { toast } = useToast();

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
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar el archivo';
      
      // Mostrar error más detallado en consola para debug
      console.error('Detalles del error:', {
        error,
        fileName: sheetFile?.name,
        fileSize: sheetFile?.size,
        mes,
        anio
      });
      
      toast({
        title: 'Error al procesar',
        description: errorMessage,
        variant: 'destructive',
        duration: 10000, // Mostrar por más tiempo para que el usuario pueda leerlo
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Instrumentadores</h1>
          </div>
          <Link href="/admin/nomenclador">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Nomenclador
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <FileDrop onFileSelect={setSheetFile} selectedFile={sheetFile} />

          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mes">Mes</Label>
                <Select value={mes.toString()} onValueChange={(value) => setMes(parseInt(value))}>
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
                <Select value={anio.toString()} onValueChange={(value) => setAnio(parseInt(value))}>
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
          </Card>

          <Button
            onClick={handleProcess}
            disabled={!sheetFile || processing}
            className="w-full"
            size="lg"
          >
            {processing ? 'Procesando...' : 'Procesar'}
          </Button>

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
                    <DetalleTable data={detalle} />
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
  );
}
