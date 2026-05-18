import type { Meta, StoryObj } from "@storybook/react-vite"
import { Badge } from "./badge"

const meta = {
  title: "Primitives/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Etiqueta compacta para status, tags ou contadores. 4 variantes (default, secondary, destructive, outline) com cores semânticas.",
          "",
          "**Props principais:**",
          "- `variant` — controla a cor: `default` (primary), `secondary`, `destructive`, `outline`.",
          "- `className` — para ajustes pontuais (raio, padding, cores).",
          "- Aceita todos os atributos HTML de `<div>` (clique, role, etc.).",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Badge } from "@am-fernandes/ui"',
          "",
          "<Badge>Novo</Badge>",
          '<Badge variant="secondary">Rascunho</Badge>',
          '<Badge variant="destructive">Erro</Badge>',
          '<Badge variant="outline">Beta</Badge>',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "secondary", "destructive", "outline"],
      description: "Cor/estilo do badge.",
      table: {
        type: { summary: "'default' | 'secondary' | 'destructive' | 'outline'" },
        defaultValue: { summary: "'default'" },
      },
    },
    children: {
      control: "text",
      description: "Conteúdo do badge (texto ou ícone).",
      table: { type: { summary: "ReactNode" } },
    },
    className: {
      control: "text",
      description: "Classes Tailwind extras.",
      table: { type: { summary: "string" } },
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    variant: "default",
    children: "Badge",
  },
}

export const Default: Story = {
  args: { children: "Badge" },
}

export const Variants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge variant="default">default</Badge>
      <Badge variant="secondary">secondary</Badge>
      <Badge variant="destructive">destructive</Badge>
      <Badge variant="outline">outline</Badge>
    </div>
  ),
}
