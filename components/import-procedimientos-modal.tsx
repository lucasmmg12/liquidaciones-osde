'use client';

import { useState, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { formatARS } from '@/lib/formatters';

interface ImportProcedimientosModalProps {
  open: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface PreviewRow {
  codigo: string;
  procedimiento: string;
  complejidad: string | null;
  valor: number | null;
}

export function ImportProcedimientosModal({ open, onClose, onImportComplete }: ImportProcedimientosModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [error, setError] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<string>('');

  // Mes y año para los valores
  const currentDate = new Date();
  const [mes, setMes] = useState<number>(currentDate.getMonth() + 1);
  const [anio, setAnio] = useState<number>(currentDate.getFullYear());

  const { toast } = useToast();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {

    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');

    try {
      const XLSX = await import('xlsx');
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Buscar la hoja "nomenclador" (case-insensitive)
      const sheetName = workbook.SheetNames.find((name: string) =>
        name.toLowerCase().includes('nomenclador')
      ) || workbook.SheetNames[0];

      if (!sheetName) {
        setError('No se encontró ninguna hoja en el archivo');
        return;
      }

      console.log(`Leyendo hoja: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (jsonData.length === 0) {
        setError('La hoja está vacía');
        return;
      }

      console.log('Primera fila del nomenclador:', jsonData[0]);

      // Limpiar TODAS las claves de la primera fila (remover espacios ocultos)
      const cleanKeys = Object.keys(jsonData[0]).map(k => ({
        original: k,
        clean: k.trim().toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      }));

      console.log('Columnas limpias detectadas:', cleanKeys.map(k => k.clean));

      // Buscar columnas usando las claves limpias
      const codigoKeyObj = cleanKeys.find(k => k.clean.includes('codigo'));
      const procKeyObj = cleanKeys.find(k => k.clean.includes('procedimiento') || k.clean.includes('descripcion'));
      const complKeyObj = cleanKeys.find(k => k.clean.includes('complejidad'));
      const valorKeyObj = cleanKeys.find(k =>
        k.clean.includes('valor') && !k.clean.includes('anterior') && !k.clean.includes('nuevo')
      );

      if (!codigoKeyObj) {
        setError('No se encontró una columna "Código" o "Codigo" en la hoja nomenclador. Verifique espacios o acentos en el encabezado.');
        return;
      }

      const codigoKey = codigoKeyObj.original;
      const procKey = procKeyObj?.original;
      const complKey = complKeyObj?.original;
      const valorKey = valorKeyObj?.original;

      console.log('Mapeo de columnas final:', { codigoKey, procKey, complKey, valorKey });

      // Preparar preview
      const previewData: PreviewRow[] = jsonData.slice(0, 10).map((row: any) => {
        const codigo = String(row[codigoKey] || '').trim().toUpperCase();
        const procedimiento = procKey ? String(row[procKey] || '').trim() : '';

        let complejidad: string | null = null;
        if (complKey && row[complKey] !== undefined && row[complKey] !== null) {
          const complValue = String(row[complKey]).trim();
          if (complValue !== '' && complValue !== 'null' && complValue !== 'undefined') {
            complejidad = complValue;
          }
        }

        let valor: number | null = null;
        if (valorKey && row[valorKey] !== undefined && row[valorKey] !== null) {
          if (typeof row[valorKey] === 'number') {
            valor = row[valorKey];
          } else {
            const valorStr = String(row[valorKey]).trim();
            if (valorStr !== '' && valorStr !== 'null' && valorStr !== 'undefined') {
              const cleaned = valorStr.replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.');
              const valorNum = parseFloat(cleaned);
              if (!isNaN(valorNum) && valorNum >= 0) {
                valor = valorNum;
              }
            }
          }
        }

        return { codigo, procedimiento, complejidad, valor };
      }).filter(p => p.codigo);

      if (previewData.length === 0) {
        setError('No se encontraron códigos válidos. Asegúrese de que la columna de códigos no esté vacía.');
        return;
      }

      setPreview(previewData);
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Error al leer el archivo. Verifique que sea un archivo Excel válido.');
    }
  };

  const handleImport = async () => {
    if (!file || preview.length === 0) return;

    setImporting(true);
    setError('');
    setImportProgress('Iniciando importación...');
    try {
      const XLSX = await import('xlsx');
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      const sheetName = workbook.SheetNames.find((name: string) =>
        name.toLowerCase().includes('nomenclador')
      ) || workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      // Identificar columnas de nuevo para el proceso completo (clones de lógica de limpieza)
      const firstRow = jsonData[0];
      const allKeys = Object.keys(firstRow);

      const findKey = (pattern: string) => allKeys.find(k =>
        k.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(pattern)
      );

      const codigoKey = findKey('codigo')!;
      const procKey = findKey('procedimiento') || findKey('descripcion');
      const complKey = findKey('complejidad');
      const valorKey = allKeys.find(k => {
        const cleanK = k.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return cleanK.includes('valor') && !cleanK.includes('anterior') && !cleanK.includes('nuevo');
      });

      const importData = jsonData.map((row: any) => {
        const codigo = String(row[codigoKey] || '').trim().toUpperCase();
        const procedimiento = procKey ? String(row[procKey] || '').trim() : codigo;

        let complejidad: string | null = null;
        if (complKey && row[complKey] !== undefined && row[complKey] !== null) {
          const complValue = String(row[complKey]).trim();
          if (complValue !== '' && complValue !== 'null' && complValue !== 'undefined') {
            complejidad = complValue;
          }
        }

        let valor: number | null = null;
        if (valorKey && row[valorKey] !== undefined && row[valorKey] !== null) {
          if (typeof row[valorKey] === 'number') {
            valor = row[valorKey];
          } else {
            const valorStr = String(row[valorKey]).trim();
            if (valorStr !== '' && valorStr !== 'null' && valorStr !== 'undefined') {
              const cleaned = valorStr.replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.');
              const valorNum = parseFloat(cleaned);
              if (!isNaN(valorNum) && valorNum >= 0) {
                valor = valorNum;
              }
            }
          }
        }

        return { codigo, procedimiento, complejidad, valor };
      }).filter(item => item.codigo);

      setImportProgress('Preparando datos...');

      // Preparar datos para inserción en batch
      const procedimientosToInsert: any[] = [];
      const procedimientosToUpdate: any[] = [];
      const valoresMap = new Map<string, number>(); // complejidad -> valor

      // Primero, obtener todos los procedimientos existentes de una vez
      setImportProgress('Cargando procedimientos existentes...');
      const { data: existingProcedimientos, error: loadError } = await supabase
        .from('procedimientos')
        .select('codigo, id');

      if (loadError) {
        throw new Error(`Error al cargar procedimientos existentes: ${loadError.message}`);
      }

      const existingCodes = new Set(
        (existingProcedimientos || []).map((p: any) => String(p.codigo).toUpperCase().trim())
      );

      // Separar en insertar y actualizar
      for (const item of importData) {
        const codigoNormalizado = item.codigo.toUpperCase().trim();

        if (existingCodes.has(codigoNormalizado)) {
          // Actualizar existente
          const existing = existingProcedimientos?.find(
            (p: any) => String(p.codigo).toUpperCase().trim() === codigoNormalizado
          );
          if (existing) {
            procedimientosToUpdate.push({
              id: existing.id,
              codigo: item.codigo,
              procedimiento: item.procedimiento || item.codigo,
              complejidad: item.complejidad || null,
              activo: true,
              updated_at: new Date().toISOString()
            });
          }
        } else {
          // Insertar nuevo
          procedimientosToInsert.push({
            codigo: item.codigo,
            procedimiento: item.procedimiento || item.codigo,
            complejidad: item.complejidad || null,
            activo: true
          });
        }

        // Agregar valor al mapa (si hay complejidad y valor)
        if (item.complejidad !== null && item.valor !== null && item.valor > 0) {
          const complejidadKey = item.complejidad || 'SIN_COMPLEJIDAD';
          // Si ya existe, usar el mayor valor (o el último, según prefieras)
          valoresMap.set(complejidadKey, item.valor);
        }
      }

      // Insertar procedimientos en batch
      let successCount = 0;
      let updateCount = 0;
      let errorCount = 0;

      if (procedimientosToInsert.length > 0) {
        setImportProgress(`Insertando ${procedimientosToInsert.length} procedimientos nuevos...`);
        // Insertar en lotes de 100
        const batchSize = 100;
        for (let i = 0; i < procedimientosToInsert.length; i += batchSize) {
          const batch = procedimientosToInsert.slice(i, i + batchSize);
          setImportProgress(`Insertando procedimientos ${i + 1}-${Math.min(i + batchSize, procedimientosToInsert.length)} de ${procedimientosToInsert.length}...`);

          const { error } = await supabase
            .from('procedimientos')
            .insert(batch);

          if (error) {
            // Si hay error de duplicados (23505), intentar actualizar individualmente
            if (error.code === '23505') {
              console.log(`Batch tiene duplicados, procesando individualmente...`);
              for (const item of batch) {
                // Buscar si existe
                const { data: existing } = await supabase
                  .from('procedimientos')
                  .select('id')
                  .eq('codigo', item.codigo)
                  .single();

                if (existing) {
                  // Actualizar
                  const { error: updateError } = await supabase
                    .from('procedimientos')
                    .update({
                      procedimiento: item.procedimiento,
                      complejidad: item.complejidad,
                      activo: item.activo,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id);

                  if (updateError) {
                    console.error(`Error actualizando ${item.codigo}:`, updateError);
                    errorCount++;
                  } else {
                    updateCount++;
                  }
                } else {
                  // Intentar insertar de nuevo
                  const { error: insertError } = await supabase
                    .from('procedimientos')
                    .insert([item]);

                  if (insertError) {
                    console.error(`Error insertando ${item.codigo}:`, insertError);
                    errorCount++;
                  } else {
                    successCount++;
                  }
                }
              }
            } else {
              console.error(`Error inserting batch ${i}-${Math.min(i + batchSize, procedimientosToInsert.length)}:`, error);
              errorCount += batch.length;
            }
          } else {
            successCount += batch.length;
          }
        }
      }

      // Actualizar procedimientos existentes
      if (procedimientosToUpdate.length > 0) {
        setImportProgress(`Actualizando ${procedimientosToUpdate.length} procedimientos existentes...`);
        for (let i = 0; i < procedimientosToUpdate.length; i++) {
          const item = procedimientosToUpdate[i];
          setImportProgress(`Actualizando procedimiento ${i + 1} de ${procedimientosToUpdate.length}...`);

          const { error } = await supabase
            .from('procedimientos')
            .update({
              procedimiento: item.procedimiento,
              complejidad: item.complejidad,
              activo: item.activo,
              updated_at: item.updated_at
            })
            .eq('id', item.id);

          if (error) {
            console.error('Error updating procedimiento:', item.codigo, error);
            errorCount++;
          } else {
            updateCount++;
          }
        }
      }

      // Insertar/actualizar valores en batch
      let valoresCount = 0;

      setImportProgress('Procesando valores...');
      // Obtener valores existentes para el mes/año seleccionado
      const { data: existingValores, error: valoresLoadError } = await supabase
        .from('valores_nomenclador')
        .select('complejidad, id, valor')
        .eq('mes', mes)
        .eq('anio', anio)
        .eq('obra_social', 'OSDE')
        .eq('modulo', 'instrumentadores');

      if (valoresLoadError) {
        console.error('Error loading valores existentes:', valoresLoadError);
        // Continuar de todas formas, puede que no existan valores aún
      }

      const valoresToInsert: any[] = [];
      const valoresToUpdate: any[] = [];

      // Convertir Map a Array para evitar problemas de iteración
      const valoresArray = Array.from(valoresMap.entries());
      for (const [complejidad, valor] of valoresArray) {
        const existing = existingValores?.find((v: any) => v.complejidad === complejidad);

        if (existing) {
          valoresToUpdate.push({
            id: existing.id,
            valor: valor,
            updated_at: new Date().toISOString()
          });
        } else {
          valoresToInsert.push({
            complejidad: complejidad,
            mes: mes,
            anio: anio,
            obra_social: 'OSDE',
            modulo: 'instrumentadores',
            valor: valor
          });
        }
      }

      // Insertar valores nuevos
      if (valoresToInsert.length > 0) {
        setImportProgress(`Insertando ${valoresToInsert.length} valores...`);
        const { error } = await supabase
          .from('valores_nomenclador')
          .insert(valoresToInsert);

        if (error) {
          console.error('Error inserting valores:', error);
          console.error('Detalles:', { valoresToInsert, error });
        } else {
          valoresCount += valoresToInsert.length;
        }
      }

      // Actualizar valores existentes
      if (valoresToUpdate.length > 0) {
        setImportProgress(`Actualizando ${valoresToUpdate.length} valores...`);
        for (const item of valoresToUpdate) {
          const { error } = await supabase
            .from('valores_nomenclador')
            .update({
              valor: item.valor,
              updated_at: item.updated_at
            })
            .eq('id', item.id);

          if (error) {
            console.error('Error updating valor:', item, error);
          } else {
            valoresCount++;
          }
        }
      }

      setImportProgress('Finalizando...');

      console.log('Resumen de importación:', {
        totalItems: importData.length,
        successCount,
        updateCount,
        valoresCount,
        errorCount,
        mes,
        anio
      });

      const totalProcesados = successCount + updateCount;
      const mensaje = [
        successCount > 0 ? `${successCount} nuevos` : '',
        updateCount > 0 ? `${updateCount} actualizados` : '',
        valoresCount > 0 ? `${valoresCount} valores para ${mes}/${anio}` : ''
      ].filter(Boolean).join(', ');

      toast({
        title: 'Importación completada',
        description: `${mensaje}.${errorCount > 0 ? ` ${errorCount} errores.` : ''}`,
      });

      // Pequeño delay para asegurar que los datos se hayan guardado en la BD
      await new Promise(resolve => setTimeout(resolve, 500));

      // Recargar datos
      onImportComplete();
      handleClose();
    } catch (err: any) {
      console.error('Error importing:', err);
      const errorMessage = err?.message || 'Error desconocido al importar';
      setError(errorMessage);
      setImportProgress('');
      toast({
        title: 'Error',
        description: `No se pudo completar la importación: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
      setImportProgress('');
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setError('');
    setImportProgress('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Procedimientos desde Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>📋 Importación del Nomenclador</strong>
              <br />
              Esta importación se hace <strong>una sola vez</strong> al inicio. Seleccione el archivo Excel que contiene la hoja <strong>"nomenclador"</strong>.
              <br /><br />
              <strong>Columnas esperadas:</strong> código, procedimiento (opcional), complejidad (opcional), valor (opcional)
              <br /><br />
              <strong>⚠️ Importante:</strong> Los valores se asociarán al mes/año seleccionado abajo. Para meses siguientes, use "Copiar desde mes anterior" en la pestaña Valores.
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              Seleccione el período para esta importación:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mes-import">Mes</Label>
                <Select value={mes.toString()} onValueChange={(value: string) => setMes(parseInt(value))}>
                  <SelectTrigger id="mes-import">
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
                <Label htmlFor="anio-import">Año</Label>
                <Select value={anio.toString()} onValueChange={(value: string) => setAnio(parseInt(value))}>
                  <SelectTrigger id="anio-import">
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
            <p className="text-xs text-blue-700 mt-2">
              Los valores se guardarán para {new Date(anio, mes - 1).toLocaleString('es-AR', { month: 'long' })} {anio}
            </p>
          </div>

          <div>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-procedimientos-upload"
            />
            <label
              htmlFor="excel-procedimientos-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors"
            >
              <Upload className="h-8 w-8 text-slate-400 mb-2" />
              <span className="text-sm text-slate-600">
                {file ? file.name : 'Seleccione el archivo Excel con la hoja "nomenclador"'}
              </span>
            </label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {preview.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">
                Vista previa (primeras {preview.length} filas)
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Procedimiento</TableHead>
                      <TableHead>Complejidad</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row: PreviewRow, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono">{row.codigo}</TableCell>
                        <TableCell className="max-w-xs truncate">{row.procedimiento || '-'}</TableCell>
                        <TableCell>{row.complejidad || '-'}</TableCell>
                        <TableCell>{row.valor ? formatARS(row.valor) : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2">
          {importProgress && (
            <div className="w-full text-sm text-slate-600 mb-2">
              {importProgress}
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={importing}>
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={preview.length === 0 || importing}>
              {importing ? (importProgress || 'Importando...') : 'Confirmar Importación'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

