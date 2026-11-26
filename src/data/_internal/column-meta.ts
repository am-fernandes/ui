import * as React from "react"

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
  /**
   * The column in the exported file: `false` leaves it out; a function gives
   * the value to write (row, accessor value). By default a column with data
   * exports its accessor value and a column without (actions) is left out.
   */
  export?: boolean | ((row: TData, value: unknown) => unknown)
  /** Alignment of the header, the cells and the footer. Default: left. */
  align?: "left" | "center" | "right"
}

/** Keys the library's column helpers set for the table, not for consumers. */
interface InternalColumnMeta<TData> extends DataTableColumnMeta<TData> {
  /** Set by `formattedColumn` without `align`: right when the values are numbers. */
  alignNumbers?: boolean
}

/** The DataTable part of a column's `meta`. */
export function columnMeta<TData>(meta: unknown): InternalColumnMeta<TData> {
  return (meta ?? {}) as InternalColumnMeta<TData>
}

export type { InternalColumnMeta }

/** A cell value as plain text: empty for nothing, `String()` for the rest. */
export function valueToText(value: unknown): string {
  if (value == null) return ""
  if (Array.isArray(value)) return value.map(valueToText).join(", ")
  return String(value)
}

/**
 * `true` inside the button that wraps a clickable row's first cell: content
 * there must not add focusable elements of its own (a button cannot hold one).
 */
export const InsideRowActionContext = React.createContext(false)
