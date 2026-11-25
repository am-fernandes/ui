/**
 * Pure helpers of the chart components: scales, round ticks, bands, stacks,
 * bar and line geometry, number formats and series colours. No React here,
 * so each piece is tested on its own.
 */

/** The categorical palette ends at `--chart-6`. */
export const MAX_SERIES = 6

/** Bars are thin: never thicker than this, whatever the room (dataviz spec). */
export const MAX_BAR = 24
/** Surface gap between touching fills (adjacent bars, stacked segments). */
export const BAR_GAP = 2
/** Rounded data end of a bar; the baseline end stays square. */
export const BAR_RADIUS = 4

export interface SeriesLike {
  key: string
  /** Pins the series to `--chart-N`, so removing another series repaints nothing. */
  color?: number
}

/**
 * A seventh series is a development error: there is no seventh colour, and a
 * cycled or generated one would be confused with another series.
 */
export function checkSeriesCount(count: number, component: string): void {
  if (count <= MAX_SERIES) return
  const message = `[${component}] ${count} series; the most is ${MAX_SERIES}, as the categorical colours end at --chart-${MAX_SERIES}. Group the smallest series into "Outros", or split the data into two charts.`
  if (process.env.NODE_ENV !== "production") throw new Error(message)
  console.error(message)
}

/**
 * The colour slot (1–6) of each series. A pinned `color` is kept; the others
 * take, in order, the slots nobody pinned. Colour belongs to the series:
 * hiding one (from the legend) keeps every slot.
 */
export function seriesSlots(series: SeriesLike[]): Map<string, number> {
  const pinned = new Set(
    series.map((s) => s.color).filter((c): c is number => c != null && c >= 1 && c <= MAX_SERIES),
  )
  const slots = new Map<string, number>()
  let next = 1
  for (const s of series) {
    if (s.color != null && s.color >= 1 && s.color <= MAX_SERIES) {
      slots.set(s.key, s.color)
      continue
    }
    while (pinned.has(next)) next++
    slots.set(s.key, Math.min(next, MAX_SERIES))
    next++
  }
  return slots
}

export const seriesColor = (slot: number) => `var(--chart-${slot})`

/** A round step near `span / count`: 1, 2, 2.5 or 5 times a power of ten. */
export function niceStep(span: number, count: number): number {
  const raw = Math.abs(span) / Math.max(1, count)
  if (!Number.isFinite(raw) || raw === 0) return 1
  const power = 10 ** Math.floor(Math.log10(raw))
  const fraction = raw / power
  const nice =
    fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10
  return nice * power
}

function decimalsOfStep(step: number): number {
  if (step >= 1) return 0
  return Math.min(10, Math.max(0, -Math.floor(Math.log10(step)) + 1))
}

/**
 * Round ticks covering `[min, max]`, about `count` of them. The domain grows
 * to the outer ticks, so the grid ends on a labelled line.
 */
export function niceTicks(
  min: number,
  max: number,
  count = 5,
): { min: number; max: number; ticks: number[] } {
  let lo = Number.isFinite(min) ? min : 0
  let hi = Number.isFinite(max) ? max : 0
  if (lo > hi) [lo, hi] = [hi, lo]
  if (lo === hi) {
    if (lo === 0) hi = 1
    else if (lo > 0) lo = 0
    else hi = 0
  }
  const step = niceStep(hi - lo, count)
  const places = decimalsOfStep(step)
  const round = (v: number) => Number(v.toFixed(places))
  const start = round(Math.floor(lo / step + 1e-9) * step)
  const end = round(Math.ceil(hi / step - 1e-9) * step)
  const ticks: number[] = []
  for (let i = 0; ; i++) {
    const value = round(start + i * step)
    if (value > end + step / 2) break
    ticks.push(Object.is(value, -0) ? 0 : value)
  }
  return { min: start, max: end, ticks }
}

/** Maps `domain` onto `range` linearly. */
export function linearScale(
  [d0, d1]: [number, number],
  [r0, r1]: [number, number],
): (value: number) => number {
  const span = d1 - d0 || 1
  return (value) => r0 + ((value - d0) / span) * (r1 - r0)
}

export interface Bands {
  /** Room per category. */
  step: number
  /** The part of it the marks may use (the rest is air between categories). */
  bandwidth: number
  /** Start of category `index`'s usable band. */
  start: (index: number) => number
  /** Centre of category `index`. */
  center: (index: number) => number
}

/** Splits `length` into `count` equal bands, `padding` of each left as air. */
export function bandScale(count: number, length: number, padding = 0.3): Bands {
  const step = count > 0 ? length / count : length
  const bandwidth = step * (1 - padding)
  return {
    step,
    bandwidth,
    start: (index) => index * step + (step - bandwidth) / 2,
    center: (index) => index * step + step / 2,
  }
}

