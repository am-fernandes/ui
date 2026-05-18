import { describe, expect, it } from "vitest"

import {
  centsToDisplay,
  formatBRL,
  fromCents,
  percentFromValue,
  percentOfTotal,
  toCents,
} from "./currency"

describe("toCents", () => {
  it("converts whole reais to integer cents", () => {
    expect(toCents(1)).toBe(100)
    expect(toCents(1234.56)).toBe(123456)
  })

  it("rounds half-cent values to nearest cent", () => {
    expect(toCents(0.005)).toBe(1)
    expect(toCents(0.004)).toBe(0)
  })

  it("handles float drift (0.1 + 0.2)", () => {
    expect(toCents(0.1 + 0.2)).toBe(30)
  })

  it("handles negatives", () => {
    expect(toCents(-1.23)).toBe(-123)
  })

  it("handles zero", () => {
    expect(toCents(0)).toBe(0)
  })
})

describe("fromCents", () => {
  it("inverts toCents for safe integers", () => {
    expect(fromCents(123456)).toBe(1234.56)
    expect(fromCents(100)).toBe(1)
  })

  it("handles zero and negatives", () => {
    expect(fromCents(0)).toBe(0)
    expect(fromCents(-123)).toBe(-1.23)
  })
})

describe("percentOfTotal", () => {
  it("computes integer percent of total", () => {
    expect(percentOfTotal(70, 1850)).toBe(1295)
  })

  it("rounds to nearest cent", () => {
    // 33.33% de 1850 = 616.605 → arredondado a 1 centavo = 616.61
    expect(percentOfTotal(33.33, 1850)).toBeCloseTo(616.61, 2)
  })

  it("returns 0 when total is 0", () => {
    expect(percentOfTotal(50, 0)).toBe(0)
  })

  it("handles 0 percent", () => {
    expect(percentOfTotal(0, 1000)).toBe(0)
  })

  it("handles 100 percent", () => {
    expect(percentOfTotal(100, 1234.56)).toBe(1234.56)
  })
})

describe("percentFromValue", () => {
  it("computes percent that value represents of total", () => {
    expect(percentFromValue(1295, 1850)).toBe(70)
  })

  it("returns 0 when total is 0", () => {
    expect(percentFromValue(100, 0)).toBe(0)
  })

  it("rounds to two decimals", () => {
    expect(percentFromValue(616.6, 1850)).toBeCloseTo(33.33, 2)
  })
})

describe("centsToDisplay", () => {
  it("formats positive integers with thousand separator and comma decimal", () => {
    expect(centsToDisplay(123456)).toBe("1.234,56")
  })

  it("formats small values", () => {
    expect(centsToDisplay(0)).toBe("0,00")
    expect(centsToDisplay(5)).toBe("0,05")
    expect(centsToDisplay(99)).toBe("0,99")
  })

  it("formats negatives with leading minus", () => {
    expect(centsToDisplay(-123456)).toBe("-1.234,56")
  })

  it("pads single-digit cents", () => {
    expect(centsToDisplay(100)).toBe("1,00")
    expect(centsToDisplay(105)).toBe("1,05")
  })
})

describe("formatBRL", () => {
  it("formats float reais with R$ prefix", () => {
    expect(formatBRL(1234.56)).toBe("R$ 1.234,56")
    expect(formatBRL(0)).toBe("R$ 0,00")
  })

  it("handles negatives", () => {
    expect(formatBRL(-1234.56)).toBe("R$ -1.234,56")
  })
})
