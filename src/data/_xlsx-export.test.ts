import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { buildCsv, downloadXlsx } from "./_xlsx-export"

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
    ["dados.v2", "dados.v2.xlsx"],
    ["relatorio.xls", "relatorio.xls"],
  ])("writes %s as %s", async (input, expected) => {
    await downloadXlsx([{ a: 1 }], input, "Dados")
    expect(writeFile).toHaveBeenCalledTimes(1)
    const [, actual] = writeFile.mock.calls[0] as unknown as [unknown, string]
    expect(actual).toBe(expected)
  })
})

/** jsdom's Blob has no arrayBuffer(); FileReader reads it. */
function readBytes(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer))
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(blob)
  })
}

describe("CSV for Brazilian Excel", () => {
  const BOM = "﻿"

  it("writes UTF-8 with BOM, ';' between cells and CRLF between lines", () => {
    const csv = buildCsv({ headers: ["Nome", "Cidade"], rows: [["João", "São Paulo"]] })
    expect(csv).toBe(`${BOM}Nome;Cidade\r\nJoão;São Paulo\r\n`)
  })

  it("writes numbers with a decimal comma and no thousands separator", () => {
    const csv = buildCsv({ headers: ["Valor"], rows: [[1234.56], [-0.5], [1000000], [Number.NaN]] })
    expect(csv).toBe(`${BOM}Valor\r\n1234,56\r\n-0,5\r\n1000000\r\n\r\n`)
  })

  it("writes dates as dd/mm/aaaa, with the time only when there is one", () => {
    const csv = buildCsv({
      headers: ["Data"],
      rows: [[new Date(2026, 4, 19)], [new Date(2026, 4, 19, 14, 30)]],
    })
    expect(csv).toBe(`${BOM}Data\r\n19/05/2026\r\n19/05/2026 14:30\r\n`)
  })

  it("defuses text that Excel would run as a formula", () => {
    const csv = buildCsv({
      headers: ["Texto"],
      rows: [
        ['=HYPERLINK("http://x","clique")'],
        ["+5511999990000"],
        ["-2+3"],
        ["@SUM(A1:A2)"],
        ["normal"],
      ],
    })
    expect(csv.split("\r\n").slice(1, 6)).toEqual([
      `"'=HYPERLINK(""http://x"",""clique"")"`,
      "'+5511999990000",
      "'-2+3",
      "'@SUM(A1:A2)",
      "normal",
    ])
  })

  it("quotes cells with ';', quotes or line breaks, and leaves empty cells empty", () => {
    const csv = buildCsv({
      headers: ["A", "B", "C"],
      rows: [
        ["um; dois", 'diz "oi"', "linha\nnova"],
        [null, undefined, true],
      ],
    })
    expect(csv).toBe(`${BOM}A;B;C\r\n"um; dois";"diz ""oi""";"linha\nnova"\r\n;;VERDADEIRO\r\n`)
  })

  describe("download", () => {
    let blobs: Blob[]
    const createObjectURL = URL.createObjectURL
    beforeEach(() => {
      blobs = []
      URL.createObjectURL = vi.fn((blob: Blob) => {
        blobs.push(blob)
        return "blob:csv"
      }) as typeof URL.createObjectURL
      writeFile.mockClear()
    })
    afterEach(() => {
      URL.createObjectURL = createObjectURL
    })

    it("a .csv name is written by the library, not by the xlsx writer", async () => {
      const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
      await downloadXlsx([{ Nome: "Ana", Valor: 10.5 }], "relatorio.csv", "Dados")
      expect(writeFile).not.toHaveBeenCalled()
      expect(click).toHaveBeenCalledTimes(1)
      const anchor = click.mock.contexts[0] as HTMLAnchorElement
      expect(anchor.download).toBe("relatorio.csv")
      expect(blobs[0]?.type).toBe("text/csv;charset=utf-8")
      const bytes = await readBytes(blobs[0] as Blob)
      // UTF-8 byte order mark first: Excel then reads the accents right.
      expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
      expect(new TextDecoder().decode(bytes)).toBe("Nome;Valor\r\nAna;10,5\r\n")
      click.mockRestore()
    })
  })
})
