"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "../../primitives/skeleton"
import { tableStyles } from "../table-styles"

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

export const defaultChartLabels: ChartLabels = {
  keyboardHint: "Use as setas para percorrer os valores.",
  empty: "Sem dados para exibir.",
  loading: "Carregando gráfico…",
  category: "Categoria",
  legend: "Séries",
  missing: "—",
}

// Literal class names, so Tailwind finds them and a forced-colours rule can
// still win over them (an inline style would not lose to a class).
export const fillClass = [
  "",
  "fill-chart-1",
  "fill-chart-2",
  "fill-chart-3",
  "fill-chart-4",
  "fill-chart-5",
  "fill-chart-6",
] as const
export const strokeClass = [
  "",
  "stroke-chart-1",
  "stroke-chart-2",
  "stroke-chart-3",
  "stroke-chart-4",
  "stroke-chart-5",
  "stroke-chart-6",
] as const
export const bgClass = [
  "",
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-chart-6",
] as const

/** Width of the element, followed with a ResizeObserver; `fallback` until measured (and on the server). */
export function useChartWidth(fallback = 640) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState(fallback)
  React.useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () => {
      const next = Math.floor(element.clientWidth)
      if (next > 0) setWidth(next)
    }
    measure()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

let measureContext: CanvasRenderingContext2D | null | undefined
/** Width in px of `text` at 12px in the page's font; an estimate where there is no canvas. */
export function measureText(text: string, weight = 400): number {
  if (measureContext === undefined) {
    measureContext = null
    const isBrowser =
      typeof document !== "undefined" &&
      typeof navigator !== "undefined" &&
      !navigator.userAgent.includes("jsdom")
    if (isBrowser) measureContext = document.createElement("canvas").getContext("2d")
  }
  if (!measureContext) return text.length * 6.6
  const family = getComputedStyle(document.body).fontFamily || "sans-serif"
  measureContext.font = `${weight} 12px ${family}`
  return measureContext.measureText(text).width
}

/**
 * Keyboard and pointer cursor over the chart's positions (categories or x
 * values). Arrows move it, Home/End jump, Escape clears; what it lands on
 * from the keyboard is announced.
 */
export function useChartCursor(count: number) {
  const [active, setActive] = React.useState<number | null>(null)
  const [fromKeyboard, setFromKeyboard] = React.useState(false)
  const index = active != null && active < count ? active : null

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (count === 0) return
    const last = count - 1
    const current = index ?? -1
    const moves: Record<string, () => number> = {
      ArrowRight: () => Math.min(last, current + 1),
      ArrowDown: () => Math.min(last, current + 1),
      ArrowLeft: () => (current === -1 ? 0 : Math.max(0, current - 1)),
      ArrowUp: () => (current === -1 ? 0 : Math.max(0, current - 1)),
      Home: () => 0,
      End: () => last,
    }
    if (event.key === "Escape") {
      setActive(null)
      return
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    setFromKeyboard(true)
    setActive(move())
  }

  return {
    active: index,
    fromKeyboard,
    onKeyDown,
    point: (next: number | null) => {
      setFromKeyboard(false)
      setActive(next)
    },
    clear: () => setActive(null),
  }
}

export interface LegendEntry {
  key: string
  label: string
  slot: number
  hidden: boolean
}

/**
 * Two or more series: the legend, whose entries show and hide their series
 * (the colours stay with the series). One series: no legend, the title names it.
 */
export function ChartLegend({
  entries,
  kind,
  label,
  onToggle,
}: {
  entries: LegendEntry[]
  kind: "bar" | "line"
  label: string
  onToggle: (key: string) => void
}) {
  if (entries.length < 2) return null
  const shown = entries.filter((e) => !e.hidden).length
  return (
    <ul aria-label={label} data-slot="chart-legend" className="flex flex-wrap gap-x-3 gap-y-1">
      {entries.map((entry) => (
        <li key={entry.key}>
          <button
            type="button"
            aria-pressed={!entry.hidden}
            // The last series on screen stays: an empty chart says nothing.
            disabled={!entry.hidden && shown === 1}
            onClick={() => onToggle(entry.key)}
            className={cn(
              "inline-flex min-h-6 cursor-pointer items-center gap-2 rounded-inner px-1 text-xs text-muted-foreground state-layer focus-visible:focus-outline disabled:cursor-default",
              entry.hidden && "line-through decoration-muted-foreground",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "shrink-0 forced-colors:bg-[CanvasText]",
                kind === "bar" ? "size-3 rounded-[2px]" : "h-0.5 w-3 rounded-full",
                bgClass[entry.slot],
                entry.hidden && "opacity-30",
              )}
            />
            {entry.label}
          </button>
        </li>
      ))}
    </ul>
  )
}

