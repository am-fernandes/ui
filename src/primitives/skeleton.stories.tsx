import type { Meta, StoryObj } from "@storybook/react-vite"

import { Skeleton } from "./skeleton"

const meta: Meta<typeof Skeleton> = {
  title: "Primitives/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          'Placeholder pulsante para conteúdo em carregamento. É um `<div>` com `animate-pulse`, `role="status"`, `aria-busy="true"` e `aria-live="polite"`.',
          "",
          "**API:**",
          "- `className` — define dimensões e formato (`h-4 w-48`, `size-12 rounded-full`, etc).",
          "- Aceita todos os atributos HTML de `<div>` (`aria-label`, `data-*`, etc.).",
          "",
          "**Padrão de uso:** componha múltiplos skeletons em layouts que espelham a UI final.",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Skeleton } from "@am-fernandes/ui"',
          "",
          '<div className="flex items-center gap-4">',
          '  <Skeleton className="size-12 rounded-full" />',
          '  <div className="space-y-2">',
          '    <Skeleton className="h-4 w-48" />',
          '    <Skeleton className="h-4 w-32" />',
          "  </div>",
          "</div>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    className: {
      control: "text",
      description:
        "Classes Tailwind que definem tamanho e forma (`h-4 w-64`, `rounded-full`, etc).",
      table: { type: { summary: "string" } },
    },
  },
}
export default meta
type Story = StoryObj<typeof Skeleton>

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
  parameters: {
    docs: { description: { story: "Skeleton retangular padrão para uma linha de texto." } },
  },
}

export const Circle: Story = {
  render: () => <Skeleton className="size-12 rounded-full" />,
  parameters: {
    docs: { description: { story: "Círculo perfeito — útil como placeholder de avatar." } },
  },
}

export const TextBlock: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Bloco de texto: um título mais alto seguido de linhas de corpo, com a última encurtada para parecer natural.",
      },
    },
  },
}

export const AvatarRow: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Avatar + duas linhas de texto — pattern muito comum em listas de usuários, comentários e contatos.",
      },
    },
  },
}

export const Card: Story = {
  render: () => (
    <div className="w-72 overflow-hidden rounded-lg border bg-card shadow-sm">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="mt-2 flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Card com imagem, título, texto e autor — replicando layout real enquanto carrega.",
      },
    },
  },
}

export const TableRows: Story = {
  render: () => (
    <div className="w-[480px] overflow-hidden rounded-md border">
      <div className="grid grid-cols-[1fr_1fr_80px] gap-4 border-b bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground">
        <span>Nome</span>
        <span>E-mail</span>
        <span>Plano</span>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows have no stable id
          key={i}
          className="grid grid-cols-[1fr_1fr_80px] items-center gap-4 border-b px-4 py-3 last:border-b-0"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Esqueleto de tabela com 4 linhas — ideal para data tables enquanto carregam.",
      },
    },
  },
}

export const ListItems: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows have no stable id
          key={i}
          className="flex items-center gap-3 rounded-md border p-3"
        >
          <Skeleton className="size-10 rounded-md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="size-6 rounded-md" />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Lista vertical de itens (thumbnail + label + descrição + ação à direita). Comum em feeds e inbox.",
      },
    },
  },
}
