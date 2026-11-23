import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  Pagination,
  type PaginationProps,
  defaultPaginationLabels,
  getPaginationItems,
} from "./pagination"

function renderPagination(props: Partial<PaginationProps> = {}) {
  const onPageChange = props.onPageChange ?? vi.fn()
  const utils = render(
    <Pagination page={1} totalPages={10} {...props} onPageChange={onPageChange} />,
  )
  return { ...utils, onPageChange }
}

const pageButtons = () =>
  screen.getAllByRole("button", { name: /^Página \d/ }).map((b) => b.textContent)

describe("getPaginationItems", () => {
  it("lists every page when they fit", () => {
    expect(getPaginationItems(1, 1)).toEqual([1])
    expect(getPaginationItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it("keeps the same number of slots at the start, middle and end", () => {
    expect(getPaginationItems(1, 10)).toEqual([1, 2, 3, 4, 5, "end-ellipsis", 10])
    expect(getPaginationItems(4, 10)).toEqual([1, 2, 3, 4, 5, "end-ellipsis", 10])
    expect(getPaginationItems(5, 10)).toEqual([1, "start-ellipsis", 4, 5, 6, "end-ellipsis", 10])
    expect(getPaginationItems(6, 10)).toEqual([1, "start-ellipsis", 5, 6, 7, "end-ellipsis", 10])
    expect(getPaginationItems(7, 10)).toEqual([1, "start-ellipsis", 6, 7, 8, 9, 10])
    expect(getPaginationItems(10, 10)).toEqual([1, "start-ellipsis", 6, 7, 8, 9, 10])
  })

  it("never hides a single page behind an ellipsis", () => {
    for (let total = 8; total <= 30; total++) {
      for (let page = 1; page <= total; page++) {
        const items = getPaginationItems(page, total)
        items.forEach((item, i) => {
          if (typeof item === "number") return
          const before = items[i - 1] as number
          const after = items[i + 1] as number
          expect(after - before).toBeGreaterThanOrEqual(3)
        })
        expect(items).toHaveLength(7)
        expect(items).toContain(page)
      }
    }
  })

  it("honours siblingCount (and clamps it at zero)", () => {
    expect(getPaginationItems(10, 20, 2)).toEqual([
      1,
      "start-ellipsis",
      8,
      9,
      10,
      11,
      12,
      "end-ellipsis",
      20,
    ])
    expect(getPaginationItems(10, 20, 0)).toEqual([1, "start-ellipsis", 10, "end-ellipsis", 20])
    expect(getPaginationItems(10, 20, -3)).toEqual([1, "start-ellipsis", 10, "end-ellipsis", 20])
  })
})

describe("Pagination", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("structure", () => {
    it("is a named navigation landmark with a list of controls", () => {
      renderPagination()
      const nav = screen.getByRole("navigation", { name: "Paginação" })
      expect(nav).toHaveAttribute("data-slot", "pagination")
      expect(within(nav).getByRole("list")).toBeInTheDocument()
    })

    it("marks the current page with aria-current", () => {
      renderPagination({ page: 3 })
      const current = screen.getByRole("button", { name: "Página 3" })
      expect(current).toHaveAttribute("aria-current", "page")
      expect(current).toHaveClass("bg-primary")
      const other = screen.getByRole("button", { name: "Página 2" })
      expect(other).not.toHaveAttribute("aria-current")
      expect(other).not.toHaveClass("bg-primary")
    })

    it("hides ellipses from assistive tech", () => {
      const { container } = renderPagination({ page: 5, totalPages: 20 })
      const ellipses = container.querySelectorAll('[data-slot="pagination-ellipsis"]')
      expect(ellipses).toHaveLength(2)
      for (const e of ellipses) expect(e).toHaveAttribute("aria-hidden", "true")
      expect(pageButtons()).toEqual(["1", "4", "5", "6", "20"])
    })

    it("formats large page numbers in pt-BR", () => {
      renderPagination({ page: 1500, totalPages: 2000 })
      expect(screen.getByRole("button", { name: "Página 1.500" })).toHaveTextContent("1.500")
    })

    it("merges className", () => {
      renderPagination({ className: "mt-4" })
      expect(screen.getByRole("navigation")).toHaveClass("mt-4", "flex")
    })
  })

  describe("navigation", () => {
    it("goes to a page, to the previous and to the next one", async () => {
      const { onPageChange } = renderPagination({ page: 3 })
      await userEvent.click(screen.getByRole("button", { name: "Página 4" }))
      expect(onPageChange).toHaveBeenLastCalledWith(4)
      await userEvent.click(screen.getByRole("button", { name: "Página anterior" }))
      expect(onPageChange).toHaveBeenLastCalledWith(2)
      await userEvent.click(screen.getByRole("button", { name: "Próxima página" }))
      expect(onPageChange).toHaveBeenLastCalledWith(4)
    })

    it("does nothing when the current page is clicked", async () => {
      const { onPageChange } = renderPagination({ page: 3 })
      await userEvent.click(screen.getByRole("button", { name: "Página 3" }))
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it("disables previous on the first page and next on the last", () => {
      const { rerender, onPageChange } = renderPagination({ page: 1 })
      expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled()
      expect(screen.getByRole("button", { name: "Próxima página" })).toBeEnabled()
      rerender(<Pagination page={10} totalPages={10} onPageChange={onPageChange} />)
      expect(screen.getByRole("button", { name: "Página anterior" })).toBeEnabled()
      expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled()
    })

    it("shows first/last buttons on request", async () => {
      const { onPageChange } = renderPagination({ page: 5, showFirstLast: true })
      await userEvent.click(screen.getByRole("button", { name: "Primeira página" }))
      expect(onPageChange).toHaveBeenLastCalledWith(1)
      await userEvent.click(screen.getByRole("button", { name: "Última página" }))
      expect(onPageChange).toHaveBeenLastCalledWith(10)
    })

    it("has no first/last buttons by default", () => {
      renderPagination()
      expect(screen.queryByRole("button", { name: "Primeira página" })).not.toBeInTheDocument()
      expect(screen.queryByRole("button", { name: "Última página" })).not.toBeInTheDocument()
    })

    it("clamps out-of-range pages", async () => {
      const { onPageChange, rerender } = renderPagination({ page: 42, totalPages: 5 })
      expect(screen.getByRole("button", { name: "Página 5" })).toHaveAttribute(
        "aria-current",
        "page",
      )
      expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled()
      await userEvent.click(screen.getByRole("button", { name: "Página anterior" }))
      expect(onPageChange).toHaveBeenLastCalledWith(4)
      rerender(<Pagination page={-2} totalPages={5} onPageChange={onPageChange} />)
      expect(screen.getByRole("button", { name: "Página 1" })).toHaveAttribute(
        "aria-current",
        "page",
      )
    })

    it("is fully keyboard operable", async () => {
      const { onPageChange } = renderPagination({ page: 2, totalPages: 3 })
      await userEvent.tab()
      expect(screen.getByRole("button", { name: "Página anterior" })).toHaveFocus()
      await userEvent.tab()
      expect(screen.getByRole("button", { name: "Página 1" })).toHaveFocus()
      await userEvent.keyboard("{Enter}")
      expect(onPageChange).toHaveBeenLastCalledWith(1)
      await userEvent.tab()
      await userEvent.tab()
      await userEvent.keyboard(" ")
      expect(onPageChange).toHaveBeenLastCalledWith(3)
    })

    it("disables every control with disabled", () => {
      renderPagination({ page: 3, disabled: true, pageSizeOptions: [10, 20] })
      for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled()
      expect(screen.getByRole("combobox", { name: "Itens por página" })).toBeDisabled()
    })
  })

  describe("totals", () => {
    it("derives the page count and a range summary from totalItems", () => {
      renderPagination({ page: 2, totalItems: 243, pageSize: 10 })
      expect(screen.getByText("11–20 de 243")).toHaveAttribute("data-slot", "pagination-range")
      expect(pageButtons().at(-1)).toBe("25")
    })

    it("caps the summary at the last item", () => {
      renderPagination({ page: 25, totalItems: 243, pageSize: 10 })
      expect(screen.getByText("241–243 de 243")).toBeInTheDocument()
    })

    it("gives totalItems precedence over totalPages", () => {
      renderPagination({ totalItems: 30, totalPages: 99, pageSize: 10 })
      expect(pageButtons()).toEqual(["1", "2", "3"])
    })

    it("handles zero items as a single empty page", () => {
      renderPagination({ totalItems: 0 })
      expect(screen.getByText("0–0 de 0")).toBeInTheDocument()
      expect(pageButtons()).toEqual(["1"])
      expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled()
    })

    it("falls back to 10 per page when pageSize is not positive", () => {
      renderPagination({ totalItems: 25, pageSize: 0 })
      expect(screen.getByText("1–10 de 25")).toBeInTheDocument()
      expect(pageButtons()).toEqual(["1", "2", "3"])
    })

    it("has no summary without totalItems", () => {
      const { container } = renderPagination()
      expect(container.querySelector('[data-slot="pagination-range"]')).toBeNull()
    })

    it("floors fractional totalPages and keeps at least one page", () => {
      const { rerender, onPageChange } = renderPagination({ totalPages: 3.7 })
      expect(pageButtons()).toEqual(["1", "2", "3"])
      rerender(<Pagination page={1} totalPages={0} onPageChange={onPageChange} />)
      expect(pageButtons()).toEqual(["1"])
    })
  })

  describe("compact variant", () => {
    it("shows 'Página N de M' between previous and next", async () => {
      const { onPageChange } = renderPagination({ page: 3, variant: "compact" })
      expect(screen.getByText("Página 3 de 10")).toHaveAttribute(
        "data-slot",
        "pagination-indicator",
      )
      expect(screen.queryByRole("button", { name: /^Página \d/ })).not.toBeInTheDocument()
      await userEvent.click(screen.getByRole("button", { name: "Próxima página" }))
      expect(onPageChange).toHaveBeenLastCalledWith(4)
    })
  })

  describe("cursor mode", () => {
    it("shows only previous/next and enables next while hasMore", async () => {
      const onPageChange = vi.fn()
      const { rerender } = render(<Pagination page={2} hasMore onPageChange={onPageChange} />)
      expect(screen.getByText("Página 2")).toBeInTheDocument()
      expect(screen.queryByRole("button", { name: /^Página \d/ })).not.toBeInTheDocument()
      await userEvent.click(screen.getByRole("button", { name: "Próxima página" }))
      expect(onPageChange).toHaveBeenLastCalledWith(3)

      rerender(<Pagination page={2} hasMore={false} onPageChange={onPageChange} />)
      expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled()
      expect(screen.getByRole("button", { name: "Página anterior" })).toBeEnabled()
    })

    it("ignores showFirstLast (the last page is unknown) and clamps below 1", () => {
      render(<Pagination page={0} hasMore showFirstLast onPageChange={() => {}} />)
      expect(screen.queryByRole("button", { name: "Última página" })).not.toBeInTheDocument()
      expect(screen.getByText("Página 1")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled()
    })
  })

  describe("page size", () => {
    it("is hidden without pageSizeOptions", () => {
      renderPagination({ pageSizeOptions: [] })
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
    })

    it("changes the page size and goes back to page 1", async () => {
      const onPageSizeChange = vi.fn()
      const { onPageChange } = renderPagination({
        page: 4,
        totalItems: 200,
        pageSize: 20,
        pageSizeOptions: [10, 20, 50],
        onPageSizeChange,
      })
      const select = screen.getByRole("combobox", { name: "Itens por página" })
      expect(select).toHaveValue("20")
      await userEvent.selectOptions(select, "50")
      expect(onPageSizeChange).toHaveBeenCalledWith(50)
      expect(onPageChange).toHaveBeenCalledWith(1)
    })

    it("does not re-request page 1 when already there, and works without onPageSizeChange", async () => {
      const { onPageChange } = renderPagination({ page: 1, pageSizeOptions: [10, 20] })
      await userEvent.selectOptions(screen.getByRole("combobox"), "20")
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it("adds the current pageSize to the options when missing", () => {
      renderPagination({ pageSize: 15, pageSizeOptions: [50, 10] })
      const options = within(screen.getByRole("combobox")).getAllByRole("option")
      expect(options.map((o) => o.textContent)).toEqual(["10", "15", "50"])
      expect(screen.getByRole("combobox")).toHaveValue("15")
    })
  })

  describe("links", () => {
    const href = (page: number) => `/leads?page=${page}`

    it("renders pages and steps as real links and still reports the page", async () => {
      const onPageChange = vi.fn()
      render(
        <Pagination
          page={3}
          totalPages={10}
          getPageHref={href}
          showFirstLast
          onPageChange={onPageChange}
        />,
      )
      expect(screen.queryAllByRole("button")).toHaveLength(0)
      const page4 = screen.getByRole("link", { name: "Página 4" })
      expect(page4).toHaveAttribute("href", "/leads?page=4")
      expect(screen.getByRole("link", { name: "Página 3" })).toHaveAttribute("aria-current", "page")
      expect(screen.getByRole("link", { name: "Página anterior" })).toHaveAttribute(
        "href",
        "/leads?page=2",
      )
      expect(screen.getByRole("link", { name: "Última página" })).toHaveAttribute(
        "href",
        "/leads?page=10",
      )
      page4.addEventListener("click", (e) => e.preventDefault())
      await userEvent.click(page4)
      await waitFor(() => expect(onPageChange).toHaveBeenCalledWith(4))
    })

    it("reports the page from an enabled step link and sizes links with size=sm", async () => {
      const onPageChange = vi.fn()
      render(
        <Pagination
          page={2}
          totalPages={5}
          size="sm"
          getPageHref={href}
          onPageChange={onPageChange}
        />,
      )
      const next = screen.getByRole("link", { name: "Próxima página" })
      expect(next).toHaveClass("size-8")
      next.addEventListener("click", (e) => e.preventDefault())
      await userEvent.click(next)
      await waitFor(() => expect(onPageChange).toHaveBeenCalledWith(3))
    })

    it("follows the link that was clicked, not the one re-rendered by onPageChange", async () => {
      // Regression: updating the page inside the click re-renders "next" with
      // the following href before the browser follows the link, skipping a page.
      // jsdom reads the href too early to reproduce it — the real-browser guard
      // is "link mode navigates…" in tests/e2e/pagination.spec.ts.
      function LinkPager() {
        const [page, setPage] = React.useState(3)
        return (
          <Pagination
            page={page}
            onPageChange={setPage}
            totalPages={8}
            getPageHref={(p) => `#p-${p}`}
          />
        )
      }
      window.location.hash = ""
      render(<LinkPager />)
      await userEvent.click(screen.getByRole("link", { name: "Próxima página" }))
      await waitFor(() =>
        expect(screen.getByRole("link", { name: "Página 4" })).toHaveAttribute(
          "aria-current",
          "page",
        ),
      )
      expect(window.location.hash).toBe("#p-4")
    })

    it("turns the steps at the ends into disabled links", async () => {
      const onPageChange = vi.fn()
      render(<Pagination page={1} totalPages={3} getPageHref={href} onPageChange={onPageChange} />)
      const previous = screen.getByRole("link", { name: "Página anterior" })
      expect(previous).not.toHaveAttribute("href")
      expect(previous).toHaveAttribute("aria-disabled", "true")
      const event = new MouseEvent("click", { bubbles: true, cancelable: true })
      previous.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
      expect(onPageChange).not.toHaveBeenCalled()
      expect(screen.getByRole("link", { name: "Próxima página" })).toHaveAttribute(
        "href",
        "/leads?page=2",
      )
    })

    it("disables page links with disabled", () => {
      const onPageChange = vi.fn()
      render(
        <Pagination
          page={2}
          totalPages={3}
          getPageHref={href}
          disabled
          onPageChange={onPageChange}
        />,
      )
      const page3 = screen.getByRole("link", { name: "Página 3" })
      expect(page3).not.toHaveAttribute("href")
      expect(page3).toHaveAttribute("aria-disabled", "true")
      const event = new MouseEvent("click", { bubbles: true, cancelable: true })
      page3.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it("falls back to buttons for unsafe hrefs and warns in dev", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      const onPageChange = vi.fn()
      render(
        <Pagination
          page={1}
          totalPages={2}
          getPageHref={() => "javascript:alert(1)"}
          onPageChange={onPageChange}
        />,
      )
      expect(screen.queryAllByRole("link")).toHaveLength(0)
      expect(String(warn.mock.calls[0]?.[0])).toContain("[Pagination]")
      await userEvent.click(screen.getByRole("button", { name: "Página 2" }))
      expect(onPageChange).toHaveBeenCalledWith(2)
    })
  })

  describe("sizes and labels", () => {
    it("uses 40px controls by default and 32px with size=sm", () => {
      const { rerender, onPageChange } = renderPagination({ page: 5, pageSizeOptions: [10] })
      expect(screen.getByRole("button", { name: "Página 5" })).toHaveClass("h-10", "min-w-10")
      expect(screen.getByRole("button", { name: "Página anterior" })).toHaveClass("size-control-md")
      expect(screen.getByRole("combobox")).toHaveClass("h-9")
      rerender(
        <Pagination
          page={5}
          totalPages={10}
          size="sm"
          pageSizeOptions={[10]}
          onPageChange={onPageChange}
        />,
      )
      expect(screen.getByRole("button", { name: "Página 5" })).toHaveClass(
        "h-8",
        "min-w-8",
        "text-xs",
      )
      expect(screen.getByRole("button", { name: "Página anterior" })).toHaveClass("size-control-sm")
      expect(screen.getByRole("combobox")).toHaveClass("h-8")
      const ellipsis = document.querySelector('[data-slot="pagination-ellipsis"]')
      expect(ellipsis).toHaveClass("h-8")
    })

    it("sizes the compact indicator", () => {
      const { rerender, onPageChange } = renderPagination({ variant: "compact" })
      expect(screen.getByText("Página 1 de 10")).toHaveClass("text-sm")
      rerender(
        <Pagination
          page={1}
          totalPages={10}
          variant="compact"
          size="sm"
          onPageChange={onPageChange}
        />,
      )
      expect(screen.getByText("Página 1 de 10")).toHaveClass("text-xs")
    })

    it("ships pt-BR defaults", () => {
      expect(defaultPaginationLabels.page(1234)).toBe("Página 1.234")
      expect(defaultPaginationLabels.pageOf(2, 1000)).toBe("Página 2 de 1.000")
      expect(defaultPaginationLabels.range(1, 10, 1234)).toBe("1–10 de 1.234")
    })

    it("overrides labels", () => {
      renderPagination({
        totalItems: 50,
        pageSizeOptions: [10],
        labels: {
          navigation: "Páginas de leads",
          previous: "Voltar",
          next: "Avançar",
          page: (n) => `Ir para ${n}`,
          range: (from, to, total) => `${from} a ${to} (${total})`,
          pageSize: "Por página",
        },
      })
      expect(screen.getByRole("navigation", { name: "Páginas de leads" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Voltar" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Avançar" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Ir para 2" })).toBeInTheDocument()
      expect(screen.getByText("1 a 10 (50)")).toBeInTheDocument()
      expect(screen.getByRole("combobox", { name: "Por página" })).toBeInTheDocument()
    })
  })

  it("works as a controlled component", async () => {
    function Controlled() {
      const [page, setPage] = React.useState(1)
      return <Pagination page={page} onPageChange={setPage} totalPages={20} />
    }
    render(<Controlled />)
    await userEvent.click(screen.getByRole("button", { name: "Próxima página" }))
    await userEvent.click(screen.getByRole("button", { name: "Próxima página" }))
    expect(screen.getByRole("button", { name: "Página 3" })).toHaveAttribute("aria-current", "page")
    await userEvent.click(screen.getByRole("button", { name: "Página 20" }))
    expect(pageButtons()).toEqual(["1", "16", "17", "18", "19", "20"])
  })
})
