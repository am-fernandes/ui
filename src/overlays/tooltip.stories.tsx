import type { Meta, StoryObj } from "@storybook/react"

import { Button } from "../primitives/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

const meta: Meta<typeof Tooltip> = {
  title: "Overlays/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Dica contextual em hover/focus. Envolva o trigger em `TooltipTrigger asChild` e o conteúdo em `TooltipContent`.",
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover</Button>
        </TooltipTrigger>
        <TooltipContent>Dica</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}
