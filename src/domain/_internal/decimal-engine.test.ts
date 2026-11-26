import { describe, expect, it } from "vitest"

import {
  type NumberEditInput,
  applyNumberEdit,
  caretBeforeDigits,
  formatUnits,
  fromUnits,
  toUnits,
} from "./decimal-engine"

describe("toUnits / fromUnits", () => {
  it("converte para a menor unidade do campo", () => {
    expect(toUnits(1234.56, 2)).toBe(123456)
    expect(toUnits(12.5, 1)).toBe(125)
    expect(toUnits(12, 0)).toBe(12)
    expect(toUnits(-0.05, 2)).toBe(-5)
  })

  it("arredonda o que tem casas a mais", () => {
    expect(toUnits(33.333, 2)).toBe(3333)
    expect(toUnits(0.1 + 0.2, 2)).toBe(30)
  })

  it("o que não é número vira null", () => {
    expect(toUnits(null, 2)).toBeNull()
    expect(toUnits(undefined, 2)).toBeNull()
    expect(toUnits(Number.NaN, 2)).toBeNull()
    expect(toUnits(Number.POSITIVE_INFINITY, 2)).toBeNull()
  })

  it("fromUnits desfaz toUnits", () => {
    expect(fromUnits(123456, 2)).toBe(1234.56)
    expect(fromUnits(125, 1)).toBe(12.5)
    expect(fromUnits(12, 0)).toBe(12)
  })
})

describe("formatUnits", () => {
  it("formata em pt-BR com as casas do campo", () => {
    expect(formatUnits(123456, 2)).toBe("1.234,56")
    expect(formatUnits(5, 2)).toBe("0,05")
    expect(formatUnits(0, 2)).toBe("0,00")
    expect(formatUnits(125, 1)).toBe("12,5")
    expect(formatUnits(0, 1)).toBe("0,0")
    expect(formatUnits(1234, 0)).toBe("1.234")
    expect(formatUnits(0, 0)).toBe("0")
  })

  it("mostra o sinal de negativo", () => {
    expect(formatUnits(-123456, 2)).toBe("-1.234,56")
    expect(formatUnits(-5, 2)).toBe("-0,05")
  })

  it("null é campo vazio", () => {
    expect(formatUnits(null, 2)).toBe("")
  })

  it("o sinal digitado antes de qualquer dígito aparece, sem ser valor ainda", () => {
    expect(formatUnits(0, 2, true)).toBe("-0,00")
    expect(formatUnits(null, 2, true)).toBe("-")
    // Com valor diferente de zero o rascunho não importa.
    expect(formatUnits(500, 2, true)).toBe("5,00")
  })
})

describe("caretBeforeDigits", () => {
  it("fica no fim quando não há dígito depois", () => {
    expect(caretBeforeDigits("1.234,56", 0, "left")).toBe(8)
  })

  it("conta os dígitos a partir do fim", () => {
    // "12.9|34,56"
    expect(caretBeforeDigits("12.934,56", 4, "left")).toBe(4)
    expect(caretBeforeDigits("12.934,56", 4, "right")).toBe(4)
  })

  it("ao lado de um separador, encosta no lado pedido", () => {
    // Cinco dígitos depois: "1|.234,56" (esquerda) ou "1.|234,56" (direita).
    expect(caretBeforeDigits("1.234,56", 5, "left")).toBe(1)
    expect(caretBeforeDigits("1.234,56", 5, "right")).toBe(2)
  })

  it("antes do primeiro dígito, fica depois do sinal", () => {
    expect(caretBeforeDigits("-1,23", 3, "left")).toBe(1)
    expect(caretBeforeDigits("-1,23", 3, "right")).toBe(1)
  })

  it("pedindo mais dígitos do que há, vai para o início", () => {
    expect(caretBeforeDigits("1,23", 9, "right")).toBe(0)
  })
})

