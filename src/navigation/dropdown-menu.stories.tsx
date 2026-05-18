import type { Meta, StoryObj } from "@storybook/react-vite"
import { LogOut, Settings, User } from "lucide-react"

import { Button } from "../primitives/button"
import { DropdownMenu, type DropdownMenuItemData } from "./dropdown-menu"

const sampleItems: DropdownMenuItemData[] = [
  { type: "label", label: "Minha conta" },
  { type: "separator" },
  { label: "Perfil", icon: User, onSelect: () => console.log("perfil") },
  { label: "Configurações", icon: Settings, shortcut: "⌘," },
  { type: "separator" },
  {
    label: "Sair",
    icon: LogOut,
    destructive: true,
    onSelect: () => console.log("sair"),
  },
]

const meta = {
  title: "Navigation/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Menu contextual ancorado em um `trigger` ReactNode. Itens declarados via `items` (união discriminada por `type`).",
          "",
          "**Props principais:**",
          "- `trigger` — ReactNode disparador (recomendado: `Button`). É envolvido por `Trigger asChild` do Radix.",
          "- `items` — array de `DropdownMenuItemData` (item, separator ou label).",
          "- `align` — alinhamento do menu (`'start' | 'center' | 'end'`, default `'start'`).",
          "- `open` / `onOpenChange` — modo controlado.",
          "",
          "**`DropdownMenuItemData` (união discriminada):**",
          "- `{ type?: 'item', label, icon?, onSelect?, disabled?, destructive?, shortcut? }` — item acionável (default quando `type` é omitido). `icon` é um `ComponentType` (ex.: ícones do `lucide-react`).",
          "- `{ type: 'separator' }` — divisor visual entre grupos.",
          "- `{ type: 'label', label }` — rótulo de seção, não interativo.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Button, DropdownMenu } from "@am-fernandes/ui"',
          'import { LogOut, User } from "lucide-react"',
          "",
          "const items = [",
          '  { type: "label", label: "Minha conta" },',
          '  { type: "separator" },',
          '  { label: "Perfil", icon: User, onSelect: () => console.log("perfil") },',
          '  { label: "Sair", icon: LogOut, destructive: true, onSelect: () => console.log("sair") },',
          "]",
          "",
          '<DropdownMenu trigger={<Button variant="outline">Abrir menu</Button>} items={items} />',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    items: {
      control: "object",
      description: "Entradas do menu (`DropdownMenuItemData[]`).",
      table: { type: { summary: "DropdownMenuItemData[]" } },
    },
    trigger: {
      control: false,
      description: "Elemento disparador (ReactNode).",
      table: { type: { summary: "ReactNode" } },
    },
    align: {
      control: "inline-radio",
      options: ["start", "center", "end"],
      description: "Alinhamento do conteúdo em relação ao trigger.",
      table: {
        type: { summary: "'start' | 'center' | 'end'" },
        defaultValue: { summary: "'start'" },
      },
    },
    open: {
      control: false,
      description: "Estado aberto controlado.",
      table: { type: { summary: "boolean" } },
    },
    onOpenChange: {
      control: false,
      description: "Callback ao abrir/fechar.",
      table: { category: "Eventos" },
    },
  },
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    trigger: <Button variant="outline">Abrir menu</Button>,
    align: "start",
    items: sampleItems,
  },
}

export const Default: Story = {
  args: {
    trigger: <Button variant="outline">Abrir menu</Button>,
    items: sampleItems,
  },
}
