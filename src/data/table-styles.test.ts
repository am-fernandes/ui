import { describe, expect, it } from "vitest"

import { tableStyles } from "./table-styles"

describe("tableStyles", () => {
  it("retorna objeto com todas as chaves esperadas", () => {
    const s = tableStyles()
    expect(s).toMatchObject({
      table: expect.any(String),
      header: expect.any(String),
      body: expect.any(String),
      footer: expect.any(String),
      row: expect.any(String),
      head: expect.any(String),
      cell: expect.any(String),
      caption: expect.any(String),
    })
  })

  it("segue a densidade de linha da lib: py-2.5 px-3", () => {
    const s = tableStyles()
    expect(s.table).toMatch(/w-full|caption/)
    expect(s.row).toMatch(/border-b/)
    expect(s.head).toMatch(/font-medium|text-muted/)
    for (const slot of [s.head, s.cell]) {
      expect(slot.split(" ")).toEqual(expect.arrayContaining(["px-3", "py-2.5"]))
      expect(slot).not.toMatch(/\bp[xy]-4\b/)
    }
  })

  it("marca a linha selecionada como o DataTable: bg-accent, e contorno em cores forçadas", () => {
    const s = tableStyles()
    expect(s.row).toContain("data-[state=selected]:bg-accent")
    expect(s.row).toContain("data-[state=selected]:text-accent-foreground")
    expect(s.row).not.toContain("data-[state=selected]:bg-muted")
    expect(s.row).toContain("forced-colors:data-[state=selected]:outline-[Highlight]")
  })

  it("expõe classes específicas de cabeçalho, rodapé e legenda", () => {
    const s = tableStyles()
    expect(s.header).toMatch(/border-b/)
    expect(s.footer).toMatch(/border-t|bg-muted/)
    expect(s.body).toMatch(/last-child|border-0/)
    expect(s.caption).toMatch(/mt-4|text-sm|text-muted/)
  })
})
