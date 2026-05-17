import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { Label } from "../primitives/label"
import { CurrencyInput } from "./currency-input"

const meta = {
  title: "Domain/CurrencyInput",
  component: CurrencyInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof CurrencyInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 0,
    onValueChange: () => {},
  },
  render: () => {
    const [value, setValue] = React.useState<number>(0)
    return (
      <div className="flex flex-col gap-2 w-80">
        <Label htmlFor="contract-value">Valor do contrato (R$)</Label>
        <CurrencyInput id="contract-value" value={value} onValueChange={setValue} />
      </div>
    )
  },
}
