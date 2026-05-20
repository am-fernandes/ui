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
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
} from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Popover } from "../overlays/popover"
import { Button } from "../primitives/button"
import { Input } from "../primitives/input"
import { downloadXlsx } from "./_xlsx-export"

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
        "px-3 py-2.5 text-left align-middle font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}
function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td data-slot="table-cell" className={cn("px-3 py-2.5 align-middle", className)} {...props} />
  )
}

export interface DataTableLabels {
  /** Placeholder of the search input. */
  search: string
  /** aria-label of the search input. */
  searchAriaLabel: string
  /** Empty-state message when the filtered data is empty. */
  empty: string
  /** sr-only status announced while the table is loading. */
  loading: string
  /** aria-label of the previous-page button. */
  paginationPrevious: string
  /** aria-label of the next-page button. */
  paginationNext: string
  /** Render the row-count line, given filtered + total counts. */
  rowCount: (filtered: number, total: number) => string
  /** Render the "page X of Y" indicator. */
  pageIndicator: (pageIndex: number, pageCount: number) => string
  /** Render the column-header sort button aria-label. */
  sortBy: (headerText: string) => string
  /** Export-to-Excel trigger button label. */
  exportTrigger: string
  /** "Export filtered data" menu item label. */
  exportFiltered: string
  /** "Export current page" menu item label. */
  exportPage: string
  /** "Export all data" menu item label. */
  exportAll: string
}

const numberFormatter = new Intl.NumberFormat("pt-BR")

function defaultRowCount(filtered: number, total: number): string {
  const totalStr = numberFormatter.format(total)
  if (filtered === total) {
    return `${totalStr} registro${total === 1 ? "" : "s"}`
  }
  return `${numberFormatter.format(filtered)} de ${totalStr} registros`
}

function defaultPageIndicator(pageIndex: number, pageCount: number): string {
  return `Página ${numberFormatter.format(pageIndex + 1)} de ${numberFormatter.format(pageCount)}`
}

export const defaultDataTableLabels: DataTableLabels = {
  search: "Buscar...",
  searchAriaLabel: "Buscar na tabela",
  empty: "Nenhum resultado.",
  loading: "Carregando dados…",
  paginationPrevious: "Página anterior",
  paginationNext: "Próxima página",
  rowCount: defaultRowCount,
  pageIndicator: defaultPageIndicator,
  sortBy: (headerText) => `Ordenar por ${headerText}`,
  exportTrigger: "Exportar para Excel",
  exportFiltered: "Exportar dados filtrados",
  exportPage: "Exportar página atual",
  exportAll: "Exportar todos os dados",
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  /** Enable global text search; the columns listed are the only ones searched. */
  searchableColumns?: string[]
  /**
   * Whitelist of column ids (typically `accessorKey`) whose headers are sortable.
   * When omitted, **no** header is sortable. Mirrors the `searchableColumns`
   * opt-in pattern. Replaces the per-column `enableSorting` flag in the columnDef.
   */
  sortableColumns?: string[]
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
  /** Controlled sorting state. When provided, parent owns the sort. */
  sorting?: SortingState
  /** Controlled sorting change handler. */
  onSortingChange?: OnChangeFn<SortingState>
  /** Whether sort is server-driven. When true, the table skips its own sort
   *  pass and just propagates state via `onSortingChange`. */
  manualSorting?: boolean
  /** Overridable copy. All keys optional — defaults are pt-BR. */
  labels?: Partial<DataTableLabels>
  /** Callback fired when a body row is clicked. Adds button-like a11y (role, tabIndex, keydown). */
  onRowClick?: (row: TData, event: React.MouseEvent<HTMLTableRowElement>) => void
  /** Per-row className. Receives the row data and index; return undefined to skip. Useful for coloring rows by status. */
  rowClassName?: (row: TData, index: number) => string | undefined
  /**
   * When `true`, the body renders skeleton rows in place of data. Search input and
   * footer (count + pagination buttons) also skeleton-ize. Skeleton row count
   * derives from `pagination.pageSize` (or 5 when pagination is off). `aria-busy`
   * is set on the wrapper so assistive tech announces the loading state once.
   */
  loading?: boolean
  /**
   * Render an "Exportar para Excel" ghost button on the right side of the toolbar.
   * Clicking opens a popover with three scopes (filtered, current page, all rows).
   * Pass `true` to enable with defaults or an object to customize filename / sheet
   * name / row mapping.
   */
  downloadable?: boolean | DataTableDownloadable<TData>
}

