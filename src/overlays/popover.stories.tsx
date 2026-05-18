import type { Meta, StoryObj } from "@storybook/react"

import { Button } from "../primitives/button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

const meta: Meta<typeof Popover> = {
  title: "Overlays/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Painel flutuante ancorado em um trigger. Use para conteúdo contextual leve (filtros, ações secundárias).",
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof Popover>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Abrir</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm">Conteúdo do popover.</p>
      </PopoverContent>
    </Popover>
  ),
}
