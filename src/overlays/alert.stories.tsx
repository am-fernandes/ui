import type { Meta, StoryObj } from "@storybook/react-vite"
import { CheckCircle2, Info, OctagonAlert, TriangleAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "./alert"

const meta = {
  title: "Overlays/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Mensagem inline para feedback ou destaque. 5 variantes (default + info/success/warning/destructive) usando paletas WCAG AA.",
      },
    },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

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
