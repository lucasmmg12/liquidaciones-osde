'use client';

import { useRef, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface FileDropProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export function FileDrop({ onFileSelect, selectedFile }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.xlsx')) {
      onFileSelect(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargar Archivo Crudo (Foja Quirúrgica)</CardTitle>
        <CardDescription>
          Cargue el archivo Excel crudo de Sheet1 (Salus). El sistema detectará automáticamente la fila de cabecera buscando "Fecha de visita".
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors"
        >
          <Upload className="h-8 w-8 text-slate-400 mb-2" />
          <span className="text-sm text-slate-600">
            {selectedFile ? selectedFile.name : 'Haga clic o arrastre un archivo .xlsx aquí'}
          </span>
        </label>
        {selectedFile && (
          <Button
            onClick={() => inputRef.current?.click()}
            variant="outline"
            className="w-full mt-3"
          >
            Cambiar archivo
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
