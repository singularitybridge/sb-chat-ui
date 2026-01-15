import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';
import { 
  Clock, 
  Bot, 
  Cpu, 
  ArrowDownUp, 
  DollarSign, 
  Timer,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown
} from 'lucide-react';
import { CostRecord } from '../../types/costTracking';
import { formatCost, formatDuration, formatTokens } from '../../services/api/costTrackingService';
import { format } from 'date-fns';
import { ModelIndicator } from '../ModelIndicator';

interface CostTableProps {
  data: CostRecord[];
  loading?: boolean;
  pageSize?: number;
  totalCount?: number; // Total records in database (for showing accurate count)
}

export const CostTable: React.FC<CostTableProps> = ({
  data,
  loading = false,
  pageSize = 10,
  totalCount
}) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'timestamp', desc: true }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns: ColumnDef<CostRecord>[] = [
    {
      accessorKey: 'timestamp',
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 hover:text-primary"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <Clock className="h-4 w-4" />
          Timestamp
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {format(new Date(row.getValue('timestamp')), 'MMM dd, HH:mm:ss')}
        </div>
      ),
    },
    {
      accessorKey: 'assistantName',
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 hover:text-primary"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <Bot className="h-4 w-4" />
          Assistant
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {row.getValue('assistantName') || 'Unknown'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'modelName',
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 hover:text-primary"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <Cpu className="h-4 w-4" />
          Model
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <ModelIndicator 
          modelName={row.getValue('modelName')} 
          size="small" 
          showBadge={true}
        />
      ),
    },
    {
      id: 'tokens',
      header: ({ column }) => (
        <div className="flex items-center justify-end gap-2">
          <ArrowDownUp className="h-4 w-4" />
          Tokens
        </div>
      ),
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="text-right text-sm">
            <span className="text-muted-foreground">↓</span> {formatTokens(record.inputTokens)}
            <span className="mx-1 text-muted-foreground">/</span>
            <span className="text-muted-foreground">↑</span> {formatTokens(record.outputTokens)}
          </div>
        );
      },
    },
    {
      accessorKey: 'totalCost',
      header: ({ column }) => (
        <button
          className="flex items-center justify-end gap-2 hover:text-primary w-full"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <DollarSign className="h-4 w-4" />
          Cost
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCost(row.getValue('totalCost'))}
        </div>
      ),
    },
    {
      accessorKey: 'duration',
      header: ({ column }) => (
        <button
          className="flex items-center justify-end gap-2 hover:text-primary w-full"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <Timer className="h-4 w-4" />
          Duration
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-right text-sm text-muted-foreground">
          {formatDuration(row.getValue('duration'))}
        </div>
      ),
    },
    {
      accessorKey: 'requestType',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('requestType') as string;
        const bgColor = type === 'streaming'
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
          : type === 'stateless'
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          : 'bg-secondary text-foreground';
        
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${bgColor}`}>
            {type}
          </span>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  if (loading) {
    return (
      <div className="w-full">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-secondary rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Search */}
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Search costs..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
        />
        <div className="text-sm text-muted-foreground">
          {totalCount !== undefined && totalCount > data.length
            ? `${table.getFilteredRowModel().rows.length} of ${totalCount} records`
            : `${table.getFilteredRowModel().rows.length} records`}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary border-b">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                  No cost records found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-accent">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-foreground">
          Showing {table.getState().pagination.pageIndex * pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          of {table.getFilteredRowModel().rows.length} results
          {totalCount !== undefined && totalCount > data.length && (
            <span className="text-muted-foreground"> (total: {totalCount})</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};