import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  BarChart3,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  Mail,
  Settings,
  Users,
} from "lucide-react"

import { Sidebar, type SidebarItem } from "./sidebar"

const meta: Meta<typeof Sidebar> = {
  title: "Navigation/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Opinionated single-column navigation rail.",
          "",
          "- Top: brand button that toggles collapsed (icon-only) ↔ expanded.",
          "- Middle: flat list of items, with optional one-level submenus.",
          "- Bottom: avatar + user name + edit-profile / sign-out icons.",
          "",
          "API is locked: no header/footer slots, no variants. Pass `brand`,",
          "`user`, `items`, plus `onProfileClick` / `onSignOut` callbacks.",
        ].join("\n"),
      },
    },
  },
  args: {
    brand: (
      <div className="grid h-full w-full place-items-center rounded bg-primary text-xs font-semibold text-primary-foreground">
        A
      </div>
    ),
    user: { name: "Matheus Sena" },
    onProfileClick: () => {},
    onSignOut: () => {},
  },
}
export default meta
type Story = StoryObj<typeof Sidebar>

const baseItems: SidebarItem[] = [
  { id: "home", label: "Início", icon: Home, href: "/" },
  { id: "dash", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "users", label: "Usuários", icon: Users, href: "/users" },
  { id: "settings", label: "Configurações", icon: Settings, href: "/settings" },
]

export const Expanded: Story = {
  args: {
    defaultCollapsed: false,
    items: baseItems,
  },
}

export const Collapsed: Story = {
  args: {
    defaultCollapsed: true,
    items: baseItems,
  },
}

export const WithSubmenu: Story = {
  args: {
    defaultCollapsed: false,
    items: [
      { id: "home", label: "Início", icon: Home, href: "/" },
      {
        id: "billing",
        label: "Financeiro",
        icon: CreditCard,
        defaultOpen: true,
        items: [
          { id: "invoices", label: "Faturas", href: "/billing/invoices" },
          { id: "subscriptions", label: "Assinaturas", href: "/billing/subscriptions" },
        ],
      },
      { id: "reports", label: "Relatórios", icon: BarChart3, href: "/reports" },
    ],
  },
}

export const WithBadges: Story = {
  args: {
    defaultCollapsed: false,
    items: [
      {
        id: "inbox",
        label: "Caixa de entrada",
        icon: Mail,
        href: "/inbox",
        badge: (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-medium text-destructive-foreground">
            12
          </span>
        ),
      },
      { id: "docs", label: "Documentos", icon: FileText, href: "/docs" },
    ],
  },
}

export const WithAvatar: Story = {
  args: {
    defaultCollapsed: false,
    items: baseItems,
    user: {
      name: "Ana Souza",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
    },
  },
}

export const ActiveItem: Story = {
  args: {
    defaultCollapsed: false,
    items: baseItems,
    isActive: (item) => item.id === "dash",
  },
}
