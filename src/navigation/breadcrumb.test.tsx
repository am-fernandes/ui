import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Breadcrumb } from "./breadcrumb"

describe("Breadcrumb", () => {
  it("renders via items API", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Contratos", href: "/contratos" },
          { label: "Page" },
        ]}
      />,
    )
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Contratos")).toBeInTheDocument()
    expect(screen.getByText("Page")).toBeInTheDocument()
    expect(screen.getByText("Home").tagName).toBe("A")
  })

  it("marks the last item without href as current page", () => {
    render(<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Current" }]} />)
    const current = screen.getByText("Current")
    expect(current.getAttribute("aria-current")).toBe("page")
  })

  it('emits exactly one aria-current="page"', () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Middle", href: "/middle" },
          { label: "Last" },
        ]}
      />,
    )
    const currents = container.querySelectorAll('[aria-current="page"]')
    expect(currents).toHaveLength(1)
    expect(currents[0]?.textContent).toBe("Last")
  })

  it('aria-current="page" only on the last item (not on links)', () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Section", href: "/section" },
          { label: "Item" },
        ]}
      />,
    )
    const links = container.querySelectorAll("a")
    for (const link of links) {
      expect(link.getAttribute("aria-current")).toBeNull()
    }
    expect(screen.getByText("Item").getAttribute("aria-current")).toBe("page")
  })

  it("does NOT set aria-current on a middle item that lacks an href", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Middle-no-href" },
          { label: "Last", href: "/last" },
        ]}
      />,
    )
    const middle = screen.getByText("Middle-no-href")
    expect(middle.getAttribute("aria-current")).toBeNull()
    // Still rendered as a span (no href)
    expect(middle.tagName).toBe("SPAN")
  })

  it("renders custom separator", () => {
    render(
      <Breadcrumb
        separator={<span data-testid="sep">/</span>}
        items={[{ label: "Home", href: "/" }, { label: "Sub", href: "/sub" }, { label: "Last" }]}
      />,
    )
    // 3 items → 2 separators
    expect(screen.getAllByTestId("sep")).toHaveLength(2)
  })

  it("uses a configurable aria-label on the nav (default capitalized)", () => {
    const { container, rerender } = render(
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Last" }]} />,
    )
    expect(container.querySelector("nav")?.getAttribute("aria-label")).toBe("Breadcrumb")

    rerender(
      <Breadcrumb ariaLabel="Trilha" items={[{ label: "Home", href: "/" }, { label: "Last" }]} />,
    )
    expect(container.querySelector("nav")?.getAttribute("aria-label")).toBe("Trilha")
  })

  it("separator items do not carry aria-hidden", () => {
    const { container } = render(
      <Breadcrumb
        items={[{ label: "A", href: "/a" }, { label: "B", href: "/b" }, { label: "C" }]}
      />,
    )
    const separators = container.querySelectorAll('[data-slot="breadcrumb-separator"]')
    expect(separators.length).toBeGreaterThan(0)
    for (const sep of separators) {
      expect(sep.hasAttribute("aria-hidden")).toBe(false)
    }
  })

  it("maxItems collapses middle items into an ellipsis", () => {
    const items = [
      { label: "Home", href: "/" },
      { label: "A", href: "/a" },
      { label: "B", href: "/b" },
      { label: "C", href: "/c" },
      { label: "D", href: "/d" },
      { label: "Last" },
    ]
    render(<Breadcrumb items={items} maxItems={3} />)

    // First + ellipsis + tail (maxItems-1 from the end).
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("…")).toBeInTheDocument()
    expect(screen.getByText("D")).toBeInTheDocument()
    expect(screen.getByText("Last")).toBeInTheDocument()
    // Middle items collapsed away.
    expect(screen.queryByText("A")).not.toBeInTheDocument()
    expect(screen.queryByText("B")).not.toBeInTheDocument()
    expect(screen.queryByText("C")).not.toBeInTheDocument()
  })

  it("maxItems is a no-op when items.length <= maxItems", () => {
    render(
      <Breadcrumb
        maxItems={5}
        items={[{ label: "Home", href: "/" }, { label: "Sub", href: "/s" }, { label: "Last" }]}
      />,
    )
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Sub")).toBeInTheDocument()
    expect(screen.getByText("Last")).toBeInTheDocument()
    expect(screen.queryByText("…")).not.toBeInTheDocument()
  })

  it("collapsed: last item still carries aria-current and exactly one aria-current is emitted", () => {
    const items = [
      { label: "Home", href: "/" },
      { label: "A", href: "/a" },
      { label: "B", href: "/b" },
      { label: "C", href: "/c" },
      { label: "D", href: "/d" },
      { label: "Last" },
    ]
    const { container } = render(<Breadcrumb items={items} maxItems={3} />)
    const currents = container.querySelectorAll('[aria-current="page"]')
    expect(currents).toHaveLength(1)
    expect(currents[0]?.textContent).toBe("Last")
  })
})
