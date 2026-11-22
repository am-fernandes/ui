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

  // CNPJ alfanumérico (IN RFB 2.229/2024, em vigor desde julho de 2026): as
  // doze primeiras posições aceitam letras maiúsculas e cada caractere vale o
  // código ASCII menos 48 no mesmo módulo 11.
  describe("alfanumérico", () => {
    it("aceita o exemplo oficial da Receita, com e sem máscara", () => {
      expect(isValidCNPJ("12.ABC.345/01DE-35")).toBe(true)
      expect(isValidCNPJ("12ABC34501DE35")).toBe(true)
    })

    it("aceita outras raízes com letras (DV conferido à mão)", () => {
      // A=17 em todas as doze posições: soma 17×58=986, resto 7, DV1=4;
      // soma 17×62+4×2=1062, resto 6, DV2=5.
      expect(isValidCNPJ("AAAAAAAAAAAA45")).toBe(true)
      // Só a primeira posição com letra, Z=42: soma 42×5+1×2=212, resto 3,
      // DV1=8; soma 42×6+1×3+8×2=271, resto 7, DV2=4.
      expect(isValidCNPJ("Z0.000.000/0001-84")).toBe(true)
      expect(isValidCNPJ("Z0000000000100")).toBe(false)
    })

    it("trata letra minúscula como a maiúscula", () => {
      expect(isValidCNPJ("12.abc.345/01de-35")).toBe(true)
    })

    it("rejeita DV errado", () => {
      expect(isValidCNPJ("12.ABC.345/01DE-36")).toBe(false)
      expect(isValidCNPJ("12.ABC.345/01DE-45")).toBe(false)
      expect(isValidCNPJ("12.ABD.345/01DE-35")).toBe(false)
    })

    it("rejeita letra nos dois dígitos verificadores", () => {
      expect(isValidCNPJ("12ABC34501DE3A")).toBe(false)
      expect(isValidCNPJ("12ABC34501DEA5")).toBe(false)
    })

    it("rejeita tamanho diferente de 14", () => {
      expect(isValidCNPJ("12ABC34501DE3")).toBe(false)
      expect(isValidCNPJ("12ABC34501DE355")).toBe(false)
    })

    it("não conta letra de rótulo como parte do número", () => {
      expect(isValidCNPJ("CNPJ 12.ABC.345/01DE-35")).toBe(false)
    })
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
