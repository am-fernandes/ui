import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Label } from "../primitives/label"
import { TimePicker } from "./time-picker"

const meta = {
  title: "Forms/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof TimePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("09:30")
    return (
      <div className="flex w-[280px] flex-col gap-2">
        <Label htmlFor="start-time">Horário de início</Label>
        <TimePicker
          id="start-time"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
    )
  },
}

export const Disabled: Story = {
  args: { disabled: true, value: "14:00" },
}
