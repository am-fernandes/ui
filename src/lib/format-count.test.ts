import { describe, expect, it } from "vitest"

import { formatCount } from "./format-count"

describe("formatCount", () => {
  it("returns the raw count when below or equal to max", () => {
    expect(formatCount(0)).toBe("0")
    expect(formatCount(1)).toBe("1")
    expect(formatCount(42)).toBe("42")
    expect(formatCount(999)).toBe("999")
  })

  it("caps at the default max of 999 with `+` suffix", () => {
    expect(formatCount(1000)).toBe("999+")
    expect(formatCount(12345)).toBe("999+")
  })

  it("respects a custom max", () => {
    expect(formatCount(9, 9)).toBe("9")
    expect(formatCount(10, 9)).toBe("9+")
    expect(formatCount(150, 99)).toBe("99+")
  })

  it("clamps negative counts to 0", () => {
    expect(formatCount(-1)).toBe("0")
    expect(formatCount(-9999)).toBe("0")
  })

  it("returns 0 for non-finite numbers", () => {
    expect(formatCount(Number.NaN)).toBe("0")
    expect(formatCount(Number.POSITIVE_INFINITY)).toBe("0")
    expect(formatCount(Number.NEGATIVE_INFINITY)).toBe("0")
  })

  it("floors fractional counts", () => {
    expect(formatCount(3.7)).toBe("3")
    expect(formatCount(999.999)).toBe("999")
    expect(formatCount(1000.5)).toBe("999+")
  })
})
