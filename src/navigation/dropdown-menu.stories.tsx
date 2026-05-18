import type { Meta, StoryObj } from "@storybook/react-vite"
import { LogOut, Settings, User } from "lucide-react"

import { Button } from "../primitives/button"
import { DropdownMenu } from "./dropdown-menu"

const meta = {
  title: "Navigation/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Menu contextual ancorado em um `trigger` ReactNode. Itens passados por `items` (entries do tipo `item`, `label` ou `separator`).",
      },
    },
  },
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    trigger: <Button variant="outline">Abrir menu</Button>,
    items: [
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
    ],
  },
}