/**
 * Bars of one category side by side: each at most `MAX_BAR` thick, with the
 * surface gap between them, centred in the band. Returns the offset of each
 * bar from the band centre and the thickness.
 */
export function groupLayout(
  bandwidth: number,
  bars: number,
): { thickness: number; offsets: number[] } {
  if (bars <= 0) return { thickness: 0, offsets: [] }
  const room = (bandwidth - BAR_GAP * (bars - 1)) / bars
  const thickness = Math.max(1, Math.min(MAX_BAR, room))
  const total = thickness * bars + BAR_GAP * (bars - 1)
  const offsets = Array.from({ length: bars }, (_, i) => -total / 2 + i * (thickness + BAR_GAP))
  return { thickness, offsets }
}

export interface StackSegment {
  /** Value where the segment starts (the baseline side). */
  from: number
  /** Value where it ends (the data side). */
  to: number
  /** No segment on this side of zero after it: its data end is the bar's. */
  outermost: boolean
  /** No segment on this side of zero before it: it touches the baseline. */
  innermost: boolean
}

/**
 * Stacks one category's values: positives up from zero, negatives down, each
 * side in the order given. `null` and `0` take no room.
 */
export function stackValues(values: Array<number | null>): Array<StackSegment | null> {
  let up = 0
  let down = 0
  const segments: Array<StackSegment | null> = values.map((value) => {
    if (value == null || value === 0 || !Number.isFinite(value)) return null
    if (value > 0) {
      const segment = { from: up, to: up + value, outermost: false, innermost: up === 0 }
      up += value
      return segment
    }
    const segment = { from: down, to: down + value, outermost: false, innermost: down === 0 }
    down += value
    return segment
  })
  // The last segment on each side carries the bar's data end.
  let lastUp = -1
  let lastDown = -1
  segments.forEach((segment, index) => {
    if (segment && segment.to > 0) lastUp = index
    if (segment && segment.to < 0) lastDown = index
  })
  if (lastUp !== -1) (segments[lastUp] as StackSegment).outermost = true
  if (lastDown !== -1) (segments[lastDown] as StackSegment).outermost = true
  return segments
}

/** Highest and lowest totals of a stacked chart (the bars' reach). */
export function stackExtent(rows: Array<Array<number | null>>): [number, number] {
  let lo = 0
  let hi = 0
  for (const row of rows) {
    for (const segment of stackValues(row)) {
      if (!segment) continue
      lo = Math.min(lo, segment.to)
      hi = Math.max(hi, segment.to)
    }
  }
  return [lo, hi]
}

/**
 * A bar as a path: square at the baseline, rounded on the data end. `end`
 * says which side is the data end; the radius shrinks to fit a thin or short
 * bar. `round: false` draws a plain rectangle (an inner stacked segment).
 */
export function barPath(
  x: number,
  y: number,
  width: number,
  height: number,
  end: "top" | "bottom" | "left" | "right",
  round = true,
): string {
  const w = Math.max(0, width)
  const h = Math.max(0, height)
  const f = (n: number) => Number(n.toFixed(2))
  const across = end === "top" || end === "bottom" ? w : h
  const along = end === "top" || end === "bottom" ? h : w
  const r = round ? Math.min(BAR_RADIUS, across / 2, along) : 0
  const x1 = x + w
  const y1 = y + h
  if (r === 0) return `M${f(x)},${f(y)}H${f(x1)}V${f(y1)}H${f(x)}Z`
  const arc = (tx: number, ty: number) => `A${f(r)},${f(r)} 0 0 1 ${f(tx)},${f(ty)}`
  switch (end) {
    case "top":
      return `M${f(x)},${f(y1)}V${f(y + r)}${arc(x + r, y)}H${f(x1 - r)}${arc(x1, y + r)}V${f(y1)}Z`
    case "bottom":
      return `M${f(x1)},${f(y)}V${f(y1 - r)}${arc(x1 - r, y1)}H${f(x + r)}${arc(x, y1 - r)}V${f(y)}Z`
    case "right":
      return `M${f(x)},${f(y)}H${f(x1 - r)}${arc(x1, y + r)}V${f(y1 - r)}${arc(x1 - r, y1)}H${f(x)}Z`
    case "left":
      return `M${f(x1)},${f(y1)}H${f(x + r)}${arc(x, y1 - r)}V${f(y + r)}${arc(x + r, y)}H${f(x1)}Z`
  }
}

export interface Point {
  x: number
  y: number
}

