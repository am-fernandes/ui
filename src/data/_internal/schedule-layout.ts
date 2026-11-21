import { addDays, startOfDay } from "date-fns"

import { type ScheduleEventInput, eventDays } from "./schedule-dates"

export interface RowSegment<E extends ScheduleEventInput> {
  event: E
  /** First column (0-based) the event occupies in this row. */
  startCol: number
  /** Last column (inclusive). */
  endCol: number
  /** Stacking lane (0 = top). */
  lane: number
  /** The event started before this row. */
  continuesBefore: boolean
  /** The event goes on after this row. */
  continuesAfter: boolean
}

const DAY_MS = 24 * 60 * 60 * 1000

function dayIndex(day: Date, first: Date): number {
  return Math.round((startOfDay(day).getTime() - first.getTime()) / DAY_MS)
}

/**
 * Places events into lanes across a row of consecutive days (a month week, or
 * the all-day row of the week/day view). Each event gets the lowest lane that
 * is free on every day it covers, so spanning bars never overlap. Events are
 * expected in display order (see `compareEvents`); within the same start
 * column, longer spans go first so bars stay on top.
 */
export function layoutRow<E extends ScheduleEventInput>(
  events: E[],
  days: Date[],
): RowSegment<E>[] {
  if (days.length === 0) return []
  const first = startOfDay(days[0] as Date)
  const lastCol = days.length - 1
  const rowEnd = addDays(first, days.length)

  const placed = events
    .map((event) => {
      const span = eventDays(event)
      if (span.first.getTime() >= rowEnd.getTime() || span.last.getTime() < first.getTime()) {
        return null
      }
      const startCol = Math.max(0, dayIndex(span.first, first))
      const endCol = Math.min(lastCol, dayIndex(span.last, first))
      return {
        event,
        startCol,
        endCol,
        continuesBefore: span.first.getTime() < first.getTime(),
        continuesAfter: dayIndex(span.last, first) > lastCol,
      }
    })
    .filter((s): s is Omit<RowSegment<E>, "lane"> => s !== null)
    .map((s, order) => ({ ...s, order }))
    .sort(
      (a, b) =>
        a.startCol - b.startCol ||
        b.endCol - b.startCol - (a.endCol - a.startCol) ||
        a.order - b.order,
    )

  const lanes: boolean[][] = []
  return placed.map(({ order: _order, ...segment }) => {
    let lane = 0
    for (; ; lane++) {
      const row = lanes[lane] ?? []
      let free = true
      for (let col = segment.startCol; col <= segment.endCol; col++) {
        if (row[col]) {
          free = false
          break
        }
      }
      if (free) {
        for (let col = segment.startCol; col <= segment.endCol; col++) row[col] = true
        lanes[lane] = row
        break
      }
    }
    return { ...segment, lane }
  })
}

/** How many segments covering each column sit in a lane at or beyond `maxLanes`. */
export function hiddenCountByColumn<E extends ScheduleEventInput>(
  segments: RowSegment<E>[],
  columns: number,
  maxLanes: number,
): number[] {
  const counts = Array.from({ length: columns }, () => 0)
  for (const s of segments) {
    if (s.lane < maxLanes) continue
    for (let col = s.startCol; col <= s.endCol; col++) counts[col] = (counts[col] as number) + 1
  }
  return counts
}

export interface TimedPlacement<E extends ScheduleEventInput> {
  event: E
  /** Distance from the top of the visible hours, in px. */
  top: number
  /** Height in px (at least `minHeight`). */
  height: number
  /** Column inside its overlap cluster (0-based). */
  column: number
  /** Columns in its overlap cluster. */
  columns: number
}

/**
 * Lays out the timed events of one day column. Events are clipped to
 * [minHour, maxHour]; overlapping events (transitively, a "cluster") share the
 * width side by side, each in the first column free at its start time. A very
 * short event still occupies `minHeight` px, and that visual height counts for
 * collisions so blocks never cover each other.
 */
export function layoutDayColumn<E extends ScheduleEventInput>(
  events: E[],
  day: Date,
  minHour: number,
  maxHour: number,
  hourHeight: number,
  minHeight = 20,
): TimedPlacement<E>[] {
  const rangeStart = startOfDay(day).getTime() + minHour * 3_600_000
  const rangeEnd = startOfDay(day).getTime() + maxHour * 3_600_000
  const pxPerMs = hourHeight / 3_600_000
  const minMs = minHeight / pxPerMs

  const items = events
    .filter((e) => e.start.getTime() < rangeEnd && e.end.getTime() > rangeStart)
    .map((event) => {
      const start = Math.max(event.start.getTime(), rangeStart)
      const end = Math.max(Math.min(event.end.getTime(), rangeEnd), start)
      return { event, start, end, visualEnd: Math.max(end, start + minMs) }
    })
    .sort((a, b) => a.start - b.start || b.end - a.end)

  const result: TimedPlacement<E>[] = []
  let cluster: Array<(typeof items)[number] & { column: number }> = []
  let columnEnds: number[] = []
  let clusterEnd = Number.NEGATIVE_INFINITY

  const flush = () => {
    for (const item of cluster) {
      result.push({
        event: item.event,
        top: (item.start - rangeStart) * pxPerMs,
        height: Math.max((item.end - item.start) * pxPerMs, minHeight),
        column: item.column,
        columns: columnEnds.length,
      })
    }
    cluster = []
    columnEnds = []
  }

  for (const item of items) {
    if (item.start >= clusterEnd) flush()
    let column = columnEnds.findIndex((end) => end <= item.start)
    if (column === -1) {
      column = columnEnds.length
      columnEnds.push(item.visualEnd)
    } else {
      columnEnds[column] = item.visualEnd
    }
    cluster.push({ ...item, column })
    clusterEnd = cluster.length === 1 ? item.visualEnd : Math.max(clusterEnd, item.visualEnd)
  }
  flush()
  return result
}
