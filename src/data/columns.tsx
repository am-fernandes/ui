import type { ColumnDef, Row } from "@tanstack/react-table"
import type * as React from "react"

import { DEFAULT_TIME_ZONE, formatDate } from "@/lib/date"
import { cn } from "@/lib/utils"
import { Tooltip, type TooltipProps } from "../overlays/tooltip"
import { type InternalColumnMeta, valueToText } from "./_internal/column-meta"

export type DateColumnShowTime = boolean | "auto"

type DateColumnAccessor<TData> =
  | {
      accessorKey: keyof TData & string
      accessorFn?: never
      id?: string
    }
  | {
      accessorKey?: never
      /** Reads the date from the row (nested fields, computed values). */
      accessorFn: (row: TData, rowIndex: number) => unknown
      id: string
    }

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

const BR_DATE_RE = /^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/
const ISO_DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * A cell value in the forms `src/lib/date` reads: a `Date`, an ISO date-only
 * string (a calendar day), an ISO date-time (an instant with `Z`/offset, or a
 * wall clock without), or `null`. A Brazilian string ("19/05/2026 14:30") is
 * a wall clock, rewritten as ISO.
 */
function toDateInput(value: unknown): Date | string | null {
  if (value == null || value === "") return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === "number") return Number.isFinite(value) ? new Date(value) : null
  if (typeof value !== "string") return null
  const br = BR_DATE_RE.exec(value)
  if (br) {
    const [, dd, mm, yyyy, hh, mi, ss] = br
    return hh ? `${yyyy}-${mm}-${dd}T${hh}:${mi}${ss ? `:${ss}` : ""}` : `${yyyy}-${mm}-${dd}`
  }
  return value
}

/** Milliseconds of the instant a value stands for, or `null`. */
function instantMs(input: Date | string | null, timeZone: string): number | null {
  if (input == null) return null
  const iso = formatDate(input, "iso", timeZone)
  return iso === "" ? null : Date.parse(iso)
}

/**
 * Column helper for date / datetime fields.
 *
 * - Formats values as `dd/MM/yyyy` (date) or `dd/MM/yyyy HH:mm` (datetime),
 *   instants in `timeZone` (São Paulo by default); a date-only value is
 *   always its own calendar day.
 * - Sorting compares instants, so it is chronological even when the value is
 *   a Brazilian string.
 * - The search reads the formatted text and the export writes a real date
 *   (the day and time the cell shows).
 *
 * Accepted value types: `Date`, ISO string (`"2026-05-19"` / `"2026-05-19T14:30:00Z"`
 * / `"2026-05-19T14:30"`), BR string (`"19/05/2026"` / `"19/05/2026 14:30"`),
 * epoch millis (number), `null`, `""`.
 */
export function dateColumn<TData>(opts: DateColumnOptions<TData>): ColumnDef<TData> {
  const {
    header,
    showTime = "auto",
    timeZone = DEFAULT_TIME_ZONE,
    className,
    emptyText = "",
  } = opts
  const access =
    opts.accessorKey != null
      ? { accessorKey: opts.accessorKey, ...(opts.id ? { id: opts.id } : {}) }
      : { accessorFn: opts.accessorFn, id: opts.id }

  const withTime = (raw: unknown, input: Date | string): boolean => {
    if (showTime !== "auto") return showTime
    if (typeof input === "string" && ISO_DATE_ONLY_RE.test(input)) return false
    if (typeof raw === "string" && ISO_DATE_ONLY_RE.test(raw)) return false
    return formatDate(input, "time", timeZone) !== "00:00"
  }
  const formatValue = (raw: unknown): string | null => {
    const input = toDateInput(raw)
    if (input == null) return null
    const text = formatDate(input, withTime(raw, input) ? "brl-full" : "brl", timeZone)
    return text === "" ? null : text
  }

  const meta: InternalColumnMeta<TData> = {
    // Search what the cell shows ("19/05/2026"), not the ISO value.
    searchText: (_row, value) => formatValue(value) ?? "",
    // Export a real date: the day and time the cell shows, in the Date's
    // own fields (the sheet has no time zone).
    export: (_row, value) => {
      const input = toDateInput(value)
      if (input == null || formatValue(value) == null) return null
      const [year = 0, month = 1, day = 1] = formatDate(input, "us", timeZone)
        .split("-")
        .map(Number)
      if (!withTime(value, input)) return new Date(year, month - 1, day)
      const [hour = 0, minute = 0] = formatDate(input, "time", timeZone).split(":").map(Number)
      return new Date(year, month - 1, day, hour, minute)
    },
  }
  return {
    ...access,
    header,
    meta,
    cell: ({ getValue }) => {
      const text = formatValue(getValue())
      if (text === null) return emptyText
      return className ? <span className={className}>{text}</span> : text
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = instantMs(toDateInput(rowA.getValue(columnId)), timeZone)
      const b = instantMs(toDateInput(rowB.getValue(columnId)), timeZone)
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
  const meta: InternalColumnMeta<TData> = {
    // Numbers and money read down the right edge; text stays left.
    ...(opts.align ? { align: opts.align } : { alignNumbers: true }),
    // Search what the cell shows ("123.456.789-01", "R$ 1.234,50") when the
    // format gives text; the raw value otherwise.
    searchText: (row, value) => {
      if (value == null || value === "") return emptyText
      const node = formatter ? formatter(value as TValue, row) : value
      return typeof node === "string" || typeof node === "number"
        ? String(node)
        : valueToText(value)
    },
  }
  return {
    ...access,
    header,
    meta,
    // Only emit these keys when set: TanStack merges `{ ...defaults, ...columnDef }`,
    // so an own `sortingFn: undefined` would clobber the `"auto"` default and crash
    // `getSortingFn()` with "sortingFn is not a function".
    ...(enableSorting !== undefined ? { enableSorting } : {}),
    ...(sortingFn !== undefined ? { sortingFn } : {}),
    cell: ({ getValue, row }: { getValue: () => unknown; row: Row<TData> }) => {
      const raw = getValue() as TValue
      if (raw == null || raw === "") return emptyText
      const node = formatter ? formatter(raw, row.original) : (raw as React.ReactNode)

      // Cells produced by a `format` callback are nearly always numeric or
      // numeric-like (phone, date, currency, percentage). Wrap them with
      // `tabular-nums` so digits align vertically across rows — the typeface
      // stays the same (no Geist Mono swap), only the `tnum` OpenType feature
      // is enabled.
      const baseClass = formatter ? "tabular-nums" : undefined
      const mergedClass = cn(baseClass, className)

      if (truncate && typeof node === "string") {
        // Iterate by code points (Array.from) so we don't cut a UTF-16
        // surrogate pair in half and emit U+FFFD when the source contains
        // astral-plane characters (emoji, math-italic, etc.).
        const chars = Array.from(node)
        if (chars.length > truncate.max) {
          const short = `${chars.slice(0, truncate.max).join("").trimEnd()}…`
          return (
            <Tooltip content={node} side={truncate.side ?? "bottom"} align={truncate.align}>
              <span className={mergedClass}>{short}</span>
            </Tooltip>
          )
        }
      }

      return mergedClass ? <span className={mergedClass}>{node}</span> : node
    },
  } as ColumnDef<TData>
}
