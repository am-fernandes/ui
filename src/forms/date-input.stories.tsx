import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Label } from "../primitives/label"
import { DateInput } from "./date-input"

const meta = {
  title: "Forms/DateInput",
  component: DateInput,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof DateInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { value: "" },
  render: () => {
    const [value, setValue] = useState("")
    return (
      <div className="flex w-[280px] flex-col gap-2">
        <Label htmlFor="birth">Data de nascimento</Label>
        <DateInput id="birth" value={value} onChange={setValue} placeholder="DD/MM/AAAA" />
      </div>
    )
  },
}
