import { describe, expect, it } from "vitest"

import { formatCEP, formatCNPJ, formatCPF, formatPhone } from "./format"

describe("formatCPF", () => {
  it("formats 11 digits", () => {
    expect(formatCPF("12345678900")).toBe("123.456.789-00")
  })

  it("handles already masked input", () => {
    expect(formatCPF("123.456.789-00")).toBe("123.456.789-00")
  })
})

describe("formatCNPJ", () => {
  it("formats 14 digits", () => {
    expect(formatCNPJ("12345678000190")).toBe("12.345.678/0001-90")
  })

  it("handles already masked input", () => {
    expect(formatCNPJ("12.345.678/0001-90")).toBe("12.345.678/0001-90")
  })
})

describe("formatPhone", () => {
  it("formats 11-digit mobile number", () => {
    expect(formatPhone("11987654321")).toBe("(11) 98765-4321")
  })

  it("formats 10-digit landline", () => {
    expect(formatPhone("1134567890")).toBe("(11) 3456-7890")
  })

  it("returns original value for unknown lengths", () => {
    expect(formatPhone("12345")).toBe("12345")
  })
})

describe("formatCEP", () => {
  it("formats 8 digits", () => {
    expect(formatCEP("01310100")).toBe("01310-100")
  })

  it("handles already masked input", () => {
    expect(formatCEP("01310-100")).toBe("01310-100")
  })
})
