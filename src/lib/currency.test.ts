import { describe, expect, it } from "vitest"

import {
  centsToDisplay,
  formatBRL,
  fromCents,
  parseBRNumber,
  parseMaskedValue,
  percentFromValue,
  percentOfTotal,
  toBRLMoney,
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

describe("toBRLMoney", () => {
  it("formats number without R$ prefix", () => {
    expect(toBRLMoney(1234.5)).toBe("1.234,50")
    expect(toBRLMoney(1234.56)).toBe("1.234,56")
  })

  it("formats string number", () => {
    expect(toBRLMoney("1234.5")).toBe("1.234,50")
  })

  it("formats zero", () => {
    expect(toBRLMoney(0)).toBe("0,00")
  })

  it("returns empty string for null/undefined/empty", () => {
    expect(toBRLMoney(null)).toBe("")
    expect(toBRLMoney(undefined)).toBe("")
    expect(toBRLMoney("")).toBe("")
  })

  // Regressão: sem limite de casas, 1000/3 saía como "333,333".
  it("nunca mostra mais de duas casas", () => {
    expect(toBRLMoney(1000 / 3)).toBe("333,33")
    expect(toBRLMoney(1234.567)).toBe("1.234,57")
    expect(toBRLMoney(0.1 + 0.2)).toBe("0,30")
    expect(toBRLMoney("1234.567")).toBe("1.234,57")
  })

  // Regressão: parseFloat lia "1.234,56" como 1.234 e o resultado era "1,234".
  it("lê um texto já em formato brasileiro", () => {
    expect(toBRLMoney("1.234,56")).toBe("1.234,56")
    expect(toBRLMoney("R$ 1.234,56")).toBe("1.234,56")
    expect(toBRLMoney("1234,5")).toBe("1.234,50")
    expect(toBRLMoney("350.000")).toBe("350.000,00")
  })

  it("continua lendo o número em formato de máquina", () => {
    expect(toBRLMoney("1234.56")).toBe("1.234,56")
    expect(toBRLMoney("0.5")).toBe("0,50")
    expect(toBRLMoney("1500")).toBe("1.500,00")
  })

  it("formata negativos", () => {
    expect(toBRLMoney(-1234.5)).toBe("-1.234,50")
    expect(toBRLMoney("-1.234,50")).toBe("-1.234,50")
  })

  it("o que não é número vira texto vazio, não NaN", () => {
    expect(toBRLMoney("abc")).toBe("")
    expect(toBRLMoney(Number.NaN)).toBe("")
    expect(toBRLMoney(Number.POSITIVE_INFINITY)).toBe("")
  })
})

describe("parseMaskedValue", () => {
  it("parses masked BRL string to number", () => {
    expect(parseMaskedValue("1.234,56")).toBe(1234.56)
  })

  it("handles values without thousands separator", () => {
    expect(parseMaskedValue("1,50")).toBe(1.5)
  })

  it("handles whole numbers", () => {
    expect(parseMaskedValue("1.000,00")).toBe(1000)
  })
})

describe("parseBRNumber", () => {
  it("sem separador é um número inteiro", () => {
    expect(parseBRNumber("1500")).toBe(1500)
    expect(parseBRNumber("0")).toBe(0)
    expect(parseBRNumber("007")).toBe(7)
  })

  it("com vírgula, ela é o separador decimal e os pontos são de milhar", () => {
    expect(parseBRNumber("1.500,00")).toBe(1500)
    expect(parseBRNumber("1500,5")).toBe(1500.5)
    expect(parseBRNumber("1.234,5")).toBe(1234.5)
    expect(parseBRNumber("12,5")).toBe(12.5)
    expect(parseBRNumber("0,05")).toBe(0.05)
    expect(parseBRNumber("1.234.567,89")).toBe(1234567.89)
    expect(parseBRNumber(",5")).toBe(0.5)
  })

  it("sem vírgula, um ponto seguido de um ou dois dígitos é decimal", () => {
    expect(parseBRNumber("2350.9")).toBe(2350.9)
    expect(parseBRNumber("1500.00")).toBe(1500)
    expect(parseBRNumber("0.5")).toBe(0.5)
  })

  it("sem vírgula, pontos de milhar bem formados são milhar", () => {
    expect(parseBRNumber("1.500")).toBe(1500)
    expect(parseBRNumber("350.000")).toBe(350000)
    expect(parseBRNumber("12.345")).toBe(12345)
    expect(parseBRNumber("1.234.567")).toBe(1234567)
  })

  it("sem vírgula, um ponto que não pode ser de milhar é decimal", () => {
    // Formato de máquina: quatro dígitos antes do ponto ou zero na frente.
    expect(parseBRNumber("1234.567")).toBe(1234.567)
    expect(parseBRNumber("0.125")).toBe(0.125)
    expect(parseBRNumber("12.3456")).toBe(12.3456)
  })

  it("ignora R$, espaços e texto em volta", () => {
    expect(parseBRNumber("R$ 2.350,90")).toBe(2350.9)
    expect(parseBRNumber("  R$\u00a01.500,00  ")).toBe(1500)
    expect(parseBRNumber("Total: R$ 350.000,00 à vista")).toBe(350000)
    expect(parseBRNumber("12,5%")).toBe(12.5)
    expect(parseBRNumber("1 500,00")).toBe(1500)
  })

  it("ignora ponto final ou vírgula sobrando nas pontas", () => {
    expect(parseBRNumber("R$ 1.500,00.")).toBe(1500)
    expect(parseBRNumber("1500,")).toBe(1500)
  })

  it("lê o sinal de menos antes do número", () => {
    expect(parseBRNumber("-50")).toBe(-50)
    expect(parseBRNumber("R$ -1.234,56")).toBe(-1234.56)
    expect(parseBRNumber("\u22121.234,56")).toBe(-1234.56)
    expect(parseBRNumber("10-20")).toBe(1020)
  })

  it("devolve null quando não há número", () => {
    expect(parseBRNumber("")).toBeNull()
    expect(parseBRNumber("abc")).toBeNull()
    expect(parseBRNumber("R$ ,")).toBeNull()
    expect(parseBRNumber("-")).toBeNull()
  })
})
