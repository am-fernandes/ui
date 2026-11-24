import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { downloadSheetMock } = vi.hoisted(() => ({
  downloadSheetMock: vi.fn(
    async (_sheet: ExportSheet, _filename: string, _sheetName: string) => {},
  ),
}))

vi.mock("./_xlsx-export", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./_xlsx-export")>()),
  downloadSheet: downloadSheetMock,
}))

/** The sheet of the nth export, also as records (header → value) and its file name. */
function exportCall(n = 0): [Record<string, unknown>[], string, string, ExportSheet] {
  const [sheet, filename, sheetName] = downloadSheetMock.mock.calls[n] as [
    ExportSheet,
    string,
    string,
  ]
  const records = sheet.rows.map((row) =>
    Object.fromEntries(sheet.headers.map((header, index) => [header, row[index]])),
  )
  return [records, filename, sheetName, sheet]
}

import type { ExportSheet } from "./_xlsx-export"
import { dateColumn, formattedColumn } from "./columns"
import { DataTable } from "./data-table"

/** The page the pager marks as current and the last page it offers. */
function pager() {
  const nav = screen.getByRole("navigation", { name: "Paginação" })
  const current = within(nav).getByRole("button", { current: "page" })
  const pages = within(nav).getAllByRole("button", { name: /^Página \d+$/ })
  return { current: current.textContent, last: pages.at(-1)?.textContent }
}

