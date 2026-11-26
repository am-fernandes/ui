import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "@storybook/test"
import {
  Archive,
  ChevronDown,
  Copy,
  ExternalLink,
  FolderInput,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react"
import * as React from "react"

import { Button } from "../primitives/button"
import { IconButton } from "../primitives/icon-button"
import { Dialog } from "./dialog"
import { DropdownMenu, type DropdownMenuEntry } from "./dropdown-menu"

const actions: DropdownMenuEntry[] = [
  { label: "Editar", icon: Pencil, shortcut: "⌘E" },
  { label: "Duplicar", icon: Copy, shortcut: "⌘D" },
  { label: "Compartilhar", icon: Share2 },
  { type: "separator" },
  { label: "Arquivar", icon: Archive, disabled: true },
  { label: "Excluir", icon: Trash2, variant: "destructive" },
]

const meta = {
  title: "Overlays/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Menu de ações preso a um gatilho (`Button`, `IconButton`…). Data-driven: descreva as linhas em `items`.",
          "",
          '- **Ação** (padrão) — `{ label, icon?, shortcut?, onSelect?, href?, variant?: "destructive", disabled?, keepOpen? }`. Com `href`, a linha vira link de verdade.',
          '- **Checkbox** — `{ type: "checkbox", label, checked, onCheckedChange, keepOpen? }`.',
          '- **Rádio** — `{ type: "radio", label?, value, onValueChange, options }`.',
          '- **Grupo** — `{ type: "group", label?, items }`. **Separador** — `{ type: "separator" }`.',
          '- **Submenu** — `{ type: "submenu", label, icon?, items }`.',
          "",
          "Teclado completo: setas, Home/End, busca por letra, Enter/Espaço, Esc devolve o foco ao gatilho.",
          "Para navegar entre páginas use `AppShell`/`Tabs`; para escolher um valor de formulário use `Combobox`.",
        ].join("\n"),
      },
    },
  },
  args: {
    trigger: (
      <Button variant="outline">
        Ações <ChevronDown />
      </Button>
    ),
    items: actions,
  },
} satisfies Meta<typeof DropdownMenu>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const RowActions: Story = {
  render: (args) => (
    <div className="flex w-96 max-w-full flex-col divide-y rounded-md border">
      {[
        { id: "1042", buyer: "Ana Souza · R$ 412.000,00" },
        { id: "1043", buyer: "Bruno Lima · R$ 389.500,00" },
      ].map((row) => (
        <div key={row.id} className="flex items-center justify-between gap-3 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Proposta #{row.id}</p>
            <p className="truncate text-xs text-muted-foreground">{row.buyer}</p>
          </div>
          <DropdownMenu
            {...args}
            trigger={
              <IconButton
                icon={<MoreHorizontal />}
                label={`Ações da proposta #${row.id}`}
                size="sm"
              />
            }
            align="end"
            modal={false}
          />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'O caso mais comum: o “…” no fim de uma linha, com um `IconButton` de gatilho e o menu alinhado pela direita (`align="end"`). Em linhas de tabela use `modal={false}`: com o menu de uma linha aberto, um clique no “…” de outra já abre o dela (com o padrão `modal`, o primeiro clique só fecha o menu aberto).',
      },
    },
  },
}

function ColumnsMenu() {
  const [visible, setVisible] = React.useState({ nome: true, cpf: true, telefone: false })
  const toggle = (key: keyof typeof visible) => (checked: boolean) =>
    setVisible((current) => ({ ...current, [key]: checked }))
  return (
    <DropdownMenu
      trigger={<Button variant="outline">Colunas</Button>}
      items={[
        {
          type: "group",
          label: "Colunas visíveis",
          items: [
            {
              type: "checkbox",
              label: "Nome",
              checked: visible.nome,
              onCheckedChange: toggle("nome"),
              keepOpen: true,
            },
            {
              type: "checkbox",
              label: "CPF",
              checked: visible.cpf,
              onCheckedChange: toggle("cpf"),
              keepOpen: true,
            },
            {
              type: "checkbox",
              label: "Telefone",
              checked: visible.telefone,
              onCheckedChange: toggle("telefone"),
              keepOpen: true,
            },
          ],
        },
      ]}
    />
  )
}

export const CheckboxItems: Story = {
  render: () => <ColumnsMenu />,
  parameters: {
    docs: {
      description: {
        story:
          "Opções independentes. Com `keepOpen`, o menu fica aberto para marcar várias de uma vez.",
      },
    },
  },
}

function SortMenu() {
  const [order, setOrder] = React.useState("recentes")
  const labels: Record<string, string> = {
    recentes: "Mais recentes",
    antigos: "Mais antigos",
    valor: "Maior valor",
  }
  return (
    <DropdownMenu
      trigger={
        <Button variant="outline">
          Ordenar: {labels[order]} <ChevronDown />
        </Button>
      }
      items={[
        {
          type: "radio",
          label: "Ordenar por",
          value: order,
          onValueChange: setOrder,
          options: Object.entries(labels).map(([value, label]) => ({ value, label })),
        },
      ]}
    />
  )
}

export const RadioGroup: Story = {
  render: () => <SortMenu />,
  parameters: {
    docs: {
      description: {
        story:
          "Uma escolha entre várias. Para filtrar dados na própria tela, considere também um controle sempre visível.",
      },
    },
  },
}

export const GroupsAndSubmenu: Story = {
  args: {
    items: [
      {
        type: "group",
        label: "Proposta",
        items: [
          { label: "Editar", icon: Pencil },
          { label: "Duplicar", icon: Copy },
        ],
      },
      {
        type: "submenu",
        label: "Mover para",
        icon: FolderInput,
        items: [{ label: "Pendentes" }, { label: "Aprovadas" }, { label: "Vendidas" }],
      },
      { type: "separator" },
      { label: "Excluir", icon: Trash2, variant: "destructive" },
    ],
  },
}

export const Links: Story = {
  args: {
    items: [
      { label: "Abrir proposta", href: "#proposta" },
      { label: "Abrir em nova aba", href: "#proposta", target: "_blank", icon: ExternalLink },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Com `href`, a linha é um `<a>` de verdade: clique do meio e ⌘-clique continuam funcionando. Protocolos inseguros (`javascript:`…) são descartados.",
      },
    },
  },
}

