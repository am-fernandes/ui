import { describe, expect, it } from "vitest"

import { isValidCEP, isValidCNPJ, isValidCPF, isValidPhone } from "./brazil"

describe("isValidCPF", () => {
  it("accepts a valid CPF in raw form", () => {
    expect(isValidCPF("12345678909")).toBe(true)
  })

  it("accepts a valid CPF with formatting", () => {
    expect(isValidCPF("123.456.789-09")).toBe(true)
  })

  it("accepts another valid CPF", () => {
    expect(isValidCPF("529.982.247-25")).toBe(true)
  })

  it("rejects a CPF with wrong DV", () => {
    expect(isValidCPF("12345678900")).toBe(false)
  })

  it("rejects a CPF with fewer than 11 digits", () => {
    expect(isValidCPF("1234567890")).toBe(false)
  })

  it("rejects all-same-digit strings (e.g., 111.111.111-11)", () => {
    expect(isValidCPF("11111111111")).toBe(false)
    expect(isValidCPF("00000000000")).toBe(false)
    expect(isValidCPF("99999999999")).toBe(false)
  })

  it("rejects an empty string", () => {
    expect(isValidCPF("")).toBe(false)
  })
})

describe("isValidCNPJ", () => {
  it("accepts a valid CNPJ in raw form", () => {
    expect(isValidCNPJ("11222333000181")).toBe(true)
  })

  it("accepts a valid CNPJ with formatting", () => {
    expect(isValidCNPJ("11.222.333/0001-81")).toBe(true)
  })

  it("accepts another valid CNPJ", () => {
    expect(isValidCNPJ("45.997.418/0001-53")).toBe(true)
  })

  it("rejects a CNPJ with wrong DV", () => {
    expect(isValidCNPJ("11222333000180")).toBe(false)
  })

  it("rejects a CNPJ with fewer than 14 digits", () => {
    expect(isValidCNPJ("1122233300018")).toBe(false)
  })

  it("rejects all-same-digit strings (e.g., 11.111.111/1111-11)", () => {
    expect(isValidCNPJ("11111111111111")).toBe(false)
    expect(isValidCNPJ("00000000000000")).toBe(false)
  })

  it("rejects an empty string", () => {
    expect(isValidCNPJ("")).toBe(false)
  })
})

describe("isValidCEP", () => {
  it("accepts a valid CEP in raw form", () => {
    expect(isValidCEP("01310100")).toBe(true)
  })

  it("accepts a valid CEP with formatting", () => {
    expect(isValidCEP("01310-100")).toBe(true)
  })

  it("accepts an arbitrary 8-digit CEP", () => {
    expect(isValidCEP("12345-678")).toBe(true)
  })

  it("rejects a CEP shorter than 8 digits", () => {
    expect(isValidCEP("0131010")).toBe(false)
  })

  it("rejects a CEP longer than 8 digits", () => {
    expect(isValidCEP("013101000")).toBe(false)
  })

  it("rejects an empty string", () => {
    expect(isValidCEP("")).toBe(false)
  })
})

describe("isValidPhone", () => {
  it("accepts a valid mobile phone (11 digits)", () => {
    expect(isValidPhone("11987654321")).toBe(true)
  })

  it("accepts a valid landline (10 digits)", () => {
    expect(isValidPhone("1133334444")).toBe(true)
  })

  it("accepts a formatted phone string", () => {
    expect(isValidPhone("(11) 98765-4321")).toBe(true)
  })

  it("rejects a phone with fewer than 10 digits", () => {
    expect(isValidPhone("119876543")).toBe(false)
  })

  it("rejects a phone with more than 11 digits", () => {
    expect(isValidPhone("119876543210")).toBe(false)
  })

  it("rejects a phone with DDD < 11", () => {
    expect(isValidPhone("1098765432")).toBe(false)
    expect(isValidPhone("0098765432")).toBe(false)
  })
})
