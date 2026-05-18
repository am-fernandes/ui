import type { Meta, StoryObj } from "@storybook/react-vite"
import { BuildingIcon, CrownIcon, ZapIcon } from "lucide-react"

import { RadioGroup } from "./radio-group"

const meta: Meta<typeof RadioGroup> = {
  title: "Primitives/RadioGroup",
  component: RadioGroup,
}
export default meta
type Story = StoryObj<typeof RadioGroup>

export const Default: Story = {
  args: {
    label: "Plano",
    values: [
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro" },
    ],
  },
}

export const WithDescriptions: Story = {
  args: {
    label: "Escolha um plano",
    values: [
      { value: "free", label: "Free", description: "R$ 0/mês", icon: ZapIcon },
      { value: "pro", label: "Pro", description: "R$ 29/mês", icon: CrownIcon },
      {
        value: "team",
        label: "Team",
        description: "R$ 99/mês",
        icon: BuildingIcon,
        disabled: true,
      },
    ],
  },
}

export const Horizontal: Story = {
  args: {
    label: "Tamanho",
    orientation: "horizontal",
    values: [
      { value: "s", label: "P" },
      { value: "m", label: "M" },
      { value: "l", label: "G" },
    ],
  },
}

export const WithError: Story = {
  args: {
    label: "Plano",
    error: "Selecione uma opção",
    values: [
      { value: "a", label: "A" },
      { value: "b", label: "B" },
    ],
  },
}
