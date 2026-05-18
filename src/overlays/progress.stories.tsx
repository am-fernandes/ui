import type { Meta, StoryObj } from "@storybook/react"
import { expect, within } from "@storybook/test"

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
          "- `value: number` — progresso atual de 0 a 100. Omita (ou passe `undefined`) para estado indeterminado.",
          "- `max: number` — valor máximo. Default `100`.",
          "- Aceita demais props do `Radix Progress.Root` e do `<div>` nativo (`className`, `aria-label`, etc.).",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Progress } from "@am-fernandes/ui"',
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
      description: "Progresso atual (0–100). Omita para estado indeterminado.",
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

export const Indeterminate: Story = {
  args: {},
}

export const Zero: Story = {
  args: { value: 0 },
}

export const Full: Story = {
  args: { value: 100 },
}
