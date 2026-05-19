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

  it("inclui classes Tailwind expressivas para layout de tabela", () => {
    const s = tableStyles()
    expect(s.table).toMatch(/w-full|caption/)
    expect(s.row).toMatch(/border-b/)
    expect(s.head).toMatch(/font-medium|text-muted/)
    expect(s.cell).toMatch(/p-2|align-middle/)
  })

  it("expõe classes específicas de cabeçalho, rodapé e legenda", () => {
    const s = tableStyles()
    expect(s.header).toMatch(/border-b/)
    expect(s.footer).toMatch(/border-t|bg-muted/)
    expect(s.body).toMatch(/last-child|border-0/)
    expect(s.caption).toMatch(/mt-4|text-sm|text-muted/)
  })
})
