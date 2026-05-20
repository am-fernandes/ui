import type { ColumnDef, Row } from "@tanstack/react-table"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { dateColumn, formattedColumn } from "./columns"

interface RowShape {
  data: string | Date | number | null
}

function renderCell(col: ColumnDef<RowShape>, value: unknown): string {
  const cell = (
    col as unknown as {
      cell: (ctx: { getValue: () => unknown }) => React.ReactNode
    }
  ).cell
  const node = cell({ getValue: () => value })
  const { container } = render(<div>{node}</div>)
  return container.textContent ?? ""
}

function makeRow(value: unknown): Row<RowShape> {
  return { getValue: (_id: string) => value } as unknown as Row<RowShape>
}

function callSort(col: ColumnDef<RowShape>, a: unknown, b: unknown): number {
  const fn = (
    col as unknown as {
      sortingFn: (rowA: Row<RowShape>, rowB: Row<RowShape>, id: string) => number
    }
  ).sortingFn
  return fn(makeRow(a), makeRow(b), "data")
}

describe("dateColumn", () => {
  it("formats ISO date-only string as dd/MM/yyyy (no time)", () => {
    const col = dateColumn<RowShape>({ accessorKey: "data", header: "Data" })
    expect(renderCell(col, "2026-05-19")).toBe("19/05/2026")
  })

  it("formats ISO datetime string as dd/MM/yyyy HH:mm when time is non-zero (auto mode)", () => {
    const col = dateColumn<RowShape>({ accessorKey: "data", header: "Data" })
    expect(renderCell(col, "2026-05-19T14:30:00")).toBe("19/05/2026 14:30")
  })

  it("formats Date objects with time", () => {
    const col = dateColumn<RowShape>({ accessorKey: "data", header: "Data" })
    expect(renderCell(col, new Date(2026, 4, 19, 14, 30))).toBe("19/05/2026 14:30")
  })

  it("accepts BR-formatted strings (dd/MM/yyyy)", () => {
    const col = dateColumn<RowShape>({ accessorKey: "data", header: "Data" })
    expect(renderCell(col, "19/05/2026")).toBe("19/05/2026")
  })

  it("accepts BR-formatted strings with time", () => {
    const col = dateColumn<RowShape>({ accessorKey: "data", header: "Data" })
    expect(renderCell(col, "19/05/2026 14:30")).toBe("19/05/2026 14:30")
  })

  it("renders empty when value is null/undefined/empty", () => {
    const col = dateColumn<RowShape>({ accessorKey: "data", header: "Data" })
    expect(renderCell(col, null)).toBe("")
    expect(renderCell(col, undefined)).toBe("")
    expect(renderCell(col, "")).toBe("")
  })

  it("renders custom emptyText for missing values", () => {
    const col = dateColumn<RowShape>({ accessorKey: "data", header: "Data", emptyText: "—" })
    expect(renderCell(col, null)).toBe("—")
  })

  it("forces time with showTime: true even when value has no time", () => {
    const col = dateColumn<RowShape>({ accessorKey: "data", header: "Data", showTime: true })
    expect(renderCell(col, "2026-05-19")).toBe("19/05/2026 00:00")
  })

  it("hides time with showTime: false even when value has time", () => {
    const col = dateColumn<RowShape>({ accessorKey: "data", header: "Data", showTime: false })
    expect(renderCell(col, "2026-05-19T14:30:00")).toBe("19/05/2026")
  })

  it("sortingFn compares by timestamp (BR strings sort correctly)", () => {
    const col = dateColumn<RowShape>({ accessorKey: "data", header: "Data" })
    // Alphabetic compare would put "20/12/2025" > "15/01/2026" (wrong).
    // Correct chronological: 20/12/2025 < 15/01/2026.
    expect(callSort(col, "20/12/2025", "15/01/2026")).toBe(-1)
    expect(callSort(col, "15/01/2026", "20/12/2025")).toBe(1)
    expect(callSort(col, "15/01/2026", "15/01/2026")).toBe(0)
  })

  it("sortingFn compares ISO strings chronologically", () => {
    const col = dateColumn<RowShape>({ accessorKey: "data", header: "Data" })
    expect(callSort(col, "2025-12-20", "2026-01-15")).toBe(-1)
    expect(callSort(col, "2026-01-15T14:30:00", "2026-01-15T09:00:00")).toBe(1)
  })

  it("sortingFn handles missing values (null sorts before)", () => {
    const col = dateColumn<RowShape>({ accessorKey: "data", header: "Data" })
    expect(callSort(col, null, "2026-01-15")).toBe(-1)
    expect(callSort(col, "2026-01-15", null)).toBe(1)
    expect(callSort(col, null, null)).toBe(0)
  })
})

interface PhoneRow {
  phone: string | null
  name: string
}

function renderFormattedCell(
  col: ColumnDef<PhoneRow>,
  value: unknown,
  rowOriginal: PhoneRow,
): string {
  const cell = (
    col as unknown as {
      cell: (ctx: {
        getValue: () => unknown
        row: { original: PhoneRow }
      }) => React.ReactNode
    }
  ).cell
  const node = cell({ getValue: () => value, row: { original: rowOriginal } })
  const { container } = render(<div>{node}</div>)
  return container.textContent ?? ""
}

