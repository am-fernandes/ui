import type { ColumnDef, Row } from "@tanstack/react-table"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { dateColumn } from "./columns"

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
