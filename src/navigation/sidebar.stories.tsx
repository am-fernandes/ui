import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  BarChart3,
  Bell,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Settings,
  Users,
} from "lucide-react"
import { useState } from "react"

import { Sidebar, type SidebarItem } from "./sidebar"

const meta: Meta<typeof Sidebar> = {
  title: "Navigation/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Sidebar data-driven com agrupamento, submenus, badges, ícones e modos colapsáveis.",
          "",
          "Aceita `items` (lista plana) **ou** `groups` (lista com label por grupo). Em modo `'icon'` colapsa para apenas ícones; em `'offcanvas'` vira drawer no mobile; em `'none'` permanece sempre aberta.",
          "",
          "**Props:**",
          "- `items?: SidebarItem[]` — itens em um único grupo (sem rótulo).",
          "- `groups?: SidebarGroup[]` — múltiplos grupos com `label` opcional.",
          "- `header?` / `footer?: ReactNode` — slots para logo, busca, perfil do usuário etc.",
          "- `collapsible?: 'offcanvas' | 'icon' | 'none'` — comportamento de colapso. Default `'icon'`.",
          "- `side?: 'left' | 'right'` — lado de fixação. Default `'left'`.",
          "- `variant?: 'sidebar' | 'floating' | 'inset'` — variação visual. Default `'sidebar'`.",
          "- `defaultOpen?: boolean` / `open?` / `onOpenChange?` — controle do estado expandido.",
          "- `persistOpenState?: boolean` — persiste estado em cookie (apenas uncontrolled).",
          "- `keyboardShortcut?: string | null` — atalho `Cmd/Ctrl + tecla` para toggle. Default `'b'`.",
          "- `isActive?: (item) => boolean` — marca o item como ativo (rota atual).",
          "",
          "**Shape do item (`SidebarItem`):**",
          "```ts",
          "interface SidebarItem {",
          "  id?: string",
          "  label: React.ReactNode",
          "  icon?: React.ComponentType<{ className?: string }>",
          "  href?: string                       // renderiza <a>, omita para virar <button>",
          "  onClick?: () => void",
          "  badge?: React.ReactNode             // pílula à direita (notificações, contadores)",
          "  disabled?: boolean",
          "  items?: SidebarItem[]               // submenu (1 nível)",
          "  tooltip?: React.ReactNode",
          "}",
          "```",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Sidebar } from "@am-fernandes/ui"',
          'import { Home, Users, Settings } from "lucide-react"',
          "",
          "<Sidebar",
          "  items={[",
          '    { id: "home",  label: "Início",      icon: Home,     href: "/" },',
          '    { id: "users", label: "Usuários",    icon: Users,    href: "/users" },',
          '    { id: "cfg",   label: "Configurações", icon: Settings, href: "/settings" },',
          "  ]}",
          '  isActive={(item) => item.id === "home"}',
          "/>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    items: {
      control: false,
      description: "Itens em um único grupo. Mutuamente exclusivo com `groups`.",
      table: { type: { summary: "SidebarItem[]" } },
    },
    groups: {
      control: false,
      description: "Múltiplos grupos com label opcional.",
      table: { type: { summary: "SidebarGroup[]" } },
    },
    header: {
      control: false,
      description: "Slot superior (logo, busca etc.).",
      table: { type: { summary: "ReactNode" } },
    },
    footer: {
      control: false,
      description: "Slot inferior (perfil, ações secundárias).",
      table: { type: { summary: "ReactNode" } },
    },
    collapsible: {
      control: "inline-radio",
      options: ["offcanvas", "icon", "none"],
      description:
        "`'icon'` colapsa para mostrar só ícones; `'offcanvas'` vira drawer no mobile; `'none'` sempre aberta.",
      table: {
        type: { summary: "'offcanvas' | 'icon' | 'none'" },
        defaultValue: { summary: "'icon'" },
      },
    },
    side: {
      control: "inline-radio",
      options: ["left", "right"],
      description: "Lado de fixação.",
      table: { type: { summary: "'left' | 'right'" }, defaultValue: { summary: "'left'" } },
    },
    variant: {
      control: "inline-radio",
      options: ["sidebar", "floating", "inset"],
      description: "Variação visual.",
      table: {
        type: { summary: "'sidebar' | 'floating' | 'inset'" },
        defaultValue: { summary: "'sidebar'" },
      },
    },
    defaultOpen: {
      control: "boolean",
      description: "Estado inicial expandido (uncontrolled).",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    open: {
      control: false,
      description: "Estado controlado. Use junto com `onOpenChange`.",
      table: { type: { summary: "boolean" } },
    },
    onOpenChange: {
      control: false,
      description: "Disparado ao expandir/colapsar.",
      table: { type: { summary: "(open: boolean) => void" }, category: "Eventos" },
    },
    persistOpenState: {
      control: "boolean",
      description: "Persiste o estado expandido em cookie (apenas em modo uncontrolled).",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    keyboardShortcut: {
      control: "text",
      description: "Tecla usada com Cmd/Ctrl para alternar a sidebar. `null` desativa.",
      table: { type: { summary: "string | null" }, defaultValue: { summary: "'b'" } },
    },
    isActive: {
      control: false,
      description: "Callback para destacar o item ativo (ex.: pela rota atual).",
      table: { type: { summary: "(item: SidebarItem) => boolean" } },
    },
  },
}
export default meta
type Story = StoryObj<typeof Sidebar>

