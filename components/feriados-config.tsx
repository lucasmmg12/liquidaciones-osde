'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, RefreshCw, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getFeriados,
  addFeriado,
  removeFeriado,
  restaurarFeriadosDefecto,
  Feriado
} from '@/lib/feriados-service';
import { formatDate } from '@/lib/formatters';

export function FeriadosConfig() {
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [fecha, setFecha] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  
  const { toast } = useToast();

  useEffect(() => {
    loadFeriados();
  }, []);

  const loadFeriados = () => {
    const data = getFeriados();
    setFeriados(data);
  };

  const handleAgregar = () => {
    if (!fecha || !descripcion) {
      toast({
        title: 'Error',
        description: 'Complete todos los campos',
        variant: 'destructive',
      });
      return;
    }

    try {
      addFeriado(fecha, descripcion);
      toast({
        title: 'Éxito',
        description: `Feriado agregado: ${descripcion}`,
      });
      setFecha('');
      setDescripcion('');
      loadFeriados();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo agregar el feriado',
        variant: 'destructive',
      });
    }
  };

  const handleEliminar = (fecha: string) => {
    try {
      removeFeriado(fecha);
      toast({
        title: 'Éxito',
        description: 'Feriado eliminado',
      });
      loadFeriados();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el feriado',
        variant: 'destructive',
      });
    }
  };

  const handleRestaurar = () => {
    try {
      restaurarFeriadosDefecto();
      toast({
        title: 'Éxito',
        description: 'Feriados restaurados a valores por defecto (2024-2026)',
      });
      loadFeriados();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron restaurar los feriados',
        variant: 'destructive',
      });
    }
  };

  // Agrupar feriados por año
  const feriadosPorAnio = feriados.reduce((acc, feriado) => {
    const anio = feriado.fecha.split('-')[0];
    if (!acc[anio]) {
      acc[anio] = [];
    }
    acc[anio].push(feriado);
    return acc;
  }, {} as Record<string, Feriado[]>);

  return (
    <div className="space-y-6">
      {/* Información */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Feriados Nacionales
          </CardTitle>
          <CardDescription>
            Configura los feriados nacionales para el cálculo del plus del 20%.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Regla del Plus del 20%:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Sábados:</strong> 13:00 a 23:59</li>
                  <li><strong>Domingos:</strong> Todo el día (00:00 a 23:59)</li>
                  <li><strong>Feriados:</strong> 13:00 a 23:59</li>
                </ul>
                <p className="mt-2 text-xs text-blue-700">
                  Ejemplo: Procedimiento con factor 100% → se cobra 120%. Procedimiento con factor 50% → se cobra 60% (50% × 1.20).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario para agregar */}
      <Card>
        <CardHeader>
          <CardTitle>Agregar Feriado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                type="text"
                placeholder="Ej: Día de la Independencia"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAgregar} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agregar
            </Button>
            <Button
              variant="outline"
              onClick={handleRestaurar}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Restaurar Feriados por Defecto (2024-2026)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de feriados por año */}
      <Card>
        <CardHeader>
          <CardTitle>Feriados Configurados</CardTitle>
          <CardDescription>
            {feriados.length} feriado(s) configurado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feriados.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay feriados configurados. Usa "Restaurar Feriados por Defecto" o agrega manualmente.
            </p>
          ) : (
            <div className="space-y-6">
              {Object.keys(feriadosPorAnio)
                .sort((a, b) => b.localeCompare(a))
                .map((anio) => (
                  <div key={anio}>
                    <h3 className="text-lg font-semibold mb-3 text-slate-700">Año {anio}</h3>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="w-[100px]">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {feriadosPorAnio[anio].map((feriado) => (
                            <TableRow key={feriado.fecha}>
                              <TableCell className="font-mono">
                                {formatDate(feriado.fecha)}
                              </TableCell>
                              <TableCell>{feriado.descripcion}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEliminar(feriado.fecha)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

