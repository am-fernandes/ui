"use client"

import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type SortingFn,
  type SortingState,
  type Table as TanstackTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, Download, FilterX, Search } from "lucide-react"
import * as React from "react"

import { compareText, matchesSearch } from "@/lib/text"
import { cn } from "@/lib/utils"
import { Pagination, type PaginationLabels } from "../navigation/pagination"
import { DropdownMenu } from "../overlays/dropdown-menu"
import { Button } from "../primitives/button"
import { Input } from "../primitives/input"
import { columnMeta, valueToText } from "./_internal/column-meta"
import {
  type ExportSheet,
  type ExportValue,
  downloadSheet,
  recordsToSheet,
  toExportValue,
} from "./_xlsx-export"

export type { DataTableColumnMeta } from "./_internal/column-meta"

// Internal Table primitives — inlined here (was src/data/table.tsx).
function Table({
  className,
  children,
  containerStyle,
  containerRef,
  ...props
}: React.HTMLAttributes<HTMLTableElement> & {
  containerStyle?: React.CSSProperties
  containerRef?: React.Ref<HTMLDivElement>
}) {
  return (
    // `isolate`: the sticky header (and pinned columns) stack among themselves,
    // never above the page's overlays.
    <div
      ref={containerRef}
      data-slot="data-table-scroll"
      className="relative isolate w-full overflow-auto"
      style={containerStyle}
    >
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
        "border-b transition-colors hover:state-hover data-[state=selected]:bg-accent data-[state=selected]:text-accent-foreground",
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
      scope="col"
      className={cn(
        "px-3 py-2.5 text-left align-middle font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}
function TableFooter({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
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
  /**
   * Visible label of the page-size select (when pageSizeOptions is set).
   * Doubles as the accessible name — the `<select>` is wrapped by a `<label>`
   * with this text, so screen readers and voice-control match what's visible.
   */
  pageSize: string
  /** Render the row-count line, given filtered + total counts. */
  rowCount: (filtered: number, total: number) => string
  /**
   * "Página X de Y". The footer now shows the page numbers of `Pagination`;
   * this names its compact indicator only.
   * @deprecated Use `pagination.pageOf`.
   */
  pageIndicator: (pageIndex: number, pageCount: number) => string
  /**
   * Any other text of the footer's `Pagination` ("Paginação", "Primeira
   * página", the "11–20 de 243" range…). `paginationPrevious`,
   * `paginationNext` and `pageSize` above name its controls.
   */
  pagination: Partial<PaginationLabels>
  /** Description of a sortable column's button ("Ordenar por Número"); its name is the header text. */
  sortBy: (headerText: string) => string
  /** Export-to-Excel trigger button label. */
  exportTrigger: string
  /** "Export filtered data" menu item label. */
  exportFiltered: string
  /** "Export current page" menu item label. */
  exportPage: string
  /** "Export all data" menu item label. */
  exportAll: string
  /** "Clear filters" toolbar button label. */
  clearFilters: string
  /** Message shown when an export fails (a fetcher rejects, the file cannot be written). */
  exportError: string
  /** Body text for `error={true}`. */
  error: string
  /** The button that calls `onRetry`. */
  retry: string
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
  pageSize: "Linhas por página",
  rowCount: defaultRowCount,
  pageIndicator: defaultPageIndicator,
  pagination: {},
  sortBy: (headerText) => `Ordenar por ${headerText}`,
  exportTrigger: "Exportar para Excel",
  exportFiltered: "Exportar dados filtrados",
  exportPage: "Exportar página atual",
  exportAll: "Exportar todos os dados",
  clearFilters: "Limpar filtros",
  exportError: "Não foi possível exportar os dados. Tente de novo.",
  error: "Não foi possível carregar os dados.",
  retry: "Tentar de novo",
}

export interface DataTableProps<TData>
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "aria-label" | "aria-labelledby" | "children"
  > {
  /** The root `<div>` (toolbar, table and footer). */
  ref?: React.Ref<HTMLDivElement>
  columns: ColumnDef<TData>[]
  data: TData[]
  /**
   * Shows the search box; the columns listed are the only ones searched. The
   * search ignores accents and case and compares the text the cell shows: a
   * column's `meta.searchText` (filled by `dateColumn` and `formattedColumn`)
   * or the value as a string. With a controlled `globalFilter` and no list,
   * every visible column is searched.
   */
  searchableColumns?: string[]
  /**
   * Whitelist of column ids (typically `accessorKey`) whose headers are sortable.
   * When omitted, **no** header is sortable. Mirrors the `searchableColumns`
   * opt-in pattern. Replaces the per-column `enableSorting` flag in the columnDef.
   *
   * Text sorts in Portuguese order (accents and case ignored, "Bloco 2" before
   * "Bloco 10"), numbers by value and dates by time. A column's own
   * `sortingFn` still wins.
   */
  sortableColumns?: string[]
  /** Placeholder for the search input. */
  searchPlaceholder?: string
  /**
   * Extra classes for the search input's wrapper. Use to override the
   * default `w-full max-w-sm` width when you want the search to align
   * with an external filter grid.
   *
   * Tip: pass `"w-full max-w-none"` to make it span all available space,
   * or `"max-w-[200px]"` to clamp to a specific cell width.
   */
  searchClassName?: string
  /** Render this when data + filters result in zero rows. */
  emptyMessage?: React.ReactNode
  /** Additional class on the outer wrapper. */
  className?: string
  /** Accessible name of the `<table>` ("Contratos"). Or use `aria-labelledby` / `caption`. */
  "aria-label"?: string
  /** Id of a visible heading that names the `<table>`. */
  "aria-labelledby"?: string
  /** A `<caption>` that names the table and is shown with it (below the rows). */
  caption?: React.ReactNode
  /**
   * Caps the table's height (`320`, `"50vh"`): the body scrolls inside the box
   * and, by default, the header stays in place (`stickyHeader`).
   */
  maxHeight?: number | string
  /**
   * Keeps the header visible while the body scrolls inside `maxHeight`.
   * Default: on when `maxHeight` is set.
   */
  stickyHeader?: boolean
  /**
   * Columns that stay in place while the table scrolls sideways, by id or
   * `accessorKey`: `{ left: ["numero", "cliente.nome"] }`. They move to the
   * left edge in the order given, with a line after the last one.
   */
  pinnedColumns?: { left?: string[] }
  /**
   * Row density. `"compact"` gives rows of about 36px (`py-2`) and a 32px
   * pager, for dense back-office lists; `"default"` keeps the library's
   * `py-2.5 px-3` rows (about 41px).
   * @default "default"
   */
  density?: "default" | "compact"
  /** Enable pagination. When set, footer shows previous/next + page indicator. Default: not paginated. */
  pagination?: {
    pageSize?: number
    /**
     * When provided, renders a "Linhas por página" select in the footer
     * (left of the page indicator). Selecting an option resets the cursor
     * to page 0 (atomically — both fields propagate in a single
     * `onPaginationChange` call so server-side consumers don't fetch the
     * wrong page). If `pagination.pageSize` is omitted, the initial size
     * defaults to `pageSizeOptions[0]`.
     * Example: `pageSizeOptions: [10, 20, 50, 100]`.
     */
    pageSizeOptions?: number[]
  }
  /** Show row count in the footer (e.g. `12 registros` or `5 de 12 registros` when filtered). Default `false`. */
  showRowCount?: boolean
  /** Controlled global filter value. */
  globalFilter?: string
  /** Controlled global filter change handler. */
  onGlobalFilterChange?: OnChangeFn<string>
  /**
   * Whether filtering is server-driven. When `true`, the table skips its
   * own client-side filtering pass — the row set you pass in `data` is
   * rendered as-is. Use this when you refetch on every keystroke and
   * don't want the visible page locally filtered first (which causes a
   * brief mismatch between filtered-local rows and the next server
   * response).
   */
  manualFiltering?: boolean
  /** Controlled page index (0-based). */
  pageIndex?: number
  /**
   * Called with the new `{ pageIndex, pageSize }` on every page or page-size
   * change. Without `pageIndex` it only listens: the table keeps its page.
   */
  onPaginationChange?: OnChangeFn<PaginationState>
  /**
   * Go back to the first page when the search, a filter or the sort changes.
   * A new `data` array with the same view keeps the page either way.
   * Default `true`, or `false` with `manualPagination` (the server owns it).
   */
  autoResetPage?: boolean
  /**
   * Number of pages on the server (`manualPagination`). Optional when
   * `rowCount` is given: the count then derives from it and the page size.
   * With neither, the total is unknown: no page count is shown and "next"
   * stays available.
   */
  pageCount?: number
  /**
   * Number of rows on the server, for `manualPagination` / `manualFiltering`:
   * `data` only holds the current page, so the footer shows this total
   * (`showRowCount`) and the page count derives from it when `pageCount` is
   * absent. Without it, server pagination shows no row count.
   */
  rowCount?: number
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
  /**
   * Makes every body row clickable. A click anywhere on the row calls it; the
   * keyboard and screen readers reach it through a real `<button>` that wraps
   * the first cell's content (named by that content), so Tab, Enter and Space
   * work and the row is still a row. A click or key press that starts in a
   * control inside the row (button, link, field, menu) belongs to that control
   * and never calls `onRowClick`. Keep the first cell free of controls: a
   * button cannot hold another one.
   */
  onRowClick?: (row: TData, event: React.MouseEvent<HTMLTableRowElement>) => void
  /**
   * A stable id for each row (its key in the database, not its position).
   * React keys the rows by it, so a row's state (a field typed in, an open
   * menu) stays with that row when the page, the sort or the data changes;
   * row selection is kept by it too. Default: the row's index in `data`.
   */
  getRowId?: (row: TData, index: number) => string
  /** Per-row className. Receives the row data and index; return undefined to skip. Useful for coloring rows by status. */
  rowClassName?: (row: TData, index: number) => string | undefined
  /**
   * When `true`, the body renders skeleton rows in place of data: as many as
   * the current page size (5 without pagination). The row count and the
   * export button skeleton-ize, the pager is unavailable, and `labels.loading`
   * is announced through the table's status region. `aria-busy` is set on
   * the wrapper.
   */
  loading?: boolean
  /**
   * The data failed to load. Shown in the body (as an alert) instead of the
   * rows or the empty message, so a failed request does not read as "Nenhum
   * resultado". `true` shows `labels.error`. Ignored while `loading`.
   */
  error?: React.ReactNode
  /** With `error`, renders a `labels.retry` ("Tentar de novo") button that calls it. */
  onRetry?: () => void
  /**
   * Render an "Exportar para Excel" ghost button on the right side of the toolbar.
   * Clicking opens a menu (`DropdownMenu`) with the scopes the table can fill (filtered, current page, all rows).
   * Pass `true` to enable with defaults or an object to customize filename / sheet
   * name / row mapping.
   */
  downloadable?: boolean | DataTableDownloadable<TData>
  /**
   * Render a "Limpar filtros" button on the toolbar (left of the export
   * button). The lib doesn't own the filter state, so the parent decides
   * what to reset in the callback.
   */
  onClearFilters?: () => void
  /** Disable the clear-filters button (e.g. when no filters are active). */
  clearFiltersDisabled?: boolean
  /** Extra classes for the clear-filters button (e.g. width override). */
  clearFiltersClassName?: string
  /** Extra classes for the export trigger button (e.g. width override). */
  downloadTriggerClassName?: string
}

export interface DataTableDownloadable<TData> {
  /**
   * Filename for the downloaded xlsx. Default `"export.xlsx"`. Pass a function to
   * derive the name from the export scope (e.g. reflect active filters or the
   * current page); returning a falsy value falls back to `"export.xlsx"`. The function
   * must not throw: an exception aborts the export. `.xlsx` is appended unless the name ends in a spreadsheet or CSV extension.
   *
   * A name ending in `.csv` gives a CSV written for the Brazilian Excel: UTF-8
   * with BOM, `;` between cells, decimal comma, dates as `dd/mm/aaaa`, and a
   * `'` in front of text starting with `=`, `+`, `-` or `@` (formula injection).
   */
  filename?: string | ((scope: ExportScope) => string)
  /** Sheet name inside the workbook. Default `"Dados"`. */
  sheetName?: string
  /**
   * Custom row → record mapping (one key per column of the file). Without it
   * the file has what the screen shows: one column per column with data, in
   * order, headed by its `header` text (or id), with the value its accessor
   * reads (nested keys and `accessorFn` included). Columns without data
   * (actions) are left out, `meta.exportOnly` columns are added, and a column
   * can set `meta.export` to `false` (left out) or to `(row, value) => value`.
   */
  rowToRecord?: (row: TData, rowIndex: number) => Record<string, unknown>
  /**
   * When the parent uses `manualPagination` / `manualFiltering`, the
   * `data` prop is only the current server page — exporting it ships
   * 10 of 22k rows, which is misleading. Pass `fetchAll` to load the
   * whole unfiltered server-side set just for export; the menu item
   * "Exportar todos os dados" will call it and stream the result into
   * the xlsx without touching the table state.
   *
   * Resolved rows go through the same `rowToRecord` mapping as the
   * regular export paths.
   */
  fetchAll?: () => Promise<TData[]>
  /**
   * Same idea as `fetchAll`, but for "Exportar dados filtrados" when
   * filtering is server-side. The consumer is responsible for forwarding
   * its current filters into the fetch. Omit when you only need the
   * "all" variant.
   */
  fetchFiltered?: () => Promise<TData[]>
  /**
   * Called when an export fails: a fetcher rejects, the file name function
   * throws or the file cannot be written. The table also shows
   * `labels.exportError` under the toolbar until the next export.
   */
  onExportError?: (error: unknown) => void
}

export type ExportScope = "filtered" | "page" | "all"

/** The leaf column definitions, inside groups too. */
function leafColumnDefs<TData>(columns: ColumnDef<TData>[]): ColumnDef<TData>[] {
  return columns.flatMap((def) => {
    const children = (def as { columns?: ColumnDef<TData>[] }).columns
    return children && children.length > 0 ? leafColumnDefs(children) : [def]
  })
}

/**
 * TanStack's id of a column: its `id`, or its `accessorKey` with dots as
 * underscores ("cliente.nome" is "cliente_nome"), or a string header.
 */
function columnDefId<TData>(def: ColumnDef<TData>): string | undefined {
  const { id, accessorKey, header } = def as { id?: string; accessorKey?: string; header?: unknown }
  if (id) return id
  if (accessorKey) return accessorKey.replace(/\./g, "_")
  return typeof header === "string" ? header : undefined
}

/** Leaf column ids for names given by id or by `accessorKey`, in the order given. */
function resolveColumnIds<TData>(columns: ColumnDef<TData>[], names?: readonly string[]): string[] {
  if (!names || names.length === 0) return []
  const leaves = leafColumnDefs(columns)
  return names.flatMap((name) => {
    const def = leaves.find(
      (leaf) =>
        columnDefId(leaf) === name || (leaf as { accessorKey?: string }).accessorKey === name,
    )
    const id = def ? columnDefId(def) : undefined
    return id ? [id] : []
  })
}

/**
 * Controls a cell can hold. A click (or the click a key press makes) that
 * starts in one of them belongs to that control, never to the row.
 */
const INTERACTIVE_IN_ROW = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "summary",
  "[contenteditable]:not([contenteditable='false'])",
  ...[
    "button",
    "link",
    "checkbox",
    "radio",
    "switch",
    "slider",
    "spinbutton",
    "combobox",
    "textbox",
    "searchbox",
    "option",
    "tab",
    "menu",
    "menuitem",
    "menuitemcheckbox",
    "menuitemradio",
    "dialog",
    "listbox",
  ].map((role) => `[role='${role}']`),
].join(",")

/**
 * Whether a click on a clickable row is the row's own: it lands in the row's
 * DOM (React also bubbles clicks from portals, such as a row's menu) and does
 * not start in a control inside the row, other than the row's action button.
 * A click that ends a text selection is not one either.
 */
function isOwnRowClick(event: React.MouseEvent<HTMLTableRowElement>): boolean {
  const row = event.currentTarget
  const target = event.target
  if (!(target instanceof Element) || !row.contains(target)) return false
  const control = target.closest(INTERACTIVE_IN_ROW)
  if (control && row.contains(control) && !control.hasAttribute("data-row-action")) return false
  const selection = typeof window !== "undefined" ? window.getSelection() : null
  if (
    selection &&
    !selection.isCollapsed &&
    selection.toString().trim() !== "" &&
    selection.anchorNode &&
    row.contains(selection.anchorNode)
  ) {
    return false
  }
  return true
}

/**
 * Default order of a sortable column: numbers by value, dates by time,
 * booleans false first, and text in Portuguese order (`compareText`: accents
 * and case ignored, "Bloco 2" before "Bloco 10"). Empty values come first.
 * A column's own `sortingFn` takes precedence.
 */
function compareCellValues(a: unknown, b: unknown): number {
  const aEmpty = a == null || a === ""
  const bEmpty = b == null || b === ""
  if (aEmpty || bEmpty) return aEmpty === bEmpty ? 0 : aEmpty ? -1 : 1
  if (typeof a === "number" && typeof b === "number") {
    if (Number.isNaN(a) || Number.isNaN(b)) return Number.isNaN(a) ? -1 : Number.isNaN(b) ? 1 : 0
    return a - b
  }
  if (typeof a === "bigint" && typeof b === "bigint") return a < b ? -1 : a > b ? 1 : 0
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b)
  return compareText(valueToText(a), valueToText(b))
}

function defaultSortingFn<TData>(rowA: Row<TData>, rowB: Row<TData>, columnId: string): number {
  return compareCellValues(rowA.getValue(columnId), rowB.getValue(columnId))
}

/** Width classes used to vary skeleton cell widths so rows don't look uniform. */
const SKELETON_CELL_WIDTHS = ["w-3/4", "w-1/2", "w-2/3", "w-5/6", "w-3/5"] as const

function DataTable<TData>({
  columns,
  data,
  searchableColumns,
  sortableColumns,
  searchPlaceholder,
  searchClassName,
  emptyMessage,
  className,
  "aria-label": ariaLabelProp,
  "aria-labelledby": ariaLabelledBy,
  caption,
  density = "default",
  maxHeight,
  stickyHeader,
  pinnedColumns,
  pagination,
  showRowCount = false,
  globalFilter: globalFilterProp,
  onGlobalFilterChange: onGlobalFilterChangeProp,
  pageIndex: pageIndexProp,
  onPaginationChange: onPaginationChangeProp,
  autoResetPage,
  pageCount,
  rowCount,
  manualPagination,
  labels,
  onRowClick,
  getRowId,
  rowClassName,
  loading = false,
  error,
  onRetry,
  downloadable,
  onClearFilters,
  clearFiltersDisabled,
  clearFiltersClassName,
  downloadTriggerClassName,
  sorting: sortingProp,
  onSortingChange: onSortingChangeProp,
  manualSorting,
  manualFiltering,
  ref,
  ...rootProps
}: DataTableProps<TData>) {
  const idBase = React.useId()
  const isGlobalFilterControlled = globalFilterProp !== undefined
  // The page is controlled by `pageIndex` alone: `onPaginationChange` without
  // it is a listener, and the table keeps moving through its own pages.
  const isPageIndexControlled = pageIndexProp !== undefined
  const isSortingControlled = sortingProp !== undefined

  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const sorting = isSortingControlled ? sortingProp : internalSorting
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState("")
  // When the consumer passes `pageSizeOptions` but no explicit `pageSize`,
  // default to the first option so the <select>'s value always matches an
  // <option> — avoids React's "value didn't match any option" warning and
  // the visually-unselected state. `?.[0]` returns undefined for empty arrays
  // so the trailing `?? 10` is the catch-all when neither field is set.
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>(() => ({
    pageIndex: pageIndexProp ?? 0,
    pageSize: pagination?.pageSize ?? pagination?.pageSizeOptions?.[0] ?? 10,
  }))

  // Keep pageSize in sync with prop (consumer may change it later).
  React.useEffect(() => {
    setInternalPagination((prev) => {
      const nextPageSize = pagination?.pageSize ?? prev.pageSize
      if (prev.pageSize === nextPageSize) return prev
      return { ...prev, pageSize: nextPageSize }
    })
  }, [pagination?.pageSize])

  const effectivePageIndex = isPageIndexControlled ? pageIndexProp : internalPagination.pageIndex
  const paginationState = React.useMemo<PaginationState>(
    () => ({ pageIndex: effectivePageIndex, pageSize: internalPagination.pageSize }),
    [effectivePageIndex, internalPagination.pageSize],
  )
  // The latest pagination, also between two changes of one event (the page
  // size select reports the size, then page 1): each change builds on it.
  const paginationRef = React.useRef(paginationState)
  paginationRef.current = paginationState

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
      const prev = paginationRef.current
      const next =
        typeof updater === "function"
          ? (updater as (old: PaginationState) => PaginationState)(prev)
          : updater
      if (next.pageIndex === prev.pageIndex && next.pageSize === prev.pageSize) return
      paginationRef.current = next
      // The size is always the table's; the index only while uncontrolled.
      setInternalPagination(next)
      onPaginationChangeProp?.(next)
    },
    [onPaginationChangeProp],
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

  // The search compares what the user sees, without accents or case: a
  // column's `meta.searchText` (dateColumn and formattedColumn fill it with
  // their formatted output) or the cell value as a string. TanStack calls the
  // filter once per searchable column and keeps the row if any column matches.
  const tableRef = React.useRef<TanstackTable<TData> | null>(null)
  const globalFilterFn = React.useCallback<FilterFn<TData>>((row, columnId, filterValue) => {
    const value = row.getValue(columnId)
    const meta = columnMeta<TData>(tableRef.current?.getColumn(columnId)?.columnDef.meta)
    const text = meta.searchText ? meta.searchText(row.original, value) : valueToText(value)
    return matchesSearch(text, String(filterValue ?? ""))
  }, [])

  // Which columns the search reads: the ones in `searchableColumns`, or every
  // visible column with data when the list is not given.
  const searchableSet = React.useMemo(
    () => (searchableColumns && searchableColumns.length > 0 ? new Set(searchableColumns) : null),
    [searchableColumns],
  )
  const getColumnCanGlobalFilter = React.useCallback(
    (column: Column<TData, unknown>) =>
      searchableSet ? searchableSet.has(column.id) : column.getIsVisible(),
    [searchableSet],
  )

  const pinnedLeftKey = pinnedColumns?.left?.join("\u0000") ?? ""
  // biome-ignore lint/correctness/useExhaustiveDependencies: the joined names are the change signal for the list.
  const pinnedLeftIds = React.useMemo(
    () => resolveColumnIds(columns, pinnedColumns?.left),
    [columns, pinnedLeftKey],
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
        // Columns flagged `meta.exportOnly: true` are removed from the
        // rendered table but kept in `getAllLeafColumns()` so the xlsx
        // export still includes them.
        columnPinning: { left: pinnedLeftIds, right: [] },
        columnVisibility: Object.fromEntries(
          columns
            .filter((col) => {
              const meta = (col as { meta?: { exportOnly?: boolean } }).meta
              return meta?.exportOnly === true
            })
            .map((col) => [
              ((col as { id?: string; accessorKey?: string }).id ??
                (col as { accessorKey?: string }).accessorKey ??
                "") as string,
              false,
            ])
            .filter(([id]) => id !== ""),
        ),
      },
      onSortingChange: handleSortingChange,
      manualSorting,
      defaultColumn: { sortingFn: defaultSortingFn as SortingFn<TData> },
      onColumnFiltersChange: setColumnFilters,
      onGlobalFilterChange: handleGlobalFilterChange,
      onPaginationChange: paginationEnabled ? handlePaginationChange : undefined,
      // The table decides when to go back to page 1 (see `autoResetPage`):
      // TanStack's own reset fires on every new `data` array.
      autoResetPageIndex: false,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      // Skip the client-side filter pass when the server is filtering.
      // Without this, typing in the search would briefly show locally
      // filtered rows from the current page before the next server
      // response arrives — a visible mismatch.
      ...(manualFiltering
        ? { manualFiltering: true }
        : { getFilteredRowModel: getFilteredRowModel() }),
      ...(paginationEnabled && !manualPagination
        ? { getPaginationRowModel: getPaginationRowModel() }
        : {}),
      // Server pagination: TanStack derives the page count from `rowCount`
      // when `pageCount` is absent; with neither, -1 means "unknown" (next
      // stays enabled, no count is shown).
      ...(manualPagination
        ? {
            manualPagination: true,
            pageCount: pageCount ?? (rowCount == null ? -1 : undefined),
            rowCount,
          }
        : {}),
      globalFilterFn,
      getColumnCanGlobalFilter,
      ...(getRowId ? { getRowId: (row: TData, index: number) => getRowId(row, index) } : {}),
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
      manualFiltering,
      pageCount,
      rowCount,
      globalFilterFn,
      getColumnCanGlobalFilter,
      getRowId,
      pinnedLeftIds,
    ],
  )

  const table = useReactTable(tableOptions)
  tableRef.current = table

  // Back to page 1 when what the rows are changes (search, filters, sort) —
  // not when a new `data` array arrives with the same view (a refetch, a
  // row edited). Server pagination owns its page unless asked.
  const shouldAutoResetPage = autoResetPage ?? !manualPagination
  const viewKey = React.useMemo(
    () => JSON.stringify([globalFilter, columnFilters, sorting]),
    [globalFilter, columnFilters, sorting],
  )
  const lastViewKey = React.useRef(viewKey)
  React.useLayoutEffect(() => {
    if (lastViewKey.current === viewKey) return
    lastViewKey.current = viewKey
    if (!paginationEnabled || !shouldAutoResetPage) return
    handlePaginationChange((prev) => ({ ...prev, pageIndex: 0 }))
  }, [viewKey, paginationEnabled, shouldAutoResetPage, handlePaginationChange])

  // A page that no longer exists (the data shrank) moves to the last one.
  const pageCountNow = table.getPageCount()
  React.useLayoutEffect(() => {
    if (!paginationEnabled || manualPagination) return
    const lastPage = Math.max(0, pageCountNow - 1)
    if (paginationState.pageIndex > lastPage) {
      handlePaginationChange((prev) => ({ ...prev, pageIndex: lastPage }))
    }
  }, [
    pageCountNow,
    paginationState.pageIndex,
    paginationEnabled,
    manualPagination,
    handlePaginationChange,
  ])

  const mergedLabels: DataTableLabels = { ...defaultDataTableLabels, ...labels }
  const resolvedSearchPlaceholder = searchPlaceholder ?? mergedLabels.search
  const resolvedEmptyMessage = emptyMessage ?? mergedLabels.empty
  const rowCountFn = mergedLabels.rowCount

  // Rows for the footer count. On the server (`manualPagination` /
  // `manualFiltering`) `data` is a page or the filtered set, and the total is
  // `rowCount`: unknown under server pagination when it is not given.
  const counts: { filtered: number; total: number } | null =
    manualPagination || manualFiltering
      ? rowCount != null
        ? { filtered: rowCount, total: rowCount }
        : manualPagination
          ? null
          : { filtered: data.length, total: data.length }
      : { filtered: table.getFilteredRowModel().rows.length, total: data.length }

  // What the pager knows about the total: the rows (client side, or
  // `rowCount`), the pages (`pageCount`), or nothing (cursor-like: next stays
  // available while the page is full).
  const pageTotals: { totalItems?: number; totalPages?: number; hasMore?: boolean } =
    manualPagination
      ? pageCount != null
        ? { totalPages: pageCount }
        : rowCount != null
          ? { totalItems: rowCount }
          : { hasMore: data.length >= paginationState.pageSize }
      : { totalItems: table.getPrePaginationRowModel().rows.length }

  // As many skeleton rows as the page the user is about to see.
  const skeletonRowCount = paginationEnabled ? paginationState.pageSize : 5
  const hasError = !loading && error != null && error !== false && error !== ""
  const statusText = loading
    ? mergedLabels.loading
    : !hasError && table.getRowModel().rows.length === 0 && typeof resolvedEmptyMessage === "string"
      ? resolvedEmptyMessage
      : ""
  // Alignment per leaf column: `meta.align`, or right for a formattedColumn
  // whose values are numbers (looked up in the first row that has one).
  const columnAlign = new Map<string, "left" | "center" | "right">()
  for (const column of table.getAllLeafColumns()) {
    const meta = columnMeta<TData>(column.columnDef.meta)
    if (meta.align) {
      columnAlign.set(column.id, meta.align)
    } else if (meta.alignNumbers) {
      const sample = table
        .getCoreRowModel()
        .rows.find((row) => row.getValue(column.id) != null)
        ?.getValue(column.id)
      if (typeof sample === "number" || typeof sample === "bigint") {
        columnAlign.set(column.id, "right")
      }
    }
  }
  const alignClass = (columnId: string) => {
    const align = columnAlign.get(columnId)
    return align === "right" ? "text-right" : align === "center" ? "text-center" : undefined
  }
  const isStickyHeader = stickyHeader ?? maxHeight != null
  const compact = density === "compact"
  // Compact: 20px line + 16px = 36px rows; headers keep room for the 32px sort button.
  const cellDensity = compact ? "py-2" : undefined
  const headDensity = compact ? "py-1" : undefined

  // Pinned columns stick at the sum of the widths before them. The widths are
  // the rendered ones (content decides them), measured after layout and again
  // whenever the table or a pinned header resizes.
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [pinOffsets, setPinOffsets] = React.useState<Record<string, number>>({})
  React.useLayoutEffect(() => {
    const tableElement = scrollRef.current?.querySelector("table")
    if (!tableElement || pinnedLeftIds.length === 0) {
      setPinOffsets((prev) => (Object.keys(prev).length === 0 ? prev : {}))
      return
    }
    const headerFor = (id: string) =>
      tableElement.querySelector<HTMLElement>(
        `thead tr:last-child th[data-column-id="${CSS.escape(id)}"]`,
      )
    const measure = () => {
      const next: Record<string, number> = {}
      let left = 0
      for (const id of pinnedLeftIds) {
        next[id] = left
        left += headerFor(id)?.getBoundingClientRect().width ?? 0
      }
      setPinOffsets((prev) =>
        pinnedLeftIds.every((id) => prev[id] === next[id]) &&
        Object.keys(prev).length === pinnedLeftIds.length
          ? prev
          : next,
      )
    }
    measure()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    observer.observe(tableElement)
    for (const id of pinnedLeftIds) {
      const header = headerFor(id)
      if (header) observer.observe(header)
    }
    return () => observer.disconnect()
  }, [pinnedLeftIds])
  const lastPinnedId = pinnedLeftIds.at(-1)
  /** Sticky placement of a pinned column's cell; nothing for the others. */
  const pinFor = (
    columnId: string,
    surface: "head" | "body" | "foot",
  ): { className?: string; style?: React.CSSProperties; "data-pinned"?: "left" } => {
    if (!pinnedLeftIds.includes(columnId)) return {}
    return {
      "data-pinned": "left",
      style: { left: pinOffsets[columnId] ?? 0 },
      className: cn(
        // On one line: a pinned block that wraps grows tall and narrow.
        "sticky z-[1] whitespace-nowrap",
        // Opaque, or the scrolled cells would show through. A body cell takes
        // its row's colour (hover, selected, rowClassName); the row is
        // `bg-card` underneath so there is always one.
        surface === "head" && "bg-card",
        surface === "body" && "bg-inherit [tr:hover>&]:state-hover",
        surface === "foot" && "bg-card bg-linear-to-r from-muted/50 to-muted/50",
        // The edge of the pinned block: drawn by the cell, since a collapsed
        // border would stay behind while scrolling.
        columnId === lastPinnedId &&
          "after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border",
      ),
    }
  }
  /** The leaf column a header (or its placeholder) stands for. */
  const leafIdOf = (header: {
    column: { id: string }
    getLeafHeaders: () => { column: { id: string } }[]
  }) => header.getLeafHeaders()[0]?.column.id ?? header.column.id
  const orderedLeafColumns = [
    ...table.getLeftVisibleLeafColumns(),
    ...table.getCenterVisibleLeafColumns(),
  ]

  // Totals and other footers: `columnDef.footer` of any column.
  const hasFooter = table.getAllFlatColumns().some((column) => column.columnDef.footer != null)

  const hasSearch = !!(searchableColumns && searchableColumns.length > 0)
  const hasDownload = !!downloadable
  const hasClearFilters = typeof onClearFilters === "function"
  const downloadConfig: DataTableDownloadable<TData> | undefined =
    downloadable && typeof downloadable === "object" ? downloadable : undefined

  const [exportingScope, setExportingScope] = React.useState<ExportScope | null>(null)
  const [exportFailed, setExportFailed] = React.useState(false)

  /**
   * The file for some rows. Without `rowToRecord`, what the screen shows:
   * every leaf column with data (plus `meta.exportOnly` ones), in order, with
   * the value its accessor reads; `meta.export` leaves a column out (`false`)
   * or gives its value. Headers repeat as they are on screen.
   */
  const buildExportSheet = React.useCallback(
    (rows: { original: TData; index: number }[]): ExportSheet => {
      const rowToRecord = downloadConfig?.rowToRecord
      if (rowToRecord)
        return recordsToSheet(rows.map((row) => rowToRecord(row.original, row.index)))
      const exportColumns = table.getAllLeafColumns().flatMap((column) => {
        const meta = columnMeta<TData>(column.columnDef.meta)
        if (meta.export === false) return []
        const custom = typeof meta.export === "function" ? meta.export : undefined
        const accessor = column.accessorFn
        if (!accessor && !custom) return []
        const header = column.columnDef.header
        return [
          {
            header: typeof header === "string" && header.length > 0 ? header : column.id,
            value: (row: TData, index: number): ExportValue => {
              const value = accessor ? accessor(row, index) : undefined
              return toExportValue(custom ? custom(row, value) : value)
            },
          },
        ]
      })
      return {
        headers: exportColumns.map((column) => column.header),
        rows: rows.map((row) =>
          exportColumns.map((column) => column.value(row.original, row.index)),
        ),
      }
    },
    [downloadConfig, table],
  )

  const handleExport = React.useCallback(
    async (scope: ExportScope) => {
      // When the parent runs paginated/filtered on the server, the table only
      // holds the current page in `data`: the consumer's fetchers bring the
      // full server set. "filtered" keeps the current sort (the pre-pagination
      // model is filtered and sorted).
      const fromFetch = (rows: TData[]) => rows.map((original, index) => ({ original, index }))
      let rows: { original: TData; index: number }[]
      if (scope === "all" && downloadConfig?.fetchAll) {
        rows = fromFetch(await downloadConfig.fetchAll())
      } else if (scope === "filtered" && downloadConfig?.fetchFiltered) {
        rows = fromFetch(await downloadConfig.fetchFiltered())
      } else if (scope === "filtered") {
        rows = table.getPrePaginationRowModel().rows
      } else if (scope === "page") {
        rows = table.getRowModel().rows
      } else {
        rows = fromFetch(data)
      }
      const filename =
        typeof downloadConfig?.filename === "function"
          ? downloadConfig.filename(scope)
          : downloadConfig?.filename
      await downloadSheet(
        buildExportSheet(rows),
        filename || "export.xlsx",
        downloadConfig?.sheetName ?? "Dados",
      )
    },
    [buildExportSheet, data, downloadConfig, table],
  )

  // Only the scopes the table can fill. With server pagination `data` is one
  // page: "filtered" and "all" need their fetcher, or they would export that
  // page under the wrong name. With server filtering only, `data` is the
  // filtered set: "filtered" is it, "all" needs `fetchAll`.
  const exportScopes: ExportScope[] = (["filtered", "page", "all"] as const).filter((scope) => {
    if (scope === "filtered") return !manualPagination || downloadConfig?.fetchFiltered != null
    if (scope === "all") {
      return (!manualPagination && !manualFiltering) || downloadConfig?.fetchAll != null
    }
    return true
  })
  const scopeLabels: Record<ExportScope, string> = {
    filtered: mergedLabels.exportFiltered,
    page: mergedLabels.exportPage,
    all: mergedLabels.exportAll,
  }

  const runExport = React.useCallback(
    async (scope: ExportScope) => {
      setExportingScope(scope)
      setExportFailed(false)
      try {
        await handleExport(scope)
      } catch (error) {
        // Never silent: the consumer hears about it and the user sees it.
        setExportFailed(true)
        downloadConfig?.onExportError?.(error)
      } finally {
        setExportingScope(null)
      }
    },
    [downloadConfig, handleExport],
  )
  const renderDownloadMenu = () => {
    if (loading) {
      return (
        <div
          data-slot="data-table-download-skeleton"
          className={cn(
            "h-10 w-40 animate-pulse rounded-element bg-primary/10",
            downloadTriggerClassName,
          )}
        />
      )
    }
    // The library's menu: arrows, Home/End, typeahead, Escape back to the
    // trigger. While a file is being made the trigger is busy (`loading`,
    // aria-disabled), so the focus Radix hands back to it stays there.
    return (
      <DropdownMenu
        align="end"
        className="w-56"
        trigger={
          <Button
            type="button"
            variant="outline"
            disabled={data.length === 0}
            loading={exportingScope !== null}
            data-slot="data-table-download-trigger"
            className={cn("gap-2", downloadTriggerClassName)}
          >
            {exportingScope === null && <Download className="size-4" aria-hidden />}
            {mergedLabels.exportTrigger}
          </Button>
        }
        items={exportScopes.map((scope) => ({
          id: scope,
          label: scopeLabels[scope],
          onSelect: () => {
            void runExport(scope)
          },
        }))}
      />
    )
  }

  return (
    <div
      {...rootProps}
      ref={ref}
      className={cn("flex flex-col gap-3", className)}
      data-slot="data-table"
      data-density={density}
      aria-busy={loading || rootProps["aria-busy"] || undefined}
    >
      {hasSearch || hasDownload || hasClearFilters ? (
        <div className="flex items-center justify-between gap-2">
          {hasSearch ? (
            // Always-mounted input. Previously the loading state swapped the
            // input for a skeleton div, which made React unmount + remount the
            // <Input> and the user's keyboard focus jumped out every time the
            // debounce fired. Now we keep the input stable and pulse the
            // search icon as a subtle loading cue — the table body skeleton
            // below already communicates "fetching".
            <div
              data-slot="data-table-search"
              data-loading={loading || undefined}
              className={cn("relative w-full max-w-sm", searchClassName)}
            >
              <Search
                className={cn(
                  "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
                  loading && "animate-pulse",
                )}
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
          ) : (
            <span aria-hidden />
          )}
          <div className="flex items-center gap-2">
            {hasClearFilters ? (
              <Button
                type="button"
                // Outline when no filters are active (subtle, idle), destructive
                // when there's actually something to clear (draws attention to
                // the "undo your filtered view" affordance without using red
                // permanently — which would dilute its meaning).
                variant={clearFiltersDisabled ? "outline" : "destructive"}
                disabled={loading || clearFiltersDisabled}
                onClick={onClearFilters}
                data-slot="data-table-clear-filters"
                className={cn("gap-2", clearFiltersClassName)}
              >
                <FilterX className="size-4" aria-hidden />
                {mergedLabels.clearFilters}
              </Button>
            ) : null}
            {hasDownload ? renderDownloadMenu() : null}
          </div>
        </div>
      ) : null}

      {/* One live region for the table, in the DOM from the start: it is the
          change of its text that screen readers announce (loading, or a search
          that empties the table). A custom ReactNode empty message speaks for
          itself (see EmptyState's `announce`). */}
      {/* biome-ignore lint/a11y/useSemanticElements: <output> is for form results; this is a status message. */}
      <div role="status" data-slot="data-table-status" className="sr-only">
        {statusText}
      </div>

      {exportFailed ? (
        <p
          data-slot="data-table-export-error"
          role="alert"
          className="text-sm text-destructive-text"
        >
          {mergedLabels.exportError}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-container border border-border-strong bg-card">
        <Table
          aria-label={ariaLabelProp}
          aria-labelledby={ariaLabelledBy}
          containerStyle={maxHeight != null ? { maxHeight } : undefined}
          containerRef={scrollRef}
        >
          {caption != null ? (
            <caption
              data-slot="data-table-caption"
              className="px-3 py-2.5 text-left text-sm text-muted-foreground"
            >
              {caption}
            </caption>
          ) : null}
          <TableHeader
            className={cn(
              isStickyHeader &&
                // A collapsed border does not travel with a sticky header: each
                // th draws the line itself, in the border colour.
                "sticky top-0 z-10 bg-card [&_tr]:border-b-0 [&_th]:relative [&_th]:after:pointer-events-none [&_th]:after:absolute [&_th]:after:inset-x-0 [&_th]:after:bottom-0 [&_th]:after:h-px [&_th]:after:bg-border",
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  // Only a leaf header sorts: a group header ("Cliente" over two
                  // columns) and the empty cell above a plain column do not.
                  const isLeafHeader = !header.isPlaceholder && header.subHeaders.length === 0
                  const canSort =
                    isLeafHeader && (sortableColumns?.includes(header.column.id) ?? false)
                  const sorted = header.column.getIsSorted()
                  const ariaSort: "ascending" | "descending" | "none" =
                    sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"
                  const headerDef = header.column.columnDef.header
                  const headerText = typeof headerDef === "string" ? headerDef : header.id
                  // The button is named by what it shows, so the column header
                  // reads "Número", not "Ordenar por Número", on every cell;
                  // the action is its description (a hidden node is still read
                  // as a description, and stays out of the header's name).
                  const sortHintId = `${idBase}-sort-${header.id}`
                  const pin = pinFor(leafIdOf(header), "head")
                  return (
                    <TableHead
                      key={header.id}
                      data-column-id={isLeafHeader ? header.column.id : undefined}
                      data-pinned={pin["data-pinned"]}
                      style={pin.style}
                      className={cn(
                        headDensity,
                        isLeafHeader && alignClass(header.column.id),
                        pin.className,
                      )}
                      colSpan={header.colSpan > 1 ? header.colSpan : undefined}
                      scope={header.colSpan > 1 ? "colgroup" : "col"}
                      aria-sort={canSort ? ariaSort : undefined}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="-mx-2 inline-flex h-8 items-center gap-2 rounded-element px-2 text-left cursor-pointer transition-colors state-layer focus-visible:focus-outline-inset"
                          aria-describedby={sortHintId}
                        >
                          <span id={sortHintId} hidden>
                            {mergedLabels.sortBy(headerText)}
                          </span>
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
                {Array.from({ length: skeletonRowCount }).map((_, rowIdx) => (
                  <TableRow
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows are positional and identityless
                    key={`skeleton-${rowIdx}`}
                    data-slot="data-table-skeleton-row"
                  >
                    {orderedLeafColumns.map((column, colIdx) => (
                      <TableCell
                        key={`skeleton-${rowIdx}-${column.id}`}
                        {...pinFor(column.id, "body")}
                        className={cn(cellDensity, pinFor(column.id, "body").className)}
                      >
                        <div
                          className={cn(
                            "h-5 animate-pulse rounded-inner bg-primary/10",
                            SKELETON_CELL_WIDTHS[(rowIdx + colIdx) % SKELETON_CELL_WIDTHS.length],
                          )}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : hasError ? (
              <TableRow data-slot="data-table-error-row">
                <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-24">
                  <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <div
                      role="alert"
                      data-slot="data-table-error"
                      className="text-destructive-text"
                    >
                      {error === true ? mergedLabels.error : error}
                    </div>
                    {onRetry ? (
                      <Button type="button" variant="outline" onClick={onRetry}>
                        {mergedLabels.retry}
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, index) => {
                const interactive = onRowClick != null
                return (
                  // The row stays a row (a `role="button"` would flatten it and
                  // its cells into one button). Mouse users click anywhere on
                  // it; keyboard and assistive tech reach the same action
                  // through the real button in the first cell.
                  <TableRow
                    key={row.id}
                    className={cn(
                      pinnedLeftIds.length > 0 && "bg-card",
                      interactive &&
                        "cursor-pointer has-[[data-row-action]:focus-visible]:state-hover",
                      rowClassName?.(row.original, index),
                    )}
                    onClick={
                      interactive
                        ? (event) => {
                            if (isOwnRowClick(event)) onRowClick(row.original, event)
                          }
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => {
                      const content = flexRender(cell.column.columnDef.cell, cell.getContext())
                      const pin = pinFor(cell.column.id, "body")
                      return (
                        <TableCell
                          key={cell.id}
                          data-pinned={pin["data-pinned"]}
                          style={pin.style}
                          className={cn(cellDensity, alignClass(cell.column.id), pin.className)}
                        >
                          {interactive && cellIndex === 0 ? (
                            <button
                              type="button"
                              data-slot="data-table-row-action"
                              data-row-action=""
                              className="-mx-1 cursor-pointer rounded-inner px-1 text-left focus-visible:focus-outline"
                            >
                              {content}
                            </button>
                          ) : (
                            content
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
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
          {hasFooter && !loading && !hasError ? (
            <TableFooter>
              {table
                .getFooterGroups()
                .filter((group) =>
                  group.headers.some(
                    (header) => !header.isPlaceholder && header.column.columnDef.footer != null,
                  ),
                )
                .map((group) => (
                  <tr key={group.id} data-slot="table-footer-row" className="border-b">
                    {group.headers.map((header) => (
                      <TableCell
                        key={header.id}
                        {...pinFor(leafIdOf(header), "foot")}
                        className={cn(
                          cellDensity,
                          header.subHeaders.length === 0 && alignClass(header.column.id),
                          pinFor(leafIdOf(header), "foot").className,
                        )}
                        colSpan={header.colSpan > 1 ? header.colSpan : undefined}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.footer, header.getContext())}
                      </TableCell>
                    ))}
                  </tr>
                ))}
            </TableFooter>
          ) : null}
        </Table>
      </div>

      {paginationEnabled || showRowCount ? (
        // Tight footer: `-mt-1` trims the parent `gap-3` to 8px, plus `pt-1`
        // gives the footer only 4px of internal top padding (was 12px). The
        // row count / pagination read as part of the table block instead of
        // floating below it; pb-3 keeps a normal bottom breath at the edge.
        <div className="-mt-1 flex items-center justify-between gap-2 px-3 pt-1 pb-3">
          {showRowCount && counts !== null ? (
            loading ? (
              <div className="h-4 w-32 animate-pulse rounded-inner bg-primary/10" />
            ) : (
              <span className="text-xs text-muted-foreground">
                {rowCountFn(counts.filtered, counts.total)}
              </span>
            )
          ) : (
            <span />
          )}
          {paginationEnabled ? (
            <Pagination
              page={paginationState.pageIndex + 1}
              onPageChange={(page) =>
                handlePaginationChange((prev) => ({ ...prev, pageIndex: page - 1 }))
              }
              {...pageTotals}
              pageSize={paginationState.pageSize}
              pageSizeOptions={pagination?.pageSizeOptions}
              onPageSizeChange={(size) => {
                if (!Number.isFinite(size) || size <= 0) return
                // One change, page and size together, so a server consumer
                // never fetches page N of the new size. Pagination's own
                // "back to page 1" that follows is then a no-op.
                handlePaginationChange({ pageIndex: 0, pageSize: size })
              }}
              disabled={loading}
              size={compact ? "sm" : "md"}
              labels={{
                previous: mergedLabels.paginationPrevious,
                next: mergedLabels.paginationNext,
                pageSize: mergedLabels.pageSize,
                pageOf: (page, total) => mergedLabels.pageIndicator(page - 1, total),
                ...mergedLabels.pagination,
              }}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

DataTable.displayName = "DataTable"

export { DataTable }
