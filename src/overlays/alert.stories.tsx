import type { Meta, StoryObj } from "@storybook/react-vite"
import { CheckCircle2, Info, OctagonAlert, TriangleAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "./alert"

const VARIANT_ICON = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  destructive: OctagonAlert,
} as const

type PlaygroundArgs = {
  variant: keyof typeof VARIANT_ICON
  title: string
  description: string
}

const meta = {
  title: "Overlays/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Mensagem inline para feedback ou destaque visual. API composicional: combine `Alert` + `AlertTitle` + `AlertDescription`.",
          "",
          "**Props principais (`Alert`):**",
          "- `variant` — `'default' | 'info' | 'success' | 'warning' | 'destructive'`. Controla a paleta (todas WCAG AA).",
          "- Aceita todas as props HTML de `div` (ex.: `className`, `role`, `id`).",
          "",
          "**Subcomponentes:**",
          "- `AlertTitle` — heading (`<h5>`) com peso medium e tracking ajustado.",
          "- `AlertDescription` — corpo do alerta, texto secundário.",
          "",
          "Inclua um ícone (ex.: `lucide-react`) como primeiro filho para ganhar o slot lateral automaticamente.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Alert, AlertTitle, AlertDescription } from "@am-fernandes/ui"',
          "",
          '<Alert variant="info">',
          '  <Info className="size-4" />',
          "  <AlertTitle>Atenção</AlertTitle>",
          "  <AlertDescription>Mensagem informativa para o usuário.</AlertDescription>",
          "</Alert>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "info", "success", "warning", "destructive"],
      description: "Paleta semântica do alerta.",
      table: {
        type: { summary: "'default' | 'info' | 'success' | 'warning' | 'destructive'" },
        defaultValue: { summary: "'default'" },
      },
    },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<PlaygroundArgs>

export const Playground: Story = {
  args: {
    variant: "info",
    title: "Atenção",
    description: "Mensagem informativa para o usuário sobre uma ação ou estado do sistema.",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "info", "success", "warning", "destructive"],
      description: "Paleta semântica do alerta.",
      table: {
        type: { summary: "'default' | 'info' | 'success' | 'warning' | 'destructive'" },
        defaultValue: { summary: "'default'" },
      },
    },
    title: {
      control: "text",
      description: "Texto do `AlertTitle`.",
      table: { type: { summary: "string" } },
    },
    description: {
      control: "text",
      description: "Texto do `AlertDescription`.",
      table: { type: { summary: "string" } },
    },
  },
  render: ({ variant, title, description }) => {
    const Icon = VARIANT_ICON[variant]
    return (
      <Alert variant={variant} className="max-w-md">
        <Icon className="size-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    )
  },
}

export const Default: Story = {
  render: () => (
    <Alert className="max-w-md">
      <Info className="size-4" />
      <AlertTitle>Atenção</AlertTitle>
      <AlertDescription>
        Mensagem informativa para o usuário sobre uma ação ou estado do sistema.
      </AlertDescription>
    </Alert>
  ),
}

export const Variants: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Alert>
        <Info className="size-4" />
        <AlertTitle>Default</AlertTitle>
        <AlertDescription>Mensagem neutra do sistema.</AlertDescription>
      </Alert>
      <Alert variant="info">
        <Info className="size-4" />
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>O contrato foi atualizado pela última vez ontem.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <CheckCircle2 className="size-4" />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>Requerimento aprovado com sucesso.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <TriangleAlert className="size-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Prazo vence em menos de 24 horas.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <OctagonAlert className="size-4" />
        <AlertTitle>Destructive</AlertTitle>
        <AlertDescription>Falha ao salvar. Verifique os campos obrigatórios.</AlertDescription>
      </Alert>
    </div>
  ),
}
