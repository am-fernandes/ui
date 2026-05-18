import type { Meta, StoryObj } from "@storybook/react-vite"
import { Skeleton } from "./skeleton"

const meta = {
  title: "Primitives/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Placeholder pulsante para conteúdo em carregamento. Componha múltiplos para simular layouts.",
          "",
          "**Props principais:**",
          "- `className` — define dimensões e forma (`h-4 w-64`, `rounded-full`, etc.).",
          "- Aceita todos os atributos HTML de `<div>` (ex.: `aria-hidden`, `role`).",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    className: {
      control: "text",
      description:
        "Classes Tailwind que definem tamanho e forma do skeleton (`h-4 w-64`, `rounded-full`, etc.).",
      table: { type: { summary: "string" } },
    },
  },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    className: "h-4 w-64",
  },
}

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-64" />,
}

export const Card: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  ),
}
