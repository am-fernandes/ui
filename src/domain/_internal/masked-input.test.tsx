import { describe, expect, it } from "vitest"

import { type MaskSpec, applyEdit, caretAfter, cleanValue } from "./masked-input"

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

  it("corta o que passa do limite", () => {
    expect(applyEdit(spec, "", "123456", 6)).toEqual({ raw: "1234", caret: 5 })
  })
})