describe("formattedColumn", () => {
  const sampleRow: PhoneRow = { phone: "11944951458", name: "Gisel" }

  it("formats the cell display through the provided `format` callback", () => {
    const col = formattedColumn<PhoneRow, string>({
      accessorKey: "phone",
      header: "Telefone",
      format: (v) => `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`,
    })
    expect(renderFormattedCell(col, "11944951458", sampleRow)).toBe("(11) 94495-1458")
  })

  it("passes the full row to `format` so you can synthesize across fields", () => {
    const col = formattedColumn<PhoneRow, string>({
      accessorKey: "phone",
      header: "Contato",
      format: (v, row) => `${row.name} — ${v}`,
    })
    expect(renderFormattedCell(col, "11944951458", sampleRow)).toBe("Gisel — 11944951458")
  })

  it("renders `emptyText` when the raw value is nullish/empty", () => {
    const col = formattedColumn<PhoneRow, string>({
      accessorKey: "phone",
      header: "Telefone",
      format: (v) => v.toUpperCase(),
      emptyText: "—",
    })
    expect(renderFormattedCell(col, null, sampleRow)).toBe("—")
    expect(renderFormattedCell(col, "", sampleRow)).toBe("—")
    expect(renderFormattedCell(col, undefined, sampleRow)).toBe("—")
  })

  it("wraps the formatted output in a span when `className` is provided", () => {
    const col = formattedColumn<PhoneRow, string>({
      accessorKey: "phone",
      header: "Telefone",
      format: (v) => v,
      className: "font-mono text-xs",
    })
    const cell = (
      col as unknown as {
        cell: (ctx: {
          getValue: () => unknown
          row: { original: PhoneRow }
        }) => React.ReactNode
      }
    ).cell
    const { container } = render(
      <div>{cell({ getValue: () => "x", row: { original: sampleRow } })}</div>,
    )
    const span = container.querySelector("span")
    expect(span?.className).toContain("font-mono")
  })

  it("truncates strings longer than `truncate.max` and exposes the full text via tooltip", () => {
    const col = formattedColumn<PhoneRow, string>({
      accessorKey: "name",
      header: "Nome",
      truncate: { max: 5 },
    })
    const cell = (
      col as unknown as {
        cell: (ctx: {
          getValue: () => unknown
          row: { original: PhoneRow }
        }) => React.ReactNode
      }
    ).cell
    const { container } = render(
      <div>{cell({ getValue: () => "LEONARDO ALVES", row: { original: sampleRow } })}</div>,
    )
    // The visible span shows the clipped form (5 chars + "…").
    const trigger = container.querySelector('[data-slot="tooltip-trigger"]')
    expect(trigger?.textContent).toBe("LEONA…")
    // The tooltip primitive (Radix) doesn't render the full content until
    // opened — the trigger's child `span` is what users see at rest.
    const span = container.querySelector("span")
    expect(span?.textContent).toBe("LEONA…")
  })

  it("counts code points (not UTF-16 units) so surrogate pairs aren't split", () => {
    // "𝓒amilly" — first letter is U+1D4D2 (math-italic C, 2 UTF-16 units).
    // By code points the name is 7 long, by JS string length it is 8.
    const col = formattedColumn<PhoneRow, string>({
      accessorKey: "name",
      header: "Nome",
      truncate: { max: 7 },
    })
    expect(renderFormattedCell(col, "𝓒amilly", sampleRow)).toBe("𝓒amilly")
    // With max=6, the C stays intact (no replacement char).
    const col2 = formattedColumn<PhoneRow, string>({
      accessorKey: "name",
      header: "Nome",
      truncate: { max: 6 },
    })
    expect(renderFormattedCell(col2, "𝓒amilly", sampleRow)).toBe("𝓒amill…")
  })

  it("does NOT truncate when the formatted value is shorter than `truncate.max`", () => {
    const col = formattedColumn<PhoneRow, string>({
      accessorKey: "name",
      header: "Nome",
      truncate: { max: 20 },
    })
    expect(renderFormattedCell(col, "Gisel", sampleRow)).toBe("Gisel")
  })

  it("supports `accessorFn` columns (computed values)", () => {
    interface DeepRow {
      lead: { phone: string }
    }
    const col = formattedColumn<DeepRow, string>({
      accessorFn: (row) => row.lead.phone,
      id: "phone",
      header: "Telefone",
      format: (v) => `+55 ${v}`,
    })
    const cell = (
      col as unknown as {
        cell: (ctx: {
          getValue: () => unknown
          row: { original: DeepRow }
        }) => React.ReactNode
      }
    ).cell
    const { container } = render(
      <div>
        {cell({
          getValue: () => "11944951458",
          row: { original: { lead: { phone: "11944951458" } } },
        })}
      </div>,
    )
    expect(container.textContent).toBe("+55 11944951458")
  })
})
