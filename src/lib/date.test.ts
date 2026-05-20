import { describe, expect, it } from "vitest"

import {
  addDays,
  addMonths,
  compareDates,
  diffInDays,
  endOfDay,
  endOfMonth,
  formatDate,
  isFuture,
  isPast,
  isSameDay,
  isValidDate,
  parseDate,
  startOfDay,
  startOfMonth,
  subDays,
} from "./date"

describe("formatDate", () => {
  it("formats brl by default", () => {
    expect(formatDate("2024-01-15")).toBe("15/01/2024")
  })

  it("formats brl-full with time", () => {
    expect(formatDate("2024-01-15T14:30:00.000Z", "brl-full")).toBe("15/01/2024 14:30")
  })

  it("formats us", () => {
    expect(formatDate("2024-01-15", "us")).toBe("2024-01-15")
  })

  it("formats time", () => {
    expect(formatDate("2024-01-15T09:05:00.000Z", "time")).toBe("09:05")
  })

  it("returns empty string for null/undefined/invalid", () => {
    expect(formatDate(null)).toBe("")
    expect(formatDate(undefined)).toBe("")
    expect(formatDate("not-a-date")).toBe("")
  })
})

describe("parseDate", () => {
  it("creates UTC date from date string", () => {
    const d = parseDate("2024-01-15")
    expect(d.toISOString()).toBe("2024-01-15T00:00:00.000Z")
  })

  it("creates UTC date with time", () => {
    const d = parseDate("2024-01-15", "14:30")
    expect(d.toISOString()).toBe("2024-01-15T14:30:00.000Z")
  })
})

describe("isValidDate", () => {
  it("returns true for valid Date", () => {
    expect(isValidDate(new Date("2024-01-15"))).toBe(true)
  })

  it("returns true for valid date string", () => {
    expect(isValidDate("2024-01-15")).toBe(true)
  })

  it("returns false for null/undefined", () => {
    expect(isValidDate(null)).toBe(false)
    expect(isValidDate(undefined)).toBe(false)
  })

  it("returns false for invalid date", () => {
    expect(isValidDate("not-a-date")).toBe(false)
  })
})

describe("addDays / subDays", () => {
  it("adds days correctly", () => {
    const result = addDays("2024-01-15T00:00:00.000Z", 5)
    expect(result.toISOString()).toBe("2024-01-20T00:00:00.000Z")
  })

  it("subtracts days correctly", () => {
    const result = subDays("2024-01-15T00:00:00.000Z", 5)
    expect(result.toISOString()).toBe("2024-01-10T00:00:00.000Z")
  })
})

describe("addMonths", () => {
  it("adds months correctly", () => {
    const result = addMonths("2024-01-15T00:00:00.000Z", 2)
    expect(result.getUTCMonth()).toBe(2)
    expect(result.getUTCFullYear()).toBe(2024)
  })

  it("rolls over to next year", () => {
    const result = addMonths("2024-11-01T00:00:00.000Z", 3)
    expect(result.getUTCFullYear()).toBe(2025)
    expect(result.getUTCMonth()).toBe(1)
  })
})

describe("compareDates", () => {
  it("returns negative when a < b", () => {
    expect(compareDates("2024-01-01", "2024-12-31")).toBeLessThan(0)
  })

  it("returns positive when a > b", () => {
    expect(compareDates("2024-12-31", "2024-01-01")).toBeGreaterThan(0)
  })

  it("returns 0 for equal dates", () => {
    expect(compareDates("2024-06-15T00:00:00.000Z", "2024-06-15T00:00:00.000Z")).toBe(0)
  })
})

describe("diffInDays", () => {
  it("computes positive diff", () => {
    expect(diffInDays("2024-01-10T00:00:00.000Z", "2024-01-01T00:00:00.000Z")).toBe(9)
  })

  it("computes negative diff", () => {
    expect(diffInDays("2024-01-01T00:00:00.000Z", "2024-01-10T00:00:00.000Z")).toBe(-9)
  })

  it("returns 0 for same date", () => {
    expect(diffInDays("2024-06-15", "2024-06-15")).toBe(0)
  })
})

describe("isSameDay", () => {
  it("returns true for same UTC day", () => {
    expect(isSameDay("2024-01-15T00:00:00.000Z", "2024-01-15T23:59:59.999Z")).toBe(true)
  })

  it("returns false for different days", () => {
    expect(isSameDay("2024-01-15", "2024-01-16")).toBe(false)
  })
})

describe("startOfDay / endOfDay", () => {
  it("startOfDay returns midnight UTC", () => {
    const d = startOfDay("2024-06-15T14:30:00.000Z")
    expect(d.toISOString()).toBe("2024-06-15T00:00:00.000Z")
  })

  it("endOfDay returns 23:59:59.999 UTC", () => {
    const d = endOfDay("2024-06-15T00:00:00.000Z")
    expect(d.toISOString()).toBe("2024-06-15T23:59:59.999Z")
  })
})

describe("startOfMonth / endOfMonth", () => {
  it("startOfMonth returns first day midnight", () => {
    const d = startOfMonth("2024-06-15T00:00:00.000Z")
    expect(d.toISOString()).toBe("2024-06-01T00:00:00.000Z")
  })

  it("endOfMonth returns last day 23:59:59.999", () => {
    const d = endOfMonth("2024-06-15T00:00:00.000Z")
    expect(d.toISOString()).toBe("2024-06-30T23:59:59.999Z")
  })
})

describe("isPast / isFuture", () => {
  it("isPast returns true for old date", () => {
    expect(isPast("2000-01-01")).toBe(true)
  })

  it("isFuture returns true for far future date", () => {
    expect(isFuture("2099-12-31")).toBe(true)
  })
})
