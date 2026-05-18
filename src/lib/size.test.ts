import { describe, expect, it } from "vitest"

import { bytes, gb, kb, mb } from "./size"

describe("size helpers", () => {
  it("bytes is identity", () => {
    expect(bytes(0)).toBe(0)
    expect(bytes(123)).toBe(123)
  })

  it("kb multiplies by 1024", () => {
    expect(kb(1)).toBe(1024)
    expect(kb(500)).toBe(512000)
  })

  it("mb multiplies by 1024^2", () => {
    expect(mb(2)).toBe(2 * 1024 * 1024)
  })

  it("gb multiplies by 1024^3", () => {
    expect(gb(1)).toBe(1024 * 1024 * 1024)
  })
})
