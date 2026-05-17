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
      <div className="flex flex-col gap-2">
        <Label htmlFor="start-time">Horário de início</Label>
        <TimePicker id="start-time" value={value} onChange={setValue} />
        <span className="text-xs text-muted-foreground">Valor: {value || "(vazio)"}</span>
      </div>
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label>Encerramento</Label>
      <TimePicker value="18:00" disabled />
    </div>
  ),
}

export const Empty: Story = {
  render: () => {
    const [value, setValue] = useState("")
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor="empty-time">Horário</Label>
        <TimePicker id="empty-time" value={value} onChange={setValue} />
        <span className="text-xs text-muted-foreground">Valor: {value || "(vazio)"}</span>
      </div>
    )
  },
}
