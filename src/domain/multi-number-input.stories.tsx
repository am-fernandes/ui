import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { Label } from "../primitives/label"
import { MultiNumberInput } from "./multi-number-input"

const meta = {
  title: "Domain/MultiNumberInput",
  component: MultiNumberInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof MultiNumberInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: [30, 60, 90],
    onValueChange: () => {},
  },
  render: () => {
    const [values, setValues] = React.useState<number[]>([30, 60, 90])
    return (
      <div className="flex flex-col gap-2 w-80">
        <Label htmlFor="numbers">Lista de números</Label>
        <MultiNumberInput value={values} onValueChange={setValues} />
      </div>
    )
  },
}

export const WithSuffixDias: Story = {
  args: {
    value: [15, 30, 45],
    onValueChange: () => {},
  },
  render: () => {
    const [values, setValues] = React.useState<number[]>([15, 30, 45])
    return (
      <div className="flex flex-col gap-2 w-80">
        <Label htmlFor="installments">Parcelamento</Label>
        <MultiNumberInput value={values} onValueChange={setValues} suffix=" dias" />
      </div>
    )
  },
}

export const WithPrefixR$: Story = {
  args: {
    value: [1000, 2500, 5000],
    onValueChange: () => {},
  },
  render: () => {
    const [values, setValues] = React.useState<number[]>([1000, 2500, 5000])
    return (
      <div className="flex flex-col gap-2 w-80">
        <Label htmlFor="amounts">Valores</Label>
        <MultiNumberInput value={values} onValueChange={setValues} prefix="R$ " />
      </div>
    )
  },
}
