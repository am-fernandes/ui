import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command"

const meta = {
  title: "Navigation/Command",
  component: Command,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Command palette com busca fuzzy. Use para spotlight de ações ou listas grandes com filtro instantâneo. Base do `Combobox`.",
      },
    },
  },
} satisfies Meta<typeof Command>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[400px]">
      <CommandInput placeholder="Digite um comando ou busque…" />
      <CommandList>
        <CommandGroup heading="Sugestões">
          <CommandItem>Calendário</CommandItem>
          <CommandItem>Buscar emoji</CommandItem>
          <CommandItem>Calculadora</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Configurações">
          <CommandItem>
            Perfil
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}