describe("applyNumberEdit", () => {
  const base: Omit<NumberEditInput, "previous" | "previousText" | "edited" | "caret"> = {
    allowNegative: false,
    allowEmpty: false,
  }
  const edit = (input: Partial<NumberEditInput> & Pick<NumberEditInput, "edited" | "caret">) =>
    applyNumberEdit({ previous: 0, previousText: "0,00", ...base, ...input })

  describe("digitação no fim (centavos primeiro)", () => {
    it("cada dígito entra pela direita", () => {
      expect(edit({ edited: "0,001", caret: 5, inputType: "insertText" }).units).toBe(1)
      expect(
        edit({
          previous: 1,
          previousText: "0,01",
          edited: "0,015",
          caret: 5,
          inputType: "insertText",
        }).units,
      ).toBe(15)
      expect(
        edit({
          previous: 123456,
          previousText: "1.234,56",
          edited: "1.234,567",
          caret: 9,
          inputType: "insertText",
        }),
      ).toMatchObject({ units: 1234567, digitsAfterCaret: 0 })
    })

    it("Backspace no fim tira o último dígito", () => {
      expect(
        edit({
          previous: 123456,
          previousText: "1.234,56",
          edited: "1.234,5",
          caret: 7,
          inputType: "deleteContentBackward",
        }),
      ).toMatchObject({ units: 12345, digitsAfterCaret: 0 })
    })
  })

  describe("zeros que só preenchem a exibição", () => {
    it("com o campo em zero, o dígito vale o mesmo em qualquer posição do cursor", () => {
      // Foco por script deixa o cursor no início: "5|0,00".
      expect(edit({ edited: "50,00", caret: 1, inputType: "insertText" })).toMatchObject({
        units: 5,
        digitsAfterCaret: 0,
      })
      // No meio: "0,5|00".
      expect(edit({ edited: "0,500", caret: 3, inputType: "insertText" }).units).toBe(5)
    })

    it("um dígito à esquerda dos zeros entra antes do primeiro dígito real", () => {
      // "0,05" com o cursor no início: "7|0,05" vira 0,75.
      expect(
        edit({
          previous: 5,
          previousText: "0,05",
          edited: "70,05",
          caret: 1,
          inputType: "insertText",
        }),
      ).toMatchObject({ units: 75, digitsAfterCaret: 1 })
    })

    it("zero digitado à esquerda não muda nada", () => {
      expect(
        edit({
          previous: 5,
          previousText: "0,05",
          edited: "00,05",
          caret: 1,
          inputType: "insertText",
        }).units,
      ).toBe(5)
    })

    it("selecionar tudo e digitar recomeça do dígito", () => {
      expect(
        edit({
          previous: 123456,
          previousText: "1.234,56",
          edited: "7",
          caret: 1,
          inputType: "insertText",
        }).units,
      ).toBe(7)
    })
  })

  describe("edição no meio", () => {
    it("o dígito entra no ponto do cursor e o cursor fica depois dele", () => {
      // "1.2|34,56" digita 9: "1.29|34,56".
      const result = edit({
        previous: 123456,
        previousText: "1.234,56",
        edited: "1.2934,56",
        caret: 4,
        inputType: "insertText",
      })
      expect(result).toMatchObject({ units: 1293456, digitsAfterCaret: 4, stick: "left" })
      expect(caretBeforeDigits(formatUnits(result.units, 2), 4, "left")).toBe(4)
    })

    it("Backspace no meio tira aquele dígito e o cursor fica antes do texto que não mudou", () => {
      // "1.2|34,56" Backspace: "1.|34,56".
      const result = edit({
        previous: 123456,
        previousText: "1.234,56",
        edited: "1.34,56",
        caret: 2,
        inputType: "deleteContentBackward",
      })
      expect(result).toMatchObject({ units: 13456, digitsAfterCaret: 4, stick: "right" })
      expect(caretBeforeDigits(formatUnits(result.units, 2), 4, "right")).toBe(1)
    })

    it("Backspace sobre o ponto de milhar apaga o dígito antes dele", () => {
      // "1.|234,56": o navegador apaga o ponto.
      expect(
        edit({
          previous: 123456,
          previousText: "1.234,56",
          edited: "1234,56",
          caret: 1,
          inputType: "deleteContentBackward",
        }),
      ).toMatchObject({ units: 23456, digitsAfterCaret: 5 })
    })

    it("Delete sobre a vírgula apaga o dígito depois dela", () => {
      // "1.234|,56": o navegador apaga a vírgula.
      expect(
        edit({
          previous: 123456,
          previousText: "1.234,56",
          edited: "1.23456",
          caret: 5,
          inputType: "deleteContentForward",
        }),
      ).toMatchObject({ units: 12346, digitsAfterCaret: 1 })
    })

    it("apagar um zero de preenchimento não muda o valor", () => {
      // "0,0|5" Backspace: "0,|5".
      expect(
        edit({
          previous: 5,
          previousText: "0,05",
          edited: "0,5",
          caret: 2,
          inputType: "deleteContentBackward",
        }),
      ).toMatchObject({ units: 5, digitsAfterCaret: 1 })
    })
  })

  describe("texto que chega de uma vez (sem inputType)", () => {
    it("aproveita os dígitos, na ordem", () => {
      expect(edit({ edited: "abc12def3", caret: 9 }).units).toBe(123)
      expect(edit({ edited: "12345", caret: 5 }).units).toBe(12345)
    })

    it("limita a quinze dígitos", () => {
      expect(edit({ edited: "9".repeat(20), caret: 20 }).units).toBe(999_999_999_999_999)
    })

    it("sem dígito nenhum, o campo volta a zero", () => {
      expect(edit({ previous: 1234, previousText: "12,34", edited: "", caret: 0 }).units).toBe(0)
    })
  })

  it("recusa o 16º dígito digitado", () => {
    const result = edit({
      previous: 999_999_999_999_999,
      previousText: "9.999.999.999.999,99",
      edited: "9.999.999.999.999,991",
      caret: 21,
      inputType: "insertText",
    })
    expect(result.units).toBe(999_999_999_999_999)
    expect(result.refused).toEqual({ caret: 20 })
  })

  describe("campo que pode ficar vazio", () => {
    const empty = { allowEmpty: true }

    it("sem dígito nenhum, o valor é null", () => {
      expect(
        edit({ ...empty, previous: 1234, previousText: "12,34", edited: "", caret: 0 }).units,
      ).toBeNull()
    })

    it("do vazio, o primeiro dígito já é valor", () => {
      expect(
        edit({
          ...empty,
          previous: null,
          previousText: "",
          edited: "5",
          caret: 1,
          inputType: "insertText",
        }).units,
      ).toBe(5)
      expect(
        edit({
          ...empty,
          previous: null,
          previousText: "",
          edited: "0",
          caret: 1,
          inputType: "insertText",
        }).units,
      ).toBe(0)
    })

    it("Backspace em 0,00 esvazia o campo", () => {
      expect(
        edit({
          ...empty,
          previous: 0,
          previousText: "0,00",
          edited: "0,0",
          caret: 3,
          inputType: "deleteContentBackward",
        }).units,
      ).toBeNull()
    })

    it("Backspace em 0,05 vai a zero antes de esvaziar", () => {
      expect(
        edit({
          ...empty,
          previous: 5,
          previousText: "0,05",
          edited: "0,0",
          caret: 3,
          inputType: "deleteContentBackward",
        }).units,
      ).toBe(0)
    })
  })

  describe("negativos", () => {
    const negative = { allowNegative: true }

    it("sem allowNegative o sinal é ignorado", () => {
      expect(edit({ edited: "-0,005", caret: 6, inputType: "insertText" })).toMatchObject({
        units: 5,
        negativeDraft: false,
      })
    })

    it("o sinal digitado em zero fica de rascunho até vir um dígito", () => {
      const sign = edit({ ...negative, edited: "0,00-", caret: 5, inputType: "insertText" })
      expect(sign).toMatchObject({ units: 0, negativeDraft: true })
      expect(Object.is(sign.units, -0)).toBe(false)
      expect(
        edit({
          ...negative,
          previousText: "-0,00",
          edited: "-0,005",
          caret: 6,
          inputType: "insertText",
        }),
      ).toMatchObject({ units: -5, negativeDraft: false })
    })

    it("o sinal num campo vazio também fica de rascunho", () => {
      expect(
        edit({
          ...negative,
          allowEmpty: true,
          previous: null,
          previousText: "",
          edited: "-",
          caret: 1,
          inputType: "insertText",
        }),
      ).toMatchObject({ units: null, negativeDraft: true })
    })

    it("digitar o sinal de novo volta a positivo, e + também", () => {
      expect(
        edit({
          ...negative,
          previous: -500,
          previousText: "-5,00",
          edited: "-5,00-",
          caret: 6,
          inputType: "insertText",
        }).units,
      ).toBe(500)
      expect(
        edit({
          ...negative,
          previous: -500,
          previousText: "-5,00",
          edited: "-5,00+",
          caret: 6,
          inputType: "insertText",
        }).units,
      ).toBe(500)
    })

    it("apagar o sinal volta a positivo sem apagar dígito", () => {
      // "-|5,00" Backspace: "5,00".
      expect(
        edit({
          ...negative,
          previous: -500,
          previousText: "-5,00",
          edited: "5,00",
          caret: 0,
          inputType: "deleteContentBackward",
        }).units,
      ).toBe(500)
    })

    it("aceita o sinal de menos tipográfico", () => {
      expect(edit({ ...negative, edited: "−0,005", caret: 6, inputType: "insertText" }).units).toBe(
        -5,
      )
    })
  })
})
