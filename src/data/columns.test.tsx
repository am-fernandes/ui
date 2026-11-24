import {
  type ColumnDef,
  type Row,
  createTable,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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
    // A Date is an instant: 14:30 in São Paulo, whatever the machine's zone.
    expect(renderCell(col, new Date("2026-05-19T14:30:00-03:00"))).toBe("19/05/2026 14:30")
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

describe("dateColumn: time zone and accessors", () => {
  it("shows a UTC instant in São Paulo by default, and in timeZone when given", () => {
    const sp = dateColumn<RowShape>({ accessorKey: "data", header: "Data" })
    expect(renderCell(sp, "2026-05-19T00:00:00.000Z")).toBe("18/05/2026 21:00")
    const utc = dateColumn<RowShape>({ accessorKey: "data", header: "Data", timeZone: "UTC" })
    // Midnight in UTC: a stored date, shown without the time.
    expect(renderCell(utc, "2026-05-19T00:00:00.000Z")).toBe("19/05/2026")
    expect(renderCell(sp, new Date(Date.UTC(2026, 4, 19, 17, 30)))).toBe("19/05/2026 14:30")
  })

  it("never moves a date-only value, in any time zone", () => {
    for (const timeZone of ["America/Sao_Paulo", "Asia/Tokyo", "Pacific/Honolulu", "UTC"]) {
      const col = dateColumn<RowShape>({ accessorKey: "data", header: "Data", timeZone })
      expect(renderCell(col, "2026-05-19")).toBe("19/05/2026")
      expect(renderCell(col, "19/05/2026")).toBe("19/05/2026")
    }
  })

  it("reads wall-clock values (no offset) as they are", () => {
    const col = dateColumn<RowShape>({
      accessorKey: "data",
      header: "Data",
      timeZone: "Asia/Tokyo",
    })
    expect(renderCell(col, "2026-05-19T14:30:00")).toBe("19/05/2026 14:30")
    expect(renderCell(col, "19/05/2026 14:30")).toBe("19/05/2026 14:30")
  })

  it("sorts instants by time across formats", () => {
    const col = dateColumn<RowShape>({ accessorKey: "data", header: "Data" })
    // 10:00Z is 07:00 in São Paulo, before 08:00 there.
    expect(callSort(col, "2026-05-19T10:00:00Z", "19/05/2026 08:00")).toBe(-1)
    expect(callSort(col, "2026-05-20", new Date(Date.UTC(2026, 4, 19, 12)))).toBe(1)
  })

  it("accepts id + accessorFn", () => {
    interface Pedido {
      meta: { criadoEm: string }
    }
    const col = dateColumn<Pedido>({
      id: "criadoEm",
      accessorFn: (row) => row.meta.criadoEm,
      header: "Criado em",
    })
    expect(col.id).toBe("criadoEm")
    const accessorFn = (col as { accessorFn: (row: Pedido, index: number) => unknown }).accessorFn
    expect(accessorFn({ meta: { criadoEm: "2026-05-19" } }, 0)).toBe("2026-05-19")
  })

  it("searches and exports what the cell shows, in its time zone", () => {
    const col = dateColumn<RowShape>({ accessorKey: "data", header: "Data" })
    const meta = col.meta as {
      searchText: (row: RowShape, value: unknown) => string
      export: (row: RowShape, value: unknown) => Date | null
    }
    const value = "2026-05-19T00:00:00.000Z"
    expect(meta.searchText({ data: value }, value)).toBe("18/05/2026 21:00")
    const exported = meta.export({ data: value }, value) as Date
    // The wall clock shown (18/05 21:00), in the Date's own fields for the sheet.
    expect([exported.getDate(), exported.getMonth(), exported.getHours()]).toEqual([18, 4, 21])
  })
})

interface PhoneRow {
  phone: string | null
  name: string
}

/** The text drawn in a cell (a clipped value's full text is only for screen readers). */
function visibleText(container: HTMLElement): string {
  const clone = container.cloneNode(true) as HTMLElement
  for (const hidden of clone.querySelectorAll(".sr-only")) hidden.remove()
  return clone.textContent ?? ""
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
  return visibleText(container)
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
    // What is drawn is the clipped form (5 chars + "…"); a screen reader
    // reads the whole text, kept out of sight.
    const trigger = container.querySelector('[data-slot="tooltip-trigger"]')
    expect(trigger?.querySelector('[aria-hidden="true"]')?.textContent).toBe("LEONA…")
    expect(trigger?.querySelector(".sr-only")?.textContent).toBe("LEONARDO ALVES")
  })

  it("opens the full text from the keyboard: the clipped text is focusable", async () => {
    const col = formattedColumn<PhoneRow, string>({
      accessorKey: "name",
      header: "Nome",
      truncate: { max: 5 },
    })
    const cell = (
      col as unknown as {
        cell: (ctx: { getValue: () => unknown; row: { original: PhoneRow } }) => React.ReactNode
      }
    ).cell
    render(<div>{cell({ getValue: () => "LEONARDO ALVES", row: { original: sampleRow } })}</div>)
    await userEvent.tab()
    const trigger = document.activeElement as HTMLElement
    expect(trigger).toHaveAttribute("data-slot", "tooltip-trigger")
    expect(await screen.findByRole("tooltip")).toHaveTextContent("LEONARDO ALVES")
    await userEvent.keyboard("{Escape}")
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
    // Enter (or Space) brings it back without leaving the text.
    await userEvent.keyboard("{Enter}")
    expect(await screen.findByRole("tooltip")).toHaveTextContent("LEONARDO ALVES")
    await userEvent.keyboard(" ")
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
  })

  it("is not a second tab stop inside a clickable row's button", async () => {
    const { DataTable } = await import("./data-table")
    const col = formattedColumn<PhoneRow, string>({
      accessorKey: "name",
      header: "Nome",
      truncate: { max: 5 },
    })
    render(
      <DataTable
        columns={[col]}
        data={[{ phone: null, name: "LEONARDO ALVES" }]}
        onRowClick={() => {}}
      />,
    )
    const action = screen.getByRole("button", { name: "LEONARDO ALVES" })
    expect(action.querySelector("[tabindex]")).toBeNull()
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

  describe("sorting defaults", () => {
    interface SortRow {
      name: string
    }
    const rows: SortRow[] = [{ name: "b" }, { name: "c" }, { name: "a" }]

    function sortedNames(col: ColumnDef<SortRow>, desc = false): string[] {
      const table = createTable<SortRow>({
        data: rows,
        columns: [col],
        state: { sorting: [{ id: "name", desc }] },
        onStateChange: () => {},
        renderFallbackValue: null,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
      })
      return table.getSortedRowModel().rows.map((r) => r.original.name)
    }

    it("does not emit `sortingFn`/`enableSorting` keys when they are not provided", () => {
      const col = formattedColumn<SortRow, string>({ accessorKey: "name", header: "Nome" })
      expect("sortingFn" in col).toBe(false)
      expect("enableSorting" in col).toBe(false)
    })

    it("keeps TanStack's automatic comparator when `sortingFn` is omitted", () => {
      const col = formattedColumn<SortRow, string>({ accessorKey: "name", header: "Nome" })
      expect(sortedNames(col)).toEqual(["a", "b", "c"])
      expect(sortedNames(col, true)).toEqual(["c", "b", "a"])
    })

    it("still honours an explicit `sortingFn`", () => {
      const col = formattedColumn<SortRow, string>({
        accessorKey: "name",
        header: "Nome",
        sortingFn: (a, b) => b.original.name.localeCompare(a.original.name),
      })
      expect(typeof (col as { sortingFn?: unknown }).sortingFn).toBe("function")
      expect(sortedNames(col)).toEqual(["c", "b", "a"])
    })

    it("still honours an explicit `enableSorting: false`", () => {
      const col = formattedColumn<SortRow, string>({
        accessorKey: "name",
        header: "Nome",
        enableSorting: false,
      })
      expect(col).toMatchObject({ enableSorting: false })
      expect(sortedNames(col)).toEqual(["b", "c", "a"])
    })
  })
})
