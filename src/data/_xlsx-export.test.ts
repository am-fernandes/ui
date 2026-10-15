import { beforeEach, describe, expect, it, vi } from "vitest"

import { downloadXlsx } from "./_xlsx-export"

const writeFile = vi.fn()

vi.mock("xlsx", () => ({
  utils: {
    json_to_sheet: vi.fn(() => ({})),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile,
}))

describe("downloadXlsx", () => {
  beforeEach(() => {
    writeFile.mockClear()
  })

  it.each([
    ["contratos", "contratos.xlsx"],
    ["contratos.xlsx", "contratos.xlsx"],
    ["Contratos.filtrados", "Contratos.filtrados.xlsx"],
    ["REL.XLSX", "REL.XLSX"],
  ])("writes %s as %s", async (input, expected) => {
    await downloadXlsx([{ a: 1 }], input, "Dados")
    expect(writeFile).toHaveBeenCalledTimes(1)
    const [, actual] = writeFile.mock.calls[0] as unknown as [unknown, string]
    expect(actual).toBe(expected)
  })
})
