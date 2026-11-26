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
  useChartCursor,
  useChartWidth,
  useHiddenSeries,
  useTextMeasure,
  useWebFontsLoaded,
} from "./_internal/chart-frame"
import {
  BAR_GAP,
  MAX_BAR,
  asSentence,
  axisTickFormat,
  bandScale,
  barPath,
  checkSeriesCount,
  formatNumber,
  groupLayout,
  labelStride,
  linearScale,
  niceTicks,
  readValue,
  seriesSlots,
  stackExtent,
  stackValues,
  truncateToWidth,
} from "./_internal/chart-scale"

export type { ChartLabels, ChartSeries }
export { defaultChartLabels } from "./_internal/chart-frame"

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

const MARGIN = { top: 8, right: 8, gapToLabels: 8 }
const AXIS_BAND = 24

function BarChart<T extends Record<string, unknown>>({
  data,
  category,
  series,
  orientation = "vertical",
  stacked = false,
  formatValue = formatNumber,
  height: heightProp,
  title,
  description,
  showTable = false,
  labels: labelsProp,
  emptyMessage,
  loading = false,
  id,
  className,
}: BarChartProps<T>) {
  checkSeriesCount(series.length, "BarChart")
  const labels = { ...defaultChartLabels, ...labelsProp }
  const autoId = React.useId()
  const baseId = id ?? autoId
  const titleId = `${baseId}-title`
  const descriptionId = `${baseId}-description`
  const hintId = `${baseId}-hint`
  const horizontal = orientation === "horizontal"

  const [containerRef, width] = useChartWidth()
  useWebFontsLoaded()
  const measureText = useTextMeasure()
  const [hidden, toggle] = useHiddenSeries(series)
  const slots = seriesSlots(series)
  const visible = series.slice(0, 6).filter((s) => !hidden.has(s.key))
  const categories = data.map((record) => String(record[category] ?? ""))
  const rows = data.map((record) => visible.map((s) => readValue(record, s.key)))
  const cursor = useChartCursor(data.length)

  const height = heightProp ?? (horizontal ? Math.max(160, data.length * 36 + AXIS_BAND) : 280)
  const narrow = width < 480
  const empty = data.length === 0

  // Value domain: zero always in view, bars grow from it.
  const [lo, hi] = stacked
    ? stackExtent(rows)
    : rows
        .flat()
        .reduce<[number, number]>(
          ([a, b], v) => (v == null ? [a, b] : [Math.min(a, v), Math.max(b, v)]),
          [0, 0],
        )
  const valueLength = horizontal ? width : height
  const scale = niceTicks(
    lo,
    hi,
    Math.max(2, Math.min(6, Math.floor(valueLength / (horizontal ? 90 : 56)))),
  )
  const tickText = axisTickFormat(scale.ticks)

  // Margins: room for the value ticks (vertical) or the category names (horizontal).
  const valueLabelWidth = Math.max(...scale.ticks.map((t) => measureText(tickText(t))))
  const categoryWidth = Math.max(0, ...categories.map((c) => measureText(c)))
  const left = horizontal
    ? Math.min(Math.ceil(categoryWidth), Math.floor(width * (narrow ? 0.4 : 0.35))) +
      MARGIN.gapToLabels
    : Math.ceil(valueLabelWidth) + MARGIN.gapToLabels
  const lastTickHalf = measureText(tickText(scale.ticks[scale.ticks.length - 1] ?? 0)) / 2
  const right = horizontal ? Math.max(MARGIN.right, Math.ceil(lastTickHalf) + 2) : MARGIN.right
  const top = MARGIN.top
  const bottom = AXIS_BAND
  const plotWidth = Math.max(1, width - left - right)
  const plotHeight = Math.max(1, height - top - bottom)

  const bands = bandScale(data.length, horizontal ? plotHeight : plotWidth, 0.3)
  const value = horizontal
    ? linearScale([scale.min, scale.max], [left, left + plotWidth])
    : linearScale([scale.min, scale.max], [top + plotHeight, top])
  const zero = value(0)
  const group = stacked
    ? {
        thickness: Math.min(MAX_BAR, bands.bandwidth),
        offsets: [-Math.min(MAX_BAR, bands.bandwidth) / 2],
      }
    : groupLayout(bands.bandwidth, visible.length)
  const along = (index: number) => (horizontal ? top : left) + bands.center(index)

  // Category labels: every category keeps its name while a short one fits
  // (cut with "…", full text on hover and in the table); past that, every
  // second (third…) label is drawn, with the room of the ones skipped.
  const shortest = Math.min(categoryWidth, 40) + 8
  const stride = horizontal
    ? labelStride(data.length, plotHeight, 16)
    : labelStride(data.length, plotWidth, shortest)
  const labelRoom = horizontal ? left - MARGIN.gapToLabels : bands.step * stride - 6

  const describe = (index: number) => {
    const name = categories[index] ?? ""
    const parts = visible.map((s, j) => {
      const v = rows[index]?.[j]
      return `${s.label}: ${v == null ? labels.missing : formatValue(v)}`
    })
    return `${asSentence(name)} ${parts.join("; ")}`
  }

  const active = cursor.active
  const bars: React.ReactNode[] = []
  data.forEach((_, i) => {
    const row = rows[i] ?? []
    const segments = stacked ? stackValues(row) : null
    visible.forEach((s, j) => {
      const v = row[j]
      if (v == null || v === 0) return
      const slot = slots.get(s.key) ?? 1
      let from = 0
      let to = v
      let round = true
      let gapAtBase = 0
      if (segments) {
        const segment = segments[j]
        if (!segment) return
        from = segment.from
        to = segment.to
        round = segment.outermost
        gapAtBase = segment.innermost ? 0 : BAR_GAP
      }
      const offset = stacked ? (group.offsets[0] ?? 0) : (group.offsets[j] ?? 0)
      const cross = along(i) + offset
      const a = value(from)
      const b = value(to)
      const positive = to > from
      let d: string
      if (horizontal) {
        const x0 = positive ? a + gapAtBase : b
        const x1 = positive ? b : a - gapAtBase
        if (x1 - x0 <= 0) return
        d = barPath(x0, cross, x1 - x0, group.thickness, positive ? "right" : "left", round)
      } else {
        const y0 = positive ? b : a + gapAtBase
        const y1 = positive ? a - gapAtBase : b
        if (y1 - y0 <= 0) return
        d = barPath(cross, y0, group.thickness, y1 - y0, positive ? "top" : "bottom", round)
      }
      bars.push(
        <path
          key={`${i}-${s.key}`}
          d={d}
          data-slot="bar-chart-bar"
          data-series={s.key}
          data-category={categories[i]}
          className={cn(fillClass[slot], "forced-colors:fill-[CanvasText]")}
        />,
      )
    })
  })

  // The tooltip sits by the category, at the reach of its tallest bar.
  let tooltip: React.ReactNode = null
  if (active != null) {
    const row = rows[active] ?? []
    const reach = stacked
      ? stackValues(row).reduce((m, s) => (s && s.to > 0 ? Math.max(m, s.to) : m), 0)
      : Math.max(0, ...row.map((v) => v ?? 0))
    const anchor = horizontal
      ? { x: value(reach), y: along(active) - 20 }
      : { x: along(active), y: value(reach) - 8 }
    tooltip = (
      <ChartTooltip
        x={anchor.x}
        y={anchor.y}
        width={width}
        title={categories[active] ?? ""}
        rows={visible.map((s, j) => {
          const v = row[j]
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
      kind="bar"
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
        key: `${i}-${categories[i]}`,
        category: categories[i] ?? "",
        values: visible.map((_s, j) => {
          const v = rows[i]?.[j]
          return v == null ? labels.missing : formatValue(v)
        }),
      }))}
    />
  )

  return (
    <ChartFrame
      slot="bar-chart"
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
        // Focusable: the arrows move through the categories, showing each value.
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
        {/* Grid: hairlines on the value ticks, the zero line a step stronger. */}
        <g>
          {scale.ticks.map((tick) => {
            const at = Math.round(value(tick)) + 0.5
            return (
              <g key={tick} data-slot="bar-chart-tick">
                {horizontal ? (
                  <line
                    x1={at}
                    x2={at}
                    y1={top}
                    y2={top + plotHeight}
                    className={cn(
                      "stroke-border forced-colors:stroke-[GrayText]",
                      tick === 0 && "stroke-border-strong forced-colors:stroke-[CanvasText]",
                    )}
                  />
                ) : (
                  <line
                    x1={left}
                    x2={left + plotWidth}
                    y1={at}
                    y2={at}
                    className={cn(
                      "stroke-border forced-colors:stroke-[GrayText]",
                      tick === 0 && "stroke-border-strong forced-colors:stroke-[CanvasText]",
                    )}
                  />
                )}
                <text
                  x={horizontal ? at : left - MARGIN.gapToLabels}
                  y={horizontal ? top + plotHeight + 16 : at}
                  textAnchor={horizontal ? "middle" : "end"}
                  dominantBaseline={horizontal ? "auto" : "middle"}
                  className="fill-muted-foreground text-xs tabular-nums forced-colors:fill-[CanvasText]"
                >
                  {tickText(tick)}
                </text>
              </g>
            )
          })}
          {categories.map((name, i) => {
            if (i % stride !== 0) return null
            const shown = truncateToWidth(name, labelRoom, (t) => measureText(t))
            return (
              <text
                // biome-ignore lint/suspicious/noArrayIndexKey: categories may repeat a name.
                key={i}
                data-slot="bar-chart-category"
                x={horizontal ? left - MARGIN.gapToLabels : along(i)}
                y={horizontal ? along(i) : top + plotHeight + 16}
                textAnchor={horizontal ? "end" : "middle"}
                dominantBaseline={horizontal ? "middle" : "auto"}
                className="fill-muted-foreground text-xs forced-colors:fill-[CanvasText]"
              >
                {shown !== name ? <title>{name}</title> : null}
                {shown}
              </text>
            )
          })}
        </g>
        {active != null ? (
          <rect
            data-slot="bar-chart-highlight"
            x={horizontal ? left : left + active * bands.step}
            y={horizontal ? top + active * bands.step : top}
            width={horizontal ? plotWidth : bands.step}
            height={horizontal ? bands.step : plotHeight}
            className="fill-foreground/5 forced-colors:fill-[Highlight] forced-colors:opacity-30"
          />
        ) : null}
        <g>{bars}</g>
        {/* Hit areas: the whole band of a category, bigger than its bars. */}
        <g>
          {data.map((_, i) => (
            <rect
              // biome-ignore lint/suspicious/noArrayIndexKey: one hit area per category position.
              key={i}
              data-slot="bar-chart-hit"
              x={horizontal ? left : left + i * bands.step}
              y={horizontal ? top + i * bands.step : top}
              width={horizontal ? plotWidth : bands.step}
              height={horizontal ? bands.step : plotHeight}
              fill="transparent"
              onPointerEnter={() => cursor.point(i)}
              onPointerMove={() => cursor.point(i)}
            />
          ))}
        </g>
      </svg>
      {tooltip}
    </ChartFrame>
  )
}

BarChart.displayName = "BarChart"

export { BarChart }
