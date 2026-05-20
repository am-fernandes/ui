import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LayoutDashboard, Users } from "lucide-react"
import * as React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Sidebar, type SidebarItem } from "./sidebar"

const items: SidebarItem[] = [
  { id: "dash", label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { id: "users", label: "Usuários", icon: Users, href: "/users" },
]

describe("Sidebar (data-driven)", () => {
  it("renders items from a flat list", () => {
    render(<Sidebar items={items} />)
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Usuários")).toBeInTheDocument()
  })

  it("renders groups with headings", () => {
    render(
      <Sidebar
        groups={[
          { label: "Geral", items: [items[0]!] },
          { label: "Admin", items: [items[1]!] },
        ]}
      />,
    )
    expect(screen.getByText("Geral")).toBeInTheDocument()
    expect(screen.getByText("Admin")).toBeInTheDocument()
  })

  it("renders header and footer slots", () => {
    render(
      <Sidebar
        items={items}
        header={<div data-testid="hdr">Logo</div>}
        footer={<div data-testid="ftr">User</div>}
      />,
    )
    expect(screen.getByTestId("hdr")).toBeInTheDocument()
    expect(screen.getByTestId("ftr")).toBeInTheDocument()
  })

  it("renders item.badge", () => {
    render(<Sidebar items={[{ ...items[0]!, badge: <span data-testid="b">3</span> }]} />)
    expect(screen.getByTestId("b")).toBeInTheDocument()
  })

  it("marks active item via isActive callback", () => {
    render(<Sidebar items={items} isActive={(it) => it.id === "dash"} />)
    const dash = screen.getByText("Dashboard").closest("a")
    expect(dash).toHaveAttribute("data-active", "true")
  })

  it("renders submenu when item has children items and defaultOpen: true", () => {
    render(
      <Sidebar
        items={[
          {
            id: "reports",
            label: "Relatórios",
            defaultOpen: true,
            items: [
              { id: "fin", label: "Financeiro", href: "/fin" },
              { id: "ops", label: "Operacional", href: "/ops" },
            ],
          },
        ]}
      />,
    )
    expect(screen.getByText("Relatórios")).toBeInTheDocument()
    expect(screen.getByText("Financeiro")).toBeInTheDocument()
    expect(screen.getByText("Operacional")).toBeInTheDocument()
  })

  it("submenu is collapsed by default (children not in the DOM)", () => {
    render(
      <Sidebar
        items={[
          {
            id: "reports",
            label: "Relatórios",
            items: [
              { id: "fin", label: "Financeiro", href: "/fin" },
              { id: "ops", label: "Operacional", href: "/ops" },
            ],
          },
        ]}
      />,
    )
    expect(screen.getByText("Relatórios")).toBeInTheDocument()
    expect(screen.queryByText("Financeiro")).not.toBeInTheDocument()
    expect(screen.queryByText("Operacional")).not.toBeInTheDocument()
    const trigger = screen.getByRole("button", { name: /Relatórios/i })
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
  })

  it("clicking the submenu trigger toggles the children open and closed", async () => {
    render(
      <Sidebar
        items={[
          {
            id: "reports",
            label: "Relatórios",
            items: [
              { id: "fin", label: "Financeiro", href: "/fin" },
              { id: "ops", label: "Operacional", href: "/ops" },
            ],
          },
        ]}
      />,
    )
    const trigger = screen.getByRole("button", { name: /Relatórios/i })
    await userEvent.click(trigger)
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    expect(screen.getByText("Financeiro")).toBeInTheDocument()
    await userEvent.click(trigger)
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    expect(screen.queryByText("Financeiro")).not.toBeInTheDocument()
  })

  it("fires item.onClick alongside toggling when the trigger is clicked", async () => {
    const onClick = vi.fn()
    render(
      <Sidebar
        items={[
          {
            id: "reports",
            label: "Relatórios",
            onClick,
            items: [{ id: "fin", label: "Financeiro", href: "/fin" }],
          },
        ]}
      />,
    )
    const trigger = screen.getByRole("button", { name: /Relatórios/i })
    await userEvent.click(trigger)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
  })

  it("collapsible=icon collapsed hides labels but keeps icon", () => {
    const { container } = render(
      <Sidebar
        items={items}
        collapsible="icon"
        defaultOpen={false}
        groups={[{ label: "Geral", items }]}
      />,
    )
    // Label "Geral" is hidden when collapsed-to-icon.
    expect(screen.queryByText("Geral")).not.toBeInTheDocument()
    // The labels "Dashboard"/"Usuários" should not be in the document either.
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument()
    // The aside should report collapsed state.
    const aside = container.querySelector("aside[data-slot='sidebar']") as HTMLElement
    expect(aside.getAttribute("data-state")).toBe("collapsed")
  })

  it("renders an item without href as a button (and fires onClick)", async () => {
    const onClick = vi.fn()
    render(
      <Sidebar
        items={[{ id: "btn", label: "Configurações", onClick, icon: undefined as never }]}
      />,
    )
    const btn = screen.getByRole("button", { name: /Configurações/i })
    expect(btn.tagName).toBe("BUTTON")
    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalled()
  })

  it("renders disabled item with aria-disabled when it's an anchor", () => {
    render(<Sidebar items={[{ id: "a", label: "Diz", href: "/x", disabled: true }]} />)
    const link = screen.getByText("Diz").closest("a") as HTMLAnchorElement
    expect(link.getAttribute("aria-disabled")).toBe("true")
  })

  it("intercepts click on a disabled anchor by calling preventDefault", () => {
    const itemOnClick = vi.fn()
    const { container } = render(
      <Sidebar
        items={[{ id: "x", label: "Item X", href: "/x", disabled: true, onClick: itemOnClick }]}
      />,
    )
    const link = container.querySelector('a[aria-disabled="true"]') as HTMLAnchorElement
    expect(link).toBeTruthy()
    expect(link.tabIndex).toBe(-1)
    const event = new MouseEvent("click", { bubbles: true, cancelable: true })
    const preventDefaultSpy = vi.spyOn(event, "preventDefault")
    link.dispatchEvent(event)
    expect(preventDefaultSpy).toHaveBeenCalled()
    // The user's onClick must NOT run for a disabled item.
    expect(itemOnClick).not.toHaveBeenCalled()
  })

  it("fires item.onClick on a non-disabled anchor without intercepting", () => {
    const itemOnClick = vi.fn()
    const { container } = render(
      <Sidebar items={[{ id: "y", label: "Item Y", href: "/y", onClick: itemOnClick }]} />,
    )
    const link = container.querySelector('a[href="/y"]') as HTMLAnchorElement
    expect(link).toBeTruthy()
    const event = new MouseEvent("click", { bubbles: true, cancelable: true })
    const preventDefaultSpy = vi.spyOn(event, "preventDefault")
    link.dispatchEvent(event)
    expect(preventDefaultSpy).not.toHaveBeenCalled()
    expect(itemOnClick).toHaveBeenCalledTimes(1)
  })

  it("supports controlled open/onOpenChange via keyboard shortcut Ctrl+B", () => {
    const onOpenChange = vi.fn()
    render(<Sidebar items={items} open={true} onOpenChange={onOpenChange} />)
    fireEvent.keyDown(window, { key: "b", ctrlKey: true })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("ignores keyboard shortcut when focus is in an input", () => {
    const onOpenChange = vi.fn()
    render(
      <>
        <input data-testid="text" />
        <Sidebar items={items} open={true} onOpenChange={onOpenChange} />
      </>,
    )
    const input = screen.getByTestId("text") as HTMLInputElement
    input.focus()
    fireEvent.keyDown(input, { key: "b", ctrlKey: true })
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it("does NOT toggle on shortcut when keyboardShortcut={null}", () => {
    const onOpenChange = vi.fn()
    render(
      <Sidebar items={items} open={true} onOpenChange={onOpenChange} keyboardShortcut={null} />,
    )
    fireEvent.keyDown(window, { key: "b", ctrlKey: true })
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  describe("persistOpenState (uncontrolled)", () => {
    afterEach(() => {
      // Wipe any cookies set by tests.
      const all = document.cookie.split(";")
      for (const c of all) {
        const eq = c.indexOf("=")
        const name = (eq > -1 ? c.substring(0, eq) : c).trim()
        if (name) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
        }
      }
    })

    it("reads initial open state from cookie when present", () => {
      document.cookie = "amf-ui:sidebar:state=false; path=/"
      const { container } = render(<Sidebar items={items} persistOpenState defaultOpen />)
      const aside = container.querySelector("aside[data-slot='sidebar']") as HTMLElement
      // Cookie said `false`, defaultOpen is true — cookie wins.
      expect(aside.getAttribute("data-state")).toBe("collapsed")
    })

    it("falls back to defaultOpen when cookie is absent", () => {
      const { container } = render(<Sidebar items={items} persistOpenState defaultOpen={false} />)
      const aside = container.querySelector("aside[data-slot='sidebar']") as HTMLElement
      expect(aside.getAttribute("data-state")).toBe("collapsed")
    })

    it("writes cookie when toggled via keyboard shortcut", () => {
      // jsdom won't persist `Secure` cookies over the default http://localhost
      // origin, so we spy on the setter directly to assert the write happens.
      const proto = Object.getPrototypeOf(document) as Document
      const original = Object.getOwnPropertyDescriptor(proto, "cookie")
      const setSpy = vi.fn()
      Object.defineProperty(document, "cookie", {
        configurable: true,
        get: () => "",
        set: setSpy,
      })
      try {
        render(<Sidebar items={items} persistOpenState defaultOpen />)
        fireEvent.keyDown(window, { key: "b", metaKey: true })
        const writes = setSpy.mock.calls.map((c) => c[0] as string)
        expect(writes.some((w) => w.includes("amf-ui:sidebar:state=false"))).toBe(true)
      } finally {
        if (original) Object.defineProperty(proto, "cookie", original)
      }
    })
  })

  describe("mobile rendering (Sheet branch)", () => {
    beforeEach(() => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: (query: string) => ({
          matches: true,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }),
      })
    })

    afterEach(() => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: (query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }),
      })
    })

    it("wraps the sidebar in a Sheet when isMobile=true", () => {
      render(
        <Sidebar
          items={items}
          header={<div data-testid="hdr">Logo</div>}
          footer={<div data-testid="ftr">User</div>}
          open={true}
        />,
      )
      // The Sheet's Dialog Title is rendered ("Sidebar"); the mobile aside has
      // data-mobile="true" on the inner sidebar wrapper.
      const mobileWrap = document.querySelector('[data-slot="sidebar"][data-mobile="true"]')
      expect(mobileWrap).toBeTruthy()
      expect(screen.getByTestId("hdr")).toBeInTheDocument()
      expect(screen.getByTestId("ftr")).toBeInTheDocument()
    })

    it("falls back to aside rendering when collapsible='none' even on mobile", () => {
      const { container } = render(<Sidebar items={items} collapsible="none" />)
      const aside = container.querySelector("aside[data-slot='sidebar']")
      expect(aside).toBeTruthy()
    })
  })
})
