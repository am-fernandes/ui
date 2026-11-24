/**
 * What `DataTable` reads from a column's `meta`. TanStack types `meta` as an
 * open object, so these keys are written as plain properties:
 *
 * ```ts
 * { accessorKey: "cpf", header: "CPF", meta: { searchText: (row) => formatCPF(row.cpf) } }
 * ```
 */
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
}

/** The DataTable part of a column's `meta`. */
export function columnMeta<TData>(meta: unknown): DataTableColumnMeta<TData> {
  return (meta ?? {}) as DataTableColumnMeta<TData>
}

/** A cell value as plain text: empty for nothing, `String()` for the rest. */
export function valueToText(value: unknown): string {
  if (value == null) return ""
  if (Array.isArray(value)) return value.map(valueToText).join(", ")
  return String(value)
}
