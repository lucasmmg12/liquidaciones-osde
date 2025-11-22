'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History } from 'lucide-react';
import { VersionHistoryRow } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { formatARS, formatDate } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';

interface HistoryButtonProps {
  codigo: string;
  onReload: () => void;
}

export function HistoryButton({ codigo, onReload }: HistoryButtonProps) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<VersionHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('nomenclador_versiones')
        .select('*')
        .eq('codigo', codigo)
        .order('changed_at', { ascending: false });

      if (error) throw error;

      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el historial',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    loadHistory();
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleOpen}>
        <History className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Historial de cambios - Código {codigo}</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="text-center py-8 text-slate-600">Cargando historial...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-slate-600">No hay cambios registrados</div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Valor Anterior</TableHead>
                    <TableHead>Valor Nuevo</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDate(new Date(item.changed_at))}</TableCell>
                      <TableCell>{formatARS(item.valor_anterior)}</TableCell>
                      <TableCell>{formatARS(item.valor_nuevo)}</TableCell>
                      <TableCell>{item.usuario}</TableCell>
                      <TableCell>{item.motivo || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
