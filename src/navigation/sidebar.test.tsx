import { render, screen } from "@testing-library/react"
import { LayoutDashboard, Users } from "lucide-react"
import { describe, expect, it } from "vitest"

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

  it("renders submenu when item has children items", () => {
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
    expect(screen.getByText("Financeiro")).toBeInTheDocument()
    expect(screen.getByText("Operacional")).toBeInTheDocument()
  })
})
