import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LayoutDashboard, Users } from "lucide-react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Sidebar, type SidebarItem } from "./sidebar"

const items: SidebarItem[] = [
  { id: "dash", label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { id: "users", label: "Usuários", icon: Users, href: "/users" },
]

const baseProps = {
  brand: <span>A</span>,
  user: { name: "Matheus Sena" },
  onProfileClick: () => {},
  onSignOut: () => {},
}

describe("Sidebar", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })
  afterEach(() => {
    window.localStorage.clear()
  })

  it("renders the brand inside the toggle button", () => {
    render(
      <Sidebar
        {...baseProps}
        items={items}
        defaultCollapsed={false}
        brand={<span data-testid="brand">LOGO</span>}
      />,
    )
    expect(screen.getByTestId("brand")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /recolher menu/i })).toBeInTheDocument()
  })

  it("renders items in expanded mode", () => {
    render(<Sidebar {...baseProps} items={items} defaultCollapsed={false} />)
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Usuários")).toBeInTheDocument()
  })

  it("hides labels when collapsed", () => {
    render(<Sidebar {...baseProps} items={items} defaultCollapsed={true} />)
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument()
    expect(screen.queryByText("Usuários")).not.toBeInTheDocument()
  })

  it("toggle button flips collapsed state and persists to localStorage", async () => {
    render(<Sidebar {...baseProps} items={items} defaultCollapsed={true} />)
    const toggle = screen.getByRole("button", { name: /expandir menu/i })
    await userEvent.click(toggle)
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(window.localStorage.getItem("amf-ui:sidebar:collapsed")).toBe("false")
  })

  it("reads initial collapsed state from localStorage when present", () => {
    window.localStorage.setItem("amf-ui:sidebar:collapsed", "false")
    render(<Sidebar {...baseProps} items={items} defaultCollapsed={true} />)
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
  })

  it("renders user name when expanded", () => {
    render(
      <Sidebar
        {...baseProps}
        items={items}
        defaultCollapsed={false}
        user={{ name: "Matheus Sena" }}
      />,
    )
    expect(screen.getByText("Matheus Sena")).toBeInTheDocument()
  })

  it("uses explicit `initials` when provided", () => {
    render(
      <Sidebar
        {...baseProps}
        items={items}
        user={{ name: "Matheus Sena", initials: "MS" }}
        defaultCollapsed={false}
      />,
    )
    expect(screen.getByText("MS")).toBeInTheDocument()
  })

  it("fires onProfileClick from the avatar button", async () => {
    const onProfileClick = vi.fn()
    render(
      <Sidebar
        {...baseProps}
        items={items}
        defaultCollapsed={false}
        onProfileClick={onProfileClick}
      />,
    )
    const profileButtons = screen.getAllByRole("button", { name: /editar perfil/i })
    await userEvent.click(profileButtons[0]!)
    expect(onProfileClick).toHaveBeenCalledTimes(1)
  })

  it("opens the confirmation dialog when clicking Sair", async () => {
    const onSignOut = vi.fn()
    render(<Sidebar {...baseProps} items={items} defaultCollapsed={false} onSignOut={onSignOut} />)
    await userEvent.click(screen.getByRole("button", { name: /sair/i }))
    expect(onSignOut).not.toHaveBeenCalled()
    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
    expect(screen.getByText(/tem certeza que deseja sair/i)).toBeInTheDocument()
  })

  it("fires onSignOut when the confirmation is accepted", async () => {
    const onSignOut = vi.fn()
    render(<Sidebar {...baseProps} items={items} defaultCollapsed={false} onSignOut={onSignOut} />)
    await userEvent.click(screen.getByRole("button", { name: /sair/i }))
    const dialog = screen.getByRole("alertdialog")
    const confirmBtn = Array.from(dialog.querySelectorAll("button")).find(
      (b) => b.textContent?.trim() === "Sair",
    )
    if (confirmBtn) await userEvent.click(confirmBtn)
    expect(onSignOut).toHaveBeenCalledTimes(1)
  })

  it("skips the dialog when disableSignOutConfirm is set", async () => {
    const onSignOut = vi.fn()
    render(
      <Sidebar
        {...baseProps}
        items={items}
        defaultCollapsed={false}
        disableSignOutConfirm
        onSignOut={onSignOut}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: /sair/i }))
    expect(onSignOut).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })

  it("renders item.badge when expanded", () => {
    render(
      <Sidebar
        {...baseProps}
        defaultCollapsed={false}
        items={[{ ...items[0]!, badge: <span data-testid="b">3</span> }]}
      />,
    )
    expect(screen.getByTestId("b")).toBeInTheDocument()
  })

  it("hides badges when collapsed", () => {
    render(
      <Sidebar
        {...baseProps}
        defaultCollapsed={true}
        items={[{ ...items[0]!, badge: <span data-testid="b">3</span> }]}
      />,
    )
    expect(screen.queryByTestId("b")).not.toBeInTheDocument()
  })

  it("marks active item via isActive callback", () => {
    render(
      <Sidebar
        {...baseProps}
        items={items}
        defaultCollapsed={false}
        isActive={(it) => it.id === "dash"}
      />,
    )
    const dash = screen.getByText("Dashboard").closest("a")
    expect(dash).toHaveAttribute("data-active", "true")
  })

  it("renders submenu when item has children and defaultOpen: true", () => {
    render(
      <Sidebar
        {...baseProps}
        defaultCollapsed={false}
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

  it("submenu is collapsed by default", () => {
    render(
      <Sidebar
        {...baseProps}
        defaultCollapsed={false}
        items={[
          {
            id: "reports",
            label: "Relatórios",
            items: [{ id: "fin", label: "Financeiro", href: "/fin" }],
          },
        ]}
      />,
    )
    expect(screen.queryByText("Financeiro")).not.toBeInTheDocument()
    const trigger = screen.getByRole("button", { name: /relatórios/i })
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
  })

  it("clicking submenu trigger toggles open/closed", async () => {
    render(
      <Sidebar
        {...baseProps}
        defaultCollapsed={false}
        items={[
          {
            id: "reports",
            label: "Relatórios",
            items: [{ id: "fin", label: "Financeiro", href: "/fin" }],
          },
        ]}
      />,
    )
    const trigger = screen.getByRole("button", { name: /relatórios/i })
    await userEvent.click(trigger)
    expect(screen.getByText("Financeiro")).toBeInTheDocument()
    await userEvent.click(trigger)
    expect(screen.queryByText("Financeiro")).not.toBeInTheDocument()
  })

  it("renders an item without href as a button and fires onClick", async () => {
    const onClick = vi.fn()
    render(
      <Sidebar
        {...baseProps}
        defaultCollapsed={false}
        items={[{ id: "btn", label: "Configurações", onClick }]}
      />,
    )
    const btn = screen.getByRole("button", { name: /configurações/i })
    expect(btn.tagName).toBe("BUTTON")
    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalled()
  })

  it("base class overrides the browser default text-align: center on buttons", () => {
    render(
      <Sidebar
        {...baseProps}
        defaultCollapsed={false}
        items={[{ id: "btn", label: "Configurações", onClick: () => {} }]}
      />,
    )
    const btn = screen.getByRole("button", { name: /configurações/i })
    expect(btn.className).toContain("text-left")
  })

  it("renders disabled item with aria-disabled when it's an anchor", () => {
    render(
      <Sidebar
        {...baseProps}
        defaultCollapsed={false}
        items={[{ id: "a", label: "Diz", href: "/x", disabled: true }]}
      />,
    )
    const link = screen.getByText("Diz").closest("a") as HTMLAnchorElement
    expect(link.getAttribute("aria-disabled")).toBe("true")
  })

  it("disabled anchor cannot navigate (preventDefault)", () => {
    const itemOnClick = vi.fn()
    const { container } = render(
      <Sidebar
        {...baseProps}
        defaultCollapsed={false}
        items={[{ id: "x", label: "Item X", href: "/x", disabled: true, onClick: itemOnClick }]}
      />,
    )
    const link = container.querySelector('a[aria-disabled="true"]') as HTMLAnchorElement
    const event = new MouseEvent("click", { bubbles: true, cancelable: true })
    const preventDefaultSpy = vi.spyOn(event, "preventDefault")
    link.dispatchEvent(event)
    expect(preventDefaultSpy).toHaveBeenCalled()
    expect(itemOnClick).not.toHaveBeenCalled()
  })
})
