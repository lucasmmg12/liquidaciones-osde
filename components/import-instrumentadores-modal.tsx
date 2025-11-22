'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { processInstrumentadoresExcel } from '@/lib/instrumentadores-excel-processor';
import { importInstrumentadores } from '@/lib/instrumentadores-service';

interface ImportInstrumentadoresModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportInstrumentadoresModal({ open, onClose, onSuccess }: ImportInstrumentadoresModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      // Paso 1: Procesar el Excel
      const instrumentadores = await processInstrumentadoresExcel(file);
      
      if (instrumentadores.length === 0) {
        throw new Error('No se encontraron instrumentadores válidos en el archivo');
      }

      // Paso 2: Importar a la base de datos
      const importResult = await importInstrumentadores(instrumentadores);
      
      setResult(importResult);

      // Si todo fue exitoso, cerrar el modal después de un momento
      if (importResult.errors.length === 0) {
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Error importing:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al importar');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Instrumentadores desde Excel</DialogTitle>
          <DialogDescription>
            Suba un archivo Excel con los datos de los instrumentadores. El archivo debe contener las columnas:
            Nombre, Mat. Provincial, CUIT, Especialidad, Grupo Personal, Perfil, Activo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File selector */}
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={importing}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              {file ? (
                <>
                  <FileSpreadsheet className="h-12 w-12 text-green-500" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-slate-400" />
                  <p className="text-sm font-medium text-slate-700">
                    Haga clic para seleccionar un archivo Excel
                  </p>
                  <p className="text-xs text-slate-500">
                    o arrastre y suelte aquí
                  </p>
                </>
              )}
            </label>
          </div>

          {/* Loading indicator */}
          {importing && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm text-center text-slate-600 mt-3">
                Importando instrumentadores...
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success message */}
          {result && (
            <div className="space-y-3">
              <Alert className={result.errors.length > 0 ? 'border-yellow-500' : 'border-green-500'}>
                <CheckCircle className={`h-4 w-4 ${result.errors.length > 0 ? 'text-yellow-500' : 'text-green-500'}`} />
                <AlertDescription>
                  <strong>Importación completada:</strong>
                  <br />
                  ✓ {result.success} instrumentadores importados exitosamente
                  {result.errors.length > 0 && (
                    <>
                      <br />
                      ⚠ {result.errors.length} errores encontrados
                    </>
                  )}
                </AlertDescription>
              </Alert>

              {/* Error details */}
              {result.errors.length > 0 && (
                <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 max-h-48 overflow-y-auto">
                  <p className="text-sm font-medium text-yellow-800 mb-2">Errores:</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {result.errors.map((err, idx) => (
                      <li key={idx}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              📋 Formato del archivo Excel:
            </p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Nombre</strong>: Obligatorio - Nombre completo del instrumentador</li>
              <li>• <strong>Mat. Provincial</strong>: Opcional - Matrícula provincial</li>
              <li>• <strong>CUIT</strong>: Opcional - CUIT del instrumentador</li>
              <li>• <strong>Especialidad</strong>: Opcional - Especialidad</li>
              <li>• <strong>Grupo Personal</strong>: Opcional - Grupo de personal</li>
              <li>• <strong>Perfil</strong>: Opcional - Perfil del instrumentador</li>
              <li>• <strong>Activo</strong>: Opcional - Sí/No (por defecto: Sí)</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2 italic">
              Nota: Si un instrumentador ya existe (mismo nombre), se actualizará con los nuevos datos.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={importing}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!file || importing}>
            {importing ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

