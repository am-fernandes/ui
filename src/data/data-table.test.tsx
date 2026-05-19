import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { downloadXlsxMock } = vi.hoisted(() => ({
  downloadXlsxMock: vi.fn(async () => undefined),
}))

vi.mock("./_xlsx-export", () => ({
  downloadXlsx: downloadXlsxMock,
}))

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
    render(<DataTable columns={columns} data={data} sortableColumns={["name"]} />)
    const sortBtn = screen.getByRole("button", { name: /Ordenar por Name/i })
    await userEvent.click(sortBtn)
    const rows = screen.getAllByRole("row")
    // header row + 3 data rows
    expect(rows).toHaveLength(4)
    // first body row should be Alpha after ascending sort
    expect(rows[1]?.textContent).toContain("Alpha")
  })

  it("toggles to descending sort on the second click", async () => {
    render(<DataTable columns={columns} data={data} sortableColumns={["name"]} />)
    const sortBtn = screen.getByRole("button", { name: /Ordenar por Name/i })
    await userEvent.click(sortBtn)
    await userEvent.click(sortBtn)
    const rows = screen.getAllByRole("row")
    // first body row should be Charlie after descending sort
    expect(rows[1]?.textContent).toContain("Charlie")
  })

  it("clears sort after three clicks", async () => {
    render(<DataTable columns={columns} data={data} sortableColumns={["name"]} />)
    const sortBtn = screen.getByRole("button", { name: /Ordenar por Name/i })
    await userEvent.click(sortBtn)
    await userEvent.click(sortBtn)
    await userEvent.click(sortBtn)
    const rows = screen.getAllByRole("row")
    // back to original order: Bravo first
    expect(rows[1]?.textContent).toContain("Bravo")
  })

  it("reflects sort state via aria-sort on the header cell", async () => {
    render(<DataTable columns={columns} data={data} sortableColumns={["name"]} />)
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

  it("uses TanStack's default `includesString` when no searchableColumns are given", () => {
    // Controlled globalFilter without `searchableColumns` exercises the default
    // matcher branch (no global filter input rendered, but filter still applies).
    render(<DataTable columns={columns} data={data} globalFilter="alp" />)
    expect(screen.getByText("Alpha")).toBeInTheDocument()
    expect(screen.queryByText("Bravo")).not.toBeInTheDocument()
  })

  it("shows row count via the default rowCount formatter when showRowCount=true", async () => {
    render(<DataTable columns={columns} data={data} showRowCount searchableColumns={["name"]} />)
    expect(screen.getByText("3 registros")).toBeInTheDocument()
    // Apply filter so filtered != total -> hits the alternate branch.
    await userEvent.type(screen.getByPlaceholderText("Buscar..."), "alp")
    expect(screen.getByText("1 de 3 registros")).toBeInTheDocument()
  })

  it("singularizes the row count when total == 1", () => {
    render(<DataTable columns={columns} data={[data[0]!]} showRowCount />)
    expect(screen.getByText("1 registro")).toBeInTheDocument()
  })

  it("formats large row counts with pt-BR thousands separator", () => {
    const many: Row[] = Array.from({ length: 1832 }, (_, i) => ({
      name: `User ${i}`,
      age: i,
    }))
    render(<DataTable columns={columns} data={many} pagination={{ pageSize: 10 }} showRowCount />)
    expect(screen.getByText("1.832 registros")).toBeInTheDocument()
  })

  it("formats both filtered and total with thousands separator", () => {
    const many: Row[] = Array.from({ length: 1832 }, (_, i) => ({
      name: i < 1234 ? `Alpha ${i}` : `Bravo ${i}`,
      age: i,
    }))
    render(
      <DataTable
        columns={columns}
        data={many}
        globalFilter="Alpha"
        searchableColumns={["name"]}
        pagination={{ pageSize: 10 }}
        showRowCount
      />,
    )
    expect(screen.getByText("1.234 de 1.832 registros")).toBeInTheDocument()
  })

  it("overrides pagination, export, loading and sort labels via the labels prop (en-US sample)", async () => {
    const many: Row[] = Array.from({ length: 12 }, (_, i) => ({
      name: `Row ${i + 1}`,
      age: 20 + i,
    }))
    render(
      <DataTable
        columns={columns}
        data={many}
        sortableColumns={["name"]}
        pagination={{ pageSize: 5 }}
        downloadable
        loading
        labels={{
          loading: "Loading data…",
          paginationPrevious: "Previous page",
          paginationNext: "Next page",
          pageIndicator: (idx, total) => `Page ${idx + 1} / ${total}`,
          sortBy: (h) => `Sort by ${h}`,
          exportTrigger: "Export to Excel",
        }}
      />,
    )
    // sr-only loading status
    expect(screen.getByText("Loading data…")).toBeInTheDocument()
    // pagination aria-labels
    expect(screen.getByRole("button", { name: "Previous page" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Next page" })).toBeInTheDocument()
  })

  it("uses custom labels.search / labels.empty / labels.rowCount", async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        searchableColumns={["name"]}
        showRowCount
        labels={{
          search: "Pesquisar pessoas",
          empty: "Nenhum cadastro",
          rowCount: (f, t) => `Mostrando ${f}/${t}`,
        }}
      />,
    )
    expect(screen.getByPlaceholderText("Pesquisar pessoas")).toBeInTheDocument()
    expect(screen.getByText("Mostrando 3/3")).toBeInTheDocument()
    await userEvent.type(screen.getByPlaceholderText("Pesquisar pessoas"), "zzzz")
    expect(screen.getByText("Nenhum cadastro")).toBeInTheDocument()
    expect(screen.getByText("Mostrando 0/3")).toBeInTheDocument()
  })

  it("manualPagination respects pageCount and skips client-side pagination", async () => {
    // 12 rows but only the first page is materialized — manualPagination delegates
    // slicing to the consumer, so all rows passed in remain visible.
    const many: Row[] = Array.from({ length: 12 }, (_, i) => ({
      name: `Row ${i + 1}`,
      age: 20 + i,
    }))
    render(
      <DataTable
        columns={columns}
        data={many}
        manualPagination
        pageCount={4}
        pagination={{ pageSize: 5 }}
      />,
    )
    expect(screen.getByText(/Página 1 de 4/)).toBeInTheDocument()
    // With manualPagination, the rows array is rendered verbatim.
    expect(screen.getByText("Row 12")).toBeInTheDocument()
  })

  it("invokes onGlobalFilterChange when globalFilter is controlled (short-circuit branch)", async () => {
    const onGlobalFilterChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        searchableColumns={["name"]}
        globalFilter=""
        onGlobalFilterChange={onGlobalFilterChange}
      />,
    )
    await userEvent.type(screen.getByPlaceholderText("Buscar..."), "a")
    expect(onGlobalFilterChange).toHaveBeenCalled()
  })

  it("renders no sort button when sortableColumns is omitted", () => {
    render(<DataTable columns={columns} data={data} />)
    expect(screen.queryByRole("button", { name: /Ordenar por/i })).not.toBeInTheDocument()
    expect(screen.getByText("Name")).toBeInTheDocument()
    expect(screen.getByText("Age")).toBeInTheDocument()
  })

  it("renders sort buttons only for columns listed in sortableColumns", () => {
    render(<DataTable columns={columns} data={data} sortableColumns={["name"]} />)
    expect(
      screen.getByRole("button", { name: /Ordenar por Name/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /Ordenar por Age/i }),
    ).not.toBeInTheDocument()
  })

  it("renders an element-typed header (non-string header branch)", () => {
    const cols: ColumnDef<Row>[] = [
      {
        accessorKey: "name",
        header: () => <span data-testid="hdr-name">Custom</span>,
      },
      { accessorKey: "age", header: "Age" },
    ]
    render(<DataTable columns={cols} data={data} sortableColumns={["name"]} />)
    expect(screen.getByTestId("hdr-name")).toBeInTheDocument()
    // Sort button still rendered but its aria-label uses column id, not the JSX.
    const btn = screen
      .getAllByRole("button")
      .find((b) => /Ordenar por name/i.test(b.getAttribute("aria-label") ?? ""))
    expect(btn).toBeTruthy()
  })

  describe("downloadable", () => {
    beforeEach(() => {
      downloadXlsxMock.mockClear()
    })

    it("does not render the export button by default", () => {
      render(<DataTable columns={columns} data={data} />)
      expect(screen.queryByText("Exportar para Excel")).not.toBeInTheDocument()
    })

    it("renders an Exportar para Excel ghost button when downloadable is set", () => {
      render(<DataTable columns={columns} data={data} downloadable />)
      const btn = screen.getByRole("button", { name: /Exportar para Excel/i })
      expect(btn).toBeInTheDocument()
    })

    it("disables the export trigger when data is empty", () => {
      render(<DataTable columns={columns} data={[]} downloadable />)
      const btn = screen.getByRole("button", { name: /Exportar para Excel/i })
      expect(btn).toBeDisabled()
    })

    it("opens a popover with the three scope options on click", async () => {
      render(<DataTable columns={columns} data={data} downloadable />)
      await userEvent.click(screen.getByRole("button", { name: /Exportar para Excel/i }))
      expect(screen.getByRole("menuitem", { name: /Exportar dados filtrados/i })).toBeInTheDocument()
      expect(screen.getByRole("menuitem", { name: /Exportar página atual/i })).toBeInTheDocument()
      expect(screen.getByRole("menuitem", { name: /Exportar todos os dados/i })).toBeInTheDocument()
    })

    it("exports filtered rows respecting the active search filter", async () => {
      render(
        <DataTable
          columns={columns}
          data={data}
          downloadable
          searchableColumns={["name"]}
          globalFilter="alp"
        />,
      )
      await userEvent.click(screen.getByRole("button", { name: /Exportar para Excel/i }))
      await userEvent.click(screen.getByRole("menuitem", { name: /Exportar dados filtrados/i }))
      expect(downloadXlsxMock).toHaveBeenCalledTimes(1)
      const [records] = downloadXlsxMock.mock.calls[0] as unknown as [Record<string, unknown>[], string, string]
      expect(records).toHaveLength(1)
      expect(records[0]).toMatchObject({ Name: "Alpha" })
    })

    it("exports the current page when pagination is active", async () => {
      render(
        <DataTable columns={columns} data={data} downloadable pagination={{ pageSize: 2 }} />,
      )
      await userEvent.click(screen.getByRole("button", { name: /Exportar para Excel/i }))
      await userEvent.click(screen.getByRole("menuitem", { name: /Exportar página atual/i }))
      const [records] = downloadXlsxMock.mock.calls[0] as unknown as [Record<string, unknown>[], string, string]
      expect(records).toHaveLength(2)
    })

    it("exports all original rows ignoring filter and pagination", async () => {
      render(
        <DataTable
          columns={columns}
          data={data}
          downloadable
          searchableColumns={["name"]}
          globalFilter="alp"
          pagination={{ pageSize: 1 }}
        />,
      )
      await userEvent.click(screen.getByRole("button", { name: /Exportar para Excel/i }))
      await userEvent.click(screen.getByRole("menuitem", { name: /Exportar todos os dados/i }))
      const [records] = downloadXlsxMock.mock.calls[0] as unknown as [Record<string, unknown>[], string, string]
      expect(records).toHaveLength(data.length)
    })

    it("uses custom filename, sheetName and rowToRecord when provided", async () => {
      render(
        <DataTable
          columns={columns}
          data={data}
          downloadable={{
            filename: "contratos.xlsx",
            sheetName: "Contratos",
            rowToRecord: (row) => ({ NOME_CUSTOM: row.name.toUpperCase() }),
          }}
        />,
      )
      await userEvent.click(screen.getByRole("button", { name: /Exportar para Excel/i }))
      await userEvent.click(screen.getByRole("menuitem", { name: /Exportar todos os dados/i }))
      const [records, filename, sheetName] = downloadXlsxMock.mock.calls[0] as unknown as [
        Record<string, unknown>[],
        string,
        string,
      ]
      expect(filename).toBe("contratos.xlsx")
      expect(sheetName).toBe("Contratos")
      expect(records[0]).toEqual({ NOME_CUSTOM: "BRAVO" })
    })

    it("replaces the export button with a skeleton when loading", () => {
      const { container } = render(
        <DataTable columns={columns} data={data} downloadable loading />,
      )
      expect(screen.queryByText("Exportar para Excel")).not.toBeInTheDocument()
      expect(
        container.querySelector('[data-slot="data-table-download-skeleton"]'),
      ).toBeTruthy()
    })
  })

  describe("loading", () => {
    it("renders 5 skeleton rows by default when pagination is off", () => {
      const { container } = render(<DataTable columns={columns} data={[]} loading />)
      const skeletonRows = container.querySelectorAll(
        '[data-slot="data-table-skeleton-row"]',
      )
      expect(skeletonRows).toHaveLength(5)
    })

    it("derives skeleton row count from pagination.pageSize", () => {
      const { container } = render(
        <DataTable columns={columns} data={[]} loading pagination={{ pageSize: 8 }} />,
      )
      const skeletonRows = container.querySelectorAll(
        '[data-slot="data-table-skeleton-row"]',
      )
      expect(skeletonRows).toHaveLength(8)
    })

    it("renders one skeleton cell per column", () => {
      const { container } = render(<DataTable columns={columns} data={[]} loading />)
      const firstRow = container.querySelector('[data-slot="data-table-skeleton-row"]')
      expect(firstRow).toBeTruthy()
      expect(firstRow?.querySelectorAll("td")).toHaveLength(columns.length)
    })

    it("replaces the search input with a skeleton when searchableColumns is provided", () => {
      const { container } = render(
        <DataTable
          columns={columns}
          data={[]}
          loading
          searchableColumns={["name"]}
        />,
      )
      expect(screen.queryByPlaceholderText("Buscar...")).not.toBeInTheDocument()
      expect(
        container.querySelector('[data-slot="data-table-search-skeleton"]'),
      ).toBeTruthy()
    })

    it("does not render a search skeleton when searchableColumns is omitted", () => {
      const { container } = render(<DataTable columns={columns} data={[]} loading />)
      expect(
        container.querySelector('[data-slot="data-table-search-skeleton"]'),
      ).toBeNull()
    })

    it("disables pagination buttons while loading", () => {
      render(
        <DataTable columns={columns} data={data} loading pagination={{ pageSize: 2 }} />,
      )
      const prev = screen.getByRole("button", { name: /Página anterior/i })
      const next = screen.getByRole("button", { name: /Próxima página/i })
      expect(prev).toBeDisabled()
      expect(next).toBeDisabled()
    })

    it("sets aria-busy on the wrapper while loading", () => {
      const { container } = render(<DataTable columns={columns} data={[]} loading />)
      const wrapper = container.querySelector('[data-slot="data-table"]')
      expect(wrapper?.getAttribute("aria-busy")).toBe("true")
    })

    it("does not show the empty-state message while loading (skeleton instead)", () => {
      render(
        <DataTable
          columns={columns}
          data={[]}
          loading
          emptyMessage="Should not appear"
        />,
      )
      expect(screen.queryByText("Should not appear")).not.toBeInTheDocument()
    })
  })
})