/** A control of the pager is unavailable (aria-disabled, so it keeps its focus). */
function isUnavailable(element: HTMLElement) {
  return element.getAttribute("aria-disabled") === "true" || (element as HTMLButtonElement).disabled
}

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
  beforeEach(() => {
    downloadSheetMock.mockClear()
  })

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
    const sortBtn = screen.getByRole("button", { name: "Name" })
    await userEvent.click(sortBtn)
    const rows = screen.getAllByRole("row")
    // header row + 3 data rows
    expect(rows).toHaveLength(4)
    // first body row should be Alpha after ascending sort
    expect(rows[1]?.textContent).toContain("Alpha")
  })

  it("toggles to descending sort on the second click", async () => {
    render(<DataTable columns={columns} data={data} sortableColumns={["name"]} />)
    const sortBtn = screen.getByRole("button", { name: "Name" })
    await userEvent.click(sortBtn)
    await userEvent.click(sortBtn)
    const rows = screen.getAllByRole("row")
    // first body row should be Charlie after descending sort
    expect(rows[1]?.textContent).toContain("Charlie")
  })

  it("clears sort after three clicks", async () => {
    render(<DataTable columns={columns} data={data} sortableColumns={["name"]} />)
    const sortBtn = screen.getByRole("button", { name: "Name" })
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
    await userEvent.click(screen.getByRole("button", { name: "Name" }))
    expect(headerCells[0]?.getAttribute("aria-sort")).toBe("ascending")
    await userEvent.click(screen.getByRole("button", { name: "Name" }))
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
    expect(screen.getByRole("cell", { name: "Nenhum resultado." })).toBeInTheDocument()
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
    expect(pager()).toEqual({ current: "1", last: "3" })

    await userEvent.click(screen.getByRole("button", { name: "Próxima página" }))
    expect(screen.getByText("Row 6")).toBeInTheDocument()
    expect(screen.getByText("Row 10")).toBeInTheDocument()
    expect(screen.queryByText("Row 1")).not.toBeInTheDocument()
    expect(pager()).toEqual({ current: "2", last: "3" })
  })

  it("disables the next button on the last page", async () => {
    const many: Row[] = Array.from({ length: 6 }, (_, i) => ({
      name: `Row ${i + 1}`,
      age: 20 + i,
    }))
    render(<DataTable columns={columns} data={many} pagination={{ pageSize: 5 }} />)
    const next = screen.getByRole("button", { name: "Próxima página" })
    await userEvent.click(next)
    expect(isUnavailable(next)).toBe(true)
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

  it("searches every visible column when no searchableColumns are given", () => {
    // Controlled globalFilter without `searchableColumns`: no search input is
    // rendered, but the filter still applies to every visible column.
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
    expect(screen.getByRole("cell", { name: "Nenhum cadastro" })).toBeInTheDocument()
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
    expect(pager()).toEqual({ current: "1", last: "4" })
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
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
    expect(screen.getByText("Name")).toBeInTheDocument()
    expect(screen.getByText("Age")).toBeInTheDocument()
  })

  it("renders sort buttons only for columns listed in sortableColumns", () => {
    render(<DataTable columns={columns} data={data} sortableColumns={["name"]} />)
    expect(screen.getByRole("button", { name: "Name" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Age" })).not.toBeInTheDocument()
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
    // The button is named by what it shows; only the hint falls back to the id.
    expect(
      screen.getByRole("button", { name: "Custom", description: "Ordenar por name" }),
    ).toBeInTheDocument()
  })

  describe("table semantics", () => {
    it("names the column header after its text, with the sort action as a description", () => {
      render(<DataTable columns={columns} data={data} sortableColumns={["name"]} />)
      const button = screen.getByRole("button", { name: "Name" })
      expect(button).toHaveAccessibleDescription("Ordenar por Name")
      expect(button).not.toHaveAttribute("aria-label")
      expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
        "aria-sort",
        "none",
      )
    })

    it("uses labels.sortBy for the description", () => {
      render(
        <DataTable
          columns={columns}
          data={data}
          sortableColumns={["name"]}
          labels={{ sortBy: (h) => `Sort by ${h}` }}
        />,
      )
      expect(screen.getByRole("button", { name: "Name" })).toHaveAccessibleDescription(
        "Sort by Name",
      )
    })

    it("marks every header cell as a column header (scope=col)", () => {
      render(<DataTable columns={columns} data={data} />)
      for (const header of screen.getAllByRole("columnheader")) {
        expect(header).toHaveAttribute("scope", "col")
      }
    })

    it("takes the table's name from aria-label", () => {
      render(<DataTable columns={columns} data={data} aria-label="Contratos ativos" />)
      expect(screen.getByRole("table", { name: "Contratos ativos" })).toBeInTheDocument()
    })

    it("takes the table's name from aria-labelledby", () => {
      render(
        <>
          <h2 id="titulo-contratos">Contratos</h2>
          <DataTable columns={columns} data={data} aria-labelledby="titulo-contratos" />
        </>,
      )
      expect(screen.getByRole("table", { name: "Contratos" })).toBeInTheDocument()
    })

    it("forwards ref and the remaining props to the root", () => {
      const ref = React.createRef<HTMLDivElement>()
      const onKeyDown = vi.fn()
      render(
        <DataTable
          ref={ref}
          columns={columns}
          data={data}
          id="tabela-contratos"
          data-testid="contratos"
          title="Contratos"
          onKeyDown={onKeyDown}
        />,
      )
      const root = screen.getByTestId("contratos")
      expect(ref.current).toBe(root)
      expect(root).toHaveAttribute("data-slot", "data-table")
      expect(root).toHaveAttribute("id", "tabela-contratos")
      expect(root).toHaveAttribute("title", "Contratos")
      root.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }))
      expect(onKeyDown).toHaveBeenCalled()
    })

    it("renders a caption that names the table", () => {
      render(<DataTable columns={columns} data={data} caption="Contratos de maio" />)
      const table = screen.getByRole("table", { name: "Contratos de maio" })
      expect(table.querySelector("caption")).toHaveTextContent("Contratos de maio")
    })
  })

  describe("scroll region", () => {
    function mockSizes(
      sizes: Partial<
        Record<"scrollWidth" | "clientWidth" | "scrollHeight" | "clientHeight", number>
      >,
    ) {
      const originals = Object.keys(sizes).map((key) => [
        key,
        Object.getOwnPropertyDescriptor(HTMLElement.prototype, key),
      ])
      for (const [key, value] of Object.entries(sizes)) {
        Object.defineProperty(HTMLElement.prototype, key, { configurable: true, get: () => value })
      }
      return () => {
        for (const [key, descriptor] of originals) {
          if (descriptor)
            Object.defineProperty(
              HTMLElement.prototype,
              key as string,
              descriptor as PropertyDescriptor,
            )
          else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[key as string]
        }
      }
    }

    it("is a focusable, named region when it scrolls", () => {
      const restore = mockSizes({
        scrollWidth: 900,
        clientWidth: 300,
        scrollHeight: 100,
        clientHeight: 100,
      })
      try {
        render(<DataTable columns={columns} data={data} aria-label="Contratos" />)
        const region = screen.getByRole("region", { name: "Contratos" })
        expect(region).toHaveAttribute("tabindex", "0")
        expect(region).toHaveAttribute("data-slot", "data-table-scroll")
      } finally {
        restore()
      }
    })

    it("uses labels.scrollRegion when the table has no name", () => {
      const restore = mockSizes({
        scrollWidth: 900,
        clientWidth: 300,
        scrollHeight: 100,
        clientHeight: 100,
      })
      try {
        render(<DataTable columns={columns} data={data} />)
        expect(screen.getByRole("region", { name: "Tabela com rolagem" })).toHaveAttribute(
          "tabindex",
          "0",
        )
      } finally {
        restore()
      }
    })

    it("adds no tab stop when nothing scrolls", () => {
      const { container } = render(
        <DataTable columns={columns} data={data} aria-label="Contratos" />,
      )
      const scroller = container.querySelector('[data-slot="data-table-scroll"]')
      expect(scroller).not.toHaveAttribute("tabindex")
      expect(scroller).not.toHaveAttribute("role")
    })
  })

  describe("sticky header", () => {
    it("caps the body at maxHeight and keeps the header in place", () => {
      const { container } = render(
        <DataTable columns={columns} data={data} maxHeight={240} stickyHeader />,
      )
      const scroller = container.querySelector('[data-slot="data-table-scroll"]') as HTMLElement
      expect(scroller.style.maxHeight).toBe("240px")
      expect(container.querySelector("thead")).toHaveClass("sticky", "top-0")
    })

    it("sticks the header by default once maxHeight is set, and not without it", () => {
      const { container, rerender } = render(
        <DataTable columns={columns} data={data} maxHeight="50vh" />,
      )
      expect(
        (container.querySelector('[data-slot="data-table-scroll"]') as HTMLElement).style.maxHeight,
      ).toBe("50vh")
      expect(container.querySelector("thead")).toHaveClass("sticky")
      rerender(<DataTable columns={columns} data={data} />)
      expect(container.querySelector("thead")).not.toHaveClass("sticky")
    })
  })

  describe("row selection", () => {
    interface Cliente {
      id: string
      nome: string
    }
    const clienteCols: ColumnDef<Cliente>[] = [{ accessorKey: "nome", header: "Nome" }]
    const clientes: Cliente[] = ["Ana", "Bia", "Caio", "Davi", "Edu"].map((nome, i) => ({
      id: `c${i + 1}`,
      nome,
    }))

    it("adds a checkbox per row, named after the row, and a header checkbox", () => {
      render(<DataTable columns={clienteCols} data={clientes} selectable />)
      expect(
        screen.getByRole("checkbox", { name: "Selecionar todas as linhas da página" }),
      ).not.toBeChecked()
      for (const nome of ["Ana", "Bia", "Caio"]) {
        expect(screen.getByRole("checkbox", { name: `Selecionar ${nome}` })).not.toBeChecked()
      }
    })

    it("selects rows, marks them and shows the bar with the count and the actions", async () => {
      const onSelectionChange = vi.fn()
      render(
        <DataTable
          columns={clienteCols}
          data={clientes}
          getRowId={(row) => row.id}
          selectable
          onSelectionChange={onSelectionChange}
          selectionActions={(ids) => <button type="button">Arquivar {ids.join(",")}</button>}
        />,
      )
      expect(screen.queryByText(/selecionad/)).not.toBeInTheDocument()
      await userEvent.click(screen.getByRole("checkbox", { name: "Selecionar Bia" }))
      expect(onSelectionChange).toHaveBeenLastCalledWith(["c2"])
      expect(screen.getByText("Bia").closest("tr")).toHaveAttribute("data-state", "selected")
      expect(screen.getByText("1 selecionado")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Arquivar c2" })).toBeInTheDocument()
      await userEvent.click(screen.getByRole("checkbox", { name: "Selecionar Davi" }))
      expect(onSelectionChange).toHaveBeenLastCalledWith(["c2", "c4"])
      expect(screen.getByText("2 selecionados")).toBeInTheDocument()
      await userEvent.click(screen.getByRole("button", { name: "Limpar seleção" }))
      expect(onSelectionChange).toHaveBeenLastCalledWith([])
      expect(screen.queryByText(/selecionad/)).not.toBeInTheDocument()
    })

    it("shows the mixed state in the header and selects the whole page from it", async () => {
      const onSelectionChange = vi.fn()
      render(
        <DataTable
          columns={clienteCols}
          data={clientes}
          getRowId={(row) => row.id}
          selectable
          onSelectionChange={onSelectionChange}
          pagination={{ pageSize: 2 }}
        />,
      )
      const all = screen.getByRole("checkbox", { name: "Selecionar todas as linhas da página" })
      await userEvent.click(screen.getByRole("checkbox", { name: "Selecionar Ana" }))
      expect(all).toHaveAttribute("aria-checked", "mixed")
      await userEvent.click(all)
      expect(all).toBeChecked()
      expect(onSelectionChange).toHaveBeenLastCalledWith(["c1", "c2"])
      await userEvent.click(all)
      expect(all).not.toBeChecked()
      expect(onSelectionChange).toHaveBeenLastCalledWith([])
    })

    it("keeps the selection across pages, by id", async () => {
      const onSelectionChange = vi.fn()
      render(
        <DataTable
          columns={clienteCols}
          data={clientes}
          getRowId={(row) => row.id}
          selectable
          onSelectionChange={onSelectionChange}
          pagination={{ pageSize: 2 }}
        />,
      )
      await userEvent.click(screen.getByRole("checkbox", { name: "Selecionar Ana" }))
      await userEvent.click(screen.getByRole("button", { name: "Página 2" }))
      await userEvent.click(screen.getByRole("checkbox", { name: "Selecionar Caio" }))
      expect(onSelectionChange).toHaveBeenLastCalledWith(["c1", "c3"])
      expect(
        screen.getByRole("checkbox", { name: "Selecionar todas as linhas da página" }),
      ).toHaveAttribute("aria-checked", "mixed")
      await userEvent.click(screen.getByRole("button", { name: "Página 1" }))
      expect(screen.getByRole("checkbox", { name: "Selecionar Ana" })).toBeChecked()
      expect(screen.getByText("2 selecionados")).toBeInTheDocument()
    })

    it("works controlled (selectedRowIds) and from defaultSelectedRowIds", async () => {
      const onSelectionChange = vi.fn()
      const { rerender } = render(
        <DataTable
          columns={clienteCols}
          data={clientes}
          getRowId={(row) => row.id}
          selectable
          selectedRowIds={["c3"]}
          onSelectionChange={onSelectionChange}
        />,
      )
      expect(screen.getByRole("checkbox", { name: "Selecionar Caio" })).toBeChecked()
      await userEvent.click(screen.getByRole("checkbox", { name: "Selecionar Ana" }))
      expect(onSelectionChange).toHaveBeenLastCalledWith(["c3", "c1"])
      // Controlled: nothing changes until the parent passes the new list.
      expect(screen.getByRole("checkbox", { name: "Selecionar Ana" })).not.toBeChecked()
      rerender(
        <DataTable
          columns={clienteCols}
          data={clientes}
          getRowId={(row) => row.id}
          selectable
          defaultSelectedRowIds={["c5"]}
          key="uncontrolled"
        />,
      )
      expect(screen.getByRole("checkbox", { name: "Selecionar Edu" })).toBeChecked()
    })

    it("does not open a clickable row from its checkbox, and keeps the row button on the data", async () => {
      const onRowClick = vi.fn()
      render(<DataTable columns={clienteCols} data={clientes} selectable onRowClick={onRowClick} />)
      await userEvent.click(screen.getByRole("checkbox", { name: "Selecionar Ana" }))
      expect(onRowClick).not.toHaveBeenCalled()
      expect(screen.getByRole("button", { name: "Ana" })).toBeInTheDocument()
    })

    it("leaves the checkbox column out of the export", async () => {
      render(<DataTable columns={clienteCols} data={clientes} selectable downloadable />)
      await userEvent.click(screen.getByRole("button", { name: /Exportar para Excel/i }))
      await userEvent.click(screen.getByRole("menuitem", { name: /Exportar todos os dados/i }))
      const [, , , sheet] = exportCall()
      expect(sheet.headers).toEqual(["Nome"])
    })
  })

  describe("pinned columns", () => {
    interface Pedido {
      numero: string
      cliente: { nome: string }
      valor: number
    }
    const cols: ColumnDef<Pedido>[] = [
      { accessorKey: "valor", header: "Valor" },
      { accessorKey: "cliente.nome", header: "Cliente" },
      { accessorKey: "numero", header: "Número" },
    ]
    const pedidos = [{ numero: "P-1", cliente: { nome: "Ana" }, valor: 10 }]

    it("moves the pinned columns to the left, in the order given, and keeps them sticky", () => {
      render(
        <DataTable
          columns={cols}
          data={pedidos}
          pinnedColumns={{ left: ["numero", "cliente.nome"] }}
        />,
      )
      const headers = screen.getAllByRole("columnheader")
      expect(headers.map((th) => th.textContent)).toEqual(["Número", "Cliente", "Valor"])
      const cells = screen.getAllByRole("cell")
      expect(cells.map((td) => td.textContent)).toEqual(["P-1", "Ana", "10"])
      for (const element of [headers[0], headers[1], cells[0], cells[1]]) {
        expect(element).toHaveAttribute("data-pinned", "left")
        expect((element as HTMLElement).style.left).toMatch(/px$/)
      }
      expect(headers[2]).not.toHaveAttribute("data-pinned")
      expect(cells[2]).not.toHaveAttribute("data-pinned")
    })
  })

  describe("shared table styles", () => {
    it("draws rows, headers and cells with tableStyles(), so both stay alike", async () => {
      const { tableStyles } = await import("./table-styles")
      const t = tableStyles()
      render(<DataTable columns={columns} data={data} />)
      const cell = screen.getByRole("cell", { name: "Bravo" })
      for (const token of t.cell.split(" ")) expect(cell).toHaveClass(token)
      for (const token of t.row.split(" ")) expect(cell.closest("tr")).toHaveClass(token)
      for (const token of t.head.split(" ")) {
        expect(screen.getByRole("columnheader", { name: "Name" })).toHaveClass(token)
      }
    })
  })

  describe("column ids", () => {
    interface Venda {
      cliente: { nome: string; cpf: string }
      valor: number
    }
    const vendaCols: ColumnDef<Venda>[] = [
      { accessorKey: "cliente.nome", header: "Cliente" },
      { accessorKey: "cliente.cpf", header: "CPF", meta: { exportOnly: true } },
      { accessorKey: "valor", header: "Valor" },
    ]
    const vendas: Venda[] = [
      { cliente: { nome: "Zélia", cpf: "111" }, valor: 1 },
      { cliente: { nome: "Ana", cpf: "222" }, valor: 2 },
    ]

    it.each([["cliente.nome"], ["cliente_nome"]])(
      "accepts %s in searchableColumns and sortableColumns",
      async (key) => {
        render(
          <DataTable
            columns={vendaCols}
            data={vendas}
            searchableColumns={[key]}
            sortableColumns={[key]}
          />,
        )
        await userEvent.click(screen.getByRole("button", { name: "Cliente" }))
        expect(screen.getAllByRole("row")[1]).toHaveTextContent("Ana")
        await userEvent.type(screen.getByRole("textbox", { name: "Buscar na tabela" }), "zelia")
        expect(screen.getByText("Zélia")).toBeInTheDocument()
        expect(screen.queryByText("Ana")).not.toBeInTheDocument()
      },
    )

    it("hides an exportOnly column with a nested key, and still exports it", async () => {
      render(<DataTable columns={vendaCols} data={vendas} downloadable />)
      expect(screen.queryByRole("columnheader", { name: "CPF" })).not.toBeInTheDocument()
      expect(screen.queryByText("111")).not.toBeInTheDocument()
      await userEvent.click(screen.getByRole("button", { name: /Exportar para Excel/i }))
      await userEvent.click(screen.getByRole("menuitem", { name: /Exportar todos os dados/i }))
      const [, , , sheet] = exportCall()
      expect(sheet.headers).toEqual(["Cliente", "CPF", "Valor"])
      expect(sheet.rows[0]).toEqual(["Zélia", "111", 1])
    })
  })

  describe("density", () => {
    it("marks the table compact and tightens rows and the pager", () => {
      render(
        <DataTable
          columns={columns}
          data={data}
          density="compact"
          pagination={{ pageSize: 2 }}
          data-testid="tabela"
        />,
      )
      expect(screen.getByTestId("tabela")).toHaveAttribute("data-density", "compact")
      expect(screen.getByRole("cell", { name: "Bravo" })).toHaveClass("py-2")
      expect(screen.getByRole("button", { name: "Próxima página" })).toHaveClass("size-control-sm")
    })

    it("keeps the default rows otherwise", () => {
      render(<DataTable columns={columns} data={data} data-testid="tabela" />)
      expect(screen.getByTestId("tabela")).toHaveAttribute("data-density", "default")
      expect(screen.getByRole("cell", { name: "Bravo" })).toHaveClass("py-2.5")
    })
  })

  describe("alignment", () => {
    function alignOf(element: HTMLElement) {
      return ["text-left", "text-center", "text-right"].find((c) => element.classList.contains(c))
    }

    it("applies meta.align to the header, the cells and the footer", () => {
      const cols: ColumnDef<Row>[] = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "age", header: "Age", footer: "75", meta: { align: "right" } },
      ]
      render(<DataTable columns={cols} data={data} sortableColumns={["age"]} />)
      expect(alignOf(screen.getByRole("columnheader", { name: "Age" }))).toBe("text-right")
      expect(alignOf(screen.getByRole("cell", { name: "30" }))).toBe("text-right")
      expect(alignOf(screen.getByRole("cell", { name: "75" }))).toBe("text-right")
      expect(alignOf(screen.getByRole("columnheader", { name: "Name" }))).toBe("text-left")
    })

    it("aligns a formattedColumn of numbers (money) to the right, and one of text to the left", () => {
      const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
      const cols: ColumnDef<Row>[] = [
        formattedColumn<Row, string>({ accessorKey: "name", header: "Name", format: (v) => v }),
        formattedColumn<Row, number>({ accessorKey: "age", header: "Valor", format: brl.format }),
      ]
      render(<DataTable columns={cols} data={data} />)
      expect(alignOf(screen.getByRole("columnheader", { name: "Valor" }))).toBe("text-right")
      expect(alignOf(screen.getByRole("cell", { name: brl.format(30) }))).toBe("text-right")
      expect(alignOf(screen.getByRole("columnheader", { name: "Name" }))).toBe("text-left")
    })

    it("lets formattedColumn's align option win", () => {
      const cols: ColumnDef<Row>[] = [
        formattedColumn<Row, number>({ accessorKey: "age", header: "Age", align: "center" }),
      ]
      render(<DataTable columns={cols} data={data} />)
      expect(alignOf(screen.getByRole("columnheader", { name: "Age" }))).toBe("text-center")
    })
  })

  describe("footer", () => {
    it("renders columnDef.footer in a tfoot, e.g. totals", () => {
      const cols: ColumnDef<Row>[] = [
        { accessorKey: "name", header: "Name", footer: "Total" },
        {
          accessorKey: "age",
          header: "Age",
          footer: ({ table }) =>
            table
              .getFilteredRowModel()
              .rows.reduce((sum, row) => sum + (row.getValue("age") as number), 0),
        },
      ]
      const { container } = render(<DataTable columns={cols} data={data} />)
      const tfoot = container.querySelector("tfoot")
      expect(tfoot).not.toBeNull()
      const cells = within(tfoot as HTMLElement).getAllByRole("cell")
      expect(cells.map((cell) => cell.textContent)).toEqual(["Total", "75"])
    })

    it("renders no tfoot when no column has a footer", () => {
      const { container } = render(<DataTable columns={columns} data={data} />)
      expect(container.querySelector("tfoot")).toBeNull()
    })
  })

  describe("grouped headers", () => {
    interface Venda {
      nome: string
      cidade: string
      valor: number
    }
    const grouped: ColumnDef<Venda>[] = [
      {
        id: "cliente",
        header: "Cliente",
        columns: [
          { accessorKey: "nome", header: "Nome" },
          { accessorKey: "cidade", header: "Cidade" },
        ],
      },
      { accessorKey: "valor", header: "Valor" },
    ]
    const vendas = [{ nome: "Ana", cidade: "Santos", valor: 10 }]

    it("spans a group header over its columns", () => {
      render(<DataTable columns={grouped} data={vendas} sortableColumns={["valor"]} />)
      const [groupRow, leafRow] = screen.getAllByRole("row")
      const groupCells = within(groupRow as HTMLElement).getAllByRole("columnheader")
      expect(groupCells).toHaveLength(2)
      expect(groupCells[0]).toHaveTextContent("Cliente")
      expect(groupCells[0]).toHaveAttribute("colspan", "2")
      expect(groupCells[0]).toHaveAttribute("scope", "colgroup")
      // The empty cell above "Valor" is not the sortable header.
      expect(groupCells[1]).not.toHaveAttribute("aria-sort")
      expect(within(leafRow as HTMLElement).getAllByRole("columnheader")).toHaveLength(3)
      expect(screen.getByRole("columnheader", { name: "Valor" })).toHaveAttribute(
        "aria-sort",
        "none",
      )
    })

    it("draws one skeleton cell per leaf column", () => {
      const { container } = render(<DataTable columns={grouped} data={[]} loading />)
      const row = container.querySelector('[data-slot="data-table-skeleton-row"]')
      expect(row?.querySelectorAll("td")).toHaveLength(3)
    })
  })

  describe("pagination", () => {
    const many: Row[] = Array.from({ length: 12 }, (_, i) => ({
      name: `Row ${String(i + 1).padStart(2, "0")}`,
      age: 20 + i,
    }))

    it("uses the library's Pagination, with page numbers and the range", () => {
      render(<DataTable columns={columns} data={many} pagination={{ pageSize: 5 }} />)
      const nav = screen.getByRole("navigation", { name: "Paginação" })
      expect(within(nav).getByText("1–5 de 12")).toBeInTheDocument()
      expect(pager()).toEqual({ current: "1", last: "3" })
    })

    it("goes straight to a page", async () => {
      render(<DataTable columns={columns} data={many} pagination={{ pageSize: 5 }} />)
      await userEvent.click(screen.getByRole("button", { name: "Página 3" }))
      expect(screen.getByText("Row 11")).toBeInTheDocument()
      expect(screen.queryByText("Row 01")).not.toBeInTheDocument()
    })

    it("does not freeze when only onPaginationChange is given", async () => {
      const onPaginationChange = vi.fn()
      render(
        <DataTable
          columns={columns}
          data={many}
          pagination={{ pageSize: 5 }}
          onPaginationChange={onPaginationChange}
        />,
      )
      await userEvent.click(screen.getByRole("button", { name: "Próxima página" }))
      expect(screen.getByText("Row 06")).toBeInTheDocument()
      expect(onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 1, pageSize: 5 })
    })

    it("keeps the page when a new data array arrives with the same filter and sort", async () => {
      const { rerender } = render(
        <DataTable columns={columns} data={many} pagination={{ pageSize: 5 }} />,
      )
      await userEvent.click(screen.getByRole("button", { name: "Página 2" }))
      rerender(<DataTable columns={columns} data={[...many]} pagination={{ pageSize: 5 }} />)
      expect(pager().current).toBe("2")
      expect(screen.getByText("Row 06")).toBeInTheDocument()
    })

    it("goes back to page 1 when the search or the sort changes", async () => {
      render(
        <DataTable
          columns={columns}
          data={many}
          pagination={{ pageSize: 5 }}
          searchableColumns={["name"]}
          sortableColumns={["name"]}
        />,
      )
      await userEvent.click(screen.getByRole("button", { name: "Página 2" }))
      await userEvent.click(screen.getByRole("button", { name: "Name" }))
      expect(pager().current).toBe("1")
      await userEvent.click(screen.getByRole("button", { name: "Página 2" }))
      await userEvent.type(screen.getByRole("textbox", { name: "Buscar na tabela" }), "Row")
      expect(pager().current).toBe("1")
    })

    it("with autoResetPage={false}, keeps the page when the sort changes", async () => {
      render(
        <DataTable
          columns={columns}
          data={many}
          pagination={{ pageSize: 5 }}
          sortableColumns={["name"]}
          autoResetPage={false}
        />,
      )
      await userEvent.click(screen.getByRole("button", { name: "Página 2" }))
      await userEvent.click(screen.getByRole("button", { name: "Name" }))
      expect(pager().current).toBe("2")
    })

    it("moves to the last page when the data shrinks under the current one", async () => {
      const { rerender } = render(
        <DataTable columns={columns} data={many} pagination={{ pageSize: 5 }} />,
      )
      await userEvent.click(screen.getByRole("button", { name: "Página 3" }))
      rerender(<DataTable columns={columns} data={many.slice(0, 7)} pagination={{ pageSize: 5 }} />)
      expect(pager()).toEqual({ current: "2", last: "2" })
      expect(screen.getByText("Row 07")).toBeInTheDocument()
    })

    it("names the pager controls from DataTableLabels and labels.pagination", () => {
      render(
        <DataTable
          columns={columns}
          data={many}
          pagination={{ pageSize: 5, pageSizeOptions: [5, 10] }}
          labels={{
            paginationPrevious: "Anterior",
            paginationNext: "Seguinte",
            pageSize: "Por página",
            pagination: { range: (from, to, total) => `${from} a ${to} de ${total}` },
          }}
        />,
      )
      expect(screen.getByRole("button", { name: "Anterior" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Seguinte" })).toBeInTheDocument()
      expect(screen.getByRole("combobox", { name: "Por página" })).toBeInTheDocument()
      expect(screen.getByText("1 a 5 de 12")).toBeInTheDocument()
    })

    it("keeps the focus on next when the page changes", async () => {
      render(<DataTable columns={columns} data={many} pagination={{ pageSize: 5 }} />)
      const next = screen.getByRole("button", { name: "Próxima página" })
      next.focus()
      await userEvent.keyboard("{Enter}")
      await userEvent.keyboard("{Enter}")
      expect(pager().current).toBe("3")
      expect(next).toHaveFocus()
    })
  })

  describe("states", () => {
    it("announces loading through a status that is not hidden from assistive tech", () => {
      const { rerender } = render(<DataTable columns={columns} data={data} />)
      const status = screen.getByRole("status")
      expect(status).toHaveTextContent("")
      rerender(<DataTable columns={columns} data={data} loading />)
      // Same live region, now with text: a change screen readers announce.
      expect(screen.getByRole("status")).toBe(status)
      expect(status).toHaveTextContent("Carregando dados…")
      expect(status.closest("[aria-hidden='true']")).toBeNull()
    })

    it("announces an empty search through the same status, not a region born with text", async () => {
      render(<DataTable columns={columns} data={data} searchableColumns={["name"]} />)
      const status = screen.getByRole("status")
      await userEvent.type(screen.getByRole("textbox", { name: "Buscar na tabela" }), "zzz")
      expect(screen.getAllByRole("status")).toEqual([status])
      expect(status).toHaveTextContent("Nenhum resultado.")
      expect(screen.getByRole("cell", { name: "Nenhum resultado." })).toBeInTheDocument()
    })

    it("draws as many skeleton rows as the current page size", async () => {
      const many: Row[] = Array.from({ length: 30 }, (_, i) => ({ name: `R${i}`, age: i }))
      const props = {
        columns,
        data: many,
        pagination: { pageSize: 5, pageSizeOptions: [5, 10] },
      }
      const { container, rerender } = render(<DataTable {...props} />)
      await userEvent.selectOptions(
        screen.getByRole("combobox", { name: "Linhas por página" }),
        "10",
      )
      rerender(<DataTable {...props} loading />)
      expect(container.querySelectorAll('[data-slot="data-table-skeleton-row"]')).toHaveLength(10)
    })

    it("shows an error instead of 'no results', with a retry button", async () => {
      const onRetry = vi.fn()
      render(
        <DataTable
          columns={columns}
          data={[]}
          error="Falha ao carregar contratos."
          onRetry={onRetry}
        />,
      )
      expect(screen.getByRole("alert")).toHaveTextContent("Falha ao carregar contratos.")
      expect(screen.queryByText("Nenhum resultado.")).not.toBeInTheDocument()
      await userEvent.click(screen.getByRole("button", { name: "Tentar de novo" }))
      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it("uses the default error text for error={true} and labels for the button", () => {
      render(
        <DataTable
          columns={columns}
          data={data}
          error
          onRetry={() => {}}
          labels={{ retry: "Recarregar" }}
        />,
      )
      expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível carregar os dados.")
      expect(screen.getByRole("button", { name: "Recarregar" })).toBeInTheDocument()
      expect(screen.queryByText("Bravo")).not.toBeInTheDocument()
    })

    it("shows the skeleton, not the error, while retrying", () => {
      render(<DataTable columns={columns} data={[]} error="Falhou" loading />)
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
      expect(screen.getByRole("status")).toHaveTextContent("Carregando dados…")
    })
  })

  describe("server mode", () => {
    const page: Row[] = Array.from({ length: 10 }, (_, i) => ({ name: `Row ${i + 1}`, age: i }))

    it("shows the server total and derives the page count from rowCount", () => {
      render(
        <DataTable
          columns={columns}
          data={page}
          manualPagination
          rowCount={243}
          pagination={{ pageSize: 10 }}
          showRowCount
        />,
      )
      expect(screen.getByText("243 registros")).toBeInTheDocument()
      expect(pager()).toEqual({ current: "1", last: "25" })
    })

    it("lets pageCount win over rowCount", () => {
      render(
        <DataTable
          columns={columns}
          data={page}
          manualPagination
          rowCount={243}
          pageCount={30}
          pagination={{ pageSize: 10 }}
        />,
      )
      expect(pager()).toEqual({ current: "1", last: "30" })
    })

    it("never shows a negative page count and keeps next available when the total is unknown", () => {
      render(
        <DataTable
          columns={columns}
          data={page}
          manualPagination
          pagination={{ pageSize: 10 }}
          showRowCount
        />,
      )
      expect(screen.queryByText(/-1/)).not.toBeInTheDocument()
      // The page's own 10 rows are not the total: no count is shown.
      expect(screen.queryByText("10 registros")).not.toBeInTheDocument()
      expect(isUnavailable(screen.getByRole("button", { name: "Próxima página" }))).toBe(false)
    })

    it("hides export scopes the table cannot fill from the server page", async () => {
      render(
        <DataTable
          columns={columns}
          data={page}
          manualPagination
          rowCount={243}
          pagination={{ pageSize: 10 }}
          downloadable
        />,
      )
      await userEvent.click(screen.getByRole("button", { name: /Exportar para Excel/i }))
      expect(screen.getByRole("menuitem", { name: "Exportar página atual" })).toBeInTheDocument()
      expect(screen.queryByRole("menuitem", { name: "Exportar todos os dados" })).toBeNull()
      expect(screen.queryByRole("menuitem", { name: "Exportar dados filtrados" })).toBeNull()
    })

    it("offers the scopes that have a fetcher", async () => {
      const fetchAll = vi.fn(async () => page)
      const fetchFiltered = vi.fn(async () => page.slice(0, 2))
      render(
        <DataTable
          columns={columns}
          data={page}
          manualPagination
          rowCount={243}
          pagination={{ pageSize: 10 }}
          downloadable={{ fetchAll, fetchFiltered }}
        />,
      )
      await userEvent.click(screen.getByRole("button", { name: /Exportar para Excel/i }))
      expect(screen.getByRole("menuitem", { name: "Exportar todos os dados" })).toBeInTheDocument()
      expect(screen.getByRole("menuitem", { name: "Exportar dados filtrados" })).toBeInTheDocument()
    })

    it("with server filtering only, keeps 'filtered' (the data) and hides 'all'", async () => {
      render(<DataTable columns={columns} data={page} manualFiltering downloadable />)
      await userEvent.click(screen.getByRole("button", { name: /Exportar para Excel/i }))
      expect(screen.getByRole("menuitem", { name: "Exportar dados filtrados" })).toBeInTheDocument()
      expect(screen.queryByRole("menuitem", { name: "Exportar todos os dados" })).toBeNull()
    })
  })

  describe("row identity", () => {
    interface Cliente {
      id: string
      nome: string
    }
    const cols: ColumnDef<Cliente>[] = [
      { accessorKey: "nome", header: "Nome" },
      {
        id: "nota",
        header: "Nota",
        cell: ({ row }) => <input aria-label={`Nota de ${row.original.nome}`} />,
      },
    ]
    const page1 = [1, 2, 3].map((n) => ({ id: `c${n}`, nome: `Cliente ${n}` }))
    const page2 = [4, 5, 6].map((n) => ({ id: `c${n}`, nome: `Cliente ${n}` }))

    it("keys rows by getRowId, so what was typed in a row stays with that row", async () => {
      const { rerender } = render(
        <DataTable columns={cols} data={page1} getRowId={(row) => row.id} />,
      )
      await userEvent.type(screen.getByRole("textbox", { name: "Nota de Cliente 1" }), "ligar")
      rerender(<DataTable columns={cols} data={page2} getRowId={(row) => row.id} />)
      expect(screen.getByRole("textbox", { name: "Nota de Cliente 4" })).toHaveValue("")
      rerender(
        <DataTable
          columns={cols}
          data={[page1[0] as Cliente, ...page2]}
          getRowId={(row) => row.id}
        />,
      )
      expect(screen.getByRole("textbox", { name: "Nota de Cliente 4" })).toHaveValue("")
    })

    it("gives getRowId the row and its index", () => {
      const getRowId = vi.fn((row: Cliente, index: number) => `${row.id}-${index}`)
      render(<DataTable columns={cols} data={page1} getRowId={getRowId} />)
      expect(getRowId).toHaveBeenCalledWith(page1[1], 1)
    })
  })

  describe("sorting", () => {
    interface Pessoa {
      nome: string
      idade?: number | null
      nascimento?: Date
      bloco?: string
    }

    function bodyColumn(index = 0) {
      return screen
        .getAllByRole("row")
        .slice(1)
        .map((row) => row.querySelectorAll("td")[index]?.textContent ?? "")
    }

    async function sortBy(name: string) {
      await userEvent.click(screen.getByRole("button", { name: new RegExp(name) }))
    }

    it.each([
      [
        [
          "ana",
          "Bruno",
          "carlos",
          "Diego",
          "Fábio",
          "Gabriel",
          "Zuleica",
          "Álvaro",
          "Ângela",
          "Érica",
          "Íris",
          "Úrsula",
        ],
        [
          "Álvaro",
          "ana",
          "Ângela",
          "Bruno",
          "carlos",
          "Diego",
          "Érica",
          "Fábio",
          "Gabriel",
          "Íris",
          "Úrsula",
          "Zuleica",
        ],
      ],
      [
        ["Carlos", "Zuleica", "ana", "bruno", "Álvaro"],
        ["Álvaro", "ana", "bruno", "Carlos", "Zuleica"],
      ],
    ])(
      "sorts names in Portuguese order, ignoring accents and case (%#)",
      async (input, expected) => {
        render(
          <DataTable
            columns={[{ accessorKey: "nome", header: "Nome" }] as ColumnDef<Pessoa>[]}
            data={input.map((nome) => ({ nome }))}
            sortableColumns={["nome"]}
          />,
        )
        await sortBy("Nome")
        expect(bodyColumn()).toEqual(expected)
        await sortBy("Nome")
        expect(bodyColumn()).toEqual([...expected].reverse())
      },
    )

    it("puts numbers inside text in numeric order", async () => {
      render(
        <DataTable
          columns={[{ accessorKey: "bloco", header: "Bloco" }] as ColumnDef<Pessoa>[]}
          data={["Bloco 10", "Bloco 2", "Bloco 1"].map((bloco) => ({ nome: bloco, bloco }))}
          sortableColumns={["bloco"]}
        />,
      )
      await sortBy("Bloco")
      expect(bodyColumn()).toEqual(["Bloco 1", "Bloco 2", "Bloco 10"])
    })

    it("sorts numbers numerically and dates by time", async () => {
      const cols: ColumnDef<Pessoa>[] = [
        { accessorKey: "nome", header: "Nome" },
        { accessorKey: "idade", header: "Idade" },
        {
          accessorKey: "nascimento",
          header: "Nascimento",
          cell: ({ row }) => row.original.nascimento?.toISOString().slice(0, 10),
        },
      ]
      const rows: Pessoa[] = [
        { nome: "B", idade: 9, nascimento: new Date(2001, 0, 1) },
        { nome: "A", idade: 100, nascimento: new Date(1999, 11, 31) },
        { nome: "C", idade: 10, nascimento: new Date(2000, 5, 15) },
      ]
      render(<DataTable columns={cols} data={rows} sortableColumns={["idade", "nascimento"]} />)
      await sortBy("Idade")
      await sortBy("Idade")
      expect(bodyColumn(1)).toEqual(["9", "10", "100"])
      await sortBy("Nascimento")
      await sortBy("Nascimento")
      expect(bodyColumn(0)).toEqual(["A", "C", "B"])
    })

    it("keeps a column's own sortingFn", async () => {
      const cols: ColumnDef<Pessoa>[] = [
        {
          accessorKey: "nome",
          header: "Nome",
          // Length first: the column decides, not the default.
          sortingFn: (a, b) => a.original.nome.length - b.original.nome.length,
        },
      ]
      render(
        <DataTable
          columns={cols}
          data={[{ nome: "Bia" }, { nome: "Al" }, { nome: "Carla" }]}
          sortableColumns={["nome"]}
        />,
      )
      await sortBy("Nome")
      expect(bodyColumn()).toEqual(["Al", "Bia", "Carla"])
    })
  })

  describe("search", () => {
    interface Cliente {
      nome: string
      cpf: string
      valor: number
      criadoEm: string
    }
    const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    const formatCpf = (cpf: string) => cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    const clienteColumns: ColumnDef<Cliente>[] = [
      { accessorKey: "nome", header: "Nome" },
      formattedColumn<Cliente, string>({ accessorKey: "cpf", header: "CPF", format: formatCpf }),
      formattedColumn<Cliente, number>({
        accessorKey: "valor",
        header: "Valor",
        format: (v) => brl.format(v),
      }),
      dateColumn<Cliente>({ accessorKey: "criadoEm", header: "Criado em" }),
    ]
    const clientes: Cliente[] = [
      { nome: "João Álvares", cpf: "12345678901", valor: 1234.5, criadoEm: "2026-05-19T14:30:00" },
      { nome: "Maria Souza", cpf: "98765432100", valor: 99, criadoEm: "2026-02-01T09:00:00" },
    ]
    const searchable = ["nome", "cpf", "valor", "criadoEm"]

    async function search(term: string) {
      const input = screen.getByRole("textbox", { name: "Buscar na tabela" })
      await userEvent.clear(input)
      await userEvent.type(input, term)
    }

    it.each([
      ["joao", "accent and case"],
      ["ALVARES", "accent and case"],
      ["123.456", "formatted CPF"],
      ["1.234,50", "formatted money"],
      ["19/05/2026", "formatted date"],
    ])("finds the row by %s (%s)", async (term) => {
      render(<DataTable columns={clienteColumns} data={clientes} searchableColumns={searchable} />)
      await search(term)
      expect(screen.getByText("João Álvares")).toBeInTheDocument()
      expect(screen.queryByText("Maria Souza")).not.toBeInTheDocument()
    })

    it("does not match text the user does not see (the T of an ISO date)", async () => {
      render(<DataTable columns={clienteColumns} data={clientes} searchableColumns={searchable} />)
      await search("t")
      expect(screen.getByRole("cell", { name: "Nenhum resultado." })).toBeInTheDocument()
    })

    it("uses a column's meta.searchText when it gives one", async () => {
      const cols: ColumnDef<Cliente>[] = [
        {
          accessorKey: "nome",
          header: "Nome",
          meta: { searchText: (row: Cliente) => `${row.nome} cliente-vip` },
        },
      ]
      render(<DataTable columns={cols} data={clientes} searchableColumns={["nome"]} />)
      await search("vip")
      expect(screen.getByText("João Álvares")).toBeInTheDocument()
      expect(screen.getByText("Maria Souza")).toBeInTheDocument()
    })

    it("searches every visible column when searchableColumns is omitted", () => {
      render(<DataTable columns={clienteColumns} data={clientes} globalFilter="alvares" />)
      expect(screen.getByText("João Álvares")).toBeInTheDocument()
      expect(screen.queryByText("Maria Souza")).not.toBeInTheDocument()
    })
  })

  describe("downloadable", () => {
    beforeEach(() => {
      downloadSheetMock.mockClear()
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
      expect(
        screen.getByRole("menuitem", { name: /Exportar dados filtrados/i }),
      ).toBeInTheDocument()
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
      expect(downloadSheetMock).toHaveBeenCalledTimes(1)
      const [records] = exportCall()
      expect(records).toHaveLength(1)
      expect(records[0]).toMatchObject({ Name: "Alpha" })
    })

    it("exports the current page when pagination is active", async () => {
      render(<DataTable columns={columns} data={data} downloadable pagination={{ pageSize: 2 }} />)
      await userEvent.click(screen.getByRole("button", { name: /Exportar para Excel/i }))
      await userEvent.click(screen.getByRole("menuitem", { name: /Exportar página atual/i }))
      const [records] = exportCall()
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
      const [records] = exportCall()
      expect(records).toHaveLength(data.length)
    })

    it("exports nested accessorKey and accessorFn values, as the cells show them", async () => {
      interface Venda {
        cliente: { nome: string; cidade: string }
        valor: number
      }
      const cols: ColumnDef<Venda>[] = [
        { accessorKey: "cliente.nome", header: "Cliente" },
        { id: "cidade", accessorFn: (row) => row.cliente.cidade.toUpperCase(), header: "Cidade" },
        { accessorKey: "valor", header: "Valor" },
      ]
      render(
        <DataTable
          columns={cols}
          data={[{ cliente: { nome: "João", cidade: "Santos" }, valor: 10 }]}
          downloadable
        />,
      )
      expect(screen.getByText("João")).toBeInTheDocument()
      await userEvent.click(screen.getByRole("button", { name: /Exportar para Excel/i }))
      await userEvent.click(screen.getByRole("menuitem", { name: /Exportar todos os dados/i }))
      const [records] = exportCall()
      expect({ ...records[0] }).toEqual({ Cliente: "João", Cidade: "SANTOS", Valor: 10 })
    })

    async function exportScope(name: RegExp | string) {
      await userEvent.click(screen.getByRole("button", { name: /Exportar para Excel/i }))
      await userEvent.click(screen.getByRole("menuitem", { name }))
    }

    it("skips columns without data (actions) and keeps repeated header names apart", async () => {
      interface Item {
        nome: string
        bruto: number
        liquido: number
      }
      const cols: ColumnDef<Item>[] = [
        { accessorKey: "nome", header: "Nome" },
        { accessorKey: "bruto", header: "Valor" },
        { accessorKey: "liquido", header: "Valor" },
        { id: "acoes", header: "Ações", cell: () => <button type="button">Editar</button> },
      ]
      render(
        <DataTable columns={cols} data={[{ nome: "A", bruto: 10, liquido: 8 }]} downloadable />,
      )
      await exportScope(/Exportar todos os dados/i)
      const [, , , sheet] = exportCall()
      expect(sheet.headers).toEqual(["Nome", "Valor", "Valor"])
      expect(sheet.rows).toEqual([["A", 10, 8]])
    })

    it("keeps the current sort in the filtered export", async () => {
      render(
        <DataTable
          columns={columns}
          data={data}
          sortableColumns={["name"]}
          pagination={{ pageSize: 1 }}
          downloadable
        />,
      )
      await userEvent.click(screen.getByRole("button", { name: "Name" }))
      await exportScope(/Exportar dados filtrados/i)
      const [, , , sheet] = exportCall()
      expect(sheet.rows.map((row) => row[0])).toEqual(["Alpha", "Bravo", "Charlie"])
    })

    it("lets a column leave the file (meta.export: false) or give its own value", async () => {
      const cols: ColumnDef<Row>[] = [
        { accessorKey: "name", header: "Name", meta: { export: false } },
        {
          accessorKey: "age",
          header: "Age",
          meta: { export: (row: Row, value: unknown) => `${row.name}: ${value}` },
        },
      ]
      render(<DataTable columns={cols} data={[data[0] as Row]} downloadable />)
      await exportScope(/Exportar todos os dados/i)
      const [, , , sheet] = exportCall()
      expect(sheet).toEqual({ headers: ["Age"], rows: [["Bravo: 30"]] })
    })

    it("exports a dateColumn as a date, not as the ISO text", async () => {
      interface Pedido {
        vencimento: string
        criadoEm: string
      }
      render(
        <DataTable
          columns={[
            dateColumn<Pedido>({ accessorKey: "vencimento", header: "Vencimento" }),
            dateColumn<Pedido>({ accessorKey: "criadoEm", header: "Criado em" }),
          ]}
          data={[{ vencimento: "2026-05-19", criadoEm: "2026-05-19T14:30:00" }]}
          downloadable
        />,
      )
      await exportScope(/Exportar todos os dados/i)
      const [, , , sheet] = exportCall()
      const [vencimento, criadoEm] = sheet.rows[0] as Date[]
      expect(vencimento).toBeInstanceOf(Date)
      expect([vencimento?.getFullYear(), vencimento?.getMonth(), vencimento?.getDate()]).toEqual([
        2026, 4, 19,
      ])
      expect(vencimento?.getHours()).toBe(0)
      expect([criadoEm?.getDate(), criadoEm?.getHours(), criadoEm?.getMinutes()]).toEqual([
        19, 14, 30,
      ])
    })

    it("reports a failed export to onExportError and on screen, never silently", async () => {
      const failure = new Error("servidor fora")
      const onExportError = vi.fn()
      render(
        <DataTable
          columns={columns}
          data={data}
          manualPagination
          rowCount={30}
          downloadable={{ fetchAll: () => Promise.reject(failure), onExportError }}
        />,
      )
      await exportScope(/Exportar todos os dados/i)
      expect(onExportError).toHaveBeenCalledWith(failure)
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Não foi possível exportar os dados. Tente de novo.",
      )
      expect(downloadSheetMock).not.toHaveBeenCalled()
      // The trigger works again and a new attempt clears the message.
      const trigger = screen.getByRole("button", { name: /Exportar para Excel/i })
      expect(trigger).toBeEnabled()
    })

    it("reports a file that fails to be written", async () => {
      downloadSheetMock.mockRejectedValueOnce(new Error("disco cheio"))
      const onExportError = vi.fn()
      render(
        <DataTable
          columns={columns}
          data={data}
          downloadable={{ onExportError }}
          labels={{ exportError: "Falhou." }}
        />,
      )
      await exportScope(/Exportar todos os dados/i)
      expect(onExportError).toHaveBeenCalledWith(new Error("disco cheio"))
      expect(await screen.findByRole("alert")).toHaveTextContent("Falhou.")
      await exportScope(/Exportar todos os dados/i)
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
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
      const [records, filename, sheetName] = exportCall()
      expect(filename).toBe("contratos.xlsx")
      expect(sheetName).toBe("Contratos")
      expect(records[0]).toEqual({ NOME_CUSTOM: "BRAVO" })
    })

    it.each([
      ["Exportar dados filtrados", "filtered"],
      ["Exportar página atual", "page"],
      ["Exportar todos os dados", "all"],
    ])("resolves filename from a function passing the scope of '%s'", async (menuItem, scope) => {
      const filename = vi.fn((exportScope: string) => `contratos-${exportScope}.xlsx`)
      render(<DataTable columns={columns} data={data} downloadable={{ filename }} />)
      await userEvent.click(screen.getByRole("button", { name: /Exportar para Excel/i }))
      await userEvent.click(screen.getByRole("menuitem", { name: menuItem }))
      expect(filename).toHaveBeenCalledWith(scope)
      const [, resolved] = exportCall()
      expect(resolved).toBe(`contratos-${scope}.xlsx`)
    })

    it("falls back to export.xlsx when the filename function returns an empty string", async () => {
      render(<DataTable columns={columns} data={data} downloadable={{ filename: () => "" }} />)
      await userEvent.click(screen.getByRole("button", { name: /Exportar para Excel/i }))
      await userEvent.click(screen.getByRole("menuitem", { name: /Exportar todos os dados/i }))
      const [, resolved] = exportCall()
      expect(resolved).toBe("export.xlsx")
    })

    it("treats an empty string filename as the default export.xlsx", async () => {
      render(<DataTable columns={columns} data={data} downloadable={{ filename: "" }} />)
      await userEvent.click(screen.getByRole("button", { name: /Exportar para Excel/i }))
      await userEvent.click(screen.getByRole("menuitem", { name: /Exportar todos os dados/i }))
      const [, resolved] = exportCall()
      expect(resolved).toBe("export.xlsx")
    })

    it("names the export menu after its trigger", async () => {
      render(<DataTable columns={columns} data={data} downloadable />)
      await userEvent.click(screen.getByRole("button", { name: /Exportar para Excel/i }))
      expect(screen.getByRole("menu", { name: "Exportar para Excel" })).toBeInTheDocument()
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("works as a menu from the keyboard: arrows move, Enter exports, Escape closes", async () => {
      render(<DataTable columns={columns} data={data} downloadable />)
      const trigger = screen.getByRole("button", { name: /Exportar para Excel/i })
      trigger.focus()
      await userEvent.keyboard("{Enter}")
      const items = screen.getAllByRole("menuitem")
      expect(items[0]).toHaveFocus()
      await userEvent.keyboard("{ArrowDown}")
      expect(items[1]).toHaveFocus()
      await userEvent.keyboard("{Escape}")
      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
      expect(trigger).toHaveFocus()

      await userEvent.keyboard("{Enter}")
      await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}")
      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
      const [records] = exportCall()
      expect(records).toHaveLength(3)
    })

    it("replaces the export button with a skeleton when loading", () => {
      const { container } = render(<DataTable columns={columns} data={data} downloadable loading />)
      expect(screen.queryByText("Exportar para Excel")).not.toBeInTheDocument()
      expect(container.querySelector('[data-slot="data-table-download-skeleton"]')).toBeTruthy()
    })
  })

  describe("interactive rows (onRowClick)", () => {
    it("fires onRowClick with the row data and click event when a row is clicked", async () => {
      const onRowClick = vi.fn()
      render(<DataTable columns={columns} data={data} onRowClick={onRowClick} />)
      const bravoCell = screen.getByText("Bravo")
      const bravoRow = bravoCell.closest("tr")
      expect(bravoRow).toBeTruthy()
      await userEvent.click(bravoRow as HTMLTableRowElement)
      expect(onRowClick).toHaveBeenCalledTimes(1)
      const [rowArg, eventArg] = onRowClick.mock.calls[0] as [Row, React.MouseEvent]
      expect(rowArg).toEqual({ name: "Bravo", age: 30 })
      expect(eventArg).toBeDefined()
      expect(eventArg.type).toBe("click")
    })

    it("keeps every row a table row with its cells", () => {
      render(<DataTable columns={columns} data={data} onRowClick={vi.fn()} />)
      // header row + 3 body rows, each with its two cells
      expect(screen.getAllByRole("row")).toHaveLength(4)
      expect(screen.getAllByRole("cell")).toHaveLength(6)
      const row = screen.getByText("Bravo").closest("tr") as HTMLTableRowElement
      expect(row.getAttribute("role")).toBeNull()
      expect(row.getAttribute("tabindex")).toBeNull()
    })

    it("reaches the row action through a button in the first cell, named by its content", async () => {
      const onRowClick = vi.fn()
      render(<DataTable columns={columns} data={data} onRowClick={onRowClick} />)
      const action = screen.getByRole("button", { name: "Alpha" })
      expect(action.closest("td")).toBe(screen.getAllByRole("cell")[2])

      await userEvent.tab()
      await userEvent.tab()
      expect(action).toHaveFocus()
      await userEvent.keyboard("{Enter}")
      expect(onRowClick).toHaveBeenCalledTimes(1)
      expect(onRowClick.mock.calls[0]?.[0]).toEqual({ name: "Alpha", age: 20 })

      await userEvent.keyboard(" ")
      expect(onRowClick).toHaveBeenCalledTimes(2)
      expect(onRowClick.mock.calls[1]?.[0]).toEqual({ name: "Alpha", age: 20 })
    })

    it("never calls onRowClick from a control inside the row, and the control still works", async () => {
      const onRowClick = vi.fn()
      const onEdit = vi.fn()
      const cols: ColumnDef<Row>[] = [
        ...columns,
        {
          id: "acoes",
          header: "Ações",
          cell: ({ row }) => (
            <>
              <button type="button" onClick={() => onEdit(row.original.name)}>
                Editar {row.original.name}
              </button>
              <a href={`#detalhe-${row.original.name}`}>Ver {row.original.name}</a>
              <input aria-label={`Nota ${row.original.name}`} />
            </>
          ),
        },
      ]
      render(<DataTable columns={cols} data={data} onRowClick={onRowClick} />)

      const edit = screen.getByRole("button", { name: "Editar Bravo" })
      await userEvent.click(edit)
      edit.focus()
      await userEvent.keyboard("{Enter}")
      await userEvent.keyboard(" ")
      expect(onEdit).toHaveBeenCalledTimes(3)

      await userEvent.click(screen.getByRole("link", { name: "Ver Bravo" }))
      expect(window.location.hash).toBe("#detalhe-Bravo")
      window.location.hash = ""

      const note = screen.getByRole("textbox", { name: "Nota Bravo" })
      await userEvent.click(note)
      await userEvent.keyboard("ok {Enter}")
      expect(note).toHaveValue("ok ")

      expect(onRowClick).not.toHaveBeenCalled()
    })

    it("ignores clicks that come from a portal rendered by a cell (menus, popovers)", async () => {
      const onRowClick = vi.fn()
      const { createPortal } = await import("react-dom")
      const cols: ColumnDef<Row>[] = [
        ...columns,
        {
          id: "menu",
          header: "Menu",
          cell: ({ row }) => createPortal(<span>Item de {row.original.name}</span>, document.body),
        },
      ]
      render(<DataTable columns={cols} data={data} onRowClick={onRowClick} />)
      await userEvent.click(screen.getByText("Item de Bravo"))
      expect(onRowClick).not.toHaveBeenCalled()
    })

    it("does not add a row button when onRowClick is omitted", () => {
      render(<DataTable columns={columns} data={data} />)
      expect(screen.queryByRole("button", { name: "Bravo" })).not.toBeInTheDocument()
      const row = screen.getByText("Bravo").closest("tr") as HTMLTableRowElement
      expect(row.getAttribute("role")).toBeNull()
      expect(row.getAttribute("tabindex")).toBeNull()
    })
  })

  describe("pagination previous", () => {
    it("returns to the previous page when the previous button is clicked", async () => {
      const many: Row[] = Array.from({ length: 5 }, (_, i) => ({
        name: `Row ${i + 1}`,
        age: 20 + i,
      }))
      render(<DataTable columns={columns} data={many} pagination={{ pageSize: 2 }} />)

      // Start on page 1 of 3 — previous should be disabled.
      const prev = screen.getByRole("button", { name: "Página anterior" })
      const next = screen.getByRole("button", { name: "Próxima página" })
      expect(isUnavailable(prev)).toBe(true)
      expect(pager()).toEqual({ current: "1", last: "3" })

      // Advance to page 2, then go back via "Previous".
      await userEvent.click(next)
      expect(pager()).toEqual({ current: "2", last: "3" })
      expect(isUnavailable(prev)).toBe(false)

      await userEvent.click(prev)
      expect(pager()).toEqual({ current: "1", last: "3" })
      expect(screen.getByText("Row 1")).toBeInTheDocument()
      expect(screen.queryByText("Row 3")).not.toBeInTheDocument()
    })
  })

  describe("loading", () => {
    it("renders 5 skeleton rows by default when pagination is off", () => {
      const { container } = render(<DataTable columns={columns} data={[]} loading />)
      const skeletonRows = container.querySelectorAll('[data-slot="data-table-skeleton-row"]')
      expect(skeletonRows).toHaveLength(5)
    })

    it("derives skeleton row count from pagination.pageSize", () => {
      const { container } = render(
        <DataTable columns={columns} data={[]} loading pagination={{ pageSize: 8 }} />,
      )
      const skeletonRows = container.querySelectorAll('[data-slot="data-table-skeleton-row"]')
      expect(skeletonRows).toHaveLength(8)
    })

    it("renders one skeleton cell per column", () => {
      const { container } = render(<DataTable columns={columns} data={[]} loading />)
      const firstRow = container.querySelector('[data-slot="data-table-skeleton-row"]')
      expect(firstRow).toBeTruthy()
      expect(firstRow?.querySelectorAll("td")).toHaveLength(columns.length)
    })

    it("keeps the search input mounted while loading (prevents focus loss across debounce)", () => {
      const { container } = render(
        <DataTable columns={columns} data={[]} loading searchableColumns={["name"]} />,
      )
      // Input stays in the DOM with the same identity — that's what keeps
      // the user's keyboard focus across the loading flip.
      expect(screen.getByPlaceholderText("Buscar...")).toBeInTheDocument()
      // And the wrapper carries `data-loading` so consumers / styles can
      // react without us unmounting the input.
      expect(container.querySelector('[data-slot="data-table-search"][data-loading]')).toBeTruthy()
    })

    it("does not flag data-loading on the search wrapper when loading=false", () => {
      const { container } = render(
        <DataTable columns={columns} data={[]} searchableColumns={["name"]} />,
      )
      expect(container.querySelector('[data-slot="data-table-search"][data-loading]')).toBeNull()
    })

    it("disables pagination buttons while loading", () => {
      render(<DataTable columns={columns} data={data} loading pagination={{ pageSize: 2 }} />)
      const prev = screen.getByRole("button", { name: /Página anterior/i })
      const next = screen.getByRole("button", { name: /Próxima página/i })
      expect(isUnavailable(prev)).toBe(true)
      expect(isUnavailable(next)).toBe(true)
    })

    it("sets aria-busy on the wrapper while loading", () => {
      const { container } = render(<DataTable columns={columns} data={[]} loading />)
      const wrapper = container.querySelector('[data-slot="data-table"]')
      expect(wrapper?.getAttribute("aria-busy")).toBe("true")
    })

    it("does not show the empty-state message while loading (skeleton instead)", () => {
      render(<DataTable columns={columns} data={[]} loading emptyMessage="Should not appear" />)
      expect(screen.queryByText("Should not appear")).not.toBeInTheDocument()
    })
  })

  describe("pageSizeOptions", () => {
    const makeMany = (n: number): Row[] =>
      Array.from({ length: n }, (_, i) => ({ name: `Row ${i + 1}`, age: 20 + i }))

    it("does not render the page-size select when pageSizeOptions is omitted", () => {
      render(<DataTable columns={columns} data={makeMany(12)} pagination={{ pageSize: 5 }} />)
      expect(screen.queryByRole("combobox", { name: /Linhas por página/i })).not.toBeInTheDocument()
    })

    it("does not render the page-size select when pageSizeOptions is an empty array", () => {
      render(
        <DataTable
          columns={columns}
          data={makeMany(12)}
          pagination={{ pageSize: 5, pageSizeOptions: [] }}
        />,
      )
      expect(screen.queryByRole("combobox", { name: /Linhas por página/i })).not.toBeInTheDocument()
    })

    it("renders the select with the configured options when pageSizeOptions is set", () => {
      render(
        <DataTable
          columns={columns}
          data={makeMany(60)}
          pagination={{ pageSize: 10, pageSizeOptions: [10, 20, 50] }}
        />,
      )
      const select = screen.getByRole("combobox", { name: /Linhas por página/i })
      expect(select).toBeInTheDocument()
      const options = Array.from((select as HTMLSelectElement).options).map((o) => o.value)
      expect(options).toEqual(["10", "20", "50"])
      expect((select as HTMLSelectElement).value).toBe("10")
    })

    it("falls back to the first pageSizeOptions entry when pagination.pageSize is omitted", () => {
      // Default pageSize is 10; if 10 isn't in pageSizeOptions, the <select>
      // would otherwise have a value matching no option (React warning + no
      // visible selection). The component should default to options[0].
      render(
        <DataTable
          columns={columns}
          data={makeMany(60)}
          pagination={{ pageSizeOptions: [20, 50, 100] }}
        />,
      )
      const select = screen.getByRole("combobox", {
        name: /Linhas por página/i,
      }) as HTMLSelectElement
      expect(select.value).toBe("20")
      // First page renders the first 20 rows.
      expect(screen.getByText("Row 1")).toBeInTheDocument()
      expect(screen.getByText("Row 20")).toBeInTheDocument()
      expect(screen.queryByText("Row 21")).not.toBeInTheDocument()
    })

    it("changing the size resets to page 1 and shrinks the visible window (uncontrolled)", async () => {
      render(
        <DataTable
          columns={columns}
          data={makeMany(60)}
          pagination={{ pageSize: 10, pageSizeOptions: [10, 20, 50] }}
        />,
      )
      // Advance to page 3 (rows 21–30) first.
      const nextBtn = screen.getByRole("button", { name: "Próxima página" })
      await userEvent.click(nextBtn)
      await userEvent.click(nextBtn)
      expect(pager()).toEqual({ current: "3", last: "6" })

      const select = screen.getByRole("combobox", { name: /Linhas por página/i })
      await userEvent.selectOptions(select, "20")

      // After resize, cursor MUST be back on page 1 (not preserved at row 21).
      expect(pager()).toEqual({ current: "1", last: "3" })
      expect(screen.getByText("Row 1")).toBeInTheDocument()
      expect(screen.getByText("Row 20")).toBeInTheDocument()
      expect(screen.queryByText("Row 21")).not.toBeInTheDocument()
    })

    it("propagates {pageIndex: 0, pageSize: next} via onPaginationChange when user is past page 0", async () => {
      // Regression guard: before the atomic setPagination fix, TanStack's
      // setPageSize internally recomputed pageIndex from the OLD pageIndex
      // (topRowIndex / newPageSize), landing on a non-zero page. This test
      // asserts the documented contract — page resets to 0.
      const onPaginationChange = vi.fn()
      function Wrapper() {
        const [state, setState] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
        return (
          <DataTable
            columns={columns}
            data={makeMany(60)}
            pagination={{ pageSize: state.pageSize, pageSizeOptions: [10, 20, 50] }}
            pageIndex={state.pageIndex}
            onPaginationChange={(updater) => {
              const next =
                typeof updater === "function"
                  ? (updater as (old: PaginationState) => PaginationState)(state)
                  : updater
              onPaginationChange(next)
              setState(next)
            }}
          />
        )
      }
      render(<Wrapper />)
      // Move to page 4 (pageIndex = 3) via next button so old.pageIndex !== 0.
      const nextBtn = screen.getByRole("button", { name: "Próxima página" })
      await userEvent.click(nextBtn)
      await userEvent.click(nextBtn)
      await userEvent.click(nextBtn)
      onPaginationChange.mockClear()

      const select = screen.getByRole("combobox", { name: /Linhas por página/i })
      await userEvent.selectOptions(select, "20")

      expect(onPaginationChange).toHaveBeenCalled()
      const lastCall = onPaginationChange.mock.calls.at(-1)?.[0] as PaginationState
      expect(lastCall).toEqual({ pageIndex: 0, pageSize: 20 })
    })

    it("rejects non-finite / non-positive option values without firing onPaginationChange", async () => {
      // Guard test for the input-validation branch in the onChange handler.
      // We force an invalid value by injecting an extra option, then changing
      // to it via the underlying DOM (userEvent.selectOptions enforces presence).
      const onPaginationChange = vi.fn()
      render(
        <DataTable
          columns={columns}
          data={makeMany(20)}
          pagination={{ pageSize: 10, pageSizeOptions: [10, 20] }}
          onPaginationChange={onPaginationChange}
        />,
      )
      const select = screen.getByRole("combobox", {
        name: /Linhas por página/i,
      }) as HTMLSelectElement
      // Append a malformed option and dispatch change to exercise the guard.
      const bogus = document.createElement("option")
      bogus.value = "not-a-number"
      select.appendChild(bogus)
      onPaginationChange.mockClear()
      select.value = "not-a-number"
      select.dispatchEvent(new Event("change", { bubbles: true }))
      expect(onPaginationChange).not.toHaveBeenCalled()
    })

    it("keeps the select in place but unavailable while loading", () => {
      render(
        <DataTable
          columns={columns}
          data={makeMany(20)}
          loading
          pagination={{ pageSize: 10, pageSizeOptions: [10, 20] }}
        />,
      )
      expect(screen.getByRole("combobox", { name: /Linhas por página/i })).toBeDisabled()
    })

    it("uses custom labels.pageSize for the visible label (and accessible name)", () => {
      render(
        <DataTable
          columns={columns}
          data={makeMany(20)}
          pagination={{ pageSize: 10, pageSizeOptions: [10, 20] }}
          labels={{ pageSize: "Rows per page" }}
        />,
      )
      // Visible text and accessible name both come from the wrapping <label>,
      // so they match by construction — WCAG 2.5.3 (Label in Name).
      expect(screen.getByText("Rows per page")).toBeInTheDocument()
      const select = screen.getByRole("combobox", { name: "Rows per page" })
      expect(select).toBeInTheDocument()
      expect(select.getAttribute("aria-label")).toBeNull()
    })
  })
})
