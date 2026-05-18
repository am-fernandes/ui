import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it } from "vitest"

import { DataTable } from "./data-table"

interface Row {
  name: string
  age: number
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "age", header: "Age" },
]

const data: Row[] = [
  { name: "Bravo", age: 30 },
  { name: "Alpha", age: 20 },
  { name: "Charlie", age: 25 },
]

describe("DataTable", () => {
  it("renders headers and rows", () => {
    render(<DataTable columns={columns} data={data} />)
    expect(screen.getByText("Name")).toBeInTheDocument()
    expect(screen.getByText("Age")).toBeInTheDocument()
    expect(screen.getByText("Alpha")).toBeInTheDocument()
    expect(screen.getByText("Bravo")).toBeInTheDocument()
    expect(screen.getByText("Charlie")).toBeInTheDocument()
  })

  it("sorts when the sortable header is toggled", async () => {
    render(<DataTable columns={columns} data={data} />)
    const sortBtn = screen.getByRole("button", { name: /Ordenar por Name/i })
    await userEvent.click(sortBtn)
    const rows = screen.getAllByRole("row")
    // header row + 3 data rows
    expect(rows).toHaveLength(4)
    // first body row should be Alpha after ascending sort
    expect(rows[1]?.textContent).toContain("Alpha")
  })

  it("toggles to descending sort on the second click", async () => {
    render(<DataTable columns={columns} data={data} />)
    const sortBtn = screen.getByRole("button", { name: /Ordenar por Name/i })
    await userEvent.click(sortBtn)
    await userEvent.click(sortBtn)
    const rows = screen.getAllByRole("row")
    // first body row should be Charlie after descending sort
    expect(rows[1]?.textContent).toContain("Charlie")
  })

  it("clears sort after three clicks", async () => {
    render(<DataTable columns={columns} data={data} />)
    const sortBtn = screen.getByRole("button", { name: /Ordenar por Name/i })
    await userEvent.click(sortBtn)
    await userEvent.click(sortBtn)
    await userEvent.click(sortBtn)
    const rows = screen.getAllByRole("row")
    // back to original order: Bravo first
    expect(rows[1]?.textContent).toContain("Bravo")
  })

  it("reflects sort state via aria-sort on the header cell", async () => {
    render(<DataTable columns={columns} data={data} />)
    const headerCells = screen.getAllByRole("columnheader")
    expect(headerCells[0]?.getAttribute("aria-sort")).toBe("none")
    await userEvent.click(screen.getByRole("button", { name: /Ordenar por Name/i }))
    expect(headerCells[0]?.getAttribute("aria-sort")).toBe("ascending")
    await userEvent.click(screen.getByRole("button", { name: /Ordenar por Name/i }))
    expect(headerCells[0]?.getAttribute("aria-sort")).toBe("descending")
  })

  it("filters when searching", async () => {
    render(<DataTable columns={columns} data={data} searchableColumns={["name"]} />)
    const search = screen.getByPlaceholderText("Buscar...")
    await userEvent.type(search, "alp")
    expect(screen.getByText("Alpha")).toBeInTheDocument()
    expect(screen.queryByText("Bravo")).not.toBeInTheDocument()
  })

  it("renders empty state with searchable enabled and no matches", async () => {
    render(<DataTable columns={columns} data={data} searchableColumns={["name"]} />)
    await userEvent.type(screen.getByPlaceholderText("Buscar..."), "zzz")
    expect(screen.getByText("Nenhum resultado.")).toBeInTheDocument()
  })

  it("paginates rows and changes page on next click", async () => {
    const many: Row[] = Array.from({ length: 12 }, (_, i) => ({
      name: `Row ${i + 1}`,
      age: 20 + i,
    }))
    render(<DataTable columns={columns} data={many} pagination={{ pageSize: 5 }} />)

    expect(screen.getByText("Row 1")).toBeInTheDocument()
    expect(screen.getByText("Row 5")).toBeInTheDocument()
    expect(screen.queryByText("Row 6")).not.toBeInTheDocument()
    expect(screen.getByText(/Página 1 de 3/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Próxima página" }))
    expect(screen.getByText("Row 6")).toBeInTheDocument()
    expect(screen.getByText("Row 10")).toBeInTheDocument()
    expect(screen.queryByText("Row 1")).not.toBeInTheDocument()
    expect(screen.getByText(/Página 2 de 3/)).toBeInTheDocument()
  })

  it("disables the next button on the last page", async () => {
    const many: Row[] = Array.from({ length: 6 }, (_, i) => ({
      name: `Row ${i + 1}`,
      age: 20 + i,
    }))
    render(<DataTable columns={columns} data={many} pagination={{ pageSize: 5 }} />)
    const next = screen.getByRole("button", { name: "Próxima página" })
    await userEvent.click(next)
    expect(next).toBeDisabled()
  })

  it("supports controlled sorting", async () => {
    function Wrapper() {
      const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
      return (
        <>
          <button type="button" data-testid="reset" onClick={() => setSorting([])}>
            reset
          </button>
          <DataTable columns={columns} data={data} sorting={sorting} onSortingChange={setSorting} />
        </>
      )
    }
    render(<Wrapper />)
    // Controlled: Alpha should be first body row.
    let rows = screen.getAllByRole("row")
    expect(rows[1]?.textContent).toContain("Alpha")
    // Reset sorting externally.
    await userEvent.click(screen.getByTestId("reset"))
    rows = screen.getAllByRole("row")
    expect(rows[1]?.textContent).toContain("Bravo")
  })

  it("supports controlled pagination", async () => {
    const many: Row[] = Array.from({ length: 6 }, (_, i) => ({
      name: `Row ${i + 1}`,
      age: 20 + i,
    }))
    function Wrapper() {
      const [pageIndex, setPageIndex] = React.useState(0)
      const handle: React.ComponentProps<typeof DataTable<Row>>["onPaginationChange"] = (
        updater,
      ) => {
        const next =
          typeof updater === "function"
            ? (updater as (old: PaginationState) => PaginationState)({ pageIndex, pageSize: 5 })
            : updater
        setPageIndex(next.pageIndex)
      }
      return (
        <DataTable
          columns={columns}
          data={many}
          pagination={{ pageSize: 5 }}
          pageIndex={pageIndex}
          onPaginationChange={handle}
        />
      )
    }
    render(<Wrapper />)
    expect(screen.getByText("Row 1")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Próxima página" }))
    expect(screen.getByText("Row 6")).toBeInTheDocument()
  })

  it("respects controlled globalFilter prop", () => {
    render(
      <DataTable columns={columns} data={data} searchableColumns={["name"]} globalFilter="bra" />,
    )
    expect(screen.getByText("Bravo")).toBeInTheDocument()
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument()
  })
})
