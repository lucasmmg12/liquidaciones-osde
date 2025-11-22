'use client';

import { useState, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatARS } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface PreviewRow {
  codigo: string;
  procedimiento: string;
  complejidad: string | null;
  valor: number;
}

export function ImportModal({ open, onClose, onImportComplete }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [error, setError] = useState<string>('');
  const [importing, setImporting] = useState(false);
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
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (jsonData.length === 0) {
        setError('El archivo está vacío');
        return;
      }

      const requiredColumns = ['codigo', 'procedimiento', 'valor'];
      const firstRow = jsonData[0];
      const hasRequiredColumns = requiredColumns.every((col) => col in firstRow);

      if (!hasRequiredColumns) {
        setError('El archivo debe contener las columnas: codigo, procedimiento, complejidad, valor');
        return;
      }

      const previewData: PreviewRow[] = jsonData.slice(0, 10).map((row: any) => ({
        codigo: String(row.codigo || '').trim().toUpperCase(),
        procedimiento: String(row.procedimiento || '').trim(),
        complejidad: row.complejidad ? String(row.complejidad).trim() : null,
        valor: parseFloat(row.valor) || 0,
      }));

      setPreview(previewData);
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Error al leer el archivo. Verifique que sea un archivo Excel válido.');
    }
  };

  const handleImport = async () => {
    if (!file || preview.length === 0) return;

    setImporting(true);
    try {
      const XLSX = await import('xlsx');
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      const importData = jsonData.map((row: any) => ({
        codigo: String(row.codigo || '').trim().toUpperCase(),
        procedimiento: String(row.procedimiento || '').trim(),
        complejidad: row.complejidad ? String(row.complejidad).trim() : null,
        valor: parseFloat(row.valor) || 0,
        activo: true,
        updated_at: new Date().toISOString(),
      }));

      for (const item of importData) {
        const { data: existing } = await supabase
          .from('nomenclador_instrumentadores')
          .select('id, valor')
          .eq('codigo', item.codigo)
          .maybeSingle();

        if (existing) {
          if (existing.valor !== item.valor) {
            await supabase.from('nomenclador_versiones').insert({
              codigo: item.codigo,
              valor_anterior: existing.valor,
              valor_nuevo: item.valor,
              usuario: 'admin',
              motivo: 'Importación desde Excel',
            });
          }

          await supabase
            .from('nomenclador_instrumentadores')
            .update({
              procedimiento: item.procedimiento,
              complejidad: item.complejidad,
              valor: item.valor,
              updated_at: item.updated_at,
            })
            .eq('id', existing.id);
        } else {
          await supabase.from('nomenclador_instrumentadores').insert(item);
        }
      }

      toast({
        title: 'Importación exitosa',
        description: `Se importaron ${importData.length} registros`,
      });

      onImportComplete();
      handleClose();
    } catch (err) {
      console.error('Error importing:', err);
      toast({
        title: 'Error',
        description: 'No se pudo completar la importación',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar desde Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              El archivo Excel debe contener las columnas: <strong>codigo</strong>,{' '}
              <strong>procedimiento</strong>, <strong>complejidad</strong>, <strong>valor</strong>
            </AlertDescription>
          </Alert>

          <div>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-upload"
            />
            <label
              htmlFor="excel-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors"
            >
              <Upload className="h-8 w-8 text-slate-400 mb-2" />
              <span className="text-sm text-slate-600">
                {file ? file.name : 'Seleccione un archivo Excel'}
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
                    {preview.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.codigo}</TableCell>
                        <TableCell>{row.procedimiento}</TableCell>
                        <TableCell>{row.complejidad || '-'}</TableCell>
                        <TableCell>{formatARS(row.valor)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={importing}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={preview.length === 0 || importing}>
            {importing ? 'Importando...' : 'Confirmar Importación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
