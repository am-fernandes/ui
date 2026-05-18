import type { Meta, StoryObj } from "@storybook/react-vite"
import { BuildingIcon, CrownIcon, ZapIcon } from "lucide-react"
import { useState } from "react"

import { RadioGroup } from "./radio-group"

const meta: Meta<typeof RadioGroup> = {
  title: "Primitives/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "RadioGroup data-driven. Passe `values: RadioGroupItemData[]`.",
          "",
          "Cada item: `value`, `label`, opcional `description`, `icon`, `disabled`.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
    orientation: { control: "select", options: ["vertical", "horizontal"] },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
}
export default meta
type Story = StoryObj<typeof RadioGroup>

const PLANS = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
]

const PLANS_RICH = [
  { value: "free", label: "Free", description: "R$ 0/mês", icon: ZapIcon },
  { value: "pro", label: "Pro", description: "R$ 29/mês", icon: CrownIcon },
  { value: "team", label: "Team", description: "R$ 99/mês", icon: BuildingIcon, disabled: true },
]

export const Default: Story = { args: { label: "Plano", values: PLANS } }

export const WithDescriptions: Story = { args: { label: "Escolha um plano", values: PLANS_RICH } }

export const Horizontal: Story = {
  args: {
    label: "Tamanho",
    orientation: "horizontal",
    values: [
      { value: "s", label: "P" },
      { value: "m", label: "M" },
      { value: "l", label: "G" },
      { value: "xl", label: "GG" },
    ],
  },
}

export const WithError: Story = {
  args: { label: "Plano", error: "Selecione uma opção", values: PLANS, required: true },
}

export const DefaultValue: Story = {
  args: { label: "Plano (default Pro)", defaultValue: "pro", values: PLANS },
}

export const Disabled: Story = {
  args: { label: "Plano", disabled: true, defaultValue: "free", values: PLANS },
}

export const WithItemDescription: Story = {
  args: {
    label: "Método de pagamento",
    values: [
      { value: "card", label: "Cartão de crédito", description: "Aprovação imediata" },
      { value: "pix", label: "PIX", description: "Aprovação em segundos" },
      { value: "boleto", label: "Boleto", description: "Até 3 dias úteis" },
    ],
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("free")
    return (
      <div className="flex flex-col gap-4">
        <RadioGroup label="Plano" values={PLANS_RICH} value={value} onValueChange={setValue} />
        <p className="text-sm text-muted-foreground">Selecionado: {value}</p>
      </div>
    )
  },
}
