import { unzipSync } from "fflate"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { buildCsv, buildXlsx, downloadSheet, recordsToSheet } from "./_xlsx-export"

/** Files saved through the download link: the Blob and the name. */
let saved: { blob: Blob; name: string }[]
const createObjectURL = URL.createObjectURL
let click: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  saved = []
  const blobs: Blob[] = []
  URL.createObjectURL = vi.fn((blob: Blob) => {
    blobs.push(blob)
    return `blob:${blobs.length}`
  }) as typeof URL.createObjectURL
  click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    saved.push({ blob: blobs[Number(this.href.split(":").pop()) - 1] as Blob, name: this.download })
  })
})

afterEach(() => {
  URL.createObjectURL = createObjectURL
  click.mockRestore()
})

/** The XML files inside an .xlsx (a zip). */
async function unzipXlsx(blob: Blob): Promise<Record<string, string>> {
  const files = unzipSync(await readBytes(blob))
  return Object.fromEntries(
    Object.entries(files).map(([name, bytes]) => [name, new TextDecoder().decode(bytes)]),
  )
}

/** The `<c>` element of a cell ("A2") in the first sheet. */
function cellXml(files: Record<string, string>, ref: string): string {
  const sheet = files["xl/worksheets/sheet1.xml"] ?? ""
  return sheet.match(new RegExp(`<c r="${ref}"[^>]*?(?:/>|>.*?</c>)`))?.[0] ?? ""
}

describe("downloadSheet", () => {
  it.each([
    ["contratos", "contratos.xlsx"],
    ["contratos.xlsx", "contratos.xlsx"],
    ["Contratos.filtrados", "Contratos.filtrados.xlsx"],
    ["REL.XLSX", "REL.XLSX"],
    ["dados.v2", "dados.v2.xlsx"],
    ["relatorio.xls", "relatorio.xlsx"],
    ["relatorio.ods", "relatorio.xlsx"],
  ])("writes %s as %s", async (input, expected) => {
    await downloadSheet({ headers: ["a"], rows: [[1]] }, input, "Dados")
    expect(saved.map((file) => file.name)).toEqual([expected])
    expect(saved[0]?.blob.type).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
  })
})

describe("xlsx", () => {
  it("writes a local-midnight Date as the same calendar day (serial 46161 = 19/05/2026)", async () => {
    const files = await unzipXlsx(
      await buildXlsx(
        {
          headers: ["Vencimento", "Criado em"],
          rows: [[new Date(2026, 4, 19), new Date(2026, 4, 19, 14, 30)]],
        },
        "Dados",
      ),
    )
    // A Date at local midnight is the whole day 46161: no fraction that would
    // make Excel show 18/05/2026, whatever the browser's time zone.
    expect(cellXml(files, "A2")).toMatch(/<v>46161<\/v>/)
    // 14:30 local is 14:30 in Excel too (0.604166… of a day).
    expect(cellXml(files, "B2")).toMatch(/<v>46161\.6041666/)
    const styles = files["xl/styles.xml"] ?? ""
    expect(styles).toContain('formatCode="dd/mm/yyyy"')
    expect(styles).toContain('formatCode="dd/mm/yyyy hh:mm"')
  })

  it("keeps text, numbers and booleans as their own cell types, and the header row", async () => {
    const files = await unzipXlsx(
      await buildXlsx(
        {
          headers: ["Nome", "Valor", "Ativo"],
          rows: [
            ["João", 1234.5, true],
            [null, -2, false],
          ],
        },
        "Dados",
      ),
    )
    const sheet = files["xl/worksheets/sheet1.xml"] ?? ""
    const strings = files["xl/sharedStrings.xml"] ?? ""
    expect(strings).toContain("Nome")
    expect(strings).toContain("João")
    expect(cellXml(files, "B2")).toMatch(/<v>1234\.5<\/v>/)
    expect(cellXml(files, "C2")).toMatch(/t="b".*<v>1<\/v>/)
    expect(cellXml(files, "B3")).toMatch(/<v>-2<\/v>/)
    expect(sheet).not.toContain('r="A3"')
  })

  it("names the sheet, dropping characters Excel refuses", async () => {
    const files = await unzipXlsx(
      await buildXlsx({ headers: ["A"], rows: [] }, "Contratos: 2026/05 [todos] e mais texto"),
    )
    expect(files["xl/workbook.xml"]).toContain('name="Contratos  2026 05  todos  e ma"')
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

describe("recordsToSheet", () => {
  it("makes one column per key, in the order keys first appear", () => {
    expect(
      recordsToSheet([
        { a: 1, b: "x" },
        { b: "y", c: true },
      ]),
    ).toEqual({
      headers: ["a", "b", "c"],
      rows: [
        [1, "x", undefined],
        [undefined, "y", true],
      ],
    })
  })
})

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
    it("a .csv name is written as CSV, not as xlsx", async () => {
      await downloadSheet(
        { headers: ["Nome", "Valor"], rows: [["Ana", 10.5]] },
        "relatorio.csv",
        "Dados",
      )
      expect(saved.map((file) => file.name)).toEqual(["relatorio.csv"])
      expect(saved[0]?.blob.type).toBe("text/csv;charset=utf-8")
      const bytes = await readBytes(saved[0]?.blob as Blob)
      // UTF-8 byte order mark first: Excel then reads the accents right.
      expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
      expect(new TextDecoder().decode(bytes)).toBe("Nome;Valor\r\nAna;10,5\r\n")
    })
  })
})
