import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "@storybook/test"
import {
  Bell,
  Calculator,
  CalendarRange,
  ClipboardList,
  FileText,
  LogOut,
  Monitor,
  RefreshCw,
  Search,
  Table2,
  Users,
} from "lucide-react"

import { Tooltip } from "../overlays/tooltip"
import { Avatar } from "../primitives/avatar"
import { Button } from "../primitives/button"
import { Input } from "../primitives/input"
import { AppShell, type AppShellItem, useAppShell } from "./app-shell"

const STORAGE_KEY = "amf-ui:sidebar:collapsed"

function CountBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-medium text-destructive-foreground">
      {value}
    </span>
  )
}

const items: AppShellItem[] = [
  { id: "leads", label: "Leads", icon: Users, href: "#leads", badge: <CountBadge value={3} /> },
  { id: "calculadora", label: "Calculadora", icon: Calculator, href: "#calculadora" },
  {
    id: "propostas",
    label: "Propostas",
    icon: FileText,
    defaultOpen: true,
    items: [
      {
        id: "pendentes",
        label: "Pendentes",
        href: "#pendentes",
        badge: <CountBadge value={2} />,
      },
      { id: "aprovadas", label: "Aprovadas", href: "#aprovadas" },
      { id: "vendidas", label: "Vendidas", href: "#vendidas" },
    ],
  },
  { id: "csv", label: "Ações CSV", icon: ClipboardList, href: "#csv" },
  { id: "graficos", label: "Gráficos", icon: Monitor, href: "#graficos" },
  { id: "rotinas", label: "Rotinas", icon: RefreshCw, href: "#rotinas" },
  { id: "cronograma", label: "Cronograma de Obra", icon: CalendarRange, href: "#cronograma" },
]

const brand = (
  <div
    aria-hidden
    className="grid size-full place-items-center bg-primary font-mono text-sm font-semibold text-primary-foreground"
  >
    D
  </div>
)

function NavbarContent() {
  const { isMobile } = useAppShell()
  return (
    <>
      {isMobile ? (
        <Button variant="ghost" className="ml-auto size-11 p-0" aria-label="Buscar no sistema">
          <Search className="size-5" />
        </Button>
      ) : (
        <div className="w-80 max-w-full">
          <Input
            label="Buscar no sistema"
            labelPosition="hidden"
            placeholder="Buscar no sistema"
            leadingIcon={<Search className="size-4" />}
          />
        </div>
      )}
      <Button
        variant="ghost"
        className={isMobile ? "size-11 p-0" : "ml-auto size-9 p-0"}
        aria-label="Notificações"
      >
        <Bell className="size-5" />
      </Button>
    </>
  )
}

function AccountFooter() {
  const { collapsed } = useAppShell()
  const avatar = <Avatar alt="Usuário" fallback="U" className="size-8 text-xs" />
  if (collapsed) {
    return (
      <div className="flex justify-center">
        <Tooltip content="Usuário" side="right">
          <button type="button" aria-label="Usuário" className="cursor-pointer rounded-full">
            {avatar}
          </button>
        </Tooltip>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2">
      {avatar}
      <span className="min-w-0 flex-1 truncate text-sm font-medium">Usuário</span>
      <Button variant="ghost" className="size-8 shrink-0 p-0" aria-label="Sair">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}

function LeadsPage({ rows = 24 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <Button>Novo lead</Button>
      </div>
      {/* On narrow screens the table scrolls sideways: the scroll region must
          be reachable by keyboard (axe scrollable-region-focusable). */}
      <section
        aria-label="Tabela de leads"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard access to a scrollable region
        tabIndex={0}
        className="overflow-x-auto rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 font-medium">Nome</th>
              <th className="px-3 py-2.5 font-medium">Telefone</th>
              <th className="px-3 py-2.5 font-medium">Origem</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static demo rows
              <tr key={i} className="border-t">
                <td className="px-3 py-2.5">Lead {i + 1}</td>
                <td className="px-3 py-2.5 font-mono tabular-nums">
                  (11) 9{String(i).padStart(4, "0")}-0000
                </td>
                <td className="px-3 py-2.5">Site</td>
                <td className="px-3 py-2.5">Novo</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

const meta: Meta<typeof AppShell> = {
  title: "Navigation/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Moldura da aplicação: menu lateral, navbar opcional e a área de conteúdo — a única que rola.",
          "",
          "- **Menu** — header opcional (`brand` + `brandText`), os `items` e um `footer` livre. O botão de recolher fica sempre no pé do menu; o estado vai para o localStorage.",
          "- **Navbar** — barra fixa opcional acima do conteúdo, com 64px, a mesma altura do header do menu: as duas bordas ficam na mesma linha.",
          '- **Conteúdo** — `children` dentro de `<main id="conteudo">`, com padding padrão (24px no desktop, 16px no mobile). `contentPadding={false}` desliga.',
          "- **Mobile (< 768px)** — barra de 64px com botão de menu, marca e a navbar à direita. O menu abre num painel à esquerda e fecha ao escolher um item.",
          "",
          "`useAppShell()` devolve `{ collapsed, isMobile, closeMenu }` para o footer, a navbar e a página adaptarem o próprio conteúdo.",
          "",
          'O shell ocupa a altura da tela (`h-dvh`). Embaixo de outra barra (ex.: title bar do Electron), passe `className="h-full"`.',
        ].join("\n"),
      },
    },
  },
  decorators: [
    (Story) => {
      // Each story starts from its own `defaultCollapsed`, not from whatever
      // the previous story left in localStorage.
      try {
        window.localStorage.removeItem(STORAGE_KEY)
      } catch {
        // Storage blocked: nothing to reset.
      }
      return (
        <div data-testid="app-shell-frame" className="h-[640px] overflow-hidden border">
          <Story />
        </div>
      )
    },
  ],
  args: {
    items,
    className: "h-full",
    isActive: (item) => item.id === "leads",
    children: <LeadsPage />,
  },
}
export default meta
type Story = StoryObj<typeof AppShell>

