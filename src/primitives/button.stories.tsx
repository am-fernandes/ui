import type { Meta, StoryObj } from "@storybook/react-vite"
import { Plus, Search } from "lucide-react"
import { Button } from "./button"

const meta = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Botão base do design system. 6 variantes (default, destructive, outline, secondary, ghost, link) + sizes `default` e `icon`. Suporta `asChild` para renderizar como link.",
          "",
          "**Props principais:**",
          "- `variant` — estilo visual (cor de fundo, borda, etc.).",
          "- `size` — `default` para botões com texto, `icon` para botões quadrados de ícone.",
          "- `disabled` — desabilita o botão e remove o cursor.",
          "- `asChild` — renderiza o filho diretamente (use com `<a>` ou `<Link>`), aplicando os estilos via `Slot` do Radix.",
          "- `onClick`, `type` e demais atributos HTML de `<button>` são repassados.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "Estilo visual do botão.",
      table: {
        type: {
          summary: "'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'",
        },
        defaultValue: { summary: "'default'" },
      },
    },
    size: {
      control: "inline-radio",
      options: ["default", "icon"],
      description: "Tamanho/forma — use `icon` para botões só com ícone.",
      table: {
        type: { summary: "'default' | 'icon'" },
        defaultValue: { summary: "'default'" },
      },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o botão.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    asChild: {
      control: "boolean",
      description:
        "Renderiza o filho como elemento raiz (útil para envolver `<a>` ou `<Link>` mantendo os estilos).",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    children: {
      control: "text",
      description: "Conteúdo do botão (texto, ícone ou ambos).",
      table: { type: { summary: "ReactNode" } },
    },
    className: {
      control: "text",
      description: "Classes Tailwind extras.",
      table: { type: { summary: "string" } },
    },
    onClick: {
      control: false,
      description: "Handler de clique.",
      table: { category: "Eventos", type: { summary: "(e: MouseEvent) => void" } },
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    variant: "default",
    size: "default",
    disabled: false,
    asChild: false,
    children: "Botão",
  },
}

export const Default: Story = {
  args: { children: "Button" },
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="default">default</Button>
      <Button variant="destructive">destructive</Button>
      <Button variant="outline">outline</Button>
      <Button variant="secondary">secondary</Button>
      <Button variant="ghost">ghost</Button>
      <Button variant="link">link</Button>
    </div>
  ),
}

export const WithIconOnly: Story = {
  render: () => (
    <Button size="icon" aria-label="Search">
      <Search className="size-4" />
    </Button>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <Button>
      <Plus className="size-4" />
      Adicionar
    </Button>
  ),
}

export const Disabled: Story = {
  args: { children: "Button", disabled: true },
}
