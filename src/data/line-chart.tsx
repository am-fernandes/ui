"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  ChartFrame,
  type ChartLabels,
  ChartLegend,
  type ChartSeries,
  ChartTable,
  ChartTooltip,
  defaultChartLabels,
  fillClass,
  measureText,
  strokeClass,
  useChartCursor,
  useChartWidth,
  useWebFontsLoaded,
} from "./_internal/chart-frame"
import {
  type Point,
  areaPath,
  axisTickFormat,
  checkSeriesCount,
  defaultFormatX,
  formatNumber,
  labelStride,
  linePath,
  lineRuns,
  linearScale,
  nearestIndex,
  niceTicks,
  readValue,
  seriesSlots,
} from "./_internal/chart-scale"

export type { ChartLabels, ChartSeries }

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

const TOP = 12
const AXIS_BAND = 24
const GAP = 8
/** Up to this many series are named at the end of their line. */
const DIRECT_LABELS = 4
/** End labels closer than this would collide: the legend carries the names. */
const LABEL_SPACING = 14

function LineChart<T extends Record<string, unknown>>({
  data,
  x,
  series,
  area = false,
  formatValue = formatNumber,
  formatX,
  height = 280,
  title,
  description,
  showTable = false,
  labels: labelsProp,
  emptyMessage,
  loading = false,
  id,
  className,
}: LineChartProps<T>) {
  checkSeriesCount(series.length, "LineChart")
  const labels = { ...defaultChartLabels, ...labelsProp }
  const autoId = React.useId()
  const baseId = id ?? autoId
  const titleId = `${baseId}-title`
  const descriptionId = `${baseId}-description`
  const hintId = `${baseId}-hint`

  const [containerRef, width] = useChartWidth()
  useWebFontsLoaded()
  const [hidden, setHidden] = React.useState<Set<string>>(new Set())
  const slots = seriesSlots(series)
  const visible = series.slice(0, 6).filter((s) => !hidden.has(s.key))
  const xs = data.map((record) => record[x])
  const xText = xs.map((value) =>
    formatX ? formatX(value as T[keyof T & string]) : defaultFormatX(value, xs),
  )
  const values = visible.map((s) => data.map((record) => readValue(record, s.key)))
  const cursor = useChartCursor(data.length)
  const narrow = width < 480
  const empty = data.length === 0
  const withArea = area && visible.length === 1

  // Value domain: the data, with zero when the area is filled down to it.
  const all = values.flat().filter((v): v is number => v != null)
  const lo = Math.min(...all, withArea ? 0 : Number.POSITIVE_INFINITY)
  const hi = Math.max(...all, withArea ? 0 : Number.NEGATIVE_INFINITY)
  const plotHeightGuess = height - TOP - AXIS_BAND
  const scale = niceTicks(
    all.length ? lo : 0,
    all.length ? hi : 1,
    Math.max(2, Math.min(6, Math.floor(plotHeightGuess / 56))),
  )
  const tickText = axisTickFormat(scale.ticks)
  const left = Math.ceil(Math.max(...scale.ticks.map((t) => measureText(tickText(t))))) + GAP

  // End of each line: the last point with a value.
  const ends = values.map((run) => {
    for (let i = run.length - 1; i >= 0; i--) if (run[i] != null) return i
    return -1
  })
  const y = linearScale([scale.min, scale.max], [height - AXIS_BAND, TOP])
  const endYs = values.map((run, j) => {
    const at = ends[j] ?? -1
    return at === -1 ? null : y(run[at] as number)
  })
  const sortedEnds = endYs.filter((v): v is number => v != null).sort((a, b) => a - b)
  const collide = sortedEnds.some(
    (v, i) => i > 0 && v - (sortedEnds[i - 1] as number) < LABEL_SPACING,
  )
  // Direct labels: the series name at the end of its line, in text colour
  // beside the coloured end dot. Two or more series only (one is in the
  // title), up to four, on a wide chart, and only when they do not collide.
  const direct = visible.length >= 2 && visible.length <= DIRECT_LABELS && !narrow && !collide
  const labelWidth = direct ? Math.max(...visible.map((s) => measureText(s.label, 500))) : 0
  const lastX = xText[xText.length - 1] ?? ""
  const right = direct
    ? Math.ceil(labelWidth) + 16
    : Math.max(GAP, Math.ceil(measureText(lastX) / 2) + 2)
  const plotWidth = Math.max(1, width - left - right)
  const plotBottom = height - AXIS_BAND
  const positions = data.map((_, i) =>
    data.length === 1 ? left + plotWidth / 2 : left + (i * plotWidth) / (data.length - 1),
  )
  const stride = labelStride(
    data.length,
    plotWidth,
    Math.max(...xText.map((t) => measureText(t)), 0) + 12,
  )

  const toggle = (key: string) =>
    setHidden((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const describe = (index: number) => {
    const parts = visible.map((s, j) => {
      const v = values[j]?.[index]
      return `${s.label}: ${v == null ? labels.missing : formatValue(v)}`
    })
    return `${xText[index] ?? ""}. ${parts.join("; ")}`
  }

  const active = cursor.active
  const hitFrom = (event: React.PointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.ownerSVGElement?.getBoundingClientRect()
    if (!box) return
    cursor.point(nearestIndex(positions, event.clientX - box.left))
  }

  let tooltip: React.ReactNode = null
  if (active != null) {
    const ys = values.map((run) => run[active]).filter((v): v is number => v != null)
    const anchorY = ys.length ? y(Math.max(...ys)) - 8 : TOP
    tooltip = (
      <ChartTooltip
        x={positions[active] ?? 0}
        y={anchorY}
        width={width}
        title={xText[active] ?? ""}
        rows={visible.map((s, j) => {
          const v = values[j]?.[active]
          return {
            key: s.key,
            label: s.label,
            slot: slots.get(s.key) ?? 1,
            value: v == null ? labels.missing : formatValue(v),
          }
        })}
      />
    )
  }

  const legend = (
    <ChartLegend
      kind="line"
      label={labels.legend}
      onToggle={toggle}
      entries={series.slice(0, 6).map((s) => ({
        key: s.key,
        label: s.label,
        slot: slots.get(s.key) ?? 1,
        hidden: hidden.has(s.key),
      }))}
    />
  )

  const table = (
    <ChartTable
      caption={title}
      categoryLabel={labels.category}
      columns={visible.map((s) => s.label)}
      visible={showTable}
      rows={data.map((_, i) => ({
        key: `${i}-${xText[i]}`,
        category: xText[i] ?? "",
        values: visible.map((_s, j) => {
          const v = values[j]?.[i]
          return v == null ? labels.missing : formatValue(v)
        }),
      }))}
    />
  )

  return (
    <ChartFrame
      slot="line-chart"
      titleId={titleId}
      title={title}
      descriptionId={descriptionId}
      description={description}
      legend={legend}
      legendBelow={narrow}
      containerRef={containerRef}
      height={height}
      loading={loading}
      empty={empty}
      emptyMessage={emptyMessage ?? labels.empty}
      table={table}
      announcement={
        loading ? labels.loading : active != null && cursor.fromKeyboard ? describe(active) : ""
      }
      className={className}
    >
      <span id={hintId} hidden>
        {labels.keyboardHint}
      </span>
      <svg
        role="img"
        // Focusable: the arrows move through the points, showing each value.
        // biome-ignore lint/a11y/noNoninteractiveTabindex: a keyboard path to the values the pointer gets.
        tabIndex={0}
        aria-labelledby={titleId}
        aria-describedby={[description ? descriptionId : null, hintId].filter(Boolean).join(" ")}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block overflow-visible rounded-element outline-none focus-visible:focus-outline"
        onKeyDown={cursor.onKeyDown}
        onBlur={cursor.clear}
        onPointerLeave={cursor.clear}
      >
        {/* role="img" makes everything inside presentational; the title names it. */}
        <title>{title}</title>
        <g>
          {scale.ticks.map((tick) => {
            const at = Math.round(y(tick)) + 0.5
            return (
              <g key={tick} data-slot="line-chart-tick">
                <line
                  x1={left}
                  x2={left + plotWidth}
                  y1={at}
                  y2={at}
                  className={cn(
                    "stroke-border forced-colors:stroke-[GrayText]",
                    tick === scale.min && "stroke-border-strong forced-colors:stroke-[CanvasText]",
                  )}
                />
                <text
                  x={left - GAP}
                  y={at}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-xs tabular-nums forced-colors:fill-[CanvasText]"
                >
                  {tickText(tick)}
                </text>
              </g>
            )
          })}
          {xText.map((text, i) =>
            i % stride === 0 ? (
              <text
                // biome-ignore lint/suspicious/noArrayIndexKey: x values may repeat a label.
                key={i}
                data-slot="line-chart-x"
                x={positions[i]}
                y={plotBottom + 16}
                textAnchor="middle"
                className="fill-muted-foreground text-xs forced-colors:fill-[CanvasText]"
              >
                {text}
              </text>
            ) : null,
          )}
        </g>
        {active != null ? (
          <line
            data-slot="line-chart-crosshair"
            x1={Math.round(positions[active] ?? 0) + 0.5}
            x2={Math.round(positions[active] ?? 0) + 0.5}
            y1={TOP}
            y2={plotBottom}
            className="stroke-border-strong forced-colors:stroke-[CanvasText]"
          />
        ) : null}
        {visible.map((s, j) => {
          const slot = slots.get(s.key) ?? 1
          const run = values[j] ?? []
          const points = run.map((v, i): Point | null =>
            v == null ? null : { x: positions[i] ?? 0, y: y(v) },
          )
          const runs = lineRuns(points)
          const endIndex = ends[j] ?? -1
          return (
            <g key={s.key} data-slot="line-chart-series" data-series={s.key}>
              {withArea
                ? runs.map((r) => (
                    <path
                      key={`area-${r[0]?.x}`}
                      d={areaPath(r, y(Math.max(scale.min, Math.min(0, scale.max))))}
                      fillOpacity={0.1}
                      data-slot="line-chart-area"
                      className={cn(fillClass[slot], "forced-colors:hidden")}
                    />
                  ))
                : null}
              {runs.map((r) =>
                r.length > 1 ? (
                  <path
                    key={`line-${r[0]?.x}`}
                    d={linePath(r)}
                    fill="none"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    data-slot="line-chart-line"
                    className={cn(strokeClass[slot], "forced-colors:stroke-[CanvasText]")}
                  />
                ) : (
                  // A point alone between gaps: a dot, or it would not show.
                  <circle
                    key={`dot-${r[0]?.x}`}
                    cx={r[0]?.x}
                    cy={r[0]?.y}
                    r={4}
                    strokeWidth={2}
                    className={cn(fillClass[slot], "stroke-card forced-colors:fill-[CanvasText]")}
                  />
                ),
              )}
              {endIndex !== -1 ? (
                <circle
                  data-slot="line-chart-end"
                  cx={positions[endIndex]}
                  cy={y(run[endIndex] as number)}
                  r={4}
                  strokeWidth={2}
                  className={cn(fillClass[slot], "stroke-card forced-colors:fill-[CanvasText]")}
                />
              ) : null}
              {direct && endIndex !== -1 ? (
                <text
                  data-slot="line-chart-label"
                  x={(positions[endIndex] ?? 0) + 10}
                  y={y(run[endIndex] as number)}
                  dominantBaseline="middle"
                  className="fill-foreground text-xs font-medium forced-colors:fill-[CanvasText]"
                >
                  {s.label}
                </text>
              ) : null}
              {active != null && run[active] != null ? (
                <circle
                  data-slot="line-chart-point"
                  cx={positions[active]}
                  cy={y(run[active] as number)}
                  r={4}
                  strokeWidth={2}
                  className={cn(fillClass[slot], "stroke-card forced-colors:fill-[Highlight]")}
                />
              ) : null}
            </g>
          )
        })}
        {/* Hit area: the whole plot; the pointer snaps to the nearest x. */}
        <rect
          data-slot="line-chart-hit"
          x={left}
          y={TOP}
          width={plotWidth}
          height={plotBottom - TOP}
          fill="transparent"
          onPointerMove={hitFrom}
          onPointerDown={hitFrom}
        />
      </svg>
      {tooltip}
    </ChartFrame>
  )
}

LineChart.displayName = "LineChart"

export { LineChart }
