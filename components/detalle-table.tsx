'use client';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DetalleRow } from '@/lib/types';
import { formatARS, formatDate } from '@/lib/formatters';
import { ArrowUpDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InlineEditCell } from '@/components/inline-edit-cell';

interface DetalleTableProps {
  data: DetalleRow[];
  onUpdate?: (index: number, field: keyof DetalleRow, value: any) => void;
}

export function DetalleTable({ data, onUpdate }: DetalleTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const handleUpdate = (index: number, field: keyof DetalleRow, value: any) => {
    if (onUpdate) {
      onUpdate(index, field, value);
    }
  };

  const columns: ColumnDef<DetalleRow>[] = [
    {
      accessorKey: 'fecha',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Fecha
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatDate(row.original.fecha),
    },
    {
      accessorKey: 'hora',
      header: 'Hora',
      cell: ({ row }) => {
        const hora = row.original.hora;
        const plusHorario = row.original.plusHorario;
        
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">{hora || '-'}</span>
            {plusHorario && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500 text-white text-xs font-semibold">
                <Clock className="h-3 w-3" />
                +20%
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'paciente',
      header: 'Paciente',
    },
    {
      accessorKey: 'codigo',
      header: 'Código',
      cell: ({ row }) => (
        <InlineEditCell
          value={row.original.codigo}
          onSave={(value) => handleUpdate(row.index, 'codigo', value)}
        />
      ),
    },
    {
      accessorKey: 'procedimiento',
      header: 'Procedimiento',
      cell: ({ row }) => (
        <InlineEditCell
          value={row.original.procedimiento}
          onSave={(value) => handleUpdate(row.index, 'procedimiento', value)}
        />
      ),
    },
    {
      accessorKey: 'cirujano',
      header: 'Cirujano',
    },
    {
      accessorKey: 'instrumentador',
      header: 'Instrumentador',
      cell: ({ row }) => (
        <InlineEditCell
          value={row.original.instrumentador}
          onSave={(value) => handleUpdate(row.index, 'instrumentador', value)}
        />
      ),
    },
    {
      accessorKey: 'complejidad',
      header: 'Complejidad',
      cell: ({ row }) => row.original.complejidad || '-',
    },
    {
      accessorKey: 'valor',
      header: 'Valor',
      cell: ({ row }) => formatARS(row.original.valor),
    },
    {
      accessorKey: 'factor',
      header: 'Factor',
      cell: ({ row }) => {
        const factorActual = row.original.factor;
        const porcentaje = `${(factorActual * 100).toFixed(0)}%`;
        
        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold">{porcentaje}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => {
                // Alternar entre 100% y 50%
                const nuevoFactor = factorActual === 1 ? 0.5 : 1;
                handleUpdate(row.index, 'factor', nuevoFactor);
              }}
            >
              Cambiar
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: 'importe',
      header: 'Importe',
      cell: ({ row }) => (
        <span className="font-semibold text-green-600">
          {formatARS(row.original.importe)}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="whitespace-nowrap">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No hay datos para mostrar.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
