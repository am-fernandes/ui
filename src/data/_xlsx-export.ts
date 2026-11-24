import type { Cell, SheetData } from "write-excel-file/browser"

/**
 * Spreadsheet export for `DataTable`. A name ending in `.csv` is written here
 * as a CSV that the Brazilian Excel opens right; anything else becomes an
 * `.xlsx`, through `write-excel-file` loaded only when called so the main
 * bundle of `@amfernandesinc/ui` stays small for consumers that never trigger
 * a download.
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

const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

/**
 * The wall clock of a `Date` (its local fields) as the same fields in UTC.
 * Excel has no time zones: `write-excel-file` turns a `Date` into a serial
 * number from its UTC time, so a local-midnight date east or west of UTC
 * would land on the day before or after. Moving the fields keeps the
 * calendar day and the time the table shows.
 */
function wallClockAsUTC(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds(),
    ),
  )
}

function xlsxCell(value: ExportValue): Cell {
  if (value == null) return null
  if (typeof value === "number") return Number.isFinite(value) ? { value, type: Number } : null
  if (typeof value === "bigint") return { value: value.toString(), type: String }
  if (typeof value === "boolean") return { value, type: Boolean }
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    const midnight = value.getHours() === 0 && value.getMinutes() === 0 && value.getSeconds() === 0
    return {
      value: wallClockAsUTC(value),
      type: Date,
      format: midnight ? "dd/mm/yyyy" : "dd/mm/yyyy hh:mm",
    }
  }
  return { value, type: String }
}

/** Width of a column in characters: its longest text, within reason. */
function columnWidth(header: string, rows: ExportValue[][], index: number): number {
  let longest = header.length
  for (const row of rows) {
    const value = row[index]
    const length = value instanceof Date ? 16 : value == null ? 0 : String(value).length
    if (length > longest) longest = length
  }
  return Math.min(Math.max(longest + 2, 8), 60)
}

/** Excel refuses `: \ / ? * [ ]` in a sheet name and cuts it at 31 characters. */
function safeSheetName(name: string): string {
  const cleaned = name.replace(/[:\\/?*[\]]/g, " ").slice(0, 31)
  return cleaned.trim() === "" ? "Dados" : cleaned
}

/** The `.xlsx` file of a sheet: bold, frozen header row and dates as dates. */
export async function buildXlsx(sheet: ExportSheet, sheetName: string): Promise<Blob> {
  const { default: writeExcelFile } = await import("write-excel-file/browser")
  const data: SheetData = [
    sheet.headers.map((header) => ({ value: header, type: String, fontWeight: "bold" as const })),
    ...sheet.rows.map((row) => sheet.headers.map((_, index) => xlsxCell(row[index]))),
  ]
  return writeExcelFile(data, {
    sheet: safeSheetName(sheetName),
    stickyRowsCount: 1,
    columns: sheet.headers.map((header, index) => ({
      width: columnWidth(header, sheet.rows, index),
    })),
  }).toBlob()
}

/**
 * The file name and format for a requested name: `.csv` stays CSV, `.xlsx`
 * stays; an older spreadsheet extension (`.xls`, `.xlsm`, `.xlsb`, `.ods`,
 * `.txt`) becomes `.xlsx`, which is what is written; anything else gets
 * `.xlsx` appended.
 */
export function exportFileName(filename: string): { name: string; format: "csv" | "xlsx" } {
  if (/\.csv$/i.test(filename)) return { name: filename, format: "csv" }
  if (/\.xlsx$/i.test(filename)) return { name: filename, format: "xlsx" }
  if (/\.(xls|xlsm|xlsb|ods|txt)$/i.test(filename)) {
    return { name: filename.replace(/\.[^.]+$/, ".xlsx"), format: "xlsx" }
  }
  return { name: `${filename}.xlsx`, format: "xlsx" }
}

/** Writes a sheet to a file and hands it to the browser as a download. */
export async function downloadSheet(
  sheet: ExportSheet,
  filename: string,
  sheetName: string,
): Promise<void> {
  const file = exportFileName(filename)
  if (file.format === "csv") {
    saveBlob(new Blob([buildCsv(sheet)], { type: "text/csv;charset=utf-8" }), file.name)
    return
  }
  const blob = await buildXlsx(sheet, sheetName)
  saveBlob(blob.type ? blob : new Blob([blob], { type: XLSX_TYPE }), file.name)
}
