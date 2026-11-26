<!-- Gerado por `bun run skill:api` a partir de src/. Não edite à mão: o teste scripts/lib/skill-api.test.ts falha se este arquivo e o código divergirem. -->

# API: Exibição de dados

## `data/bar-chart` — `@amfernandesinc/ui/bar-chart`

### BarChart

`import { BarChart } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/bar-chart"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `data` | `T[]` | **obrigatória** | One record per category. |
| `category` | `keyof T & string` | **obrigatória** | Key of the category (the bar's name) in each record. |
| `series` | `ChartSeries[]` | **obrigatória** | Up to six series; each takes `--chart-1`, `--chart-2`… in order. |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | `"horizontal"` for long category names. |
| `stacked` | `boolean` | `false` | Stacks the series in one bar per category (negatives stack down). |
| `formatValue` | `(value: number) => string` | `formatNumber` | Format of values in the tooltip and table (money, units). Axis ticks stay compact. |
| `height` | `number` | `280 (vertical), or 36px per category (horizontal)` | Height of the plot with its axes, in px. |
| `title` | `string` | **obrigatória** | The chart's accessible name, shown above it. |
| `description` | `React.ReactNode` | — | — |
| `showTable` | `boolean` | `false` | Shows the table of values under the chart (it is always there for screen readers). |
| `labels` | `Partial<ChartLabels>` | — | — |
| `emptyMessage` | `React.ReactNode` | — | Shown instead of the plot when there is no data. Defaults to `labels.empty`. |
| `loading` | `boolean` | `false` | — |
| `id` | `string` | — | — |
| `className` | `string` | — | — |

### defaultChartLabels

`import { defaultChartLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/bar-chart"`

```ts
const defaultChartLabels: ChartLabels = {
  keyboardHint: "Use as setas para percorrer os valores.",
  empty: "Sem dados para exibir.",
  loading: "Carregando gráfico…",
  category: "Categoria",
  legend: "Séries",
  missing: "—",
}
```

### BarChartProps

`import type { BarChartProps } from "@amfernandesinc/ui"`

```ts
export interface BarChartProps<T extends Record<string, unknown> = Record<string, unknown>> {
  /** One record per category. */
  data: T[]
  /** Key of the category (the bar's name) in each record. */
  category: keyof T & string
  /** Up to six series; each takes `--chart-1`, `--chart-2`… in order. */
  series: ChartSeries[]
  /** `"horizontal"` for long category names. @default "vertical" */
  orientation?: "vertical" | "horizontal"
  /** Stacks the series in one bar per category (negatives stack down). */
  stacked?: boolean
  /** Format of values in the tooltip and table (money, units). Axis ticks stay compact. */
  formatValue?: (value: number) => string
  /**
   * Height of the plot with its axes, in px. @default 280 (vertical), or 36px
   * per category (horizontal)
   */
  height?: number
  /** The chart's accessible name, shown above it. */
  title: string
  description?: React.ReactNode
  /** Shows the table of values under the chart (it is always there for screen readers). */
  showTable?: boolean
  labels?: Partial<ChartLabels>
  /** Shown instead of the plot when there is no data. Defaults to `labels.empty`. */
  emptyMessage?: React.ReactNode
  loading?: boolean
  id?: string
  className?: string
}
```

### ChartLabels

`import type { ChartLabels } from "@amfernandesinc/ui"`

```ts
export interface ChartLabels {
  /** Said after the chart's name when it takes focus. */
  keyboardHint: string
  /** Shown when there is no data. */
  empty: string
  /** Said while `loading`. */
  loading: string
  /** Header of the first column of the table view. */
  category: string
  /** Name of the legend (a group of buttons that show and hide series). */
  legend: string
  /** A missing value, in the tooltip and the table. */
  missing: string
}
```

### ChartSeries

`import type { ChartSeries } from "@amfernandesinc/ui"`

```ts
export interface ChartSeries {
  /** Key of the values in each data record. */
  key: string
  /** Name in the legend, tooltip and table. */
  label: string
  /**
   * Pins the series to `--chart-N` (1–6). Without it, series take the colours
   * in order. Pin when the list of series changes between renders, so a
   * series keeps its colour.
   */
  color?: 1 | 2 | 3 | 4 | 5 | 6
}
```

## `data/card` — `@amfernandesinc/ui/card`

### Card

`import { Card } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/card"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `title` | `React.ReactNode` | — | — |
| `description` | `React.ReactNode` | — | — |
| `headerAction` | `React.ReactNode` | — | — |
| `footer` | `React.ReactNode` | — | — |
| `padding` | `"default" \| "compact" \| "none"` | `"default"` | Space around the content. `"compact"` for dense dashboards; `"none"` when the content brings its own edges (a DataTable, a list, a chart that should touch the border). Header and footer keep their padding. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `3` | Level of the title's heading, to fit the page outline. |
| `ref` | `React.Ref<HTMLDivElement>` | — | — |

Repassa também: atributos HTML do React (`HTMLAttributes`).

### CardProps

`import type { CardProps } from "@amfernandesinc/ui"`

```ts
export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
  headerAction?: React.ReactNode
  footer?: React.ReactNode
  /**
   * Space around the content. `"compact"` for dense dashboards; `"none"`
   * when the content brings its own edges (a DataTable, a list, a chart that
   * should touch the border). Header and footer keep their padding.
   * @default "default"
   */
  padding?: "default" | "compact" | "none"
  /** Level of the title's heading, to fit the page outline. @default 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  ref?: React.Ref<HTMLDivElement>
}
```

## `data/columns` — `@amfernandesinc/ui/columns`

### dateColumn

`import { dateColumn } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/columns"`

Column helper for date / datetime fields. - Formats values as `dd/MM/yyyy` (date) or `dd/MM/yyyy HH:mm` (datetime), instants in `timeZone` (São Paulo by default); a date-only value is always its own calendar day. - Sorting compares instants, so it is chronological even when the value is a Brazilian string. - The search reads the formatted text and the export writes a real date (the day and time the cell shows). Accepted value types: `Date`, ISO string (`"2026-05-19"` / `"2026-05-19T14:30:00Z"` / `"2026-05-19T14:30"`), BR string (`"19/05/2026"` / `"19/05/2026 14:30"`), epoch millis (number), `null`, `""`.

```ts
dateColumn<TData>(opts: DateColumnOptions<TData>): ColumnDef<TData>
```

### formattedColumn

`import { formattedColumn } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/columns"`

Column helper that decouples the display format from the underlying value.

```ts
formattedColumn<TData, TValue = unknown>(opts: FormattedColumnOptions<TData, TValue>): ColumnDef<TData>
```

### DateColumnOptions

`import type { DateColumnOptions } from "@amfernandesinc/ui"`

```ts
export type DateColumnOptions<TData> = DateColumnAccessor<TData> & {
  header: string | (() => React.ReactNode)
  /**
   * Whether to render the time portion (`HH:mm`).
   * - `"auto"` (default): hides the time of a date-only value (`YYYY-MM-DD`,
   *   `DD/MM/YYYY`) and of an instant at midnight in the time zone.
   * - `true`: always renders date + time.
   * - `false`: always renders date only.
   */
  showTime?: DateColumnShowTime
  /**
   * Time zone in which instants (a `Date`, epoch millis, ISO with `Z` or an
   * offset) are shown, sorted by day and exported. A date-only value never
   * moves a day, whatever the zone. Pass `"UTC"` for dates stored as
   * midnight UTC (`"2026-05-19T00:00:00.000Z"`).
   * @default "America/Sao_Paulo"
   */
  timeZone?: string
  /** Extra class on the cell `<span>`. */
  className?: string
  /** Placeholder text when the value is empty or unparseable. Defaults to "". */
  emptyText?: string
}
```

### DateColumnShowTime

`import type { DateColumnShowTime } from "@amfernandesinc/ui"`

```ts
export type DateColumnShowTime = boolean | "auto"
```

### FormattedColumnOptions

`import type { FormattedColumnOptions } from "@amfernandesinc/ui"`

```ts
export type FormattedColumnOptions<TData, TValue = unknown> = FormattedColumnAccessor<
  TData,
  TValue
