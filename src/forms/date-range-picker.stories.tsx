import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Label } from "../primitives/label"
import { DateRangePicker } from "./date-range-picker"

const meta = {
  title: "Forms/DateRangePicker",
  component: DateRangePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Seletor de intervalo de datas. Retorna `{from, to}` com value pt-BR (DD/MM/AAAA).",
      },
    },
  },
} satisfies Meta<typeof DateRangePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { from: "", to: "", onFromChange: () => {}, onToChange: () => {} },
  render: () => {
    const [from, setFrom] = useState("")
    const [to, setTo] = useState("")
    return (
      <div className="flex w-[320px] flex-col gap-2">
        <Label>Período</Label>
        <DateRangePicker from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
      </div>
    )
  },
}
