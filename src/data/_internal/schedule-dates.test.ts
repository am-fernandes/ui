import { describe, expect, it } from "vitest"

import {
  compareEvents,
  eventAccessibleName,
  eventDays,
  eventNameAsShown,
  eventOverlapsDay,
  eventOverlapsRange,
  formatDayLong,
  formatDayRange,
  formatEventTime,
  formatPeriodTitle,
  formatRowTime,
  formatTime,
  getViewRange,
  isAllDayRowEvent,
  isBarEvent,
  isoDay,
  monthShort,
  shiftDate,
  weekdayShort,
} from "./schedule-dates"

const d = (month: number, day: number, hour = 0, minute = 0, year = 2026) =>
  new Date(year, month - 1, day, hour, minute)
const ev = (start: Date, end: Date, extra: Partial<{ allDay: boolean; title: string }> = {}) => ({
  id: "x",
  title: extra.title ?? "Evento",
  start,
  end,
  allDay: extra.allDay,
})

describe("schedule-dates", () => {
  it("spells pt-BR short weekdays and months with accents and periods", () => {
    expect([15, 16, 17, 18, 19, 20, 21].map((day) => weekdayShort(d(11, day)))).toEqual([
      "dom.",
      "seg.",
      "ter.",
      "qua.",
      "qui.",
      "sex.",
      "sáb.",
    ])
    expect(Array.from({ length: 12 }, (_, m) => monthShort(d(m + 1, 1)))).toEqual([
      "jan.",
      "fev.",
      "mar.",
      "abr.",
      "mai.",
      "jun.",
      "jul.",
      "ago.",
      "set.",
      "out.",
      "nov.",
      "dez.",
    ])
  })

  it("formats days and times", () => {
    expect(formatDayLong(d(11, 21))).toBe("sábado, 21 de novembro")
    expect(formatTime(d(11, 21, 9, 5))).toBe("09:05")
    expect(isoDay(d(11, 1))).toBe("2026-11-01")
  })

  it("formats day ranges", () => {
    expect(formatDayRange(d(11, 21), d(11, 21))).toBe("21 de nov. de 2026")
    expect(formatDayRange(d(11, 15), d(11, 21))).toBe("15 – 21 de nov. de 2026")
    expect(formatDayRange(d(11, 29), d(12, 5))).toBe("29 de nov. – 5 de dez. de 2026")
    expect(formatDayRange(d(12, 28), d(1, 3, 0, 0, 2027))).toBe(
      "28 de dez. de 2026 – 3 de jan. de 2027",
    )
  })

  describe("getViewRange", () => {
    it("month covers whole weeks around the month", () => {
      const sunday = getViewRange("month", d(11, 18), 0, 7)
      expect(isoDay(sunday.start)).toBe("2026-11-01")
      expect(sunday.days).toHaveLength(35)
      expect(isoDay(sunday.end)).toBe("2026-12-06")

      const monday = getViewRange("month", d(11, 18), 1, 7)
      expect(isoDay(monday.start)).toBe("2026-10-26")
      expect(monday.days).toHaveLength(42)
    })

    it("week starts on the configured weekday", () => {
      expect(isoDay(getViewRange("week", d(11, 18), 0, 7).start)).toBe("2026-11-15")
      expect(isoDay(getViewRange("week", d(11, 18), 1, 7).start)).toBe("2026-11-16")
      expect(getViewRange("week", d(11, 18), 0, 7).days).toHaveLength(7)
    })

    it("day and list start at the focused day", () => {
      const day = getViewRange("day", d(11, 18, 15), 0, 7)
      expect(day.days.map(isoDay)).toEqual(["2026-11-18"])
      expect(getViewRange("list", d(11, 18), 0, 3).days.map(isoDay)).toEqual([
        "2026-11-18",
        "2026-11-19",
        "2026-11-20",
      ])
      // Clamped to at least one whole day.
      expect(getViewRange("list", d(11, 18), 0, 0).days).toHaveLength(1)
      expect(getViewRange("list", d(11, 18), 0, 2.7).days).toHaveLength(2)
    })
  })

  it("shifts by one period in each view", () => {
    expect(isoDay(shiftDate("month", d(11, 18), 1, 7))).toBe("2026-12-18")
    expect(isoDay(shiftDate("month", d(11, 18), -1, 7))).toBe("2026-10-18")
    expect(isoDay(shiftDate("week", d(11, 18), 1, 7))).toBe("2026-11-25")
    expect(isoDay(shiftDate("day", d(11, 18), -1, 7))).toBe("2026-11-17")
    expect(isoDay(shiftDate("list", d(11, 18), 1, 14))).toBe("2026-12-02")
    expect(isoDay(shiftDate("list", d(11, 18), -1, 0))).toBe("2026-11-17")
  })

  it("titles each view", () => {
    expect(formatPeriodTitle("month", d(11, 18), 0, 7)).toBe("novembro de 2026")
    expect(formatPeriodTitle("week", d(11, 18), 0, 7)).toBe("15 – 21 de nov. de 2026")
    expect(formatPeriodTitle("day", d(11, 18), 0, 7)).toBe("quarta-feira, 18 de novembro")
    expect(formatPeriodTitle("list", d(11, 28), 0, 7)).toBe("28 de nov. – 4 de dez. de 2026")
  })

  describe("eventDays", () => {
    it("treats a timed end as exclusive", () => {
      const { first, last } = eventDays(ev(d(11, 18, 22), d(11, 19, 0)))
      expect(isoDay(first)).toBe("2026-11-18")
      expect(isoDay(last)).toBe("2026-11-18")
    })

    it("spans days for timed events crossing midnight", () => {
      expect(isoDay(eventDays(ev(d(11, 18, 22), d(11, 19, 2))).last)).toBe("2026-11-19")
    })

    it("treats an all-day end as the last day, inclusive", () => {
      expect(isoDay(eventDays(ev(d(11, 23), d(11, 25), { allDay: true })).last)).toBe("2026-11-25")
    })

    it("collapses empty or inverted ranges to the start day", () => {
      expect(isoDay(eventDays(ev(d(11, 18, 9), d(11, 18, 9))).last)).toBe("2026-11-18")
      expect(isoDay(eventDays(ev(d(11, 18, 9), d(11, 17, 9))).last)).toBe("2026-11-18")
      // All-day with an end time before the start on the same day.
      expect(isoDay(eventDays(ev(d(11, 18, 12), d(11, 18, 13), { allDay: true })).last)).toBe(
        "2026-11-18",
      )
    })
  })

  it("decides bars versus timed chips", () => {
    expect(isBarEvent(ev(d(11, 18), d(11, 18), { allDay: true }))).toBe(true)
    expect(isBarEvent(ev(d(11, 18, 22), d(11, 19, 2)))).toBe(true)
    expect(isBarEvent(ev(d(11, 18, 9), d(11, 18, 10)))).toBe(false)
  })

  it("sends only all-day events and events of 24 hours or more to the all-day row", () => {
    expect(isAllDayRowEvent(ev(d(11, 18), d(11, 18), { allDay: true }))).toBe(true)
    expect(isAllDayRowEvent(ev(d(11, 18, 9), d(11, 20, 18)))).toBe(true)
    expect(isAllDayRowEvent(ev(d(11, 18, 22), d(11, 19, 2)))).toBe(false)
    expect(isAllDayRowEvent(ev(d(11, 18, 9), d(11, 18, 10)))).toBe(false)
  })

  it("checks overlap with days and ranges", () => {
    const multi = ev(d(11, 23), d(11, 25), { allDay: true })
    expect(eventOverlapsDay(multi, d(11, 24, 15))).toBe(true)
    expect(eventOverlapsDay(multi, d(11, 26))).toBe(false)
    expect(eventOverlapsDay(multi, d(11, 22))).toBe(false)
    expect(eventOverlapsRange(multi, d(11, 25), d(11, 30))).toBe(true)
    expect(eventOverlapsRange(multi, d(11, 26), d(11, 30))).toBe(false)
    expect(eventOverlapsRange(multi, d(11, 16), d(11, 23))).toBe(false)
  })

  it("orders events chronologically, all-day first, longer first, then by title", () => {
    const a = ev(d(11, 18, 9), d(11, 18, 10), { title: "B" })
    const b = ev(d(11, 18, 9), d(11, 18, 10), { title: "A" })
    const longer = ev(d(11, 18, 9), d(11, 18, 12), { title: "Z" })
    const later = ev(d(11, 18, 11), d(11, 18, 12))
    const allDay = ev(d(11, 18), d(11, 18), { allDay: true, title: "Feriado" })
    const nextDay = ev(d(11, 19, 8), d(11, 19, 9))
    const sorted = [nextDay, later, a, b, longer, allDay].sort(compareEvents)
    expect(sorted).toEqual([allDay, longer, b, a, later, nextDay])
    expect(compareEvents(a, allDay)).toBeGreaterThan(0)
  })

  it("formats event times", () => {
    expect(formatEventTime(ev(d(11, 18, 9), d(11, 18, 10, 30)), "Dia inteiro")).toBe(
      "09:00 – 10:30",
    )
    expect(formatEventTime(ev(d(11, 18), d(11, 18), { allDay: true }), "Dia inteiro")).toBe(
      "Dia inteiro",
    )
    expect(formatEventTime(ev(d(11, 23), d(11, 25), { allDay: true }), "dia inteiro")).toBe(
      "dia inteiro, 23 – 25 de nov. de 2026",
    )
    expect(formatEventTime(ev(d(11, 19, 22), d(11, 20, 4)), "Dia inteiro")).toBe(
      "19 de nov., 22:00 – 20 de nov., 04:00",
    )
  })

  // axe (label-content-name-mismatch, WCAG 2.5.3) wants the text on the
  // event inside its name, in the same order: the name led with the title
  // while a month chip reads "15:00 Comitê" and a list row "09:00 – 10:00 Daily".
  it("names each variant in the order it is drawn", () => {
    const daily = ev(d(11, 18, 9), d(11, 18, 10), { title: "Daily" })
    expect(eventNameAsShown("chip", daily, "Dia inteiro")).toBe(
      "09:00 Daily, quarta-feira, 18 de novembro, 09:00 – 10:00",
    )
    expect(eventNameAsShown("block", daily, "Dia inteiro")).toBe(
      "Daily, 09:00 – 10:00, quarta-feira, 18 de novembro",
    )
    expect(eventNameAsShown("block", daily, "Dia inteiro", "pt-BR", { showTime: false })).toBe(
      "Daily, quarta-feira, 18 de novembro, 09:00 – 10:00",
    )
    expect(eventNameAsShown("row", daily, "Dia inteiro", "pt-BR", { day: d(11, 18) })).toBe(
      "09:00 – 10:00 Daily, quarta-feira, 18 de novembro",
    )
    const feriado = ev(d(11, 20), d(11, 20), { allDay: true, title: "Feriado" })
    expect(eventNameAsShown("bar", feriado, "Dia inteiro")).toBe(
      "Feriado, sexta-feira, 20 de novembro, dia inteiro",
    )
    expect(eventNameAsShown("row", feriado, "Dia inteiro", "pt-BR", { day: d(11, 20) })).toBe(
      "Dia inteiro Feriado, sexta-feira, 20 de novembro",
    )
    const plantao = ev(d(11, 19, 22), d(11, 20, 4), { title: "Plantão" })
    expect(eventNameAsShown("block", plantao, "Dia inteiro")).toBe(
      eventAccessibleName(plantao, "Dia inteiro"),
    )
  })

  it("builds full accessible names", () => {
    expect(
      eventAccessibleName(ev(d(11, 18, 9), d(11, 18, 10), { title: "Daily" }), "Dia inteiro"),
    ).toBe("Daily, quarta-feira, 18 de novembro, 09:00 – 10:00")
    expect(
      eventAccessibleName(
        ev(d(11, 20), d(11, 20), { allDay: true, title: "Feriado" }),
        "Dia inteiro",
      ),
    ).toBe("Feriado, sexta-feira, 20 de novembro, dia inteiro")
    expect(
      eventAccessibleName(
        ev(d(11, 23), d(11, 25), { allDay: true, title: "Treino" }),
        "Dia inteiro",
      ),
    ).toBe("Treino, dia inteiro, 23 – 25 de nov. de 2026")
  })

  it("formats the time column of list rows per day", () => {
    const crossing = ev(d(11, 19, 22), d(11, 21, 4))
    expect(formatRowTime(crossing, d(11, 19), "Dia inteiro")).toBe("22:00 – …")
    expect(formatRowTime(crossing, d(11, 20), "Dia inteiro")).toBe("Dia inteiro")
    expect(formatRowTime(crossing, d(11, 21), "Dia inteiro")).toBe("… – 04:00")
    expect(formatRowTime(ev(d(11, 18, 9), d(11, 18, 10)), d(11, 18), "Dia inteiro")).toBe(
      "09:00 – 10:00",
    )
    expect(
      formatRowTime(ev(d(11, 18), d(11, 19), { allDay: true }), d(11, 19), "Dia inteiro"),
    ).toBe("Dia inteiro")
  })
})
