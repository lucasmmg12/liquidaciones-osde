'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { InstrumentadoresTable } from '@/components/instrumentadores-table';
import { Instrumentador } from '@/lib/types';
import {
  getAllInstrumentadores,
  createInstrumentador,
  updateInstrumentador,
  deleteInstrumentador,
} from '@/lib/instrumentadores-service';
import { useToast } from '@/hooks/use-toast';

export default function InstrumentadoresAdminPage() {
  const [instrumentadores, setInstrumentadores] = useState<Instrumentador[]>([]);
  const [filteredInstrumentadores, setFilteredInstrumentadores] = useState<Instrumentador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newInstrumentador, setNewInstrumentador] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    activo: true,
  });

  const { toast } = useToast();

  useEffect(() => {
    loadInstrumentadores();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredInstrumentadores(instrumentadores);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = instrumentadores.filter(
        (i) =>
          i.nombre.toLowerCase().includes(term) ||
          i.apellido.toLowerCase().includes(term) ||
          (i.email && i.email.toLowerCase().includes(term))
      );
      setFilteredInstrumentadores(filtered);
    }
  }, [searchTerm, instrumentadores]);

  const loadInstrumentadores = async () => {
    setLoading(true);
    try {
      const data = await getAllInstrumentadores();
      setInstrumentadores(data);
      setFilteredInstrumentadores(data);
    } catch (error) {
      console.error('Error loading instrumentadores:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los instrumentadores',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newInstrumentador.nombre.trim() || !newInstrumentador.apellido.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre y apellido son obligatorios',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createInstrumentador({
        nombre: newInstrumentador.nombre.trim(),
        apellido: newInstrumentador.apellido.trim(),
        email: newInstrumentador.email.trim() || null,
        telefono: newInstrumentador.telefono.trim() || null,
        matricula_provincial: null,
        cuit: null,
        especialidad: null,
        grupo_personal: null,
        perfil: null,
        activo: newInstrumentador.activo,
      });

      toast({
        title: 'Éxito',
        description: 'Instrumentador creado correctamente',
      });

      setShowNewDialog(false);
      setNewInstrumentador({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        activo: true,
      });
      loadInstrumentadores();
    } catch (error) {
      console.error('Error creating instrumentador:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo crear el instrumentador',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (instrumentador: Instrumentador) => {
    try {
      await updateInstrumentador(instrumentador.id, instrumentador);
      toast({
        title: 'Éxito',
        description: 'Instrumentador actualizado correctamente',
      });
      loadInstrumentadores();
    } catch (error) {
      console.error('Error updating instrumentador:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar el instrumentador',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInstrumentador(id);
      toast({
        title: 'Éxito',
        description: 'Instrumentador eliminado correctamente',
      });
      loadInstrumentadores();
    } catch (error) {
      console.error('Error deleting instrumentador:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el instrumentador',
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
            <h1 className="text-3xl font-bold text-slate-900">Gestión de Instrumentadores</h1>
          </div>
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Instrumentador
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Instrumentador</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={newInstrumentador.nombre}
                    onChange={(e) =>
                      setNewInstrumentador({ ...newInstrumentador, nombre: e.target.value })
                    }
                    placeholder="Ej: Juan"
                  />
                </div>
                <div>
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    value={newInstrumentador.apellido}
                    onChange={(e) =>
                      setNewInstrumentador({ ...newInstrumentador, apellido: e.target.value })
                    }
                    placeholder="Ej: Pérez"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newInstrumentador.email}
                    onChange={(e) =>
                      setNewInstrumentador({ ...newInstrumentador, email: e.target.value })
                    }
                    placeholder="Ej: juan.perez@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={newInstrumentador.telefono}
                    onChange={(e) =>
                      setNewInstrumentador({ ...newInstrumentador, telefono: e.target.value })
                    }
                    placeholder="Ej: +54 9 11 1234-5678"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate}>Crear</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Instrumentadores ({filteredInstrumentadores.length})</span>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-600">Cargando instrumentadores...</div>
            ) : (
              <InstrumentadoresTable
                data={filteredInstrumentadores}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
