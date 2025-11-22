'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, RefreshCw, AlertCircle } from 'lucide-react';
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
  getAllLiquidacionesConfig,
  setNumeroLiquidacion,
  generarNumerosAutomaticos,
  LiquidacionConfig
} from '@/lib/liquidacion-config-service';

export function LiquidacionesConfig() {
  const [configs, setConfigs] = useState<LiquidacionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  
  // Formulario para agregar/editar
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [anio, setAnio] = useState<number>(new Date().getFullYear());
  const [numero, setNumero] = useState<string>('');
  
  const { toast } = useToast();

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await getAllLiquidacionesConfig();
      setConfigs(data);
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las configuraciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    if (!numero || isNaN(Number(numero))) {
      toast({
        title: 'Error',
        description: 'Ingrese un número de liquidación válido',
        variant: 'destructive',
      });
      return;
    }

    try {
      await setNumeroLiquidacion(mes, anio, Number(numero));
      toast({
        title: 'Éxito',
        description: `Número de liquidación ${numero} guardado para ${mes}/${anio}`,
      });
      setNumero('');
      loadConfigs();
    } catch (error) {
      console.error('Error al guardar:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el número de liquidación',
        variant: 'destructive',
      });
    }
  };

  const handleGenerarAutomatico = async () => {
    try {
      setGenerando(true);
      // Generar desde enero 2024 hasta diciembre del año siguiente
      const anioActual = new Date().getFullYear();
      await generarNumerosAutomaticos(1, 2024, 12, anioActual + 1);
      toast({
        title: 'Éxito',
        description: 'Números de liquidación generados automáticamente',
      });
      loadConfigs();
    } catch (error) {
      console.error('Error al generar:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron generar los números automáticos',
        variant: 'destructive',
      });
    } finally {
      setGenerando(false);
    }
  };

  const meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  const anios = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i);

  return (
    <div className="space-y-6">
      {/* Información */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            Numeración de Liquidaciones
          </CardTitle>
          <CardDescription>
            Configura los números de liquidación para cada período. 
            Referencia: Agosto 2025 = 401, Septiembre 2025 = 402, etc.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Formulario para agregar/editar */}
      <Card>
        <CardHeader>
          <CardTitle>Agregar o Actualizar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mes">Mes</Label>
              <Select
                value={String(mes)}
                onValueChange={(value) => setMes(Number(value))}
              >
                <SelectTrigger id="mes">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anio">Año</Label>
              <Select
                value={String(anio)}
                onValueChange={(value) => setAnio(Number(value))}
              >
                <SelectTrigger id="anio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anios.map((a) => (
                    <SelectItem key={a} value={String(a)}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero">Número de Liquidación</Label>
              <Input
                id="numero"
                type="number"
                placeholder="401"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGuardar} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Guardar
            </Button>
            <Button
              variant="outline"
              onClick={handleGenerarAutomatico}
              disabled={generando}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${generando ? 'animate-spin' : ''}`} />
              Generar Automáticos (2024-{new Date().getFullYear() + 1})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de configuraciones existentes */}
      <Card>
        <CardHeader>
          <CardTitle>Números Configurados</CardTitle>
          <CardDescription>
            {configs.length} período(s) configurado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Cargando...</p>
          ) : configs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay configuraciones. Usa "Generar Automáticos" o agrega manualmente.
            </p>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Número de Liquidación</TableHead>
                    <TableHead>Obra Social</TableHead>
                    <TableHead>Módulo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={`${config.mes}-${config.anio}`}>
                      <TableCell>
                        {meses.find((m) => m.value === config.mes)?.label} {config.anio}
                      </TableCell>
                      <TableCell className="font-mono font-bold">
                        {config.numero_liquidacion}
                      </TableCell>
                      <TableCell>{config.obra_social}</TableCell>
                      <TableCell>{config.modulo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

