import type { ColumnDef } from "@tanstack/react-table"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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

  it("filters when searching", async () => {
    render(<DataTable columns={columns} data={data} searchableColumns={["name"]} />)
    const search = screen.getByPlaceholderText("Buscar...")
    await userEvent.type(search, "alp")
    expect(screen.getByText("Alpha")).toBeInTheDocument()
    expect(screen.queryByText("Bravo")).not.toBeInTheDocument()
  })
})
