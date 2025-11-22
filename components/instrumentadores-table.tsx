'use client';

import { useState } from 'react';
import { Instrumentador } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Save, X, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface InstrumentadoresTableProps {
  data: Instrumentador[];
  onUpdate: (instrumentador: Instrumentador) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function InstrumentadoresTable({ data, onUpdate, onDelete }: InstrumentadoresTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<Instrumentador>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleEdit = (instrumentador: Instrumentador) => {
    setEditingId(instrumentador.id);
    setEditedData(instrumentador);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleSave = async (instrumentador: Instrumentador) => {
    setLoading(instrumentador.id);
    try {
      await onUpdate({
        ...instrumentador,
        ...editedData
      });
      setEditingId(null);
      setEditedData({});
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    
    setLoading(deleteConfirmId);
    try {
      await onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleFieldChange = (field: keyof Instrumentador, value: any) => {
    setEditedData({
      ...editedData,
      [field]: value
    });
  };

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Nombre</TableHead>
              <TableHead className="w-[150px]">Mat. Provincial</TableHead>
              <TableHead className="w-[150px]">CUIT</TableHead>
              <TableHead className="w-[150px]">Especialidad</TableHead>
              <TableHead className="w-[150px]">Grupo Personal</TableHead>
              <TableHead className="w-[150px]">Perfil</TableHead>
              <TableHead className="w-[80px]">Activo</TableHead>
              <TableHead className="w-[120px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                  No hay instrumentadores registrados
                </TableCell>
              </TableRow>
            ) : (
              data.map((instrumentador) => {
                const isEditing = editingId === instrumentador.id;
                const isLoading = loading === instrumentador.id;

                return (
                  <TableRow key={instrumentador.id}>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editedData.nombre ?? instrumentador.nombre}
                          onChange={(e) => handleFieldChange('nombre', e.target.value)}
                          className="h-8"
                        />
                      ) : (
                        <span className="font-medium">{instrumentador.nombre}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editedData.matricula_provincial ?? instrumentador.matricula_provincial ?? ''}
                          onChange={(e) => handleFieldChange('matricula_provincial', e.target.value || null)}
                          className="h-8"
                        />
                      ) : (
                        instrumentador.matricula_provincial || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editedData.cuit ?? instrumentador.cuit ?? ''}
                          onChange={(e) => handleFieldChange('cuit', e.target.value || null)}
                          className="h-8"
                        />
                      ) : (
                        instrumentador.cuit || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editedData.especialidad ?? instrumentador.especialidad ?? ''}
                          onChange={(e) => handleFieldChange('especialidad', e.target.value || null)}
                          className="h-8"
                        />
                      ) : (
                        instrumentador.especialidad || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editedData.grupo_personal ?? instrumentador.grupo_personal ?? ''}
                          onChange={(e) => handleFieldChange('grupo_personal', e.target.value || null)}
                          className="h-8"
                        />
                      ) : (
                        instrumentador.grupo_personal || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editedData.perfil ?? instrumentador.perfil ?? ''}
                          onChange={(e) => handleFieldChange('perfil', e.target.value || null)}
                          className="h-8"
                        />
                      ) : (
                        instrumentador.perfil || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Checkbox
                          checked={editedData.activo ?? instrumentador.activo}
                          onCheckedChange={(checked) => handleFieldChange('activo', checked)}
                        />
                      ) : (
                        <span className={instrumentador.activo ? 'text-green-600' : 'text-red-600'}>
                          {instrumentador.activo ? 'Sí' : 'No'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSave(instrumentador)}
                              disabled={isLoading}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              disabled={isLoading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(instrumentador)}
                              disabled={isLoading}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteConfirmId(instrumentador.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará el instrumentador. Puede reactivarlo más tarde si es necesario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Desactivar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

