import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "@storybook/test"
import * as React from "react"

import { Button } from "../primitives/button"
import { Input } from "../primitives/input"
import { Stepper, type StepperStep } from "./stepper"

const steps: StepperStep[] = [
  { label: "Dados pessoais", description: "Nome e CPF" },
  { label: "Endereço", description: "CEP e número" },
  { label: "Documentos", optional: true },
  { label: "Revisão" },
]

const meta = {
  title: "Navigation/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Sequência numerada de etapas para fluxos longos (cadastro, proposta). Mostra onde a pessoa está, o que já foi feito e o que falta.",
          "",
          '- `steps` — `{ label, description?, optional?, disabled?, status?: "error" | "warning", content? }`.',
          "- `activeStep` (a partir de 0): as anteriores ficam concluídas. `activeStep={steps.length}` marca todas como concluídas.",
          "- `onStepClick` deixa as etapas clicáveis (navegação não linear).",
          '- `orientation="vertical"` empilha as etapas e mostra o `content` da etapa atual embaixo dela.',
          "",
          "Na horizontal, quando o espaço não cabe as etapas, o Stepper vira um resumo “Etapa 2 de 4 · Endereço” com uma barra de progresso.",
        ].join("\n"),
      },
    },
  },
  args: { steps, activeStep: 1 },
} satisfies Meta<typeof Stepper>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Completed: Story = {
  args: { activeStep: steps.length },
}

export const WithStatus: Story = {
  args: {
    activeStep: 2,
    steps: [
      { label: "Dados pessoais" },
      { label: "Endereço", status: "error", description: "CEP inválido" },
      { label: "Documentos", status: "warning", description: "RG vencido" },
      { label: "Revisão" },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "`status` pinta a etapa com erro ou alerta, independente do progresso.",
      },
    },
  },
}

function ClickableStepper() {
  const [active, setActive] = React.useState(1)
  return (
    <Stepper
      steps={[...steps.slice(0, 3), { label: "Revisão", disabled: active < 2 }]}
      activeStep={active}
      onStepClick={setActive}
    />
  )
}

export const Clickable: Story = {
  render: () => <ClickableStepper />,
  parameters: {
    docs: {
      description: {
        story:
          "Com `onStepClick`, as etapas viram botões. Etapas `disabled` não podem ser escolhidas.",
      },
    },
  },
}

function BackOnlyStepper() {
  const [active, setActive] = React.useState(2)
  return (
    <div className="flex flex-col gap-4">
      <Stepper
        steps={steps}
        activeStep={active}
        onStepClick={setActive}
        isStepClickable={(index) => index < active}
      />
      <div className="flex gap-2">
        <Button onClick={() => setActive((a) => Math.min(a + 1, steps.length - 1))}>
          Continuar
        </Button>
      </div>
    </div>
  )
}

export const BackOnly: Story = {
  render: () => <BackOnlyStepper />,
  parameters: {
    docs: {
      description: {
        story:
          "O assistente comum: dá para voltar a uma etapa concluída, não pular adiante. `isStepClickable={(i) => i < activeStep}` faz só as etapas anteriores virarem botões; as próximas aparecem normais, sem o esmaecido de `disabled`.",
      },
    },
  },
}

function Wizard() {
  const [active, setActive] = React.useState(0)
  const wizardSteps: StepperStep[] = [
    {
      label: "Dados pessoais",
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Nome completo" />
          <Input label="CPF" />
        </div>
      ),
    },
    {
      label: "Endereço",
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="CEP" />
          <Input label="Número" />
        </div>
      ),
    },
    { label: "Revisão", content: <p className="text-sm">Confira os dados antes de enviar.</p> },
  ]
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <Stepper steps={wizardSteps} activeStep={active} orientation="vertical" />
      <div className="flex gap-2 pl-11">
        <Button variant="outline" disabled={active === 0} onClick={() => setActive((a) => a - 1)}>
          Voltar
        </Button>
        <Button onClick={() => setActive((a) => Math.min(a + 1, wizardSteps.length))}>
          {active >= wizardSteps.length - 1 ? "Enviar" : "Continuar"}
        </Button>
      </div>
    </div>
  )
}

export const Vertical: Story = {
  render: () => <Wizard />,
  parameters: {
    docs: {
      description: {
        story:
          "Na vertical, o `content` da etapa atual aparece embaixo dela — bom para formulários em etapas.",
      },
    },
  },
}

export const NarrowContainer: Story = {
  render: (args) => (
    <div className="w-72 rounded-md border p-3">
      <Stepper {...args} onStepClick={() => {}} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Em espaço estreito, a lista vira um resumo com barra de progresso (e setas, quando há `onStepClick`). O corte depende do contêiner, não da tela.",
      },
    },
  },
}

export const Interaction: Story = {
  render: () => <ClickableStepper />,
  parameters: {
    docs: {
      description: {
        story: "Teste de interação: escolhe uma etapa pelo teclado e confere a etapa atual.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const list = canvas.getByRole("list", { name: "Progresso" })
    const buttons = within(list).getAllByRole("button")
    await expect(buttons[1]).toHaveAttribute("aria-current", "step")
    buttons[2]!.focus()
    await userEvent.keyboard("{Enter}")
    await expect(within(list).getAllByRole("button")[2]).toHaveAttribute("aria-current", "step")
    await expect(within(list).getAllByRole("button")[3]).toBeEnabled()
  },
}