export interface DataTableDownloadable<TData> {
  /** Filename for the downloaded xlsx. Default `"export.xlsx"`. */
  filename?: string
  /** Sheet name inside the workbook. Default `"Dados"`. */
  sheetName?: string
  /**
   * Custom row → record mapping. Defaults to one column per visible leaf column,
   * using the column's `header` (when it's a string) as the key and the resolved
   * cell value as the cell content. The default resolver supports both
   * `accessorKey` and `accessorFn` columns.
   */
  rowToRecord?: (row: TData, rowIndex: number) => Record<string, unknown>
}

type ExportScope = "filtered" | "page" | "all"

/** Width classes used to vary skeleton cell widths so rows don't look uniform. */
const SKELETON_CELL_WIDTHS = ["w-3/4", "w-1/2", "w-2/3", "w-5/6", "w-3/5"] as const

function DataTable<TData>({
  columns,
  data,
  searchableColumns,
  sortableColumns,
  searchPlaceholder,
  emptyMessage,
  className,
  pagination,
  showRowCount = false,
  globalFilter: globalFilterProp,
  onGlobalFilterChange: onGlobalFilterChangeProp,
  pageIndex: pageIndexProp,
  onPaginationChange: onPaginationChangeProp,
  pageCount,
  manualPagination,
  labels,
  onRowClick,
  rowClassName,
  loading = false,
  downloadable,
  sorting: sortingProp,
  onSortingChange: onSortingChangeProp,
  manualSorting,
}: DataTableProps<TData>) {
  const isGlobalFilterControlled = globalFilterProp !== undefined
  const isPaginationControlled = pageIndexProp !== undefined || onPaginationChangeProp !== undefined
  const isSortingControlled = sortingProp !== undefined

  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const sorting = isSortingControlled ? sortingProp : internalSorting
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

  const globalFilter = isGlobalFilterControlled ? globalFilterProp : internalGlobalFilter

  const paginationEnabled = pagination != null || manualPagination === true

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

  const handleSortingChange: OnChangeFn<SortingState> = React.useCallback(
    (updater) => {
      const next =
        typeof updater === "function"
          ? (updater as (old: SortingState) => SortingState)(sorting)
          : updater
      if (!isSortingControlled) {
        setInternalSorting(next)
      }
      onSortingChangeProp?.(next)
    },
    [isSortingControlled, onSortingChangeProp, sorting],
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
      manualSorting,
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
      handleGlobalFilterChange,
      handlePaginationChange,
      handleSortingChange,
      manualPagination,
      manualSorting,
      pageCount,
      searchableColumns,
      globalFilterFn,
    ],
  )

  const table = useReactTable(tableOptions)

  const mergedLabels: DataTableLabels = { ...defaultDataTableLabels, ...labels }
  const resolvedSearchPlaceholder = searchPlaceholder ?? mergedLabels.search
  const resolvedEmptyMessage = emptyMessage ?? mergedLabels.empty
  const rowCountFn = mergedLabels.rowCount

  const skeletonRowCount = pagination?.pageSize ?? 5
  const skeletonColumnCount = columns.length

  const hasSearch = !!(searchableColumns && searchableColumns.length > 0)
  const hasDownload = !!downloadable
  const downloadConfig: DataTableDownloadable<TData> | undefined =
    downloadable && typeof downloadable === "object" ? downloadable : undefined

  const defaultRowToRecord = React.useCallback(
    (row: TData, rowIndex: number): Record<string, unknown> => {
      const record: Record<string, unknown> = {}
      const leafCols = table.getVisibleLeafColumns()
      for (const col of leafCols) {
        const headerDef = col.columnDef.header
        const label = typeof headerDef === "string" && headerDef.length > 0 ? headerDef : col.id
        const def = col.columnDef as {
          accessorKey?: string
          accessorFn?: (row: TData, rowIndex: number) => unknown
        }
        // Resolve in priority order: explicit accessorKey > accessorFn (covers
        // computed/nested values) > fallback to col.id as a property.
        let rawValue: unknown
        if (def.accessorKey != null) {
          rawValue = (row as Record<string, unknown>)[def.accessorKey]
        } else if (typeof def.accessorFn === "function") {
          rawValue = def.accessorFn(row, rowIndex)
        } else {
          rawValue = (row as Record<string, unknown>)[col.id]
        }
        record[label] = rawValue ?? ""
      }
      return record
    },
    [table],
  )

  const handleExport = React.useCallback(
    async (scope: ExportScope) => {
      const rows: TData[] =
        scope === "filtered"
          ? table.getFilteredRowModel().rows.map((r) => r.original)
          : scope === "page"
            ? table.getRowModel().rows.map((r) => r.original)
            : data
      const mapper = downloadConfig?.rowToRecord ?? defaultRowToRecord
      const records = rows.map(mapper)
      await downloadXlsx(
        records,
        downloadConfig?.filename ?? "export.xlsx",
        downloadConfig?.sheetName ?? "Dados",
      )
    },
    [data, defaultRowToRecord, downloadConfig, table],
  )

  const renderDownloadMenu = () => {
    if (loading) {
      return (
        <div
          data-slot="data-table-download-skeleton"
          className="h-10 w-40 animate-pulse rounded-md bg-primary/10"
        />
      )
    }
    return (
      <Popover
        align="end"
        trigger={
          <Button
            type="button"
            variant="outline"
            disabled={data.length === 0}
            data-slot="data-table-download-trigger"
            className="gap-2"
          >
            <Download className="size-4" aria-hidden />
            {mergedLabels.exportTrigger}
          </Button>
        }
        className="w-56 p-1"
      >
        <div role="menu" className="flex flex-col">
          <button
            type="button"
            role="menuitem"
            data-slot="data-table-download-filtered"
            className="rounded-sm px-2 py-1.5 text-left text-sm transition-colors cursor-pointer hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              void handleExport("filtered")
            }}
          >
            {mergedLabels.exportFiltered}
          </button>
          <button
            type="button"
            role="menuitem"
            data-slot="data-table-download-page"
            className="rounded-sm px-2 py-1.5 text-left text-sm transition-colors cursor-pointer hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              void handleExport("page")
            }}
          >
            {mergedLabels.exportPage}
          </button>
          <button
            type="button"
            role="menuitem"
            data-slot="data-table-download-all"
            className="rounded-sm px-2 py-1.5 text-left text-sm transition-colors cursor-pointer hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              void handleExport("all")
            }}
          >
            {mergedLabels.exportAll}
          </button>
        </div>
      </Popover>
    )
  }

  return (
    <div
      className={cn("flex flex-col gap-3", className)}
      data-slot="data-table"
      aria-busy={loading || undefined}
    >
      {hasSearch || hasDownload ? (
        <div className="flex items-center justify-between gap-2">
          {hasSearch ? (
            loading ? (
              <div
                data-slot="data-table-search-skeleton"
                className="h-10 w-full max-w-sm animate-pulse rounded-md bg-primary/10"
              />
            ) : (
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
                  aria-label={mergedLabels.searchAriaLabel}
                />
              </div>
            )
          ) : (
            <span aria-hidden />
          )}
          {hasDownload ? renderDownloadMenu() : null}
        </div>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = sortableColumns?.includes(header.column.id) ?? false
                  const sorted = header.column.getIsSorted()
                  const ariaSort: "ascending" | "descending" | "none" =
                    sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"
                  const headerDef = header.column.columnDef.header
                  const headerText = typeof headerDef === "string" ? headerDef : header.id
                  const ariaLabel = mergedLabels.sortBy(headerText)
                  return (
                    <TableHead key={header.id} aria-sort={canSort ? ariaSort : undefined}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="-mx-2 inline-flex h-8 items-center gap-2 rounded-md px-2 text-left cursor-pointer transition-colors hover:bg-accent"
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
            {loading ? (
              <>
                <TableRow
                  aria-hidden="true"
                  className="sr-only"
                  data-slot="data-table-loading-announcer"
                >
                  <TableCell colSpan={table.getVisibleLeafColumns().length}>
                    {/* biome-ignore lint/a11y/useSemanticElements: <output> targets calculation results inside <form>; this is a generic loading announcement, role="status" is the right ARIA role. */}
                    <span role="status" className="sr-only">
                      {mergedLabels.loading}
                    </span>
                  </TableCell>
                </TableRow>
                {Array.from({ length: skeletonRowCount }).map((_, rowIdx) => (
                  <TableRow
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows are positional and identityless
                    key={`skeleton-${rowIdx}`}
                    data-slot="data-table-skeleton-row"
                  >
                    {Array.from({ length: skeletonColumnCount }).map((__, colIdx) => (
                      <TableCell
                        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton cells are positional
                        key={`skeleton-${rowIdx}-${colIdx}`}
                      >
                        <div
                          className={cn(
                            "h-5 animate-pulse rounded-md bg-primary/10",
                            SKELETON_CELL_WIDTHS[(rowIdx + colIdx) % SKELETON_CELL_WIDTHS.length],
                          )}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, index) => {
                const interactive = onRowClick != null
                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      interactive &&
                        "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:bg-muted/60",
                      rowClassName?.(row.original, index),
                    )}
                    role={interactive ? "button" : undefined}
                    tabIndex={interactive ? 0 : undefined}
                    onClick={interactive ? (e) => onRowClick?.(row.original, e) : undefined}
                    onKeyDown={
                      interactive
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              onRowClick?.(
                                row.original,
                                e as unknown as React.MouseEvent<HTMLTableRowElement>,
                              )
                            }
                          }
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {/* biome-ignore lint/a11y/useSemanticElements: <output> targets form calculation results; this is a generic "no results" announcement, role="status" is the right ARIA role. */}
                  <span role="status" aria-live="polite">
                    {resolvedEmptyMessage}
                  </span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {paginationEnabled || showRowCount ? (
        // Tight footer: `-mt-1` trims the parent `gap-3` to 8px, plus `pt-1`
        // gives the footer only 4px of internal top padding (was 12px). The
        // row count / pagination read as part of the table block instead of
        // floating below it; pb-3 keeps a normal bottom breath at the edge.
        <div className="-mt-1 flex items-center justify-between gap-2 px-3 pt-1 pb-3">
          {showRowCount ? (
            loading ? (
              <div className="h-4 w-32 animate-pulse rounded-md bg-primary/10" />
            ) : (
              <span className="text-xs text-muted-foreground">
                {rowCountFn(table.getFilteredRowModel().rows.length, data.length)}
              </span>
            )
          ) : (
            <span />
          )}
          {paginationEnabled ? (
            <div className="flex items-center gap-2">
              {loading ? (
                <div className="h-4 w-24 animate-pulse rounded-md bg-primary/10" />
              ) : (
                <span className="text-xs text-muted-foreground">
                  {mergedLabels.pageIndicator(
                    table.getState().pagination.pageIndex,
                    table.getPageCount(),
                  )}
                </span>
              )}
              <Button
                variant="outline"
                className="size-9 p-0"
                disabled={loading || !table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                aria-label={mergedLabels.paginationPrevious}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-9 p-0"
                disabled={loading || !table.getCanNextPage()}
                onClick={() => table.nextPage()}
                aria-label={mergedLabels.paginationNext}
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

DataTable.displayName = "DataTable"

export { DataTable }
