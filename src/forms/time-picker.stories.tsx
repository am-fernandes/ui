import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Label } from "../primitives/label"
import { TimePicker } from "./time-picker"

const meta = {
  title: "Forms/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          'Picker de horário **24h** com dois inputs (horas / minutos). Não usa `<input type="time">` para garantir formato 24h consistente em qualquer locale do navegador.',
          "",
          "**Comportamento:**",
          "- Digitar 2 dígitos em horas avança o foco automaticamente para minutos.",
          "- `ArrowUp` / `ArrowDown` incrementa/decrementa o campo focado (clamp em 0–23 / 0–59).",
          "- `:` no campo de horas pula direto para minutos.",
          "- Valores fora do range são clampados ao perder o foco.",
          "",
          "**Props principais:**",
          "- `value` — string `HH:MM` (24h) ou `''` para vazio.",
          "- `onChange(value)` — emite `HH:MM` quando ambos os campos têm 2 dígitos válidos; emite `''` quando incompleto.",
          "- `disabled` — desabilita ambos os inputs.",
          "- `id` — encaminhado ao input de horas para integração com `<Label htmlFor>`.",
          "- `aria-label` — label do `<fieldset>` (default `'Horário'`).",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Label, TimePicker } from "@amfernandesinc/ui"',
          'import { useState } from "react"',
          "",
          'const [value, setValue] = useState("09:30")',
          "",
          '<div className="flex flex-col gap-2">',
          '  <Label htmlFor="start-time">Horário de início</Label>',
          '  <TimePicker id="start-time" value={value} onChange={setValue} />',
          "</div>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    value: {
      control: "text",
      description: "Horário em formato `HH:MM` (24h). Vazio para nenhum valor.",
      table: { type: { summary: "string" } },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita os dois inputs.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    id: {
      control: "text",
      description: "Forwarded ao input de horas para casar com `<Label htmlFor>`.",
      table: { type: { summary: "string" } },
    },
    "aria-label": {
      control: "text",
      description: "Label do `<fieldset>` (acessibilidade).",
      table: { type: { summary: "string" }, defaultValue: { summary: "'Horário'" } },
    },
    onChange: { control: false, table: { category: "Eventos" } },
  },
} satisfies Meta<typeof TimePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    value: "09:30",
    disabled: false,
    id: "playground-time",
    "aria-label": "Horário",
  },
  render: (args) => {
    const [value, setValue] = useState(args.value ?? "")
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={args.id}>Horário</Label>
        <TimePicker
          id={args.id}
          value={value}
          onChange={setValue}
          disabled={args.disabled}
          aria-label={args["aria-label"]}
        />
        <span className="text-xs text-muted-foreground">Valor: {value || "(vazio)"}</span>
      </div>
    )
  },
}

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
