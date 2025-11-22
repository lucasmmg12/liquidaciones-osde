'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Search, Plus, AlertCircle, Download, FileText, Sparkles } from 'lucide-react';
import Footer from '@/components/Footer';
import { Procedimiento, ValorNomenclador } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { formatARS } from '@/lib/formatters';
import { InlineEditCell } from '@/components/inline-edit-cell';
import { Switch } from '@/components/ui/switch';
import { ImportProcedimientosModal } from '@/components/import-procedimientos-modal';
import { LiquidacionesConfig } from '@/components/liquidaciones-config';
import { FeriadosConfig } from '@/components/feriados-config';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function NomencladorPage() {
  const [procedimientos, setProcedimientos] = useState<Procedimiento[]>([]);
  const [valores, setValores] = useState<ValorNomenclador[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Filtros para valores (mes/año)
  const currentDate = new Date();
  const [mesFiltro, setMesFiltro] = useState<number>(currentDate.getMonth() + 1);
  const [anioFiltro, setAnioFiltro] = useState<number>(currentDate.getFullYear());
  
  const { toast } = useToast();

  useEffect(() => {
    loadProcedimientos();
    loadValores();
  }, [mesFiltro, anioFiltro]);

  const loadProcedimientos = async () => {
    try {
      // Primero obtener el count total
      const { count } = await supabase
        .from('procedimientos')
        .select('*', { count: 'exact', head: true });

      console.log(`📊 Total en BD: ${count}`);

      if (!count) {
        setProcedimientos([]);
        return;
      }

      // Cargar en lotes de 1000 (límite de Supabase)
      const batchSize = 1000;
      const numBatches = Math.ceil(count / batchSize);
      let allData: any[] = [];

      for (let i = 0; i < numBatches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize - 1, count - 1);
        
        console.log(`📥 Cargando lote ${i + 1}/${numBatches} (${start}-${end})...`);
        
        const { data, error } = await supabase
          .from('procedimientos')
          .select('*')
          .order('codigo', { ascending: true })
          .range(start, end);

        if (error) throw error;
        
        if (data) {
          allData = [...allData, ...data];
        }
      }
      
      console.log(`✅ Total procedimientos cargados: ${allData.length}`);
      setProcedimientos(allData);
    } catch (error) {
      console.error('Error loading procedimientos:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar los procedimientos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadValores = async () => {
    try {
      const { data, error } = await supabase
        .from('valores_nomenclador')
        .select('*')
        .eq('mes', mesFiltro)
        .eq('anio', anioFiltro)
        .eq('obra_social', 'OSDE')
        .eq('modulo', 'instrumentadores')
        .order('complejidad', { ascending: true });

      if (error) {
        console.error('Error loading valores:', error);
        
        // Si el error es que la tabla no existe, mostrar mensaje más claro
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          toast({
            title: 'Error',
            description: 'La tabla valores_nomenclador no existe. Ejecute la migración de base de datos.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }
      
      setValores(data || []);
    } catch (error: any) {
      console.error('Error loading valores:', error);
      toast({
        title: 'Error',
        description: `No se pudo cargar los valores: ${error?.message || 'Error desconocido'}. Verifique la consola para más detalles.`,
        variant: 'destructive',
      });
      setValores([]);
    }
  };

  const handleUpdateProcedimiento = async (row: Procedimiento, field: string, value: any) => {
    try {
      const updates: any = { [field]: value, updated_at: new Date().toISOString() };

      const { error } = await supabase
        .from('procedimientos')
        .update(updates)
        .eq('id', row.id);

      if (error) throw error;

      setProcedimientos((prev) =>
        prev.map((item) => (item.id === row.id ? { ...item, ...updates } : item))
      );

      toast({
        title: 'Actualizado',
        description: 'El procedimiento se actualizó correctamente',
      });
    } catch (error) {
      console.error('Error updating:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el procedimiento',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateValor = async (row: ValorNomenclador, newValue: number) => {
    try {
      const { error } = await supabase
        .from('valores_nomenclador')
        .update({ valor: newValue, updated_at: new Date().toISOString() })
        .eq('id', row.id);

      if (error) throw error;

      setValores((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, valor: newValue, updated_at: new Date().toISOString() } : item
        )
      );

      toast({
        title: 'Valor actualizado',
        description: `Valor actualizado para ${mesFiltro}/${anioFiltro}`,
      });
    } catch (error) {
      console.error('Error updating value:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el valor',
        variant: 'destructive',
      });
    }
  };

  const handleCopiarDesdeUltimoMes = async () => {
    // Calcular mes anterior automáticamente
    let mesAnterior = mesFiltro - 1;
    let anioAnterior = anioFiltro;
    
    if (mesAnterior < 1) {
      mesAnterior = 12;
      anioAnterior = anioFiltro - 1;
    }

    const nombreMesAnterior = new Date(anioAnterior, mesAnterior - 1).toLocaleString('es-AR', { month: 'long' });
    const nombreMesActual = new Date(anioFiltro, mesFiltro - 1).toLocaleString('es-AR', { month: 'long' });

    const confirmar = confirm(
      `¿Copiar todos los valores de ${nombreMesAnterior} ${anioAnterior} a ${nombreMesActual} ${anioFiltro}?\n\nEsto creará una copia exacta de los valores del mes anterior.`
    );
    if (!confirmar) return;

    try {
      // Obtener valores del mes anterior
      const { data: valoresOrigen, error: errorOrigen } = await supabase
        .from('valores_nomenclador')
        .select('*')
        .eq('mes', mesAnterior)
        .eq('anio', anioAnterior)
        .eq('obra_social', 'OSDE')
        .eq('modulo', 'instrumentadores');

      if (errorOrigen) throw errorOrigen;

      if (!valoresOrigen || valoresOrigen.length === 0) {
        toast({
          title: 'No hay valores en el mes anterior',
          description: `No se encontraron valores para ${nombreMesAnterior} ${anioAnterior}. Debe crear los valores manualmente o importar desde Excel.`,
          variant: 'destructive',
        });
        return;
      }

      // Insertar en el mes destino
      const valoresNuevos = valoresOrigen.map(v => ({
        complejidad: v.complejidad,
        mes: mesFiltro,
        anio: anioFiltro,
        obra_social: 'OSDE',
        modulo: 'instrumentadores',
        valor: v.valor,
      }));

      const { error: errorInsert } = await supabase
        .from('valores_nomenclador')
        .insert(valoresNuevos);

      if (errorInsert) throw errorInsert;

      toast({
        title: '✅ Valores copiados exitosamente',
        description: `Se copiaron ${valoresNuevos.length} valores desde ${nombreMesAnterior} ${anioAnterior}`,
      });

      loadValores();
    } catch (error) {
      console.error('Error copiando valores:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron copiar los valores. Puede que ya existan para este mes.',
        variant: 'destructive',
      });
    }
  };

  const handleAplicarAumento = async () => {
    // Calcular mes anterior automáticamente
    let mesAnterior = mesFiltro - 1;
    let anioAnterior = anioFiltro;
    
    if (mesAnterior < 1) {
      mesAnterior = 12;
      anioAnterior = anioFiltro - 1;
    }

    const nombreMesAnterior = new Date(anioAnterior, mesAnterior - 1).toLocaleString('es-AR', { month: 'long' });
    const nombreMesActual = new Date(anioFiltro, mesFiltro - 1).toLocaleString('es-AR', { month: 'long' });

    const porcentaje = prompt(
      `Copiar valores desde ${nombreMesAnterior} ${anioAnterior} a ${nombreMesActual} ${anioFiltro}\n\n¿Qué porcentaje de aumento aplicar?\n(Ejemplo: 10 para aumentar 10%)`
    );
    if (!porcentaje) return;

    const aumento = parseFloat(porcentaje);
    if (isNaN(aumento)) {
      toast({
        title: 'Error',
        description: 'Porcentaje inválido. Debe ingresar un número.',
        variant: 'destructive',
      });
      return;
    }

    const confirmar = confirm(
      `Se copiarán los valores de ${nombreMesAnterior} ${anioAnterior} con ${aumento}% de aumento.\n\n¿Continuar?`
    );
    if (!confirmar) return;

    try {
      // Obtener valores del mes anterior
      const { data: valoresOrigen, error: errorOrigen } = await supabase
        .from('valores_nomenclador')
        .select('*')
        .eq('mes', mesAnterior)
        .eq('anio', anioAnterior)
        .eq('obra_social', 'OSDE')
        .eq('modulo', 'instrumentadores');

      if (errorOrigen) throw errorOrigen;

      if (!valoresOrigen || valoresOrigen.length === 0) {
        toast({
          title: 'No hay valores en el mes anterior',
          description: `No se encontraron valores para ${nombreMesAnterior} ${anioAnterior}. Debe crear los valores manualmente o importar desde Excel.`,
          variant: 'destructive',
        });
        return;
      }

      // Insertar en el mes destino con aumento
      const valoresNuevos = valoresOrigen.map(v => ({
        complejidad: v.complejidad,
        mes: mesFiltro,
        anio: anioFiltro,
        obra_social: 'OSDE',
        modulo: 'instrumentadores',
        valor: Math.round(v.valor * (1 + aumento / 100) * 100) / 100, // Redondear a 2 decimales
      }));

      const { error: errorInsert } = await supabase
        .from('valores_nomenclador')
        .insert(valoresNuevos);

      if (errorInsert) throw errorInsert;

      toast({
        title: `✅ Valores copiados con ${aumento}% de aumento`,
        description: `Se procesaron ${valoresNuevos.length} complejidades`,
      });

      loadValores();
    } catch (error) {
      console.error('Error aplicando aumento:', error);
      toast({
        title: 'Error',
        description: 'No se pudo aplicar el aumento. Puede que ya existan valores para este mes.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateProcedimiento = async () => {
    const codigo = prompt('Ingrese el código del procedimiento:');
    if (!codigo) return;

    const procedimiento = prompt('Ingrese la descripción del procedimiento:');
    if (!procedimiento) return;

    const complejidad = prompt('Ingrese la complejidad (debe existir en la tabla de Valores):');
    
    try {
      const { error } = await supabase.from('procedimientos').insert({
        codigo: codigo.trim().toUpperCase(),
        procedimiento: procedimiento.trim(),
        complejidad: complejidad?.trim() || null,
        activo: true,
      });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Error',
            description: 'Ya existe un procedimiento con ese código',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: 'Procedimiento creado',
        description: 'El procedimiento se creó correctamente',
      });

      loadProcedimientos();
    } catch (error) {
      console.error('Error creating procedimiento:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el procedimiento',
        variant: 'destructive',
      });
    }
  };

  const handleExportarNomenclador = () => {
    try {
      // Preparar datos para exportar
      const dataToExport = procedimientos.map(p => ({
        codigo: p.codigo,
        procedimiento: p.procedimiento,
        complejidad: p.complejidad || ''
      }));

      // Crear CSV
      const headers = ['codigo', 'procedimiento', 'complejidad'];
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(row => 
          `"${row.codigo}","${row.procedimiento.replace(/"/g, '""')}","${row.complejidad}"`
        )
      ].join('\n');

      // Crear blob y descargar
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `nomenclador_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Exportación exitosa',
        description: `Se exportaron ${dataToExport.length} procedimientos`,
      });
    } catch (error) {
      console.error('Error exportando:', error);
      toast({
        title: 'Error',
        description: 'No se pudo exportar el nomenclador',
        variant: 'destructive',
      });
    }
  };

  const handleCreateValor = async () => {
    const complejidad = prompt('Ingrese la complejidad:');
    if (!complejidad) return;

    const valorStr = prompt('Ingrese el valor:');
    if (!valorStr) return;

    const valor = parseFloat(valorStr.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (isNaN(valor)) {
      toast({
        title: 'Error',
        description: 'Valor inválido',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('valores_nomenclador').insert({
        complejidad: complejidad.trim(),
        mes: mesFiltro,
        anio: anioFiltro,
        obra_social: 'OSDE',
        modulo: 'instrumentadores',
        valor: valor,
      });

      if (error) throw error;

      toast({
        title: 'Valor creado',
        description: `Valor creado para ${mesFiltro}/${anioFiltro}`,
      });

      loadValores();
    } catch (error) {
      console.error('Error creating valor:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el valor. Puede que ya exista para esta complejidad/mes/año.',
        variant: 'destructive',
      });
    }
  };

  const filteredProcedimientos = procedimientos.filter(
    (item) =>
      item.codigo.toLowerCase().includes(search.toLowerCase()) ||
      item.procedimiento.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header con estética Grow Labs */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/instrumentadores">
                <Button 
                  variant="ghost" 
                  className="glass-effect-dark border-green-500/30 hover:bg-green-500/20 hover:border-green-400 text-white"
                >
                  <ArrowLeft className="h-5 w-5 text-green-400" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                  Nomenclador
                </h1>
                <p className="text-gray-300 mt-1 text-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-400" />
                  Gestión de códigos, procedimientos y valores
                </p>
              </div>
            </div>
          </div>

        <Card className="glass-effect border-green-500/30 p-6">
          <Tabs defaultValue="procedimientos" className="w-full">
            <div className="border-b border-green-500/20 px-6 pt-6">
              <TabsList className="w-full justify-start bg-gray-800/50">
                <TabsTrigger 
                  value="procedimientos"
                  className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                >
                  Procedimientos (Código → Complejidad)
                </TabsTrigger>
                <TabsTrigger 
                  value="valores"
                  className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                >
                  Valores (Complejidad + Mes/Año → Valor)
                </TabsTrigger>
                <TabsTrigger 
                  value="liquidaciones"
                  className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                >
                  Liquidaciones (Numeración)
                </TabsTrigger>
                <TabsTrigger 
                  value="feriados"
                  className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                >
                  Feriados (Plus 20%)
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="procedimientos" className="p-6">
              <div className="mb-6 space-y-4">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Buscar por código o procedimiento..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleExportarNomenclador} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                  <Button onClick={handleCreateProcedimiento} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Procedimiento
                  </Button>
                  <Button onClick={() => setShowImportModal(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar desde Excel
                  </Button>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="bg-slate-100 px-4 py-2 rounded-md">
                    <span className="text-slate-600">Total de procedimientos: </span>
                    <span className="font-bold text-slate-900">{procedimientos.length}</span>
                  </div>
                  {search && filteredProcedimientos.length !== procedimientos.length && (
                    <div className="bg-blue-100 px-4 py-2 rounded-md">
                      <span className="text-blue-600">Mostrando: </span>
                      <span className="font-bold text-blue-900">{filteredProcedimientos.length}</span>
                    </div>
                  )}
                  <div className="bg-green-100 px-4 py-2 rounded-md">
                    <span className="text-green-600">Activos: </span>
                    <span className="font-bold text-green-900">
                      {procedimientos.filter(p => p.activo).length}
                    </span>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-slate-600">Cargando...</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Procedimiento</TableHead>
                        <TableHead>Complejidad</TableHead>
                        <TableHead>Valor ({mesFiltro}/{anioFiltro})</TableHead>
                        <TableHead>Activo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProcedimientos.length > 0 ? (
                        filteredProcedimientos.map((row) => {
                          // Buscar el valor correspondiente a la complejidad del procedimiento para el período seleccionado
                          const valorItem = valores.find(v => v.complejidad === row.complejidad);
                          
                          return (
                            <TableRow key={row.id}>
                              <TableCell className="font-mono">{row.codigo}</TableCell>
                              <TableCell>
                                <InlineEditCell
                                  value={row.procedimiento}
                                  onSave={(value) => handleUpdateProcedimiento(row, 'procedimiento', value)}
                                />
                              </TableCell>
                              <TableCell>
                                <InlineEditCell
                                  value={row.complejidad || ''}
                                  onSave={(value) => handleUpdateProcedimiento(row, 'complejidad', value || null)}
                                  placeholder="Sin complejidad"
                                />
                              </TableCell>
                              <TableCell>
                                {valorItem ? (
                                  <span className="font-semibold text-green-600">
                                    {formatARS(valorItem.valor)}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-sm italic">
                                    Sin valor para {mesFiltro}/{anioFiltro}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={row.activo}
                                  onCheckedChange={(checked) => handleUpdateProcedimiento(row, 'activo', checked)}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No hay procedimientos registrados.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="valores" className="p-6">
              <div className="mb-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-900 mb-2">
                    <strong>💡 ¿Cómo funcionan los valores mensuales?</strong>
                  </p>
                  <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                    <li><strong>Primer mes:</strong> Importe el nomenclador desde Excel (botón en pestaña "Procedimientos")</li>
                    <li><strong>Meses siguientes:</strong> Use "Copiar desde mes anterior" o "Copiar con aumento %"</li>
                    <li><strong>Histórico:</strong> Cada mes mantiene sus propios valores para re-liquidaciones</li>
                    <li><strong>Edición:</strong> Puede editar valores haciendo clic en la celda</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mes-valor">Mes a gestionar</Label>
                    <Select value={mesFiltro.toString()} onValueChange={(value) => setMesFiltro(parseInt(value))}>
                      <SelectTrigger id="mes-valor">
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
                    <Label htmlFor="anio-valor">Año</Label>
                    <Select value={anioFiltro.toString()} onValueChange={(value) => setAnioFiltro(parseInt(value))}>
                      <SelectTrigger id="anio-valor">
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

                {valores.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-900 mb-2">
                          No hay valores para {new Date(anioFiltro, mesFiltro - 1).toLocaleString('es-AR', { month: 'long' })} {anioFiltro}
                        </p>
                        <p className="text-sm text-yellow-800 mb-3">
                          Debe crear los valores antes de poder procesar liquidaciones de este período.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button onClick={handleCopiarDesdeUltimoMes} size="sm" variant="default">
                            📋 Copiar desde mes anterior
                          </Button>
                          <Button onClick={handleAplicarAumento} size="sm" variant="default">
                            📈 Copiar con aumento %
                          </Button>
                          <Button onClick={handleCreateValor} size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Crear manualmente
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {valores.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleCreateValor} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Complejidad
                    </Button>
                    <Button onClick={handleCopiarDesdeUltimoMes} variant="outline" size="sm">
                      📋 Copiar desde mes anterior
                    </Button>
                    <Button onClick={handleAplicarAumento} variant="outline" size="sm">
                      📈 Copiar con aumento %
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {valores.length > 0 && (
                  <div className="bg-slate-100 px-4 py-2 rounded-md inline-block">
                    <span className="text-slate-600 text-sm">Complejidades configuradas: </span>
                    <span className="font-bold text-slate-900">{valores.length}</span>
                  </div>
                )}
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Complejidad</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Mes</TableHead>
                        <TableHead>Año</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {valores.length > 0 ? (
                        valores.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-semibold">{row.complejidad}</TableCell>
                            <TableCell>
                              <InlineEditCell
                                value={row.valor.toString()}
                                onSave={(value) => {
                                  const numValue = parseFloat(value);
                                  if (!isNaN(numValue)) {
                                    handleUpdateValor(row, numValue);
                                  }
                                }}
                                type="number"
                                formatter={(val) => formatARS(parseFloat(val))}
                              />
                            </TableCell>
                            <TableCell className="text-sm">{row.mes}</TableCell>
                            <TableCell className="text-sm">{row.anio}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            No hay valores para {mesFiltro}/{anioFiltro}. 
                            <br />
                            <span className="text-sm text-slate-500">
                              Use "Copiar desde otro mes" si ya tiene valores de un período anterior.
                            </span>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="liquidaciones" className="p-6">
              <LiquidacionesConfig />
            </TabsContent>

            <TabsContent value="feriados" className="p-6">
              <FeriadosConfig />
            </TabsContent>
          </Tabs>
        </Card>

        <ImportProcedimientosModal
          open={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportComplete={() => {
            loadProcedimientos();
            loadValores();
          }}
        />
      </div>
    </div>
  );
}
