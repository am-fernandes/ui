import type { Meta, StoryObj } from "@storybook/react-vite"
import { Calendar, Home, Inbox, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./sidebar"

type PlaygroundArgs = {
  defaultOpen: boolean
  side: "left" | "right"
  variant: "sidebar" | "floating" | "inset"
  collapsible: "offcanvas" | "icon" | "none"
}

const items = [
  { title: "Home", url: "#", icon: Home },
  { title: "Inbox", url: "#", icon: Inbox },
  { title: "Calendar", url: "#", icon: Calendar },
  { title: "Settings", url: "#", icon: Settings },
]

const meta: Meta<PlaygroundArgs> = {
  title: "Navigation/Sidebar",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Navegação lateral persistente, composicional, com suporte a expandir/colapsar, modo mobile (via Sheet) e atalho `Ctrl/⌘ + B`. Cobre 23 sub-componentes para permitir composição livre.",
          "",
          "**Composição típica:**",
          "1. `SidebarProvider` — envolve a árvore inteira e expõe o estado via `useSidebar`. Props chave: `defaultOpen`, `open`, `onOpenChange`.",
          "2. `Sidebar` — a barra em si. Props: `side` (`left`/`right`), `variant` (`sidebar`/`floating`/`inset`), `collapsible` (`offcanvas`/`icon`/`none`).",
          "3. `SidebarHeader` / `SidebarFooter` — slots fixos no topo/base.",
          "4. `SidebarContent` — área rolável central.",
          "5. `SidebarGroup` + `SidebarGroupLabel` + `SidebarGroupContent` — agrupa seções com título.",
          "6. `SidebarMenu` + `SidebarMenuItem` + `SidebarMenuButton` — lista de navegação. `SidebarMenuButton` aceita `asChild`, `isActive`, `tooltip`, `variant` e `size`.",
          "7. `SidebarMenuSub` + `SidebarMenuSubItem` + `SidebarMenuSubButton` — menu aninhado.",
          "8. `SidebarInset` — área principal de conteúdo ao lado da barra.",
          "9. `SidebarTrigger` / `SidebarRail` — controles para alternar abertura.",
          "10. `SidebarInput`, `SidebarSeparator`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuSkeleton`, `SidebarGroupAction` — utilitários.",
          "",
          "Como a API é composicional, os argTypes abaixo controlam apenas as props mais comuns do `SidebarProvider`/`Sidebar`.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    defaultOpen: {
      control: "boolean",
      description: "Estado inicial do `SidebarProvider` (default `true`).",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
        category: "SidebarProvider",
      },
    },
    side: {
      control: "inline-radio",
      options: ["left", "right"],
      description: "Lado em que a barra ancora.",
      table: {
        type: { summary: "'left' | 'right'" },
        defaultValue: { summary: "'left'" },
        category: "Sidebar",
      },
    },
    variant: {
      control: "inline-radio",
      options: ["sidebar", "floating", "inset"],
      description: "Estilo visual da barra.",
      table: {
        type: { summary: "'sidebar' | 'floating' | 'inset'" },
        defaultValue: { summary: "'sidebar'" },
        category: "Sidebar",
      },
    },
    collapsible: {
      control: "inline-radio",
      options: ["offcanvas", "icon", "none"],
      description:
        "Estratégia ao colapsar: `offcanvas` esconde, `icon` mantém ícones, `none` desliga.",
      table: {
        type: { summary: "'offcanvas' | 'icon' | 'none'" },
        defaultValue: { summary: "'offcanvas'" },
        category: "Sidebar",
      },
    },
  },
}

export default meta
type Story = StoryObj<PlaygroundArgs>

export const Playground: Story = {
  args: {
    defaultOpen: true,
    side: "left",
    variant: "sidebar",
    collapsible: "offcanvas",
  },
  render: (args) => (
    <SidebarProvider defaultOpen={args.defaultOpen}>
      <Sidebar side={args.side} variant={args.variant} collapsible={args.collapsible}>
        <SidebarHeader>
          <div className="px-2 py-1 text-sm font-semibold">AM Fernandes</div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Aplicação</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <h1 className="text-base font-medium">Dashboard</h1>
        </header>
        <main className="p-6">
          <p>Conteúdo principal da aplicação.</p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
}

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="px-2 py-1 text-sm font-semibold">AM Fernandes</div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Aplicação</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <h1 className="text-base font-medium">Dashboard</h1>
        </header>
        <main className="p-6">
          <p>Conteúdo principal da aplicação.</p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
}
