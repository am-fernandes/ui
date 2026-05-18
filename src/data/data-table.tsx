"use client"

import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "../primitives/button"
import { Input } from "../primitives/input"

// Internal Table primitives — inlined here (was src/data/table.tsx).
function Table({ className, children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}
function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />
}
function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}
function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  )
}
function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}
function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td data-slot="table-cell" className={cn("p-2 align-middle", className)} {...props} />
}

export interface DataTableLabels {
  search?: string
  empty?: string
  /** Render the row-count line, given filtered + total counts. */
  rowCount?: (filtered: number, total: number) => string
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  /** Enable global text search; the columns listed are the only ones searched. */
  searchableColumns?: string[]
  /** Placeholder for the search input. */
  searchPlaceholder?: string
  /** Render this when data + filters result in zero rows. */
  emptyMessage?: React.ReactNode
  /** Additional class on the outer wrapper. */
  className?: string
  /** Enable pagination. When set, footer shows previous/next + page indicator. Default: not paginated. */
  pagination?: {
    pageSize?: number
  }
  /** Show row count in the footer (e.g. `12 registros` or `5 de 12 registros` when filtered). Default `false`. */
  showRowCount?: boolean
  /** Controlled sorting state. */
  sorting?: SortingState
  /** Controlled sorting change handler. */
  onSortingChange?: OnChangeFn<SortingState>
  /** Controlled global filter value. */
  globalFilter?: string
  /** Controlled global filter change handler. */
  onGlobalFilterChange?: OnChangeFn<string>
  /** Controlled page index (0-based). */
  pageIndex?: number
  /** Controlled pagination change handler. */
  onPaginationChange?: OnChangeFn<PaginationState>
  /** Total page count (required when `manualPagination` is true). */
  pageCount?: number
  /** Whether pagination is server-driven. */
  manualPagination?: boolean
  /** Overridable copy. */
  labels?: DataTableLabels
}

function defaultRowCount(filtered: number, total: number): string {
  if (filtered === total) {
    return `${total} registro${total === 1 ? "" : "s"}`
  }
  return `${filtered} de ${total} registros`
}

