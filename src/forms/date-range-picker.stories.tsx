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
        component: [
          "Seletor de **intervalo de datas** com popover de Calendar mostrando dois meses lado a lado por default.",
          "Cada extremo do intervalo é controlado separadamente: `from`/`to` como string ISO (`YYYY-MM-DD`) e callbacks `onFromChange`/`onToChange`.",
          "Exibição em pt-BR (`DD/MM/AAAA — DD/MM/AAAA`).",
          "",
          "**Props principais:**",
          "- `from` / `to` — strings ISO (`YYYY-MM-DD`) ou vazias.",
          "- `onFromChange(value)` / `onToChange(value)` — recebem novas strings ISO.",
          "- `placeholder` — texto quando nenhum extremo está definido.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    from: {
      control: "text",
      description: "Início do intervalo em ISO (`YYYY-MM-DD`).",
      table: { type: { summary: "string" } },
    },
    to: {
      control: "text",
      description: "Fim do intervalo em ISO (`YYYY-MM-DD`).",
      table: { type: { summary: "string" } },
    },
    placeholder: {
      control: "text",
      description: "Texto exibido quando nenhum extremo está preenchido.",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "'Selecione o período'" },
      },
    },
    onFromChange: { control: false, table: { category: "Eventos" } },
    onToChange: { control: false, table: { category: "Eventos" } },
  },
} satisfies Meta<typeof DateRangePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    from: "",
    to: "",
    onFromChange: () => {},
    onToChange: () => {},
    placeholder: "Selecione o período",
  },
  render: (args) => {
    const [from, setFrom] = useState(args.from)
    const [to, setTo] = useState(args.to)
    return (
      <div className="flex w-[320px] flex-col gap-2">
        <Label>Período</Label>
        <DateRangePicker
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
          placeholder={args.placeholder}
        />
        <span className="text-xs text-muted-foreground">
          ISO: {from || "(vazio)"} → {to || "(vazio)"}
        </span>
      </div>
    )
  },
}

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
