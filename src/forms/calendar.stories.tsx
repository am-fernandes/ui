import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Calendar } from "./calendar"

const meta = {
  title: "Forms/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Calendário baseado em react-day-picker, locale pt-BR por default. Use standalone ou via `DateInput`/`DateRangePicker`.",
      },
    },
  },
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date())
    return (
      <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
    )
  },
}
