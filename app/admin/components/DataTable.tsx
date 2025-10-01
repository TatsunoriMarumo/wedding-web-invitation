"use client";

import * as React from "react";

import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTableFilter } from "./DataTableFilter";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableViewOptions } from "./DataTableViewOptions";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isAdd?: boolean;
  isDeleteExpired?: boolean;
  addAction?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnsFilters] = React.useState<ColumnFiltersState>([]);

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() => {
    return columns.reduce((acc, column) => {
      const typedColumn = column as ColumnDef<TData, TValue> & { accessorKey?: string };
      if (typedColumn.accessorKey) {
        // meta.isVisible が false のものだけ初期非表示
        acc[typedColumn.accessorKey] = typedColumn.meta?.isVisible !== false;
      }
      return acc;
    }, {} as Record<string, boolean>);
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnsFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getRowId: (row, index) => (row as { id?: string }).id ?? index.toString(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const rows = table.getRowModel().rows;

  // モバイル用ラベル取得（header が string でない場合のフォールバック）
  const getHeaderLabel = (colId: string) => {
    const col = table.getAllColumns().find((c) => c.id === colId);
    if (!col) return colId;
    const hdr = col.columnDef.header;
    if (typeof hdr === "string") return hdr;
    // meta.title があれば採用、なければ id
    // ※ header が関数のときは適切な HeaderContext が必要になるため安全に回避
    return col.columnDef?.meta?.title ?? col.id;
  };

  return (
    <div className="w-full">
      {/* コントロール類：モバイルは縦積み、md以上で横並び */}
      <div className="flex flex-col gap-2 pb-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:w-auto">
          <DataTableFilter table={table} />
        </div>
        <div className="w-full md:w-auto md:ml-auto">
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* モバイル（カードビュー） */}
      <div className="md:hidden">
        {rows.length ? (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border bg-white p-4 shadow-sm"
                data-state={row.getIsSelected() && "selected"}
              >
                <div className="space-y-2">
                  {row.getVisibleCells().map((cell) => {
                    const label = getHeaderLabel(cell.column.id);
                    return (
                      <div
                        key={cell.id}
                        className="grid grid-cols-3 items-start gap-2"
                      >
                        <div className="col-span-1 text-xs font-medium text-muted-foreground">
                          {label}
                        </div>
                        <div className="col-span-2 text-sm break-words">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border bg-white p-6 text-center text-sm text-muted-foreground">
            No Results.
          </div>
        )}
      </div>

      {/* md以上（テーブルビュー） */}
      <div className="relative mt-2 hidden overflow-x-auto rounded-md border md:block">
        <Table className="table-auto min-w-full">
          <TableHeader className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="whitespace-nowrap text-xs font-semibold"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="align-top break-words">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No Results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ページネーション：モバイル中央寄せ、md以上で左右に余白 */}
      <div className="flex items-center justify-center py-4 md:justify-end">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
