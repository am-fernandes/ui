import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command"

type PlaygroundArgs = {
  placeholder: string
  emptyMessage: string
  groupHeading: string
}

const meta: Meta<PlaygroundArgs> = {
  title: "Navigation/Command",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Command palette com busca fuzzy (baseado em `cmdk`). Útil para spotlight de ações ou listas grandes com filtro instantâneo. Também é a base do `Combobox`.",
          "",
          "**Composição:**",
          "- `Command` — container raiz (`flex flex-col`).",
          "- `CommandInput` — input de busca com ícone. Prop chave: `placeholder`.",
          "- `CommandList` — lista rolável (`max-h-[300px]`).",
          "- `CommandEmpty` — mensagem exibida quando nenhum item bate com a busca.",
          "- `CommandGroup` — agrupa itens. Prop chave: `heading`.",
          "- `CommandItem` — item selecionável. Props chave: `value`, `disabled`, `onSelect`.",
          "- `CommandSeparator` — divisor entre grupos.",
          "- `CommandShortcut` — atalho exibido à direita do item.",
          "- `CommandDialog` — wrapper que monta o Command dentro de um `Dialog` (modal estilo Spotlight).",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder do `CommandInput`.",
      table: { type: { summary: "string" }, category: "CommandInput" },
    },
    emptyMessage: {
      control: "text",
      description: "Texto exibido em `CommandEmpty` quando não há resultados.",
      table: { type: { summary: "string" }, category: "CommandEmpty" },
    },
    groupHeading: {
      control: "text",
      description: "Heading do `CommandGroup`.",
      table: { type: { summary: "string" }, category: "CommandGroup" },
    },
  },
}

export default meta
type Story = StoryObj<PlaygroundArgs>

export const Playground: Story = {
  args: {
    placeholder: "Digite um comando ou busque…",
    emptyMessage: "Nenhum resultado.",
    groupHeading: "Sugestões",
  },
  render: (args) => (
    <Command className="rounded-lg border shadow-md w-[400px]">
      <CommandInput placeholder={args.placeholder} />
      <CommandList>
        <CommandEmpty>{args.emptyMessage}</CommandEmpty>
        <CommandGroup heading={args.groupHeading}>
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
