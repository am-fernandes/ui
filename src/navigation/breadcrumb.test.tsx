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
})