const flatItems: SidebarItem[] = [
  { id: "home", label: "Início", icon: Home, href: "/" },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "users", label: "Usuários", icon: Users, href: "/users" },
  { id: "reports", label: "Relatórios", icon: BarChart3, href: "/reports" },
  { id: "settings", label: "Configurações", icon: Settings, href: "/settings" },
]

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex" style={{ height: "100vh" }}>
      {children}
      <main className="flex-1 overflow-auto p-6">
        <h1 className="text-2xl font-semibold">Conteúdo da página</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use os atalhos da sidebar para navegar. Pressione <kbd>Cmd</kbd>/<kbd>Ctrl</kbd> +{" "}
          <kbd>B</kbd> para alternar o estado expandido.
        </p>
      </main>
    </div>
  )
}

export const FlatItems: Story = {
  args: { items: flatItems },
  render: (args) => (
    <Frame>
      <Sidebar {...args} />
    </Frame>
  ),
}

export const WithGroups: Story = {
  args: {
    groups: [
      {
        label: "Principal",
        items: [
          { id: "home", label: "Início", icon: Home, href: "/" },
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
          { id: "reports", label: "Relatórios", icon: BarChart3, href: "/reports" },
        ],
      },
      {
        label: "Administração",
        items: [
          { id: "users", label: "Usuários", icon: Users, href: "/users" },
          { id: "billing", label: "Cobrança", icon: CreditCard, href: "/billing" },
          { id: "settings", label: "Configurações", icon: Settings, href: "/settings" },
        ],
      },
      {
        label: "Suporte",
        items: [
          { id: "docs", label: "Documentação", icon: FileText, href: "/docs" },
          { id: "help", label: "Ajuda", icon: LifeBuoy, href: "/help" },
        ],
      },
    ],
  },
  render: (args) => (
    <Frame>
      <Sidebar {...args} />
    </Frame>
  ),
}

export const WithSubmenu: Story = {
  args: {
    items: [
      { id: "home", label: "Início", icon: Home, href: "/" },
      {
        id: "reports",
        label: "Relatórios",
        icon: BarChart3,
        items: [
          { id: "fin", label: "Financeiro", href: "/reports/fin" },
          { id: "ops", label: "Operacional", href: "/reports/ops" },
          { id: "hr", label: "RH", href: "/reports/hr" },
        ],
      },
      {
        id: "users",
        label: "Usuários",
        icon: Users,
        items: [
          { id: "list", label: "Lista", href: "/users" },
          { id: "invites", label: "Convites", href: "/users/invites" },
        ],
      },
      { id: "settings", label: "Configurações", icon: Settings, href: "/settings" },
    ],
  },
  render: (args) => (
    <Frame>
      <Sidebar {...args} />
    </Frame>
  ),
}

export const WithHeaderFooter: Story = {
  args: {
    items: flatItems,
    header: (
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold">
          A
        </div>
        <span className="font-semibold">AM Fernandes</span>
      </div>
    ),
    footer: (
      <div className="flex items-center gap-2 border-t px-3 py-3">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
          MS
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Matheus Sena</span>
          <span className="text-xs text-muted-foreground">matheus@empresa.com</span>
        </div>
      </div>
    ),
  },
  render: (args) => (
    <Frame>
      <Sidebar {...args} />
    </Frame>
  ),
}

export const WithBadges: Story = {
  args: {
    items: [
      { id: "home", label: "Início", icon: Home, href: "/" },
      {
        id: "inbox",
        label: "Caixa de entrada",
        icon: Mail,
        href: "/inbox",
        badge: (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
            12
          </span>
        ),
      },
      {
        id: "alerts",
        label: "Alertas",
        icon: Bell,
        href: "/alerts",
        badge: (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-medium text-destructive-foreground">
            3
          </span>
        ),
      },
      { id: "settings", label: "Configurações", icon: Settings, href: "/settings" },
    ],
  },
  render: (args) => (
    <Frame>
      <Sidebar {...args} />
    </Frame>
  ),
}

export const IsActive: Story = {
  render: () => {
    const [active, setActive] = useState("dashboard")
    return (
      <div className="flex" style={{ height: "100vh" }}>
        <Sidebar
          items={flatItems.map((it) => ({
            ...it,
            href: undefined,
            onClick: () => setActive(it.id ?? ""),
          }))}
          isActive={(it) => it.id === active}
        />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-2xl font-semibold">Item ativo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Selecionado: <code>{active}</code>
          </p>
        </main>
      </div>
    )
  },
}

export const CollapsibleIcon: Story = {
  args: { items: flatItems, defaultOpen: false, collapsible: "icon" },
  parameters: {
    docs: {
      description: {
        story:
          "Com `collapsible='icon'` e `defaultOpen={false}`, a sidebar mostra apenas os ícones. Pressione <kbd>Cmd</kbd>+<kbd>B</kbd> para expandir.",
      },
    },
  },
  render: (args) => (
    <Frame>
      <Sidebar {...args} />
    </Frame>
  ),
}

export const Floating: Story = {
  args: { items: flatItems, variant: "floating" },
  render: (args) => (
    <Frame>
      <Sidebar {...args} />
    </Frame>
  ),
}

export const Inset: Story = {
  args: { items: flatItems, variant: "inset" },
  render: (args) => (
    <Frame>
      <Sidebar {...args} />
    </Frame>
  ),
}

export const RightSide: Story = {
  args: { items: flatItems, side: "right" },
  render: (args) => (
    <div className="flex" style={{ height: "100vh" }}>
      <main className="flex-1 overflow-auto p-6">
        <h1 className="text-2xl font-semibold">Conteúdo da página</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sidebar fixada à direita.</p>
      </main>
      <Sidebar {...args} />
    </div>
  ),
}
