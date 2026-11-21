import { addDays } from "date-fns"
import { describe, expect, it } from "vitest"

import { hiddenCountByColumn, layoutDayColumn, layoutRow } from "./schedule-layout"

const d = (day: number, hour = 0, minute = 0) => new Date(2026, 10, day, hour, minute)
const week = Array.from({ length: 7 }, (_, i) => addDays(d(15), i)) // dom. 15 → sáb. 21
const ev = (id: string, start: Date, end: Date, allDay = false) => ({
  id,
  title: id,
  start,
  end,
  allDay,
})

describe("layoutRow", () => {
  it("returns nothing for an empty row", () => {
    expect(layoutRow([ev("a", d(16, 9), d(16, 10))], [])).toEqual([])
  })

  it("drops events outside the row", () => {
    const before = ev("before", d(10), d(14), true)
    const after = ev("after", d(22, 9), d(22, 10))
    expect(layoutRow([before, after], week)).toEqual([])
  })

  it("puts overlapping bars in separate lanes and reuses free lanes", () => {
    const segments = layoutRow(
      [
        ev("long", d(16), d(19), true),
        ev("overlap", d(18), d(20), true),
        ev("later", d(20, 9), d(20, 10)),
        ev("early", d(15, 9), d(15, 10)),
      ],
      week,
    )
    const byId = Object.fromEntries(segments.map((s) => [s.event.id, s]))
    expect(byId.long).toMatchObject({ startCol: 1, endCol: 4, lane: 0 })
    expect(byId.overlap).toMatchObject({ startCol: 3, endCol: 5, lane: 1 })
    expect(byId.early).toMatchObject({ startCol: 0, endCol: 0, lane: 0 })
    // Column 5 is free in lane 0 (long ends on col 4).
    expect(byId.later).toMatchObject({ startCol: 5, endCol: 5, lane: 0 })
  })

  it("places longer spans first when they start on the same day", () => {
    const segments = layoutRow(
      [ev("chip", d(16, 9), d(16, 10)), ev("bar", d(16), d(18), true)],
      week,
    )
    expect(segments.map((s) => [s.event.id, s.lane])).toEqual([
      ["bar", 0],
      ["chip", 1],
    ])
  })

  it("clips spans to the row and flags continuations", () => {
    const [segment] = layoutRow([ev("trip", d(13), d(24), true)], week)
    expect(segment).toMatchObject({
      startCol: 0,
      endCol: 6,
      continuesBefore: true,
      continuesAfter: true,
    })
    const [inside] = layoutRow([ev("inside", d(16), d(17), true)], week)
    expect(inside).toMatchObject({ continuesBefore: false, continuesAfter: false })
  })
})

describe("hiddenCountByColumn", () => {
  it("counts segments beyond the visible lanes on each day they cover", () => {
    const segments = layoutRow(
      [
        ev("a", d(16), d(18), true),
        ev("b", d(16), d(17), true),
        ev("c", d(16, 9), d(16, 10)),
        ev("d", d(17, 9), d(17, 10)),
      ],
      week,
    )
    expect(hiddenCountByColumn(segments, 7, 2)).toEqual([0, 1, 1, 0, 0, 0, 0])
    expect(hiddenCountByColumn(segments, 7, 3)).toEqual([0, 0, 0, 0, 0, 0, 0])
  })
})

describe("layoutDayColumn", () => {
  it("positions events by time", () => {
    const [p] = layoutDayColumn([ev("a", d(18, 9), d(18, 10, 30))], d(18), 0, 24, 48)
    expect(p).toMatchObject({ top: 9 * 48, height: 1.5 * 48, column: 0, columns: 1 })
  })

  it("lays overlapping events side by side, per cluster", () => {
    const placements = layoutDayColumn(
      [
        ev("daily", d(18, 9), d(18, 9, 30)),
        ev("review", d(18, 9, 15), d(18, 10, 30)),
        ev("visit", d(18, 10), d(18, 11)),
        ev("lunch", d(18, 12), d(18, 13)),
      ],
      d(18),
      0,
      24,
      48,
    )
    const byId = Object.fromEntries(placements.map((p) => [p.event.id, p]))
    expect(byId.daily).toMatchObject({ column: 0, columns: 2 })
    expect(byId.review).toMatchObject({ column: 1, columns: 2 })
    // daily ended at 9:30, so visit reuses column 0.
    expect(byId.visit).toMatchObject({ column: 0, columns: 2 })
    expect(byId.lunch).toMatchObject({ column: 0, columns: 1 })
  })

  it("clips to minHour/maxHour and skips events outside", () => {
    const placements = layoutDayColumn(
      [
        ev("early", d(18, 6), d(18, 8)),
        ev("straddle", d(18, 6), d(18, 9)),
        ev("late", d(18, 17), d(18, 20)),
        ev("night", d(18, 20), d(18, 21)),
      ],
      d(18),
      7,
      19,
      40,
    )
    const byId = Object.fromEntries(placements.map((p) => [p.event.id, p]))
    expect(byId.early).toMatchObject({ top: 0, height: 40 })
    expect(byId.straddle).toMatchObject({ top: 0, height: 80 })
    expect(byId.late).toMatchObject({ top: 10 * 40, height: 80 })
    expect(byId.night).toBeUndefined()
  })

  it("keeps a minimum height and treats it as occupied for collisions", () => {
    const placements = layoutDayColumn(
      [ev("a", d(18, 9), d(18, 9, 5)), ev("b", d(18, 9, 10), d(18, 9, 20))],
      d(18),
      0,
      24,
      48,
      20,
    )
    const byId = Object.fromEntries(placements.map((p) => [p.event.id, p]))
    expect(byId.a?.height).toBe(20)
    // 5 minutes = 4px, but the block is 20px tall (≈25 min): b must not sit on it.
    expect(byId.b).toMatchObject({ column: 1, columns: 2 })
  })

  it("handles zero-length events", () => {
    const [p] = layoutDayColumn([ev("ping", d(18, 9), d(18, 9))], d(18), 0, 24, 48)
    expect(p).toMatchObject({ top: 9 * 48, height: 20 })
  })
})