> & {
  header: ColumnDef<TData>["header"]
  /**
   * Format the cell's display. Receives the raw value plus the full row, so
   * you can synthesize labels from sibling fields (e.g. `formatPhone(value)`,
   * `formatBRL(value)`, `\`${row.firstName} ${row.lastName}\``).
   *
   * The search compares this output when it is text (so "123.456" finds
   * "123.456.789-01"); the xlsx export and the sort use the raw value.
   * Optional; omit to render the raw value.
   */
  format?: (value: TValue, row: TData) => React.ReactNode
  /** Extra class on the wrapping `<span>`. Omit and we render the value bare. */
  className?: string
  /** Render this string when the raw value is `null`, `undefined`, or `""`. */
  emptyText?: string
  enableSorting?: boolean
  /** Custom sort. Defaults to TanStack's automatic comparator on the raw value. */
  sortingFn?: ColumnDef<TData>["sortingFn"]
  /**
   * Alignment of the header, cells and footer. Default: right when the column
   * holds numbers (money, quantities, percentages), left otherwise.
   */
  align?: "left" | "center" | "right"
  /**
   * Cap the displayed text length and show the full string in a tooltip
   * on hover. Only kicks in when the formatted value is a string longer
   * than `truncate.max`.
   */
  truncate?: TruncateOption
}
```

### TruncateOption

`import type { TruncateOption } from "@amfernandesinc/ui"`

Cap displayed text length; the full text shows on hover, on keyboard focus (the clipped text is a tab stop) and on a tap, and screen readers read it whole. Only applies when the formatted output is a string longer than `max`.

```ts
export interface TruncateOption {
  /** Max characters before clipping with "…" and showing a tooltip. */
  max: number
  /** Tooltip side. Defaults to `"bottom"`. */
  side?: TooltipProps["side"]
  /** Tooltip alignment along its side. */
  align?: TooltipProps["align"]
}
```

## `data/data-table` — `@amfernandesinc/ui/data-table`

### DataTable

`import { DataTable } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/data-table"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `ref` | `React.Ref<HTMLDivElement>` | — | The root `<div>` (toolbar, table and footer). |
| `columns` | `ColumnDef<TData>[]` | **obrigatória** | — |
| `data` | `TData[]` | **obrigatória** | — |
| `searchableColumns` | `DataTableColumnKey<TData>[]` | — | Shows the search box; the columns listed are the only ones searched. The search ignores accents and case and compares the text the cell shows: a column's `meta.searchText` (filled by `dateColumn` and `formattedColumn`) or the value as a string. With a controlled `globalFilter` and no list, every visible column is searched. Entries are column ids: a column's `id`, or its `accessorKey` (nested keys as written, `"cliente.nome"`, or as TanStack's id, `"cliente_nome"`). |
| `sortableColumns` | `DataTableColumnKey<TData>[]` | — | Whitelist of column ids (typically `accessorKey`) whose headers are sortable. When omitted, **no** header is sortable. Mirrors the `searchableColumns` opt-in pattern. Replaces the per-column `enableSorting` flag in the columnDef. Text sorts in Portuguese order (accents and case ignored, "Bloco 2" before "Bloco 10"), numbers by value and dates by time. A column's own `sortingFn` still wins. Entries are column ids, as in `searchableColumns`. |
| `searchPlaceholder` | `string` | — | Placeholder for the search input. |
| `searchClassName` | `string` | — | Extra classes for the search input's wrapper. Use to override the default `w-full max-w-sm` width when you want the search to align with an external filter grid. Tip: pass `"w-full max-w-none"` to make it span all available space, or `"max-w-[200px]"` to clamp to a specific cell width. |
| `emptyMessage` | `React.ReactNode` | — | Render this when data + filters result in zero rows. |
| `className` | `string` | — | Additional class on the outer wrapper. |
| `aria-label` | `string` | — | Accessible name of the `<table>` ("Contratos"). Or use `aria-labelledby` / `caption`. |
| `aria-labelledby` | `string` | — | Id of a visible heading that names the `<table>`. |
| `caption` | `React.ReactNode` | — | A `<caption>` that names the table and is shown with it (below the rows). |
| `maxHeight` | `number \| string` | — | Caps the table's height (`320`, `"50vh"`): the body scrolls inside the box and, by default, the header stays in place (`stickyHeader`). |
| `stickyHeader` | `boolean` | — | Keeps the header visible while the body scrolls inside `maxHeight`. Default: on when `maxHeight` is set. |
| `selectable` | `boolean` | `false` | Adds a checkbox column: one per row (named after the row's first column) and one in the header that selects the rows of the page, with the mixed state when only some are. The selection is a list of row ids (`getRowId`, or the index), so it survives paging, sorting and server pages; selected rows are marked (`data-state="selected"`). |
| `selectedRowIds` | `string[]` | — | Selected row ids, controlled. |
| `defaultSelectedRowIds` | `string[]` | — | Selected row ids on the first render, uncontrolled. |
| `onSelectionChange` | `(rowIds: string[]) => void` | — | Called with every id selected after a change, in the order they were picked. |
| `selectionActions` | `(rowIds: string[]) => React.ReactNode` | — | Actions for the selected rows ("Arquivar", "Exportar"): shown in a bar above the table, with the count and a button to clear the selection, while something is selected. |
| `pinnedColumns` | `{ left?: string[] }` | — | Columns that stay in place while the table scrolls sideways, by id or `accessorKey`: `{ left: ["numero", "cliente.nome"] }`. They move to the left edge in the order given, with a line after the last one. |
| `density` | `"default" \| "compact"` | `"default"` | Row density. `"compact"` gives rows of about 36px (`py-2`) and a 32px pager, for dense back-office lists; `"default"` keeps the library's `py-2.5 px-3` rows (about 41px). |
| `pagination` | `{ pageSize?: number /** * When provided, renders a "Linhas por página" select in the footer * (left of the page indicator). Selecting an option resets the cursor * to page 0 (atomically — both fields propagate in a single * 'onPaginationChange' call so server-side consumers don't fetch the * wrong page). If 'pagination.pageSize' is omitted, the initial size * defaults to 'pageSizeOptions[0]'. * Example: 'pageSizeOptions: [10, 20, 50, 100]'. */ pageSizeOptions?: number[] }` | — | Enable pagination. When set, footer shows previous/next + page indicator. Default: not paginated. |
| `showRowCount` | `boolean` | `false` | Show row count in the footer (e.g. `12 registros` or `5 de 12 registros` when filtered). Default `false`. |
| `globalFilter` | `string` | — | Controlled global filter value. |
| `onGlobalFilterChange` | `OnChangeFn<string>` | — | Controlled global filter change handler. |
| `manualFiltering` | `boolean` | — | Whether filtering is server-driven. When `true`, the table skips its own client-side filtering pass — the row set you pass in `data` is rendered as-is. Use this when you refetch on every keystroke and don't want the visible page locally filtered first (which causes a brief mismatch between filtered-local rows and the next server response). |
| `pageIndex` | `number` | — | Controlled page index (0-based). |
| `onPaginationChange` | `OnChangeFn<PaginationState>` | — | Called with the new `{ pageIndex, pageSize }` on every page or page-size change. Without `pageIndex` it only listens: the table keeps its page. |
| `autoResetPage` | `boolean` | — | Go back to the first page when the search, a filter or the sort changes. A new `data` array with the same view keeps the page either way. Default `true`, or `false` with `manualPagination` (the server owns it). |
| `pageCount` | `number` | — | Number of pages on the server (`manualPagination`). Optional when `rowCount` is given: the count then derives from it and the page size. With neither, the total is unknown: no page count is shown and "next" stays available. |
| `rowCount` | `number` | — | Number of rows on the server, for `manualPagination` / `manualFiltering`: `data` only holds the current page, so the footer shows this total (`showRowCount`) and the page count derives from it when `pageCount` is absent. Without it, server pagination shows no row count. |
| `manualPagination` | `boolean` | — | Whether pagination is server-driven. |
| `sorting` | `SortingState` | — | Controlled sorting state. When provided, parent owns the sort. |
| `onSortingChange` | `OnChangeFn<SortingState>` | — | Controlled sorting change handler. |
| `manualSorting` | `boolean` | — | Whether sort is server-driven. When true, the table skips its own sort pass and just propagates state via `onSortingChange`. |
| `labels` | `Partial<DataTableLabels>` | — | Overridable copy. All keys optional — defaults are pt-BR. |
| `onRowClick` | `(row: TData, event: React.MouseEvent<HTMLTableRowElement>) => void` | — | Makes every body row clickable. A click anywhere on the row calls it; the keyboard and screen readers reach it through a real `<button>` that wraps the first cell's content (named by that content), so Tab, Enter and Space work and the row is still a row. A click or key press that starts in a control inside the row (button, link, field, menu) belongs to that control and never calls `onRowClick`. Keep the first cell free of controls: a button cannot hold another one. |
| `getRowId` | `(row: TData, index: number) => string` | — | A stable id for each row (its key in the database, not its position). React keys the rows by it, so a row's state (a field typed in, an open menu) stays with that row when the page, the sort or the data changes; row selection is kept by it too. Default: the row's index in `data`. |
| `rowClassName` | `(row: TData, index: number) => string \| undefined` | — | Per-row className. Receives the row data and index; return undefined to skip. Useful for coloring rows by status. |
| `loading` | `boolean` | `false` | When `true`, the body renders skeleton rows in place of data: as many as the current page size (5 without pagination). The row count and the export button skeleton-ize, the pager is unavailable, and `labels.loading` is announced through the table's status region. `aria-busy` is set on the wrapper. |
| `error` | `React.ReactNode` | — | The data failed to load. Shown in the body (as an alert) instead of the rows or the empty message, so a failed request does not read as "Nenhum resultado". `true` shows `labels.error`. Ignored while `loading`. |
| `onRetry` | `() => void` | — | With `error`, renders a `labels.retry` ("Tentar de novo") button that calls it. |
| `downloadable` | `boolean \| DataTableDownloadable<TData>` | — | Render an "Exportar para Excel" ghost button on the right side of the toolbar. Clicking opens a menu (`DropdownMenu`) with the scopes the table can fill (filtered, current page, all rows). Pass `true` to enable with defaults or an object to customize filename / sheet name / row mapping. |
| `onClearFilters` | `() => void` | — | Render a "Limpar filtros" button on the toolbar (left of the export button). The lib doesn't own the filter state, so the parent decides what to reset in the callback. |
| `clearFiltersDisabled` | `boolean` | — | Disable the clear-filters button (e.g. when no filters are active). |
| `clearFiltersClassName` | `string` | — | Extra classes for the clear-filters button (e.g. width override). |
| `downloadTriggerClassName` | `string` | — | Extra classes for the export trigger button (e.g. width override). |

Repassa também: atributos HTML do React (`HTMLAttributes`).

### defaultDataTableLabels

`import { defaultDataTableLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/data-table"`

```ts
const defaultDataTableLabels: DataTableLabels = {
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
  selectPage: "Selecionar todas as linhas da página",
  selectRow: (rowText) => `Selecionar ${rowText}`,
  selectedCount: (count) =>
    count === 1 ? "1 selecionado" : `${numberFormatter.format(count)} selecionados`,
  clearSelection: "Limpar seleção",
  scrollRegion: "Tabela com rolagem",
}
```

### ColumnDef

`import type { ColumnDef } from "@amfernandesinc/ui"`

Reexportado de `@tanstack/table-core` (mesmo tipo do pacote original).

### DataTableColumnKey

`import type { DataTableColumnKey } from "@amfernandesinc/ui"`

A column id in `searchableColumns`, `sortableColumns`: the editor suggests the row's own keys, and any other id (`"cliente.nome"`, an `id` you gave a column) is accepted.

```ts
export type DataTableColumnKey<TData> = (keyof TData & string) | (string & {})
```

### DataTableColumnMeta

`import type { DataTableColumnMeta } from "@amfernandesinc/ui"`

What `DataTable` reads from a column's `meta`. TanStack types `meta` as an open object, so these keys are written as plain properties: ```ts { accessorKey: "cpf", header: "CPF", meta: { searchText: (row) => formatCPF(row.cpf) } } ```

```ts
export interface DataTableColumnMeta<TData = unknown> {
  /**
   * The text the search compares, when it is not the cell value as a string:
   * what the cell shows ("123.456.789-01", "19/05/2026"), or extra words. It
   * receives the row and the column value. `dateColumn` and `formattedColumn`
   * fill it with their formatted output.
   */
  searchText?: (row: TData, value: unknown) => string
  /** Kept out of the screen but written to the exported file. */
  exportOnly?: boolean
  /**
   * The column in the exported file: `false` leaves it out; a function gives
   * the value to write (row, accessor value). By default a column with data
   * exports its accessor value and a column without (actions) is left out.
   */
  export?: boolean | ((row: TData, value: unknown) => unknown)
  /** Alignment of the header, the cells and the footer. Default: left. */
  align?: "left" | "center" | "right"
}
```

### DataTableDownloadable

`import type { DataTableDownloadable } from "@amfernandesinc/ui"`

```ts
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
```

### DataTableLabels

`import type { DataTableLabels } from "@amfernandesinc/ui"`

```ts
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
  /** Name of the header checkbox (`selectable`): it selects the rows of the page. */
  selectPage: string
  /** Name of a row's checkbox, from the text of the row's first column. */
  selectRow: (rowText: string) => string
  /** Count in the selection bar. */
  selectedCount: (count: number) => string
  /** The selection bar's button that clears the selection. */
  clearSelection: string
  /** Name of the scrolling box when the table has no `aria-label` / `aria-labelledby`. */
  scrollRegion: string
}
```

### DataTableProps

`import type { DataTableProps } from "@amfernandesinc/ui"`

```ts
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
   *
   * Entries are column ids: a column's `id`, or its `accessorKey` (nested
   * keys as written, `"cliente.nome"`, or as TanStack's id, `"cliente_nome"`).
   */
  searchableColumns?: DataTableColumnKey<TData>[]
  /**
   * Whitelist of column ids (typically `accessorKey`) whose headers are sortable.
   * When omitted, **no** header is sortable. Mirrors the `searchableColumns`
   * opt-in pattern. Replaces the per-column `enableSorting` flag in the columnDef.
   *
   * Text sorts in Portuguese order (accents and case ignored, "Bloco 2" before
   * "Bloco 10"), numbers by value and dates by time. A column's own
   * `sortingFn` still wins.
   *
   * Entries are column ids, as in `searchableColumns`.
   */
  sortableColumns?: DataTableColumnKey<TData>[]
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
   * Adds a checkbox column: one per row (named after the row's first column)
   * and one in the header that selects the rows of the page, with the mixed
   * state when only some are. The selection is a list of row ids
   * (`getRowId`, or the index), so it survives paging, sorting and server
   * pages; selected rows are marked (`data-state="selected"`).
   */
  selectable?: boolean
  /** Selected row ids, controlled. */
  selectedRowIds?: string[]
  /** Selected row ids on the first render, uncontrolled. */
  defaultSelectedRowIds?: string[]
  /** Called with every id selected after a change, in the order they were picked. */
  onSelectionChange?: (rowIds: string[]) => void
  /**
   * Actions for the selected rows ("Arquivar", "Exportar"): shown in a bar
   * above the table, with the count and a button to clear the selection,
   * while something is selected.
   */
  selectionActions?: (rowIds: string[]) => React.ReactNode
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
```

### ExportScope

`import type { ExportScope } from "@amfernandesinc/ui"`

```ts
export type ExportScope = "filtered" | "page" | "all"
```

### PaginationState

`import type { PaginationState } from "@amfernandesinc/ui"`

Reexportado de `@tanstack/table-core` (mesmo tipo do pacote original).

### SortingState

`import type { SortingState } from "@amfernandesinc/ui"`

Reexportado de `@tanstack/table-core` (mesmo tipo do pacote original).

## `data/empty-state` — `@amfernandesinc/ui/empty-state`

### EmptyState

`import { EmptyState } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/empty-state"`

Placeholder for a content area with no data: icon, title, description and actions. Pass it to `DataTable`'s `emptyMessage`, or render it in place of a list.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `title` | `React.ReactNode` | **obrigatória** | Main message: what is empty ("Nenhum lead encontrado"). |
| `description` | `React.ReactNode` | — | Why it is empty, or what to do next. |
| `icon` | `React.ReactNode` | — | Decorative icon or illustration above the title (hidden from screen readers). |
| `actions` | `React.ReactNode` | — | Buttons below the text ("Novo lead", "Limpar filtros"). |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3` | Heading tag of the title, to fit the page outline. Semantic only — the visual size stays the same. |
| `compact` | `boolean` | `false` | Tighter spacing and stacked actions, for cards, popovers and narrow columns. |
| `announce` | `boolean` | `false` | Announce the title and description to screen readers when the empty state appears. Use it when it results from a user action (a search or a filter with no results) — not for content that is empty on page load. As a DataTable's `emptyMessage`: the table's status region speaks only text messages, so an EmptyState there is silent unless it has `announce`. Tie it to the search or filter (`announce={query !== ""}`), so a table that loads empty is not read out. |
| `ref` | `React.Ref<HTMLDivElement>` | — | — |

Repassa também: atributos HTML do React (`HTMLAttributes`).

### EmptyStateProps

`import type { EmptyStateProps } from "@amfernandesinc/ui"`

```ts
export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Main message: what is empty ("Nenhum lead encontrado"). */
  title: React.ReactNode
  /** Why it is empty, or what to do next. */
  description?: React.ReactNode
  /** Decorative icon or illustration above the title (hidden from screen readers). */
  icon?: React.ReactNode
  /** Buttons below the text ("Novo lead", "Limpar filtros"). */
  actions?: React.ReactNode
  /**
   * Heading tag of the title, to fit the page outline. Semantic only — the
   * visual size stays the same.
   * @default 3
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
  /** Tighter spacing and stacked actions, for cards, popovers and narrow columns. */
  compact?: boolean
  /**
   * Announce the title and description to screen readers when the empty state
   * appears. Use it when it results from a user action (a search or a filter
   * with no results) — not for content that is empty on page load.
   *
   * As a DataTable's `emptyMessage`: the table's status region speaks only
   * text messages, so an EmptyState there is silent unless it has
   * `announce`. Tie it to the search or filter
   * (`announce={query !== ""}`), so a table that loads empty is not read out.
   */
  announce?: boolean
  ref?: React.Ref<HTMLDivElement>
}
```

## `data/image` — `@amfernandesinc/ui/image`

### Image

`import { Image } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/image"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `src` | `string \| null` | — | Address of the image. Empty, `null` or `undefined` means "no image": the `fallback` shows, as a normal state and not as an error. |
| `alt` | `string` | **obrigatória** | Text alternative. It stays with the screen reader when the image fails, is refused or is missing: the fallback takes it as its name. |
| `aspectRatio` | `number` | — | — |
| `placeholder` | `"blur" \| "skeleton" \| "none"` | `"skeleton"` | What shows while the image loads. `"blur"` shows `blurDataURL` blurred; without it, a plain muted block. |
| `blurDataURL` | `string` | — | A tiny version of the image (a `data:image/…` URI, or an address with an allowed protocol) shown blurred while the real one loads, with `placeholder="blur"`. |
| `fallback` | `React.ReactNode` | — | Shown in place of the image when there is no `src`, when the address is refused and when it fails to load. Defaults to an icon with the text from `labels` (the text hides when the box is narrower than 8rem). |
| `labels` | `Partial<ImageLabels>` | — | — |
| `objectFit` | `keyof typeof objectFitMap` | `"cover"` | — |
| `rounded` | `keyof typeof roundedMap` | `"none"` | — |
| `loading` | `"lazy" \| "eager"` | `"lazy"` | Override native lazy loading. Defaults to "lazy". |
| `allowedProtocols` | `string[]` | — | Protocols the address may use. It **replaces** the default list (`http:`, `https:`), it does not add to it: `["data:"]` accepts only data URIs. To add one, spread the default: `[...DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, "data:"]`. |
| `srcSet` | `string` | — | Mirror the native attribute; forwarded directly to `<img>`. |
| `sizes` | `string` | — | Mirror the native attribute; forwarded directly to `<img>`. |
| `decorative` | `boolean` | `false` | When true, the image is purely decorative — alt is forced to "" and role="presentation". |
| `ref` | `React.Ref<HTMLImageElement>` | — | The `<img>`; `null` while the fallback shows. |

Repassa também: atributos HTML do React (`HTMLAttributes`, `ImgHTMLAttributes`).

### defaultImageLabels

`import { defaultImageLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/image"`

```ts
const defaultImageLabels: ImageLabels = {
  empty: "Sem imagem",
  error: "Falha ao carregar imagem",
}
```

### ImageLabels

`import type { ImageLabels } from "@amfernandesinc/ui"`

```ts
export interface ImageLabels {
  /** Shown when there is no `src` (a property without a photo). */
  empty: string
  /** Shown when the image fails to load or its address is refused. */
  error: string
}
```

### ImageProps

`import type { ImageProps } from "@amfernandesinc/ui"`

```ts
export interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "loading" | "decoding" | "src"> {
  /**
   * Address of the image. Empty, `null` or `undefined` means "no image": the
   * `fallback` shows, as a normal state and not as an error.
   */
  src?: string | null
  /**
   * Text alternative. It stays with the screen reader when the image fails,
   * is refused or is missing: the fallback takes it as its name.
   */
  alt: string
  aspectRatio?: number
  /**
   * What shows while the image loads. `"blur"` shows `blurDataURL` blurred;
   * without it, a plain muted block.
   * @default "skeleton"
   */
  placeholder?: "blur" | "skeleton" | "none"
  /**
   * A tiny version of the image (a `data:image/…` URI, or an address with an
   * allowed protocol) shown blurred while the real one loads, with
   * `placeholder="blur"`.
   */
  blurDataURL?: string
  /**
   * Shown in place of the image when there is no `src`, when the address is
   * refused and when it fails to load. Defaults to an icon with the text
   * from `labels` (the text hides when the box is narrower than 8rem).
   */
  fallback?: React.ReactNode
  labels?: Partial<ImageLabels>
  objectFit?: keyof typeof objectFitMap
  rounded?: keyof typeof roundedMap
  /** Override native lazy loading. Defaults to "lazy". */
  loading?: "lazy" | "eager"
  /**
   * Protocols the address may use. It **replaces** the default list
   * (`http:`, `https:`), it does not add to it: `["data:"]` accepts only data
   * URIs. To add one, spread the default:
   * `[...DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, "data:"]`.
   */
  allowedProtocols?: string[]
  /** Mirror the native attribute; forwarded directly to `<img>`. */
  srcSet?: string
  /** Mirror the native attribute; forwarded directly to `<img>`. */
  sizes?: string
  /** When true, the image is purely decorative — alt is forced to "" and role="presentation". */
  decorative?: boolean
  /** The `<img>`; `null` while the fallback shows. */
  ref?: React.Ref<HTMLImageElement>
}
```

## `data/line-chart` — `@amfernandesinc/ui/line-chart`

### LineChart

`import { LineChart } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/line-chart"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `data` | `T[]` | **obrigatória** | One record per point on the x axis, in order. |
| `x` | `keyof T & string` | **obrigatória** | Key of the x value in each record: a category, or an ISO date ("2026-03", "2026-03-15"). |
| `series` | `ChartSeries[]` | **obrigatória** | Up to six series; each takes `--chart-1`, `--chart-2`… in order. |
| `area` | `boolean` | `false` | Fills under the line (only with a single visible series). |
| `formatValue` | `(value: number) => string` | `formatNumber` | Format of values in the tooltip, labels and table. Axis ticks stay compact. |
| `formatX` | `(value: T[keyof T & string]) => string` | — | Label of an x value. Defaults to month names for ISO months ("mar.") and "15 de mar." for days. |
| `height` | `number` | `280` | Height of the plot with its axes, in px. |
| `title` | `string` | **obrigatória** | The chart's accessible name, shown above it. |
| `description` | `React.ReactNode` | — | — |
| `showTable` | `boolean` | `false` | Shows the table of values under the chart (it is always there for screen readers). |
| `labels` | `Partial<ChartLabels>` | — | — |
| `emptyMessage` | `React.ReactNode` | — | Shown instead of the plot when there is no data. Defaults to `labels.empty`. |
| `loading` | `boolean` | `false` | — |
| `id` | `string` | — | — |
| `className` | `string` | — | — |

### LineChartProps

`import type { LineChartProps } from "@amfernandesinc/ui"`

```ts
export interface LineChartProps<T extends Record<string, unknown> = Record<string, unknown>> {
  /** One record per point on the x axis, in order. */
  data: T[]
  /** Key of the x value in each record: a category, or an ISO date ("2026-03", "2026-03-15"). */
  x: keyof T & string
  /** Up to six series; each takes `--chart-1`, `--chart-2`… in order. */
  series: ChartSeries[]
  /** Fills under the line (only with a single visible series). */
  area?: boolean
  /** Format of values in the tooltip, labels and table. Axis ticks stay compact. */
  formatValue?: (value: number) => string
  /** Label of an x value. Defaults to month names for ISO months ("mar.") and "15 de mar." for days. */
  formatX?: (value: T[keyof T & string]) => string
  /** Height of the plot with its axes, in px. @default 280 */
  height?: number
  /** The chart's accessible name, shown above it. */
  title: string
  description?: React.ReactNode
  /** Shows the table of values under the chart (it is always there for screen readers). */
  showTable?: boolean
  labels?: Partial<ChartLabels>
  /** Shown instead of the plot when there is no data. Defaults to `labels.empty`. */
  emptyMessage?: React.ReactNode
  loading?: boolean
  id?: string
  className?: string
}
```

## `data/schedule` — `@amfernandesinc/ui/schedule`

### Schedule

`import { Schedule } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/schedule"`

Calendar of events with month, week, day and list views. Data-driven: pass `events` (`Date`s, shown in `timeZone`) and the schedule lays them out — spanning bars for all-day and multi-day events, side-by-side blocks for overlapping times, "+N mais" when a month day is full.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `events` | `ScheduleEvent[]` | **obrigatória** | — |
| `view` | `ScheduleView` | — | — |
| `defaultView` | `ScheduleView` | `"month"` | — |
| `onViewChange` | `(view: ScheduleView) => void` | — | — |
| `views` | `ScheduleView[]` | `ALL_VIEWS` | Views offered in the switcher. The switcher hides when there is only one. |
| `date` | `Date` | — | Focused date — decides the visible period. |
| `defaultDate` | `Date` | — | Focused date of an uncontrolled schedule. Without it (and without `date` and `today`), the server renders the frame and the period comes in the browser: the server cannot know the browser's date. Pass it to have the period in the server HTML. |
| `onDateChange` | `(date: Date) => void` | — | — |
| `today` | `Date` | — | What counts as "today" (highlight, "Hoje" button, current-time line). Defaults to the real clock, refreshed every minute, read once the page is in the browser: the server renders no "today" and no current-time line. Pass a fixed date for deterministic renders (tests, screenshots, a server render with "today" in it). |
| `timeZone` | `string` | `DEFAULT_TIME_ZONE` | Time zone the days and hours are shown in, an IANA name. Events are instants (`Date`s); a meeting at 13:00 in São Paulo sits at 13:00 on any machine, server or browser, so the server HTML and the hydration agree. All-day events start at midnight of this zone. |
| `onEventClick` | `(event: ScheduleEvent) => void` | — | Click on an event. Without it (and without `renderEventDetails`) the events are plain content, not buttons, so the keyboard does not stop on each of them. |
| `onSlotClick` | `(date: Date) => void` | — | Click on an empty day (month) or time slot (week, day): receives the day at 00:00, or the time clicked rounded down to the half hour. From the keyboard, each day's number or header becomes a button that gives the day at `scrollToHour`. Use it to start "Agendar visita". |
| `onRangeChange` | `(range: { start: Date; end: Date; view: ScheduleView }) => void` | — | Called with the period on screen whenever it changes, and once on mount: fetch the events of `{ start, end }` (end exclusive). Same range as `getScheduleRange`. |
| `renderEventDetails` | `(event: ScheduleEvent) => React.ReactNode` | — | When set, clicking an event opens a popover with this content. |
| `weekStartsOn` | `WeekStart` | `0` | First day of the week. |
| `minHour` | `number` | `0` | Week/day views: first hour shown. |
| `maxHour` | `number` | `24` | Week/day views: hour where the grid ends (exclusive). |
| `scrollToHour` | `number` | `8` | Week/day views: hour the grid scrolls to when it appears. |
| `hourHeight` | `number` | `48` | Week/day views: height of one hour, in px. |
| `maxColumns` | `number` | `3 in the week, 6 in the day` | Week/day views: most events side by side in a day column. When more happen at the same time, the last column shows "+N" with the rest, so the blocks never get too narrow to read. |
| `timeGridMaxHeight` | `number \| string` | `"36rem"` | Week/day views: most height of the scrolling grid of hours. A number is px. Pass `"none"` to show every hour without an inner scroll. |
| `monthMaxEvents` | `number` | `3` | Month view: events shown per day before "+N mais". |
| `listDays` | `number` | `7` | List view: days shown from `date`. |
| `loading` | `boolean` | `false` | Shows a spinner with "Carregando…" in the header and marks the body `aria-busy`. |
| `locale` | `string` | `"pt-BR"` | Language of the day and month names and of the date formats, as a BCP 47 tag ("pt-BR", "en-US", "es"). The fixed texts come from `labels`. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `2` | Heading tag of the period title. |
| `labels` | `Partial<ScheduleLabels>` | — | — |
| `className` | `string` | — | — |

### getScheduleRange

`import { getScheduleRange } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/schedule"`

The period a view shows, the same one `onRangeChange` reports: `start` is the first visible day at 00:00 and `end` the day after the last one (exclusive), midnights of `timeZone` (São Paulo unless you pass the schedule's). Use it to fetch the events before the first render.

```ts
getScheduleRange(view: ScheduleView, date: Date, options: { weekStartsOn?: WeekStart; listDays?: number; timeZone?: string } = {}): { start: Date; end: Date }
```

### defaultScheduleLabels

`import { defaultScheduleLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/schedule"`

```ts
const defaultScheduleLabels: ScheduleLabels = {
  today: "Hoje",
  previous: {
    month: "Mês anterior",
    week: "Semana anterior",
    day: "Dia anterior",
    list: "Período anterior",
  },
  next: {
    month: "Próximo mês",
    week: "Próxima semana",
    day: "Próximo dia",
    list: "Próximo período",
  },
  views: { month: "Mês", week: "Semana", day: "Dia", list: "Lista" },
  viewSwitcher: "Visualização",
  allDay: "Dia inteiro",
  more: (count) => `+${count} mais`,
  empty: "Nenhum evento neste período",
  loading: "Carregando…",
  newEvent: (day) => `Novo evento em ${day}`,
  timeGrid: "Grade de horários",
}
```

### ScheduleColor

`import type { ScheduleColor } from "@amfernandesinc/ui"`

```ts
export type ScheduleColor =
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "blue"
  | "purple"
  | "pink"
```

### ScheduleEvent

`import type { ScheduleEvent } from "@amfernandesinc/ui"`

```ts
export interface ScheduleEvent {
  /** Stable identity (React key, `data-event-id`). */
  id: string
  title: string
  start: Date
  /**
   * Timed events: the end instant (exclusive — ending at 00:00 does not spill
   * into the next day). All-day events (`allDay`): the last day, inclusive.
   */
  end: Date
  /** Shown as a bar in the month and all-day rows, without a time. */
  allDay?: boolean
  /** Category colour. @default "blue" */
  color?: ScheduleColor
  /** Free content for `renderEventDetails`. Not rendered by the schedule itself. */
  description?: React.ReactNode
}
```

### ScheduleLabels

`import type { ScheduleLabels } from "@amfernandesinc/ui"`

```ts
export interface ScheduleLabels {
  today: string
  previous: Record<ScheduleView, string>
  next: Record<ScheduleView, string>
  views: Record<ScheduleView, string>
  /** Accessible name of the view switcher. */
  viewSwitcher: string
  allDay: string
  /** Month view: collapsed events of a day. */
  more: (count: number) => string
  /** List view with no events in the period. */
  empty: string
  loading: string
  /** Name of the button on a day that calls `onSlotClick` ("Novo evento em sábado, 21 de novembro"). */
  newEvent: (day: string) => string
  /** Name of the scrolling grid of hours (week and day views). */
  timeGrid: string
}
```

### ScheduleProps

`import type { ScheduleProps } from "@amfernandesinc/ui"`

```ts
export interface ScheduleProps {
  events: ScheduleEvent[]
  view?: ScheduleView
  /** @default "month" */
  defaultView?: ScheduleView
  onViewChange?: (view: ScheduleView) => void
  /** Views offered in the switcher. The switcher hides when there is only one. @default all four */
  views?: ScheduleView[]
  /** Focused date — decides the visible period. */
  date?: Date
  /**
   * Focused date of an uncontrolled schedule. Without it (and without `date`
   * and `today`), the server renders the frame and the period comes in the
   * browser: the server cannot know the browser's date. Pass it to have the
   * period in the server HTML.
   */
  defaultDate?: Date
  onDateChange?: (date: Date) => void
  /**
   * What counts as "today" (highlight, "Hoje" button, current-time line).
   * Defaults to the real clock, refreshed every minute, read once the page
   * is in the browser: the server renders no "today" and no current-time
   * line. Pass a fixed date for deterministic renders (tests, screenshots,
   * a server render with "today" in it).
   */
  today?: Date
  /**
   * Time zone the days and hours are shown in, an IANA name. Events are
   * instants (`Date`s); a meeting at 13:00 in São Paulo sits at 13:00 on any
   * machine, server or browser, so the server HTML and the hydration agree.
   * All-day events start at midnight of this zone.
   * @default "America/Sao_Paulo"
   */
  timeZone?: string
  /**
   * Click on an event. Without it (and without `renderEventDetails`) the
   * events are plain content, not buttons, so the keyboard does not stop on
   * each of them.
   */
  onEventClick?: (event: ScheduleEvent) => void
  /**
   * Click on an empty day (month) or time slot (week, day): receives the
   * day at 00:00, or the time clicked rounded down to the half hour. From
   * the keyboard, each day's number or header becomes a button that gives
   * the day at `scrollToHour`. Use it to start "Agendar visita".
   */
  onSlotClick?: (date: Date) => void
  /**
   * Called with the period on screen whenever it changes, and once on
   * mount: fetch the events of `{ start, end }` (end exclusive). Same range
   * as `getScheduleRange`.
   */
  onRangeChange?: (range: { start: Date; end: Date; view: ScheduleView }) => void
  /** When set, clicking an event opens a popover with this content. */
  renderEventDetails?: (event: ScheduleEvent) => React.ReactNode
  /** First day of the week. @default 0 (domingo) */
  weekStartsOn?: WeekStart
  /** Week/day views: first hour shown. @default 0 */
  minHour?: number
  /** Week/day views: hour where the grid ends (exclusive). @default 24 */
  maxHour?: number
  /** Week/day views: hour the grid scrolls to when it appears. @default 8 */
  scrollToHour?: number
  /** Week/day views: height of one hour, in px. @default 48 */
  hourHeight?: number
  /**
   * Week/day views: most events side by side in a day column. When more
   * happen at the same time, the last column shows "+N" with the rest, so
   * the blocks never get too narrow to read. @default 3 in the week, 6 in the day
   */
  maxColumns?: number
  /**
   * Week/day views: most height of the scrolling grid of hours. A number is
   * px. Pass `"none"` to show every hour without an inner scroll.
   * @default "36rem"
   */
  timeGridMaxHeight?: number | string
  /** Month view: events shown per day before "+N mais". @default 3 */
  monthMaxEvents?: number
  /** List view: days shown from `date`. @default 7 */
  listDays?: number
  /** Shows a spinner with "Carregando…" in the header and marks the body `aria-busy`. */
  loading?: boolean
  /**
   * Language of the day and month names and of the date formats, as a BCP 47
   * tag ("pt-BR", "en-US", "es"). The fixed texts come from `labels`.
   * @default "pt-BR"
   */
  locale?: string
  /** Heading tag of the period title. @default 2 */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  labels?: Partial<ScheduleLabels>
  className?: string
}
```

### ScheduleView

`import type { ScheduleView } from "@amfernandesinc/ui"`

```ts
export type ScheduleView = "month" | "week" | "day" | "list"
```

## `data/scroll-area` — `@amfernandesinc/ui/scroll-area`

### ScrollArea

`import { ScrollArea } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/scroll-area"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `orientation` | `ScrollAreaOrientation` | `"vertical"` | Which scrollbar(s) to render. Default `"vertical"`. |
| `aria-label` | `string` | — | Names the scrolling area. With a name it becomes a region landmark ("Histórico do lead"), announced when it gets focus. |
| `aria-labelledby` | `string` | — | Identifies the element (or elements) that labels the current element. |
| `ref` | `React.Ref<React.ComponentRef<typeof ScrollAreaPrimitive.Root>>` | — | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |

Repassa também: props de `@radix-ui/react-primitive`; props de `@radix-ui/react-scroll-area` (`ScrollAreaProps`); atributos HTML do React (`Attributes`, `HTMLAttributes`).

### ScrollBar

`import { ScrollBar } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/scroll-area"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `ref` | `React.Ref<React.ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>>` | — | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |

Repassa também: props de `@radix-ui/react-primitive`; props de `@radix-ui/react-scroll-area` (`ScrollAreaScrollbarProps`, `ScrollAreaScrollbarVisibleProps`); atributos HTML do React (`Attributes`, `HTMLAttributes`).

### ScrollAreaOrientation

`import type { ScrollAreaOrientation } from "@amfernandesinc/ui"`

```ts
export type ScrollAreaOrientation = "vertical" | "horizontal" | "both"
```

### ScrollAreaProps

`import type { ScrollAreaProps } from "@amfernandesinc/ui"`

```ts
export interface ScrollAreaProps extends React.ComponentProps<typeof ScrollAreaPrimitive.Root> {
  /** Which scrollbar(s) to render. Default `"vertical"`. */
  orientation?: ScrollAreaOrientation
  /**
   * Names the scrolling area. With a name it becomes a region landmark
   * ("Histórico do lead"), announced when it gets focus.
   */
  "aria-label"?: string
  "aria-labelledby"?: string
  ref?: React.Ref<React.ComponentRef<typeof ScrollAreaPrimitive.Root>>
}
```

### ScrollBarProps

`import type { ScrollBarProps } from "@amfernandesinc/ui"`

```ts
export interface ScrollBarProps
  extends React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> {
  ref?: React.Ref<React.ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>>
}
```

## `data/sparkline` — `@amfernandesinc/ui/sparkline`

### Sparkline

`import { Sparkline } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/sparkline"`

A tiny trend line for a table cell or a metric card: no axes, no tooltip, the line in the de-emphasis colour and the latest point in the accent.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `data` | `number[]` | **obrigatória** | The values, oldest first. A non-finite value breaks the line. |
| `label` | `string` | **obrigatória** | What the trend says, in words: the accessible name ("Vendas dos últimos 12 meses, de 14 para 22"). A sparkline has no axes or tooltip, so this is the only way a screen reader gets it. |
| `width` | `number` | `96` | — |
| `height` | `number` | `28` | — |

Repassa também: atributos HTML do React (`Attributes`, `RefAttributes`, `SVGAttributes`).

### SparklineProps

`import type { SparklineProps } from "@amfernandesinc/ui"`

```ts
export interface SparklineProps
  extends Omit<React.SVGProps<SVGSVGElement>, "width" | "height" | "role"> {
  /** The values, oldest first. A non-finite value breaks the line. */
  data: number[]
  /**
   * What the trend says, in words: the accessible name ("Vendas dos últimos
   * 12 meses, de 14 para 22"). A sparkline has no axes or tooltip, so this is
   * the only way a screen reader gets it.
   */
  label: string
  /** @default 96 */
  width?: number
  /** @default 28 */
  height?: number
}
```

## `data/table-styles` — `@amfernandesinc/ui/table-styles`

### tableStyles

`import { tableStyles } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/table-styles"`

Helper for raw HTML <table> usage when DataTable would be overkill. The classes are the DataTable's own: same row density and selected colour.

```ts
tableStyles(): { readonly table: "w-full caption-bottom text-sm"; readonly header: "[&_tr]:border-b"; readonly body: "[&_tr:last-child]:border-0"; readonly footer: "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0"; readonly row: "border-b transition-colors hover:state-hover data-[state=selected]:bg-accent data-[state=selected]:text-accent-foreground forced-colors:data-[state=selected]:outline-2 forced-colors:data-[state=selected]:-outline-offset-2 forced-colors:data-[state=selected]:outline-[Highlight]"; readonly head: "px-3 py-2.5 text-left align-middle font-medium text-muted-foreground"; readonly cell: "px-3 py-2.5 align-middle"; readonly caption: "mt-4 text-sm text-muted-foreground"; }
```

### TableStyles

`import type { TableStyles } from "@amfernandesinc/ui"`

```ts
export type TableStyles = ReturnType<typeof tableStyles>
```

## `data/tree` — `@amfernandesinc/ui/tree`

### Tree

`import { Tree } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/tree"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `data` | `TreeNodeData[]` | **obrigatória** | — |
| `expanded` | `Set<string> \| string[]` | — | Expanded node ids (controlled): an array or a `Set`. |
| `onExpandedChange` | `(next: Set<string>) => void` | — | Called when a node is expanded or collapsed. |
| `defaultExpanded` | `Set<string> \| string[]` | — | Expanded ids at first render (uncontrolled): an array or a `Set`. |
| `selected` | `string` | — | Selected node id (controlled, single selection). |
| `defaultSelected` | `string` | — | Selected node id at first render (uncontrolled). |
| `onSelectedChange` | `(id: string) => void` | — | Called when a node is selected, with its id. |
| `onLoadChildren` | `(node: TreeNodeData) => void \| PromiseLike<unknown>` | — | Called when a node with `hasChildren` and no `children` is opened. Load its children and pass them in `data`. Closing the node and opening it again calls it again, so a load that failed can be retried. Return the load's promise to tell a load in progress from one that failed: while it runs, closing and opening the node does not ask a second time (an app that appends what arrives would get every child twice). The Tree only watches it end: show a failure from your own code. |
| `maxDepth` | `number` | `DEFAULT_MAX_DEPTH` | Maximum recursion depth. Default `64`. |
| `indentSize` | `number` | `DEFAULT_INDENT` | Horizontal indent per nesting level in pixels. Default `16`. |
| `labels` | `Partial<TreeLabels>` | — | — |
| `ref` | `React.Ref<HTMLUListElement>` | — | — |

Repassa também: atributos HTML do React (`HTMLAttributes`).

### defaultTreeLabels

`import { defaultTreeLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/tree"`

```ts
const defaultTreeLabels: TreeLabels = {
  loading: "Carregando…",
  depthLimit: "… (limite de profundidade)",
  cycle: "… (ciclo detectado)",
}
```

### TreeLabels

`import type { TreeLabels } from "@amfernandesinc/ui"`

```ts
export interface TreeLabels {
  /** Row shown while the children of an opened node load. */
  loading: string
  /** Row shown where `maxDepth` stops the tree. */
  depthLimit: string
  /** Row shown where a node would contain itself. */
  cycle: string
}
```

### TreeNodeData

`import type { TreeNodeData } from "@amfernandesinc/ui"`

```ts
export interface TreeNodeData {
  id: string
  label: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  children?: TreeNodeData[]
  /**
   * The node has children that are not loaded yet. Leave `children`
   * undefined: opening the node calls `onLoadChildren(node)` and shows a
   * loading row until you pass the children.
   */
  hasChildren?: boolean
}
```

### TreeProps

`import type { TreeProps } from "@amfernandesinc/ui"`

```ts
export interface TreeProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, "onSelect" | "defaultValue"> {
  data: TreeNodeData[]
  /** Expanded node ids (controlled): an array or a `Set`. */
  expanded?: Set<string> | string[]
  /** Called when a node is expanded or collapsed. */
  onExpandedChange?: (next: Set<string>) => void
  /** Expanded ids at first render (uncontrolled): an array or a `Set`. */
  defaultExpanded?: Set<string> | string[]
  /** Selected node id (controlled, single selection). */
  selected?: string
  /** Selected node id at first render (uncontrolled). */
  defaultSelected?: string
  /** Called when a node is selected, with its id. */
  onSelectedChange?: (id: string) => void
  /**
   * Called when a node with `hasChildren` and no `children` is opened. Load
   * its children and pass them in `data`. Closing the node and opening it
   * again calls it again, so a load that failed can be retried. Return the
   * load's promise to tell a load in progress from one that failed: while it
   * runs, closing and opening the node does not ask a second time (an app
   * that appends what arrives would get every child twice). The Tree only
   * watches it end: show a failure from your own code.
   */
  // biome-ignore lint/suspicious/noConfusingVoidType: a callback that returns nothing is as valid as one that returns its load.
  onLoadChildren?: (node: TreeNodeData) => void | PromiseLike<unknown>
  /** Maximum recursion depth. Default `64`. */
  maxDepth?: number
  /** Horizontal indent per nesting level in pixels. Default `16`. */
  indentSize?: number
  labels?: Partial<TreeLabels>
}
```

## `data/video` — `@amfernandesinc/ui/video`

### Video

`import { Video } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/video"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `src` | `string` | **obrigatória** | — |
| `aria-label` | `string` | — | Accessible label (required unless aria-labelledby is set). |
| `aria-labelledby` | `string` | — | Override aria-labelledby instead. |
| `poster` | `string` | — | — |
| `captions` | `VideoCaptionTrack[]` | — | — |
| `aspectRatio` | `number` | `16 / 9` | — |
| `objectFit` | `keyof typeof objectFitMap` | `"contain"` | How the video fills the box. `"contain"` shows the whole frame, so a vertical phone video in a 16:9 box is not cropped. |
| `preload` | `"none" \| "metadata" \| "auto"` | `"metadata"` | — |
| `crossOrigin` | `React.VideoHTMLAttributes<HTMLVideoElement>["crossOrigin"]` | — | CORS mode of the media and its caption files. Not set by default: a video on a host without CORS headers still plays. Captions served from another origin need `"anonymous"` (and CORS headers on that server). |
| `allowedProtocols` | `string[]` | — | Protocols the address may use. It **replaces** the default list (`http:`, `https:`): for a `blob:` preview pass `[...DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, "blob:"]`. |
| `labels` | `Partial<VideoLabels>` | — | — |
| `ref` | `React.Ref<HTMLVideoElement>` | — | The `<video>`; `null` while the address is refused. |

Repassa também: atributos HTML do React (`HTMLAttributes`, `MediaHTMLAttributes`, `VideoHTMLAttributes`).

### defaultVideoLabels

`import { defaultVideoLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/video"`

```ts
const defaultVideoLabels: VideoLabels = {
  error: "Não foi possível carregar o vídeo",
  invalid: "Fonte de vídeo inválida",
  retry: "Tentar de novo",
}
```

### VideoCaptionTrack

`import type { VideoCaptionTrack } from "@amfernandesinc/ui"`

```ts
export interface VideoCaptionTrack {
  src: string
  srcLang: string
  label: string
  default?: boolean
  /** WebVTT track kind. Default `"captions"`. */
  kind?: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata"
}
```

### VideoLabels

`import type { VideoLabels } from "@amfernandesinc/ui"`

```ts
export interface VideoLabels {
  /** Shown when the media fails to load (network, codec, missing file). */
  error: string
  /** Shown when `src` is refused by `allowedProtocols`. */
  invalid: string
  /** Button that tries the media again after an error. */
  retry: string
}
```

### VideoProps

`import type { VideoProps } from "@amfernandesinc/ui"`

```ts
export interface VideoProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "src"> {
  src: string
  /** Accessible label (required unless aria-labelledby is set). */
  "aria-label"?: string
  /** Override aria-labelledby instead. */
  "aria-labelledby"?: string
  poster?: string
  captions?: VideoCaptionTrack[]
  aspectRatio?: number
  /**
   * How the video fills the box. `"contain"` shows the whole frame, so a
   * vertical phone video in a 16:9 box is not cropped.
   * @default "contain"
   */
  objectFit?: keyof typeof objectFitMap
  preload?: "none" | "metadata" | "auto"
  /**
   * CORS mode of the media and its caption files. Not set by default: a
   * video on a host without CORS headers still plays. Captions served from
   * another origin need `"anonymous"` (and CORS headers on that server).
   */
  crossOrigin?: React.VideoHTMLAttributes<HTMLVideoElement>["crossOrigin"]
  /**
   * Protocols the address may use. It **replaces** the default list
   * (`http:`, `https:`): for a `blob:` preview pass
   * `[...DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, "blob:"]`.
   */
  allowedProtocols?: string[]
  labels?: Partial<VideoLabels>
  /** The `<video>`; `null` while the address is refused. */
  ref?: React.Ref<HTMLVideoElement>
}
```
