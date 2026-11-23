import type { Meta, StoryObj } from "@storybook/react"
import { expect, within } from "@storybook/test"
import { useState } from "react"

import { Button } from "../primitives/button"
import { Progress } from "./progress"

const meta: Meta<typeof Progress> = {
  title: "Overlays/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    a11y: {
      // Decorative demo stories: the component supports `aria-label`/`aria-labelledby` via spread,
      // but these stories render the bar in isolation without a contextual name. Consumers must
      // provide an accessible name in production.
      config: { rules: [{ id: "aria-progressbar-name", enabled: false }] },
    },
    docs: {
      description: {
        component: [
          "Barra de progresso linear. Use para indicar avanço de upload, processamento ou wizards.",
          "",
          "**Props principais:**",
          "- `value: number | null` — progresso atual, de 0 a `max`. `null` ou ausente: indeterminado (uma faixa que corre a barra).",
          "- `max: number` — valor de “concluído”, por exemplo `7` na etapa 3 de 7. Default `100`.",
          "- Aceita demais props do `Radix Progress.Root` e do `<div>` nativo (`className`, `aria-label`, etc.).",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Progress } from "@amfernandesinc/ui"',
          "",
          "<Progress value={60} />",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    value: {
      control: { type: "number", min: 0, max: 100, step: 1 },
      description: "Progresso atual (0–100).",
      table: { type: { summary: "number" } },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof Progress>

export const Playground: Story = {
  args: { value: 60 },
}

export const Default: Story = {
  args: { value: 60 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvas.getByRole("progressbar")
    await expect(bar).toHaveAttribute("aria-valuenow", "60")
  },
}

export const Zero: Story = {
  args: { value: 0 },
}

export const Full: Story = {
  args: { value: 100 },
}

export const WithMax: Story = {
  args: { value: 3, max: 7, "aria-label": "Etapa 3 de 7" },
  parameters: {
    docs: {
      description: { story: "`max` muda a escala: `value={3} max={7}` preenche 3/7 da barra." },
    },
  },
}

export const Indeterminate: Story = {
  args: { value: null, "aria-label": "Importando planilha" },
  parameters: {
    docs: {
      description: {
        story:
          "Sem `value` (ou com `null`): indeterminado, para quando não se sabe quanto falta. Uma faixa corre a barra; com movimento reduzido ela fica parada no meio.",
      },
    },
  },
}

export const Steps: Story = {
  render: () => {
    const [step, setStep] = useState(1)
    return (
      <div className="flex flex-col gap-3">
        <Progress value={step} max={5} aria-label={`Etapa ${step} de 5`} />
        <Button variant="outline" onClick={() => setStep((n) => (n % 5) + 1)}>
          Avançar
        </Button>
      </div>
    )
  },
  parameters: {
    docs: {
      description: { story: "A barra desliza até o valor novo a cada mudança." },
    },
  },
}
