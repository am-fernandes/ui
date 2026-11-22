import { describe, expect, it } from "vitest"

import { compareText, matchesSearch, normalizeText } from "./text"

describe("normalizeText", () => {
  it("removes accents and case", () => {
    expect(normalizeText("João Álvares")).toBe("joao alvares")
    expect(normalizeText("CONFIGURAÇÕES")).toBe("configuracoes")
    expect(normalizeText("Ângela Ühlmann")).toBe("angela uhlmann")
  })

  it("keeps digits and punctuation", () => {
    expect(normalizeText("R$ 1.234,56")).toBe("r$ 1.234,56")
  })
})

describe("matchesSearch", () => {
  it("finds text typed without accents", () => {
    expect(matchesSearch("João Álvares", "joao")).toBe(true)
    expect(matchesSearch("Configurações", "configuracoes")).toBe(true)
    expect(matchesSearch("Convidar usuário", "usuario")).toBe(true)
  })

  it("finds text typed with accents in unaccented data", () => {
    expect(matchesSearch("Joao", "joão")).toBe(true)
  })

  it("matches everything for an empty or blank term", () => {
    expect(matchesSearch("qualquer", "")).toBe(true)
    expect(matchesSearch("qualquer", "   ")).toBe(true)
  })

  it("returns false when the term is not there", () => {
    expect(matchesSearch("Bruno", "ana")).toBe(false)
  })
})

describe("compareText", () => {
  it("sorts Portuguese names the way a person expects", () => {
    const names = ["Zuleica", "ana", "Álvaro", "Bruno", "Ângela", "carlos", "Érica"]
    expect([...names].sort(compareText)).toEqual([
      "Álvaro",
      "ana",
      "Ângela",
      "Bruno",
      "carlos",
      "Érica",
      "Zuleica",
    ])
  })

  it("orders numbers inside text by value", () => {
    expect(["Bloco 10", "Bloco 2", "Bloco 1"].sort(compareText)).toEqual([
      "Bloco 1",
      "Bloco 2",
      "Bloco 10",
    ])
  })
})
