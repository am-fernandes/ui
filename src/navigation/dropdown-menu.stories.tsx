import type { Meta, StoryObj } from "@storybook/react-vite"
import { LogOut, Settings, User } from "lucide-react"

import { Button } from "../primitives/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItems,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"

const meta = {
  title: "Navigation/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Abrir menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Perfil</DropdownMenuItem>
        <DropdownMenuItem>Configurações</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

export const WithItemsAPI: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItems
          items={[
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
          ]}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
