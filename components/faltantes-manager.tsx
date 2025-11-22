'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FaltanteRow } from '@/lib/types';
import { resolverFaltante } from '@/lib/liquidacion-service';
import { useToast } from '@/hooks/use-toast';
import { formatARS } from '@/lib/formatters';
import { AlertCircle, Check } from 'lucide-react';

interface FaltantesManagerProps {
  open: boolean;
  onClose: () => void;
  faltantes: FaltanteRow[];
  mes: number;
  anio: number;
  onResolve: () => void;
}

export function FaltantesManager({ 
  open, 
  onClose, 
  faltantes, 
  mes, 
  anio,
  onResolve 
}: FaltantesManagerProps) {
  const [editing, setEditing] = useState<{ 
    [key: string]: { 
      complejidad: string; 
      valor: string;
      procedimiento: string;
    } 
  }>({});
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEdit = (codigo: string, procedimiento: string) => {
    setEditing({
      ...editing,
      [codigo]: {
        complejidad: editing[codigo]?.complejidad || '',
        valor: editing[codigo]?.valor || '',
        procedimiento: editing[codigo]?.procedimiento || procedimiento
      }
    });
  };

  const handleSave = async (codigo: string) => {
    const edit = editing[codigo];
    if (!edit) return;

    const complejidad = edit.complejidad.trim();
    const valorStr = edit.valor.trim().replace(/[^\d.,]/g, '').replace(',', '.');
    const valor = parseFloat(valorStr);

    if (!complejidad) {
      toast({
        title: 'Error',
        description: 'Debe ingresar una complejidad',
        variant: 'destructive',
      });
      return;
    }

    if (isNaN(valor) || valor <= 0) {
      toast({
        title: 'Error',
        description: 'Debe ingresar un valor válido mayor a 0',
        variant: 'destructive',
      });
      return;
    }

    setSaving(codigo);
    try {
      await resolverFaltante(
        codigo,
        edit.procedimiento,
        complejidad,
        mes,
        anio,
        valor
      );

      toast({
        title: 'Faltante resuelto',
        description: `Se asignó complejidad "${complejidad}" y valor ${formatARS(valor)} al código ${codigo}`,
      });

      // Limpiar edición
      const newEditing = { ...editing };
      delete newEditing[codigo];
      setEditing(newEditing);

      // Notificar al padre para recargar
      onResolve();
    } catch (error) {
      console.error('Error resolving faltante:', error);
      toast({
        title: 'Error',
        description: 'No se pudo resolver el faltante',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  };

  const handleCancel = (codigo: string) => {
    const newEditing = { ...editing };
    delete newEditing[codigo];
    setEditing(newEditing);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Faltantes</DialogTitle>
        </DialogHeader>

        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Asigne complejidad y valor a los códigos faltantes. Estos datos se guardarán en el nomenclador 
            para que no vuelvan a aparecer como faltantes en próximas liquidaciones.
          </AlertDescription>
        </Alert>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Procedimiento</TableHead>
                <TableHead>Ocurrencias</TableHead>
                <TableHead>Complejidad</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faltantes.map((faltante) => {
                const isEditing = editing[faltante.codigo];
                const isSaving = saving === faltante.codigo;

                return (
                  <TableRow key={faltante.codigo}>
                    <TableCell className="font-mono">{faltante.codigo}</TableCell>
                    <TableCell>{faltante.procedimiento}</TableCell>
                    <TableCell>{faltante.ocurrencias}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={isEditing.complejidad}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              [faltante.codigo]: {
                                ...isEditing,
                                complejidad: e.target.value
                              }
                            })
                          }
                          placeholder="Ej: Laparoscópica"
                          className="w-32"
                        />
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={isEditing.valor}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              [faltante.codigo]: {
                                ...isEditing,
                                valor: e.target.value
                              }
                            })
                          }
                          placeholder="0.00"
                          type="text"
                          className="w-32"
                        />
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSave(faltante.codigo)}
                            disabled={isSaving}
                          >
                            {isSaving ? 'Guardando...' : <Check className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(faltante.codigo)}
                            disabled={isSaving}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(faltante.codigo, faltante.procedimiento)}
                        >
                          Editar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