/** Runs of consecutive points: a `null` (missing value) breaks the line. */
export function lineRuns(points: Array<Point | null>): Point[][] {
  const runs: Point[][] = []
  let current: Point[] = []
  for (const point of points) {
    if (point == null) {
      if (current.length) runs.push(current)
      current = []
    } else current.push(point)
  }
  if (current.length) runs.push(current)
  return runs
}

const fmt = (n: number) => Number(n.toFixed(2))

export function linePath(run: Point[]): string {
  return run.map((p, i) => `${i === 0 ? "M" : "L"}${fmt(p.x)},${fmt(p.y)}`).join("")
}

/** The area under a run, closed on `baseline`. */
export function areaPath(run: Point[], baseline: number): string {
  if (run.length === 0) return ""
  const first = run[0] as Point
  const last = run[run.length - 1] as Point
  return `${linePath(run)}L${fmt(last.x)},${fmt(baseline)}L${fmt(first.x)},${fmt(baseline)}Z`
}

/** Index of the position nearest to `at`. */
export function nearestIndex(positions: number[], at: number): number {
  let best = 0
  let distance = Number.POSITIVE_INFINITY
  positions.forEach((p, i) => {
    const d = Math.abs(p - at)
    if (d < distance) {
      distance = d
      best = i
    }
  })
  return best
}

/**
 * Every how many labels one is drawn, so labels about `labelSize` wide (plus
 * air) fit in `available`. 1 = all of them.
 */
export function labelStride(count: number, available: number, labelSize: number): number {
  if (count <= 1 || available <= 0) return 1
  return Math.max(1, Math.ceil((count * labelSize) / available))
}

const numberFormats = new Map<string, Intl.NumberFormat>()
function numberFormat(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = JSON.stringify(options)
  let f = numberFormats.get(key)
  if (!f) {
    f = new Intl.NumberFormat("pt-BR", options)
    numberFormats.set(key, f)
  }
  return f
}

/** Brazilian number format, up to two decimals: `1.250,5`. */
/**
 * The start of an announcement: `label` and a period, without doubling one
 * that is already there ("dez." from the month names stays "dez.", not "dez..").
 */
export function asSentence(label: string): string {
  const trimmed = label.trim()
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

export function formatNumber(value: number): string {
  return numberFormat({ maximumFractionDigits: 2 }).format(value)
}

/**
 * Format of an axis's ticks, one style for the whole axis: in full below
 * 10.000 ("2.500"), compact from there ("10 mil", "1,5 mi").
 */
export function axisTickFormat(ticks: number[]): (value: number) => string {
  const reach = Math.max(0, ...ticks.map((t) => Math.abs(t)))
  if (reach >= 10_000) {
    const compact = numberFormat({ notation: "compact", maximumFractionDigits: 1 })
    // Intl puts a no-break space in "10 mil"; plain spaces copy and search the same.
    return (value) => compact.format(value).replace(/\u00a0/g, " ")
  }
  return formatNumber
}

const ISO_MONTH = /^(\d{4})-(\d{2})$/
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Default label of an `x` value: an ISO month ("2026-03") reads "mar.", with
 * the two-digit year when the series spans years ("mar. 26"); an ISO day
 * reads "15 de mar."; anything else as text.
 */
export function defaultFormatX(value: unknown, all: unknown[] = []): string {
  if (typeof value !== "string") return value == null ? "" : String(value)
  const month = ISO_MONTH.exec(value)
  if (month) {
    const date = new Date(Date.UTC(Number(month[1]), Number(month[2]) - 1, 1))
    const name = numberlessMonth(date)
    const years = new Set(
      all
        .filter((v): v is string => typeof v === "string" && ISO_MONTH.test(v))
        .map((v) => v.slice(0, 4)),
    )
    return years.size > 1 ? `${name} ${month[1]?.slice(2)}` : name
  }
  const day = ISO_DAY.exec(value)
  if (day) {
    const date = new Date(Date.UTC(Number(day[1]), Number(day[2]) - 1, Number(day[3])))
    return new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(date)
  }
  return value
}

function numberlessMonth(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" }).format(date)
}

/**
 * Cuts `text` to fit `maxWidth`, ending in "…". `measure` gives a string's
 * width in px.
 */
export function truncateToWidth(
  text: string,
  maxWidth: number,
  measure: (text: string) => number,
): string {
  if (measure(text) <= maxWidth) return text
  let lo = 0
  let hi = text.length
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    if (measure(`${text.slice(0, mid).trimEnd()}…`) <= maxWidth) lo = mid
    else hi = mid - 1
  }
  return lo === 0 ? "…" : `${text.slice(0, lo).trimEnd()}…`
}

/** Reads a number from a data record; anything else is a missing value. */
export function readValue(record: Record<string, unknown>, key: string): number | null {
  const value = record[key]
  return typeof value === "number" && Number.isFinite(value) ? value : null
}
