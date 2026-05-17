import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { Label } from "../primitives/label"
import { PercentageInput } from "./percentage-input"

const meta = {
  title: "Domain/PercentageInput",
  component: PercentageInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof PercentageInput>

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
        <Label htmlFor="commission">Comissão (%)</Label>
        <PercentageInput id="commission" value={value} onValueChange={setValue} />
      </div>
    )
  },
}
