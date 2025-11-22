'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Plus, Users, Search } from 'lucide-react';
import { Instrumentador } from '@/lib/types';
import {
  getAllInstrumentadores,
  createInstrumentador,
  updateInstrumentador,
  deleteInstrumentador
} from '@/lib/instrumentadores-service';
import { InstrumentadoresTable } from '@/components/instrumentadores-table';
import { ImportInstrumentadoresModal } from '@/components/import-instrumentadores-modal';
import { AddInstrumentadorForm } from '@/components/add-instrumentador-form';
import { useToast } from '@/hooks/use-toast';

export default function GestionInstrumentadoresPage() {
  const [instrumentadores, setInstrumentadores] = useState<Instrumentador[]>([]);
  const [filteredInstrumentadores, setFilteredInstrumentadores] = useState<Instrumentador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  
  const { toast } = useToast();

  // Cargar instrumentadores
  const loadInstrumentadores = async () => {
    setLoading(true);
    try {
      const data = await getAllInstrumentadores(incluirInactivos);
      setInstrumentadores(data);
      setFilteredInstrumentadores(data);
    } catch (error) {
      console.error('Error loading instrumentadores:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los instrumentadores',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar el componente
  useEffect(() => {
    loadInstrumentadores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incluirInactivos]);

  // Filtrar instrumentadores cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredInstrumentadores(instrumentadores);
    } else {
      const filtered = instrumentadores.filter(inst =>
        inst.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.matricula_provincial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.cuit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.especialidad?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInstrumentadores(filtered);
    }
  }, [searchTerm, instrumentadores]);

  // Manejar actualización de instrumentador
  const handleUpdate = async (instrumentador: Instrumentador) => {
    try {
      await updateInstrumentador(instrumentador.id, instrumentador);
      toast({
        title: 'Éxito',
        description: 'Instrumentador actualizado correctamente'
      });
      await loadInstrumentadores();
    } catch (error) {
      console.error('Error updating:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el instrumentador',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Manejar eliminación de instrumentador
  const handleDelete = async (id: string) => {
    try {
      await deleteInstrumentador(id);
      toast({
        title: 'Éxito',
        description: 'Instrumentador desactivado correctamente'
      });
      await loadInstrumentadores();
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: 'Error',
        description: 'No se pudo desactivar el instrumentador',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Manejar creación de instrumentador
  const handleCreate = async (data: Omit<Instrumentador, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createInstrumentador(data);
      toast({
        title: 'Éxito',
        description: 'Instrumentador creado correctamente'
      });
      await loadInstrumentadores();
    } catch (error) {
      console.error('Error creating:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el instrumentador',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Manejar éxito de importación
  const handleImportSuccess = async () => {
    toast({
      title: 'Importación exitosa',
      description: 'Los instrumentadores se importaron correctamente'
    });
    await loadInstrumentadores();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Gestión de Instrumentadores</h1>
              <p className="text-slate-600 mt-1">
                Base de datos de instrumentadores del equipo
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {filteredInstrumentadores.length}
              </p>
              <p className="text-sm text-slate-600">
                {searchTerm ? 'Resultados encontrados' : 'Instrumentadores registrados'}
              </p>
            </div>
          </div>
        </Card>

        {/* Actions Bar */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre, matrícula, CUIT o especialidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="incluir-inactivos"
                  checked={incluirInactivos}
                  onCheckedChange={setIncluirInactivos}
                />
                <Label htmlFor="incluir-inactivos" className="text-sm cursor-pointer">
                  Incluir inactivos
                </Label>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowImportModal(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Excel
              </Button>
              
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              <p className="mt-4 text-slate-600">Cargando instrumentadores...</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Lista de Instrumentadores
                </h2>
                {searchTerm && (
                  <p className="text-sm text-slate-600 mt-1">
                    Mostrando {filteredInstrumentadores.length} de {instrumentadores.length} instrumentadores
                  </p>
                )}
              </div>
              <InstrumentadoresTable
                data={filteredInstrumentadores}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            </>
          )}
        </Card>

        {/* Import Modal */}
        <ImportInstrumentadoresModal
          open={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={handleImportSuccess}
        />

        {/* Add Form */}
        <AddInstrumentadorForm
          open={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleCreate}
        />
      </div>
    </div>
  );
}
