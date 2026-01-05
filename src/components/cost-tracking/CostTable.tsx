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
}

export const CostTable: React.FC<CostTableProps> = ({ 
  data, 
  loading = false,
  pageSize = 10 
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
          className="flex items-center gap-2 hover:text-primary-600"
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
          className="flex items-center gap-2 hover:text-primary-600"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <Bot className="h-4 w-4" />
          Assistant
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-gray-400" />
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
          className="flex items-center gap-2 hover:text-primary-600"
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
            <span className="text-gray-500">↓</span> {formatTokens(record.inputTokens)}
            <span className="mx-1 text-gray-400">/</span>
            <span className="text-gray-500">↑</span> {formatTokens(record.outputTokens)}
          </div>
        );
      },
    },
    {
      accessorKey: 'totalCost',
      header: ({ column }) => (
        <button
          className="flex items-center justify-end gap-2 hover:text-primary-600 w-full"
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
          className="flex items-center justify-end gap-2 hover:text-primary-600 w-full"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <Timer className="h-4 w-4" />
          Duration
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-right text-sm text-gray-600">
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
          ? 'bg-blue-100 text-blue-800' 
          : type === 'stateless'
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800';
        
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
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
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
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary-500"
        />
        <div className="text-sm text-gray-500">
          {table.getFilteredRowModel().rows.length} records
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
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
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  No cost records found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
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
        <div className="text-sm text-gray-700">
          Showing {table.getState().pagination.pageIndex * pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          of {table.getFilteredRowModel().rows.length} results
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};