export const Default: Story = {
  args: {
    brand,
    brandText: "Dash",
    defaultCollapsed: false,
    navbar: <NavbarContent />,
    footer: <AccountFooter />,
  },
}

export const Collapsed: Story = {
  args: {
    brand,
    brandText: "Dash",
    defaultCollapsed: true,
    navbar: <NavbarContent />,
    footer: <AccountFooter />,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Trilho de 64px com tooltip nos itens. O footer usa `useAppShell().collapsed` para mostrar só o avatar.",
      },
    },
  },
}

export const RailWithoutIcons: Story = {
  args: {
    defaultCollapsed: true,
    items: [
      { id: "leads", label: "Leads", href: "#leads", badge: <CountBadge value={3} /> },
      { id: "propostas", label: "Propostas", href: "#propostas" },
      { id: "obras", label: "Obras", href: "#obras" },
    ],
    isActive: (item) => item.id === "leads",
  },
  parameters: {
    docs: {
      description: {
        story:
          "No trilho, um item sem `icon` mostra a inicial do rótulo, e um `badge` vira um ponto. O rótulo e o badge continuam no nome acessível (o leitor ouve “Leads, 3”).",
      },
    },
  },
}

export const OnlyItems: Story = {
  args: {
    defaultCollapsed: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Só `items` é obrigatório. Sem header, navbar e footer, o menu começa direto nos itens.",
      },
    },
  },
}

export const BrandAsBackButton: Story = {
  args: {
    brand,
    brandText: "Dash",
    defaultCollapsed: false,
    onBrandClick: () => {},
    items: [
      { id: "lead", label: "Lead", icon: Users, href: "#lead" },
      { id: "projeto", label: "Projeto", icon: FileText, href: "#projeto" },
      { id: "logs", label: "Logs", icon: Table2, href: "#logs" },
    ],
    isActive: (item) => item.id === "lead",
  },
  parameters: {
    docs: {
      description: {
        story:
          'Com `onBrandClick`, a marca vira um botão ("Voltar" por padrão, troque em `labels.brandAction`). Útil quando o menu muda para os itens de uma entidade.',
      },
    },
  },
}

export const WithoutContentPadding: Story = {
  args: {
    brand,
    brandText: "Dash",
    defaultCollapsed: true,
    contentPadding: false,
    children: (
      <div className="grid h-full min-h-[480px] place-items-center bg-muted text-sm text-muted-foreground">
        Mapa / quadro de borda a borda
      </div>
    ),
  },
}

export const UnderTitleBar: Story = {
  args: {
    brand,
    brandText: "Nexus",
    defaultCollapsed: false,
    navbar: <NavbarContent />,
  },
  render: (args) => (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex h-8 shrink-0 items-center border-b px-2.5 text-[11px] font-medium">
        Nexus Tickets
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <AppShell {...args} className="h-full" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Embaixo de uma barra de título própria (Electron), o shell usa `className="h-full"` para ocupar só o espaço que sobra — com `h-dvh` ele passaria 32px do pai e o fim do menu ficaria cortado.',
      },
    },
  },
}

export const CollapseInteraction: Story = {
  args: {
    brand,
    brandText: "Dash",
    defaultCollapsed: false,
    navbar: <NavbarContent />,
    footer: <AccountFooter />,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Teste de interação: o header do menu e a navbar terminam na mesma linha, e o botão do pé do menu alterna entre 256px e o trilho de 64px.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    // The desktop menu only exists from 768px up.
    if (window.innerWidth < 768) return
    const canvas = within(canvasElement)
    const aside = canvasElement.querySelector('[data-slot="app-shell-sidebar"]') as HTMLElement
    const header = canvasElement.querySelector('[data-slot="app-shell-brand"]') as HTMLElement
    const navbar = canvasElement.querySelector('[data-slot="app-shell-navbar"]') as HTMLElement

    const headerBox = header.getBoundingClientRect()
    const navbarBox = navbar.getBoundingClientRect()
    await expect(headerBox.height).toBe(64)
    await expect(navbarBox.height).toBe(64)
    await expect(headerBox.bottom).toBe(navbarBox.bottom)

    await expect(aside.getBoundingClientRect().width).toBe(256)
    await userEvent.click(canvas.getByRole("button", { name: "Recolher menu" }))
    await expect(aside).toHaveAttribute("data-state", "collapsed")
    await expect(canvas.queryByText("Usuário")).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "Expandir menu" }))
    await expect(aside).toHaveAttribute("data-state", "expanded")
    await expect(canvas.getByText("Usuário")).toBeInTheDocument()
  },
}
