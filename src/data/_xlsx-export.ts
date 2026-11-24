/**
 * Spreadsheet export for `DataTable`. A name ending in `.csv` is written here
 * as a CSV that the Brazilian Excel opens right; anything else becomes an
 * `.xlsx`, through `xlsx` loaded only when called so the main bundle of
 * `@amfernandesinc/ui` stays small for consumers that never trigger a download.
 */

/** A cell as it goes to the file. */
export type ExportValue = string | number | bigint | boolean | Date | null | undefined

/** One header row and the data rows, in the order they are written. */
export interface ExportSheet {
  headers: string[]
  rows: ExportValue[][]
}

/** Records to a sheet: one column per key, in the order the keys first appear. */
export function recordsToSheet(records: Record<string, unknown>[]): ExportSheet {
  const headers: string[] = []
  const seen = new Set<string>()
  for (const record of records) {
    for (const key of Object.keys(record)) {
      if (!seen.has(key)) {
        seen.add(key)
        headers.push(key)
      }
    }
  }
  return {
    headers,
    rows: records.map((record) => headers.map((key) => toExportValue(record[key]))),
  }
}

/** Plain values pass; anything else is written as its text. */
export function toExportValue(value: unknown): ExportValue {
  if (value == null) return value as null | undefined
  switch (typeof value) {
    case "string":
    case "number":
    case "bigint":
    case "boolean":
      return value
  }
  if (value instanceof Date) return value
  if (Array.isArray(value)) return value.map((item) => String(item ?? "")).join(", ")
  return String(value)
}

const csvNumber = new Intl.NumberFormat("pt-BR", {
  useGrouping: false,
  maximumFractionDigits: 20,
})

const pad = (value: number) => String(value).padStart(2, "0")

/**
 * A `Date` as the Brazilian Excel types it: `dd/mm/aaaa`, plus `hh:mm` when
 * the clock is not at midnight. Read from the date's own (local) fields, the
 * way it was built (`new Date(2026, 4, 19)` is 19/05/2026).
 */
function csvDate(date: Date): string {
  if (Number.isNaN(date.getTime())) return ""
  const day = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
  const midnight = date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0
  return midnight ? day : `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Text Excel would run as a formula (`=`, `+`, `-`, `@`, tab, CR) gets a `'` in front. */
const FORMULA_START = /^[=+\-@\t\r]/

function csvCell(value: ExportValue): string {
  let text: string
  if (value == null) text = ""
  else if (typeof value === "number") text = Number.isFinite(value) ? csvNumber.format(value) : ""
  else if (typeof value === "bigint") text = value.toString()
  else if (typeof value === "boolean") text = value ? "VERDADEIRO" : "FALSO"
  else if (value instanceof Date) text = csvDate(value)
  else text = FORMULA_START.test(value) ? `'${value}` : value
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * CSV for the Brazilian Excel: UTF-8 with a byte order mark (or the accents
 * come out garbled), `;` between cells (the comma is the decimal mark), a
 * decimal comma, dates as `dd/mm/aaaa` and CRLF line ends.
 */
export function buildCsv(sheet: ExportSheet): string {
  const lines = [sheet.headers, ...sheet.rows].map((row) => row.map(csvCell).join(";"))
  return `﻿${lines.map((line) => `${line}\r\n`).join("")}`
}

/** Hands a file to the browser as a download. */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.style.display = "none"
  document.body.appendChild(anchor)
  anchor.click()
  // Firefox needs the link and the URL alive a moment after the click.
  setTimeout(() => {
    URL.revokeObjectURL(url)
    anchor.remove()
  }, 100)
}

export async function downloadXlsx(
  records: Record<string, unknown>[],
  filename: string,
  sheetName: string,
): Promise<void> {
  if (/\.csv$/i.test(filename)) {
    const csv = buildCsv(recordsToSheet(records))
    saveBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), filename)
    return
  }
  const safeFilename = /\.(xlsx|xlsm|xlsb|xls|ods|txt)$/i.test(filename)
    ? filename
    : `${filename}.xlsx`
  const XLSX = await import("xlsx")
  const worksheet = XLSX.utils.json_to_sheet(records)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, safeFilename)
}
