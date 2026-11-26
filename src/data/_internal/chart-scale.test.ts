import { describe, expect, it, vi } from "vitest"

import {
  MAX_BAR,
  areaPath,
  asSentence,
  axisTickFormat,
  bandScale,
  barPath,
  checkSeriesCount,
  defaultFormatX,
  formatNumber,
  groupLayout,
  labelStride,
  linePath,
  lineRuns,
  linearScale,
  nearestIndex,
  niceStep,
  niceTicks,
  readValue,
  seriesSlots,
  stackExtent,
  stackValues,
  truncateToWidth,
} from "./chart-scale"

describe("chart-scale", () => {
  describe("series", () => {
    it("allows six series and stops the seventh with a message about grouping", () => {
      expect(() => checkSeriesCount(6, "BarChart")).not.toThrow()
      expect(() => checkSeriesCount(7, "BarChart")).toThrow(
        /\[BarChart\] 7 series; the most is 6.*"Outros".*split/,
      )
    })

    it("logs instead of throwing in production", () => {
      vi.stubEnv("NODE_ENV", "production")
      const error = vi.spyOn(console, "error").mockImplementation(() => {})
      expect(() => checkSeriesCount(8, "LineChart")).not.toThrow()
      expect(error).toHaveBeenCalledWith(expect.stringContaining("[LineChart] 8 series"))
      error.mockRestore()
      vi.unstubAllEnvs()
    })

    it("gives slots in order, keeping pinned colours and skipping the slots they take", () => {
      expect([...seriesSlots([{ key: "a" }, { key: "b" }, { key: "c" }])]).toEqual([
        ["a", 1],
        ["b", 2],
        ["c", 3],
      ])
      // "b" removed by the consumer, "c" pinned to 3: nobody is repainted.
      expect([...seriesSlots([{ key: "a" }, { key: "c", color: 3 }])]).toEqual([
        ["a", 1],
        ["c", 3],
      ])
      expect([...seriesSlots([{ key: "x" }, { key: "y", color: 1 }])]).toEqual([
        ["x", 2],
        ["y", 1],
      ])
    })
  })

  describe("ticks", () => {
    it("picks round steps", () => {
      expect(niceStep(100, 5)).toBe(20)
      expect(niceStep(1_800_000, 5)).toBe(500_000)
      expect(niceStep(9, 4)).toBe(2.5)
      expect(niceStep(0.7, 5)).toBe(0.2)
    })

    it("covers the data with round ticks, the ends on a tick", () => {
      expect(niceTicks(0, 87)).toEqual({ min: 0, max: 100, ticks: [0, 20, 40, 60, 80, 100] })
      expect(niceTicks(-35, 120, 5)).toEqual({
        min: -50,
        max: 150,
        ticks: [-50, 0, 50, 100, 150],
      })
      expect(niceTicks(0, 0.7).ticks).toEqual([0, 0.2, 0.4, 0.6, 0.8])
    })

    it("opens a flat domain to zero", () => {
      expect(niceTicks(40, 40).min).toBe(0)
      expect(niceTicks(-3, -3).max).toBe(0)
      expect(niceTicks(0, 0)).toEqual({ min: 0, max: 1, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1] })
    })
  })

  describe("scales and bands", () => {
    it("maps linearly, also inverted (SVG y grows down)", () => {
      const y = linearScale([0, 100], [200, 0])
      expect(y(0)).toBe(200)
      expect(y(50)).toBe(100)
      expect(y(100)).toBe(0)
    })

    it("splits a length into bands with air between them", () => {
      const bands = bandScale(4, 400, 0.3)
      expect(bands.step).toBe(100)
      expect(bands.bandwidth).toBe(70)
      expect(bands.start(1)).toBe(115)
      expect(bands.center(3)).toBe(350)
    })

    it("keeps grouped bars thin, with a 2px gap, centred", () => {
      const wide = groupLayout(200, 3)
      expect(wide.thickness).toBe(MAX_BAR)
      expect(wide.offsets).toEqual([-38, -12, 14])
      const narrow = groupLayout(20, 2)
      expect(narrow.thickness).toBe(9)
      expect(narrow.offsets).toEqual([-10, 1])
    })
  })

  describe("stacks", () => {
    it("stacks positives up and negatives down, marking each side's ends", () => {
      expect(stackValues([10, -4, 5, null, -2])).toEqual([
        { from: 0, to: 10, outermost: false, innermost: true },
        { from: 0, to: -4, outermost: false, innermost: true },
        { from: 10, to: 15, outermost: true, innermost: false },
        null,
        { from: -4, to: -6, outermost: true, innermost: false },
      ])
    })

    it("finds the reach of the stacks", () => {
      expect(
        stackExtent([
          [10, 5],
          [-3, 20],
          [-8, -1],
        ]),
      ).toEqual([-9, 20])
    })
  })

  describe("bar paths", () => {
    it("rounds only the data end and keeps the baseline square", () => {
      expect(barPath(0, 0, 20, 50, "top")).toBe("M0,50V4A4,4 0 0 1 4,0H16A4,4 0 0 1 20,4V50Z")
      expect(barPath(0, 0, 50, 20, "right")).toBe("M0,0H46A4,4 0 0 1 50,4V16A4,4 0 0 1 46,20H0Z")
    })

    it("shrinks the radius on a thin or short bar, and draws inner segments square", () => {
      expect(barPath(0, 0, 6, 50, "top")).toContain("A3,3")
      expect(barPath(0, 0, 20, 2, "bottom")).toContain("A2,2")
      expect(barPath(0, 0, 20, 50, "top", false)).toBe("M0,0H20V50H0Z")
    })
  })

  describe("lines", () => {
    it("breaks the line at a missing point instead of drawing it as zero", () => {
      const runs = lineRuns([{ x: 0, y: 1 }, { x: 1, y: 2 }, null, { x: 3, y: 4 }])
      expect(runs).toEqual([
        [
          { x: 0, y: 1 },
          { x: 1, y: 2 },
        ],
        [{ x: 3, y: 4 }],
      ])
      expect(linePath(runs[0] ?? [])).toBe("M0,1L1,2")
      expect(areaPath(runs[0] ?? [], 10)).toBe("M0,1L1,2L1,10L0,10Z")
    })

    it("finds the nearest position", () => {
      expect(nearestIndex([0, 50, 100], 70)).toBe(1)
      expect(nearestIndex([0, 50, 100], 80)).toBe(2)
    })

    it("thins labels that would not fit", () => {
      expect(labelStride(12, 600, 40)).toBe(1)
      expect(labelStride(12, 240, 40)).toBe(2)
      expect(labelStride(24, 200, 40)).toBe(5)
    })
  })

  describe("formats", () => {
    it("uses the Brazilian number format", () => {
      expect(formatNumber(1250.5)).toBe("1.250,5")
      expect(formatNumber(-3)).toBe("-3")
    })

    it("writes an axis in full below 10.000 and compact from there", () => {
      const small = axisTickFormat([0, 2500, 5000])
      expect(small(2500)).toBe("2.500")
      const big = axisTickFormat([0, 500_000, 1_500_000])
      expect(big(500_000)).toBe("500 mil")
      expect(big(1_500_000)).toBe("1,5 mi")
    })

    it("labels ISO months and days, with the year only across years", () => {
      expect(defaultFormatX("2026-03", ["2026-01", "2026-03"])).toBe("mar.")
      expect(defaultFormatX("2027-01", ["2026-12", "2027-01"])).toBe("jan. 27")
      expect(defaultFormatX("2026-03-15")).toBe("15 de mar.")
      expect(defaultFormatX("Site")).toBe("Site")
    })

    it("cuts text to a width with an ellipsis", () => {
      const measure = (text: string) => text.length * 10
      expect(truncateToWidth("Residencial Bosque", 200, measure)).toBe("Residencial Bosque")
      expect(truncateToWidth("Residencial Bosque", 119, measure)).toBe("Residencia…")
      expect(truncateToWidth("Residencial", 5, measure)).toBe("…")
    })

    it("reads only finite numbers", () => {
      expect(readValue({ a: 3 }, "a")).toBe(3)
      expect(readValue({ a: null }, "a")).toBeNull()
      expect(readValue({ a: "3" }, "a")).toBeNull()
      expect(readValue({ a: Number.NaN }, "a")).toBeNull()
    })
  })
})

// The month names end in a period ("dez."): the announcement read "dez..".
describe("asSentence", () => {
  it("ends a label with one period", () => {
    expect(asSentence("dez.")).toBe("dez.")
    expect(asSentence("2º tri")).toBe("2º tri.")
    expect(asSentence(" Portais ")).toBe("Portais.")
    expect(asSentence("Fim?")).toBe("Fim?")
  })
})
