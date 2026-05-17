import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { Label } from "../primitives/label"
import { DaysInstallmentInput } from "./days-installment-input"

const meta = {
  title: "Domain/DaysInstallmentInput",
  component: DaysInstallmentInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof DaysInstallmentInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: [30, 60, 90],
    onValueChange: () => {},
  },
  render: () => {
    const [installments, setInstallments] = React.useState<number[]>([30, 60, 90])
    return (
      <div className="flex flex-col gap-2 w-80">
        <Label htmlFor="installments">Parcelas (dias)</Label>
        <DaysInstallmentInput value={installments} onValueChange={setInstallments} />
      </div>
    )
  },
}
