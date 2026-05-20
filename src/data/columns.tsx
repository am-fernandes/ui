import type { ColumnDef, Row } from "@tanstack/react-table"
import { format } from "date-fns"
import type * as React from "react"

import { Tooltip, type TooltipProps } from "../overlays/tooltip"

export type DateColumnShowTime = boolean | "auto"

export interface DateColumnOptions<TData> {
  accessorKey: keyof TData & string
  header: string | (() => React.ReactNode)
  /**
   * Whether to render the time portion (`HH:mm`).
   * - `"auto"` (default): infers from the value. Hides time when the source is a
   *   plain `YYYY-MM-DD` / `DD/MM/YYYY` string, or when hours/minutes/seconds are all zero.
   * - `true`: always renders date + time.
   * - `false`: always renders date only.
   */
  showTime?: DateColumnShowTime
  /** Extra class on the cell `<span>`. */
  className?: string
  /** Placeholder text when the value is empty or unparseable. Defaults to "". */
  emptyText?: string
}

const BR_DATE_RE = /^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/
const ISO_DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/
const BR_DATE_ONLY_RE = /^\d{2}\/\d{2}\/\d{4}$/

function parseDateValue(v: unknown): Date | null {
  if (v == null || v === "") return null
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v
  if (typeof v === "number") {
    const d = new Date(v)
    return Number.isNaN(d.getTime()) ? null : d
  }
  if (typeof v !== "string") return null
  const isoDateOnly = v.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoDateOnly) {
    const [, y, m, d] = isoDateOnly
    const dt = new Date(Number(y), Number(m) - 1, Number(d))
    return Number.isNaN(dt.getTime()) ? null : dt
  }
  const br = v.match(BR_DATE_RE)
  if (br) {
    const [, dd, mm, yyyy, hh, mi, ss] = br
    const d = new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      hh ? Number(hh) : 0,
      mi ? Number(mi) : 0,
      ss ? Number(ss) : 0,
    )
    return Number.isNaN(d.getTime()) ? null : d
  }
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

function inferShowTime(rawValue: unknown, mode: DateColumnShowTime): boolean {
  if (mode === true) return true
  if (mode === false) return false
  if (typeof rawValue === "string") {
    if (ISO_DATE_ONLY_RE.test(rawValue)) return false
    if (BR_DATE_ONLY_RE.test(rawValue)) return false
  }
  const parsed = parseDateValue(rawValue)
  if (!parsed) return false
  return parsed.getHours() !== 0 || parsed.getMinutes() !== 0 || parsed.getSeconds() !== 0
}

/**
 * Column helper for date / datetime fields.
 *
 * - Formats values as `dd/MM/yyyy` (date) or `dd/MM/yyyy HH:mm` (datetime).
 * - Sorting works correctly even when the underlying value is a localized string,
 *   because the `sortingFn` compares by parsed timestamp.
 *
 * Accepted value types: `Date`, ISO string (`"2026-05-19"` / `"2026-05-19T14:30:00Z"`),
 * BR string (`"19/05/2026"` / `"19/05/2026 14:30"`), epoch millis (number), `null`, `""`.
 */
export function dateColumn<TData>(opts: DateColumnOptions<TData>): ColumnDef<TData> {
  const { accessorKey, header, showTime = "auto", className, emptyText = "" } = opts
  return {
    accessorKey,
    header,
    cell: ({ getValue }) => {
      const raw = getValue()
      const parsed = parseDateValue(raw)
      if (!parsed) return emptyText
      const withTime = inferShowTime(raw, showTime)
      const fmt = withTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"
      const text = format(parsed, fmt)
      return className ? <span className={className}>{text}</span> : text
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = parseDateValue(rowA.getValue(columnId))?.getTime()
      const b = parseDateValue(rowB.getValue(columnId))?.getTime()
      if (a == null && b == null) return 0
      if (a == null) return -1
      if (b == null) return 1
      return a < b ? -1 : a > b ? 1 : 0
    },
  } as ColumnDef<TData>
}

type FormattedColumnAccessor<TData, TValue> =
  | {
      accessorKey: keyof TData & string
      accessorFn?: never
      id?: string
    }
  | {
      accessorKey?: never
      accessorFn: (row: TData, rowIndex: number) => TValue
      id: string
    }

/**
 * Cap displayed text length and show the full content on hover.
 * Only applies when the formatted output is a string longer than `max`.
 */
export interface TruncateOption {
  /** Max characters before clipping with "…" and showing a tooltip. */
  max: number
  /** Tooltip side. Defaults to `"bottom"`. */
  side?: TooltipProps["side"]
  /** Tooltip alignment along its side. */
  align?: TooltipProps["align"]
}

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
   * The xlsx export and the column's sort/filter use the raw value — only the
   * UI display goes through `format`. Optional; omit to render the raw value.
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
   * Cap the displayed text length and show the full string in a tooltip
   * on hover. Only kicks in when the formatted value is a string longer
   * than `truncate.max`.
   */
  truncate?: TruncateOption
}

/**
 * Column helper that decouples the display format from the underlying value.
 *
 * @example
 * formattedColumn<Lead, string>({
 *   accessorFn: (lead) => lead.phone,
 *   id: 'phone',
 *   header: 'Telefone',
 *   format: (raw) => formatPhone(raw ?? ''),
 *   emptyText: '—',
 * })
 */
export function formattedColumn<TData, TValue = unknown>(
  opts: FormattedColumnOptions<TData, TValue>,
): ColumnDef<TData> {
  const {
    header,
    format: formatter,
    className,
    emptyText = "",
    enableSorting,
    sortingFn,
    truncate,
  } = opts
  const access =
    opts.accessorKey != null
      ? { accessorKey: opts.accessorKey, ...(opts.id ? { id: opts.id } : {}) }
      : { accessorFn: opts.accessorFn, id: opts.id }
  return {
    ...access,
    header,
    enableSorting,
    sortingFn,
    cell: ({ getValue, row }: { getValue: () => unknown; row: Row<TData> }) => {
      const raw = getValue() as TValue
      if (raw == null || raw === "") return emptyText
      const node = formatter ? formatter(raw, row.original) : (raw as React.ReactNode)

      if (truncate && typeof node === "string" && node.length > truncate.max) {
        const short = `${node.slice(0, truncate.max).trimEnd()}…`
        return (
          <Tooltip content={node} side={truncate.side ?? "bottom"} align={truncate.align}>
            <span className={className}>{short}</span>
          </Tooltip>
        )
      }

      return className ? <span className={className}>{node}</span> : node
    },
  } as ColumnDef<TData>
}