export interface TooltipRow {
  key: string
  label: string
  slot: number
  value: string
}

/**
 * The readout at the cursor: the value leads, the series name follows, keyed
 * by a short stroke of its colour. Hidden from assistive technology: the
 * chart announces the same text, and the table has every value.
 */
export function ChartTooltip({
  x,
  y,
  width,
  title,
  rows,
}: {
  x: number
  y: number
  width: number
  title: string
  rows: TooltipRow[]
}) {
  const flip = x > width / 2
  return (
    <div
      aria-hidden="true"
      data-slot="chart-tooltip"
      className="pointer-events-none absolute z-10 flex min-w-32 max-w-60 flex-col gap-1 rounded-element border border-border-strong bg-popover px-2.5 py-2 text-xs text-popover-foreground"
      style={{
        left: x,
        top: Math.max(0, y),
        transform: flip ? "translateX(calc(-100% - 12px))" : "translateX(12px)",
      }}
    >
      <span className="text-muted-foreground">{title}</span>
      {rows.map((row) => (
        <span key={row.key} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              "h-0.5 w-3 shrink-0 rounded-full forced-colors:bg-[CanvasText]",
              bgClass[row.slot],
            )}
          />
          <span className="font-semibold tabular-nums text-foreground">{row.value}</span>
          <span className="truncate text-muted-foreground">{row.label}</span>
        </span>
      ))}
    </div>
  )
}

/** The chart's numbers as a real table: always there for assistive technology, on screen with `visible`. */
export function ChartTable({
  caption,
  categoryLabel,
  columns,
  rows,
  visible,
}: {
  caption: string
  categoryLabel: string
  columns: string[]
  rows: Array<{ key: string; category: string; values: string[] }>
  visible: boolean
}) {
  const t = tableStyles()
  return (
    <div data-slot="chart-table" className={visible ? "w-full overflow-x-auto" : "sr-only"}>
      <table className={t.table}>
        <caption className="sr-only">{caption}</caption>
        <thead className={t.header}>
          <tr>
            <th scope="col" className={t.head}>
              {categoryLabel}
            </th>
            {columns.map((column) => (
              <th key={column} scope="col" className={cn(t.head, "text-right")}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={t.body}>
          {rows.map((row) => (
            <tr key={row.key} className="border-b">
              <th scope="row" className={cn(t.cell, "text-left font-normal")}>
                {row.category}
              </th>
              {row.values.map((value, i) => (
                <td key={columns[i]} className={cn(t.cell, "text-right tabular-nums")}>
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * The figure around a chart: title (its accessible name) and description,
 * the legend (above it on wide screens, below on narrow ones), the plot of a
 * fixed height that includes the axes, the table view and the announcer.
 */
export function ChartFrame({
  slot,
  titleId,
  title,
  descriptionId,
  description,
  legend,
  legendBelow,
  containerRef,
  height,
  loading,
  empty,
  emptyMessage,
  table,
  announcement,
  className,
  children,
}: {
  slot: string
  titleId: string
  title: string
  descriptionId: string
  description?: React.ReactNode
  legend: React.ReactNode
  legendBelow: boolean
  containerRef: React.Ref<HTMLDivElement>
  height: number
  loading: boolean
  empty: boolean
  emptyMessage: React.ReactNode
  table: React.ReactNode
  announcement: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <figure
      data-slot={slot}
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
      className={cn("m-0 flex w-full min-w-0 flex-col gap-3", className)}
    >
      <figcaption className="flex flex-col gap-0.5">
        <span
          id={titleId}
          data-slot="chart-title"
          className="text-sm font-semibold text-foreground"
        >
          {title}
        </span>
        {description ? (
          <span id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </span>
        ) : null}
      </figcaption>
      {legendBelow || loading || empty ? null : legend}
      <div ref={containerRef} data-slot="chart-plot" className="relative w-full" style={{ height }}>
        {loading ? (
          <Skeleton aria-hidden="true" className="absolute inset-0" />
        ) : empty ? (
          <div
            data-slot="chart-empty"
            className="absolute inset-0 flex items-center justify-center rounded-element bg-muted p-4 text-center text-sm text-muted-foreground"
          >
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </div>
      {legendBelow && !loading && !empty ? legend : null}
      {loading || empty ? null : table}
      <div aria-live="polite" data-slot="chart-announcer" className="sr-only">
        {announcement}
      </div>
    </figure>
  )
}