function DataTable<TData>({
  columns,
  data,
  searchableColumns,
  searchPlaceholder,
  emptyMessage,
  className,
  pagination,
  showRowCount = false,
  sorting: sortingProp,
  onSortingChange: onSortingChangeProp,
  globalFilter: globalFilterProp,
  onGlobalFilterChange: onGlobalFilterChangeProp,
  pageIndex: pageIndexProp,
  onPaginationChange: onPaginationChangeProp,
  pageCount,
  manualPagination,
  labels,
}: DataTableProps<TData>) {
  const isSortingControlled = sortingProp !== undefined
  const isGlobalFilterControlled = globalFilterProp !== undefined
  const isPaginationControlled = pageIndexProp !== undefined || onPaginationChangeProp !== undefined

  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState("")
  const [paginationState, setPaginationState] = React.useState<PaginationState>({
    pageIndex: pageIndexProp ?? 0,
    pageSize: pagination?.pageSize ?? 10,
  })

  // Keep pageSize in sync with prop (consumer may change it later).
  React.useEffect(() => {
    setPaginationState((prev) => {
      const nextPageSize = pagination?.pageSize ?? 10
      if (prev.pageSize === nextPageSize) return prev
      return { ...prev, pageSize: nextPageSize }
    })
  }, [pagination?.pageSize])

  // Sync controlled pageIndex into local state when present.
  React.useEffect(() => {
    if (pageIndexProp === undefined) return
    setPaginationState((prev) =>
      prev.pageIndex === pageIndexProp ? prev : { ...prev, pageIndex: pageIndexProp },
    )
  }, [pageIndexProp])

  const sorting = isSortingControlled ? sortingProp : internalSorting
  const globalFilter = isGlobalFilterControlled ? globalFilterProp : internalGlobalFilter

  const paginationEnabled = pagination != null || manualPagination === true

  const handleSortingChange: OnChangeFn<SortingState> = React.useCallback(
    (updater) => {
      if (isSortingControlled) {
        onSortingChangeProp?.(updater)
        return
      }
      setInternalSorting(updater)
      onSortingChangeProp?.(updater)
    },
    [isSortingControlled, onSortingChangeProp],
  )

  const handleGlobalFilterChange: OnChangeFn<string> = React.useCallback(
    (updater) => {
      if (isGlobalFilterControlled) {
        onGlobalFilterChangeProp?.(updater)
        return
      }
      setInternalGlobalFilter(updater)
      onGlobalFilterChangeProp?.(updater)
    },
    [isGlobalFilterControlled, onGlobalFilterChangeProp],
  )

  const handlePaginationChange: OnChangeFn<PaginationState> = React.useCallback(
    (updater) => {
      const next =
        typeof updater === "function"
          ? (updater as (old: PaginationState) => PaginationState)(paginationState)
          : updater
      if (!isPaginationControlled) {
        setPaginationState(next)
      }
      onPaginationChangeProp?.(next)
    },
    [isPaginationControlled, onPaginationChangeProp, paginationState],
  )

  const globalFilterFn = React.useCallback(
    (row: { getValue: (id: string) => unknown }, _columnId: string, filterValue: unknown) => {
      if (!filterValue) return true
      if (!searchableColumns || searchableColumns.length === 0) return true
      const needle = String(filterValue).toLowerCase()
      return searchableColumns.some((col) => {
        const value = row.getValue(col)
        return value != null && String(value).toLowerCase().includes(needle)
      })
    },
    [searchableColumns],
  )

  const tableOptions = React.useMemo(
    () => ({
      data,
      columns,
      state: {
        sorting,
        columnFilters,
        globalFilter,
        ...(paginationEnabled ? { pagination: paginationState } : {}),
      },
      onSortingChange: handleSortingChange,
      onColumnFiltersChange: setColumnFilters,
      onGlobalFilterChange: handleGlobalFilterChange,
      onPaginationChange: paginationEnabled ? handlePaginationChange : undefined,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      ...(paginationEnabled && !manualPagination
        ? { getPaginationRowModel: getPaginationRowModel() }
        : {}),
      ...(manualPagination ? { manualPagination: true, pageCount: pageCount ?? -1 } : {}),
      // When `searchableColumns` is provided, scope global filter to those columns;
      // otherwise fall back to TanStack's built-in `includesString` matcher.
      ...(searchableColumns && searchableColumns.length > 0
        ? { globalFilterFn }
        : { globalFilterFn: "includesString" as const }),
    }),
    [
      data,
      columns,
      sorting,
      columnFilters,
      globalFilter,
      paginationState,
      paginationEnabled,
      handleSortingChange,
      handleGlobalFilterChange,
      handlePaginationChange,
      manualPagination,
      pageCount,
      searchableColumns,
      globalFilterFn,
    ],
  )

  const table = useReactTable(tableOptions)

  const resolvedSearchPlaceholder = searchPlaceholder ?? labels?.search ?? "Buscar..."
  const resolvedEmptyMessage = emptyMessage ?? labels?.empty ?? "Nenhum resultado."
  const rowCountFn = labels?.rowCount ?? defaultRowCount

  return (
    <div className={cn("space-y-3", className)} data-slot="data-table">
      {searchableColumns && searchableColumns.length > 0 ? (
        <div className="relative w-full max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={globalFilter}
            onChange={(e) => handleGlobalFilterChange(e.target.value)}
            placeholder={resolvedSearchPlaceholder}
            className="pl-9"
            aria-label="Buscar na tabela"
          />
        </div>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  const ariaSort: "ascending" | "descending" | "none" =
                    sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"
                  const headerDef = header.column.columnDef.header
                  const headerText = typeof headerDef === "string" ? headerDef : header.id
                  const ariaLabel = `Ordenar por ${headerText}`
                  return (
                    <TableHead key={header.id} aria-sort={canSort ? ariaSort : undefined}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="-mx-2 inline-flex h-8 items-center gap-2 rounded-md px-2 text-left hover:bg-accent"
                          aria-label={ariaLabel}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3.5" aria-hidden />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3.5" aria-hidden />
                          ) : (
                            <ArrowUpDown className="size-3.5 opacity-50" aria-hidden />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
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
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {resolvedEmptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {paginationEnabled || showRowCount ? (
        <div className="flex items-center justify-between gap-2 px-2 py-3">
          {showRowCount ? (
            <span className="text-xs text-muted-foreground">
              {rowCountFn(table.getFilteredRowModel().rows.length, data.length)}
            </span>
          ) : (
            <span />
          )}
          {paginationEnabled ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                aria-label="Página anterior"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                aria-label="Próxima página"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export { DataTable }
