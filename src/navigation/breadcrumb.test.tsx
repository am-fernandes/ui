import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { RenderLinkProps } from "@/lib/render-link"
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

  it("names the nav in Portuguese by default, from labels, or from the deprecated ariaLabel", () => {
    const items = [{ label: "Home", href: "/" }, { label: "Last" }]
    const { container, rerender } = render(<Breadcrumb items={items} />)
    expect(container.querySelector("nav")?.getAttribute("aria-label")).toBe("Trilha de navegação")

    rerender(<Breadcrumb ariaLabel="Trilha" items={items} />)
    expect(container.querySelector("nav")?.getAttribute("aria-label")).toBe("Trilha")

    rerender(<Breadcrumb ariaLabel="Trilha" labels={{ navigation: "Caminho" }} items={items} />)
    expect(container.querySelector("nav")?.getAttribute("aria-label")).toBe("Caminho")
  })

  it("keeps only list items in the list, with the separators hidden from assistive technology", () => {
    const { container } = render(
      <Breadcrumb
        items={[{ label: "A", href: "/a" }, { label: "B", href: "/b" }, { label: "C" }]}
      />,
    )
    const list = container.querySelector("ol") as HTMLOListElement
    expect([...list.children].map((child) => child.tagName)).toEqual(["LI", "LI", "LI"])
    const separators = container.querySelectorAll('[data-slot="breadcrumb-separator"]')
    expect(separators).toHaveLength(2)
    for (const sep of separators) {
      expect(sep.getAttribute("aria-hidden")).toBe("true")
      expect(sep.closest("li")).not.toBeNull()
    }
  })

  it("shows a middle step without href as plain text, not as the current page", () => {
    render(
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Cadastros" }, { label: "Leads" }]}
      />,
    )
    const middle = screen.getByText("Cadastros")
    expect(middle).not.toHaveAttribute("aria-current")
    expect(middle).not.toHaveClass("font-semibold")
    expect(screen.getByText("Leads")).toHaveAttribute("aria-current", "page")
  })

  it("collapses a long trail with maxItems and lists the hidden steps in a menu", async () => {
    const items = [
      { label: "Início", href: "/" },
      { label: "Empreendimentos", href: "/empreendimentos" },
      { label: "Residencial Aurora", href: "/empreendimentos/aurora" },
      { label: "Torre B", href: "/empreendimentos/aurora/torre-b" },
      { label: "Unidades", href: "/empreendimentos/aurora/torre-b/unidades" },
      { label: "1204" },
    ]
    render(<Breadcrumb maxItems={3} items={items} />)
    expect(screen.getByRole("link", { name: "Início" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Empreendimentos" })).toBeNull()
    expect(screen.getByRole("link", { name: "Unidades" })).toBeInTheDocument()
    expect(screen.getByText("1204")).toHaveAttribute("aria-current", "page")

    await userEvent.click(screen.getByRole("button", { name: "Mostrar itens ocultos da trilha" }))
    const menu = await screen.findByRole("menu")
    for (const name of ["Empreendimentos", "Residencial Aurora", "Torre B"]) {
      expect(within(menu).getByRole("menuitem", { name })).toHaveAttribute(
        "href",
        expect.stringContaining("/empreendimentos"),
      )
    }
  })

  it("does not collapse when the trail fits maxItems", () => {
    render(<Breadcrumb maxItems={4} items={[{ label: "A", href: "/a" }, { label: "B" }]} />)
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("renders the links through renderLink (the app's router)", () => {
    const renderLink = vi.fn(({ href, ...props }: RenderLinkProps) => (
      <a data-router-link={href} href={href} {...props} />
    ))
    render(
      <Breadcrumb
        renderLink={renderLink}
        items={[
          { label: "Home", href: "/" },
          { label: "Contratos", href: "/contratos" },
          { label: "C-2026-001" },
        ]}
      />,
    )
    expect(screen.getByRole("link", { name: "Contratos" })).toHaveAttribute(
      "data-router-link",
      "/contratos",
    )
    expect(renderLink).toHaveBeenCalledTimes(2)
    // The current page is not a link at all.
    expect(screen.getByText("C-2026-001").closest("a")).toBeNull()
  })

  describe("href protocol safety", () => {
    const originalWarn = console.warn
    beforeEach(() => {
      console.warn = vi.fn()
    })
    afterEach(() => {
      console.warn = originalWarn
    })

    it("renders javascript: hrefs as a span (no anchor)", () => {
      render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Evil", href: "javascript:alert(document.cookie)" },
            { label: "Last" },
          ]}
        />,
      )
      const evil = screen.getByText("Evil")
      expect(evil.tagName).toBe("SPAN")
    })

    it("renders vbscript: and file: hrefs as a span", () => {
      render(
        <Breadcrumb
          items={[
            { label: "VBS", href: "vbscript:msgbox" },
            { label: "File", href: "file:///etc/passwd" },
            { label: "Last" },
          ]}
        />,
      )
      expect(screen.getByText("VBS").tagName).toBe("SPAN")
      expect(screen.getByText("File").tagName).toBe("SPAN")
    })

    it("keeps mailto: and tel: hrefs as anchors", () => {
      render(
        <Breadcrumb
          items={[
            { label: "Email", href: "mailto:foo@bar.com" },
            { label: "Phone", href: "tel:+5511999999999" },
            { label: "Last" },
          ]}
        />,
      )
      expect(screen.getByText("Email").tagName).toBe("A")
      expect(screen.getByText("Phone").tagName).toBe("A")
    })

    it("warns in dev when an unsafe href is blocked", () => {
      const spy = console.warn as unknown as ReturnType<typeof vi.fn>
      render(
        <Breadcrumb items={[{ label: "Bad", href: "javascript:void(0)" }, { label: "Last" }]} />,
      )
      expect(spy).toHaveBeenCalled()
      const message = String(spy.mock.calls[0]?.[0] ?? "")
      expect(message).toContain("Breadcrumb")
      expect(message).toContain("javascript:void(0)")
    })
  })
})
