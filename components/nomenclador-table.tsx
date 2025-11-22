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
import { NomencladorRow } from '@/lib/types';
import { formatARS } from '@/lib/formatters';
import { InlineEditCell } from '@/components/inline-edit-cell';
import { HistoryButton } from '@/components/history-button';
import { Switch } from '@/components/ui/switch';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NomencladorTableProps {
  data: NomencladorRow[];
  onUpdate: (row: NomencladorRow, field: string, value: any) => void;
  onUpdateValor: (row: NomencladorRow, newValue: number, motivo: string) => void;
  onReload: () => void;
}

export function NomencladorTable({ data, onUpdate, onUpdateValor, onReload }: NomencladorTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<NomencladorRow>[] = [
    {
      accessorKey: 'codigo',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Código
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'procedimiento',
      header: 'Procedimiento',
      cell: ({ row }) => (
        <InlineEditCell
          value={row.original.procedimiento}
          onSave={(value) => onUpdate(row.original, 'procedimiento', value)}
        />
      ),
    },
    {
      accessorKey: 'complejidad',
      header: 'Complejidad',
      cell: ({ row }) => (
        <InlineEditCell
          value={row.original.complejidad || ''}
          onSave={(value) => onUpdate(row.original, 'complejidad', value || null)}
          placeholder="Sin complejidad"
        />
      ),
    },
    {
      accessorKey: 'valor',
      header: 'Valor',
      cell: ({ row }) => (
        <InlineEditCell
          value={row.original.valor.toString()}
          onSave={(value) => {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              onUpdateValor(row.original, numValue, '');
            }
          }}
          type="number"
          formatter={(val) => formatARS(parseFloat(val))}
        />
      ),
    },
    {
      accessorKey: 'activo',
      header: 'Activo',
      cell: ({ row }) => (
        <Switch
          checked={row.original.activo}
          onCheckedChange={(checked) => onUpdate(row.original, 'activo', checked)}
        />
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => <HistoryButton codigo={row.original.codigo} onReload={onReload} />,
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
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
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No hay registros.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
