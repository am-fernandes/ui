import { describe, expect, it } from "vitest"

import { type MaskSpec, applyEdit, applyPaste, caretAfter, cleanValue } from "./masked-input"

// "00-00": dois grupos de dois dígitos.
const spec: MaskSpec = {
  maxLength: 4,
  filter: (text) => text.replace(/\D/g, ""),
  mask: (raw) => (raw.length <= 2 ? raw : `${raw.slice(0, 2)}-${raw.slice(2, 4)}`),
}

describe("cleanValue", () => {
  it("fica só com os caracteres significativos, até o limite", () => {
    expect(cleanValue(spec, "a1-2b3 45")).toBe("1234")
    expect(cleanValue(spec, "")).toBe("")
  })
})

describe("caretAfter", () => {
  it("devolve a posição logo depois do enésimo caractere significativo", () => {
    expect(caretAfter(spec, "12-34", 0)).toBe(0)
    expect(caretAfter(spec, "12-34", 2)).toBe(2)
    expect(caretAfter(spec, "12-34", 3)).toBe(4)
    expect(caretAfter(spec, "12-34", 4)).toBe(5)
  })

  it("para no fim quando pedem mais caracteres do que existem", () => {
    expect(caretAfter(spec, "12-3", 9)).toBe(4)
  })
})

describe("applyEdit", () => {
  it("inserção no meio: o cursor fica depois do caractere digitado", () => {
    // "12-3" com o cursor depois do 1, digita 9: o navegador deixa "192-3".
    expect(applyEdit(spec, "123", "192-3", 2, "insertText")).toEqual({ raw: "1923", caret: 2 })
  })

  it("Backspace no meio: o cursor fica encostado no texto que não mudou", () => {
    // "12-34" com o cursor depois do 3, Backspace: "12-4" e o cursor depois do hífen.
    expect(applyEdit(spec, "1234", "12-4", 3, "deleteContentBackward")).toEqual({
      raw: "124",
      caret: 3,
    })
  })

  it("Backspace sobre o separador apaga o caractere antes dele", () => {
    // "12-|34" → o navegador apaga o hífen: "1234" com o cursor em 2.
    expect(applyEdit(spec, "1234", "1234", 2, "deleteContentBackward")).toEqual({
      raw: "134",
      caret: 1,
    })
  })

  it("Delete sobre o separador apaga o caractere depois dele", () => {
    // "12|-34" → o navegador apaga o hífen: "1234" com o cursor em 2.
    expect(applyEdit(spec, "1234", "1234", 2, "deleteContentForward")).toEqual({
      raw: "124",
      caret: 2,
    })
  })

  it("separador apagado sem saber a tecla não apaga mais nada", () => {
    expect(applyEdit(spec, "1234", "1234", 2)).toEqual({ raw: "1234", caret: 2 })
  })

  it("Backspace sobre o separador sem nada antes não apaga nada", () => {
    // Máscara com separador na frente: "#12".
    const hash: MaskSpec = {
      maxLength: 2,
      filter: (text) => text.replace(/\D/g, ""),
      mask: (raw) => (raw === "" ? "" : `#${raw}`),
    }
    expect(applyEdit(hash, "12", "12", 0, "deleteContentBackward")).toEqual({ raw: "12", caret: 1 })
  })

  it("caractere que não conta devolve o cursor para onde estava", () => {
    // "12-|34" digita "x": "12-x34" com o cursor em 4.
    expect(applyEdit(spec, "1234", "12-x34", 4, "insertText")).toEqual({ raw: "1234", caret: 3 })
  })

  it("corta o que passa do limite quando o texto chega de uma vez", () => {
    expect(applyEdit(spec, "", "123456", 6)).toEqual({ raw: "1234", caret: 5 })
  })

  it("recusa a tecla digitada num campo cheio, sem empurrar o último caractere", () => {
    // "1|2-34" digita 9: "192-34" com o cursor em 2.
    expect(applyEdit(spec, "1234", "192-34", 2, "insertText")).toEqual({ raw: "1234", caret: 1 })
  })

  describe("com filtro que depende da posição", () => {
    // Letras só nas duas primeiras posições; as outras duas são dígitos.
    const positional: MaskSpec = {
      ...spec,
      filter: (text) => {
        let kept = ""
        for (const char of text) {
          if (/\d/.test(char)) kept += char
          else if (/[A-Z]/.test(char) && kept.length < 2) kept += char
        }
        return kept
      },
    }

    it("recusa a tecla que empurraria uma letra para uma posição só de dígitos", () => {
      // "1A-3" e um 9 digitado no início: o A iria para a terceira posição.
      expect(applyEdit(positional, "1A3", "91A-3", 1, "insertText")).toEqual({
        raw: "1A3",
        caret: 0,
      })
    })

    it("aceita a mesma tecla quando nenhuma letra sai do lugar permitido", () => {
      // "A1-3" e um 9 digitado no fim.
      expect(applyEdit(positional, "A13", "A1-39", 5, "insertText")).toEqual({
        raw: "A139",
        caret: 5,
      })
    })
  })

  describe("com normalização", () => {
    // Um "9" na frente sai quando sobra caractere, como o 55 do telefone.
    const prefixed: MaskSpec = {
      ...spec,
      normalize: (significant) =>
        significant.length > 4 && significant.startsWith("9")
          ? { value: significant.slice(1), dropped: 1 }
          : { value: significant, dropped: 0 },
    }

    it("cleanValue normaliza antes de limitar", () => {
      expect(cleanValue(prefixed, "9-12-34")).toBe("1234")
      expect(cleanValue(prefixed, "91-23")).toBe("9123")
    })

    it("desconta do cursor o que saiu da frente", () => {
      // "91-23" e o quinto dígito digitado no fim: "91-234" vira "12-34".
      expect(applyEdit(prefixed, "9123", "91-234", 6, "insertText")).toEqual({
        raw: "1234",
        caret: 5,
      })
    })
  })
})

describe("applyPaste", () => {
  const withExtract: MaskSpec = {
    ...spec,
    extract: (text) => /(?:^|\D)(\d{2}-?\d{2})(?!\d)/.exec(text)?.[1] ?? null,
  }

  it("um número completo substitui o campo, onde quer que o cursor esteja", () => {
    expect(applyPaste(withExtract, "12", "nº 56-78, fl. 9", 1, 1)).toEqual({
      raw: "5678",
      caret: 5,
    })
  })

  it("um pedaço entra na seleção", () => {
    // "1|2-3" cola "9": "19-23".
    expect(applyPaste(withExtract, "123", "9", 1, 1)).toEqual({ raw: "1923", caret: 2 })
    // "[12]-3" cola "9": "93".
    expect(applyPaste(withExtract, "123", "9", 0, 2)).toEqual({ raw: "93", caret: 1 })
  })

  it("sem extract, tudo entra na seleção e o limite corta o resto", () => {
    expect(applyPaste(spec, "", "a 12-34-56", 0, 0)).toEqual({ raw: "1234", caret: 5 })
  })

  it("texto sem caractere significativo não muda nada", () => {
    expect(applyPaste(withExtract, "1234", "abc", 2, 2)).toEqual({ raw: "1234", caret: 2 })
  })
})
