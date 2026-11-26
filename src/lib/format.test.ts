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

  it("formata o CNPJ alfanumérico", () => {
    expect(formatCNPJ("12ABC34501DE35")).toBe("12.ABC.345/01DE-35")
    expect(formatCNPJ("12.ABC.345/01DE-35")).toBe("12.ABC.345/01DE-35")
  })

  it("passa letras para maiúsculas", () => {
    expect(formatCNPJ("12abc34501de35")).toBe("12.ABC.345/01DE-35")
  })

  it("devolve o valor limpo quando ainda não há 14 caracteres", () => {
    expect(formatCNPJ("12.ABC.3")).toBe("12ABC3")
    expect(formatCNPJ("1234")).toBe("1234")
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

// Regressão: format.ts tinha máscaras próprias, diferentes das dos campos.
// O mesmo telefone colado no PhoneInput virava "(11) 98765-4321", mas
// formatPhone devolvia o texto cru; um CPF com dígito a mais virava
// "123.456.789-001".
describe("format.ts formata como os campos mostram", () => {
  it("formatPhone tira o código do país e o zero de operadora, como o PhoneInput", () => {
    expect(formatPhone("+55 11 98765-4321")).toBe("(11) 98765-4321")
    expect(formatPhone("+55 (11) 3456-7890")).toBe("(11) 3456-7890")
    expect(formatPhone("0 11 98765-4321")).toBe("(11) 98765-4321")
  })

  it("um número que não é um documento inteiro sai limpo, sem máscara pela metade", () => {
    expect(formatCPF("123456789001")).toBe("123456789001")
    expect(formatCPF("1234")).toBe("1234")
    expect(formatCEP("013101001")).toBe("013101001")
    expect(formatCNPJ("12ABC34501DEXY")).toBe("12ABC34501DE")
  })
})