export const InsideDialog: Story = {
  render: () => (
    <Dialog trigger={<Button>Abrir proposta</Button>} title="Proposta #1042">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm">Cliente: Ana Souza</p>
        <DropdownMenu
          trigger={<IconButton icon={<MoreHorizontal />} label="Ações da proposta" />}
          items={actions}
          align="end"
        />
      </div>
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Dentro de um `Dialog`: Esc e o clique num item fecham só o menu — o diálogo continua aberto.",
      },
    },
  },
}

export const Interaction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Teste de interação: abre pelo clique, confere os itens e fecha com Esc, devolvendo o foco ao gatilho.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)
    // Grab the trigger first: while the modal menu is open the rest of the
    // page is hidden from the accessibility tree.
    const trigger = canvas.getByRole("button", { name: "Ações" })
    await userEvent.click(trigger)
    const menu = await body.findByRole("menu")
    await expect(within(menu).getAllByRole("menuitem")).toHaveLength(5)
    await expect(within(menu).getByRole("menuitem", { name: "Arquivar" })).toHaveAttribute(
      "aria-disabled",
      "true",
    )
    await userEvent.keyboard("{Escape}")
    // Focus goes back to the trigger and the page leaves aria-hidden when the
    // menu unmounts, at the end of its exit animation.
    await waitFor(() =>
      expect(document.querySelector('[data-slot="dropdown-menu-content"]')).toBeNull(),
    )
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}
