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
        component: [
          "Calendário baseado em **react-day-picker v9** com locale **pt-BR** por default (via `date-fns/locale`).",
          "Use standalone ou como base do `DateInput` / `DateRangePicker`.",
          "",
          "**Props principais:**",
          "- `mode` — `'single'` (uma data), `'multiple'` (várias datas) ou `'range'` (intervalo `{from, to}`).",
          "- `selected` / `onSelect` — controle de seleção. O shape depende de `mode`.",
          "- `numberOfMonths` — quantidade de meses exibidos lado a lado (default `1`).",
          "- `showOutsideDays` — exibe dias de outros meses para preencher a grade (default `true`).",
          "- `disabled` — matcher de datas desabilitadas (`Date`, array, range ou função).",
          "- `locale` — locale do `date-fns`. Default `ptBR` — não precisa configurar para projetos em português.",
          "- `captionLayout` — `'label'` (default) ou `'dropdown'` para seletor de mês/ano.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    mode: {
      control: "inline-radio",
      options: ["single", "multiple", "range"],
      description: "Modo de seleção do calendário.",
      table: {
        type: { summary: "'single' | 'multiple' | 'range'" },
        defaultValue: { summary: "'single'" },
      },
    },
    numberOfMonths: {
      control: { type: "number", min: 1, max: 3, step: 1 },
      description: "Quantos meses renderizar lado a lado.",
      table: { type: { summary: "number" }, defaultValue: { summary: "1" } },
    },
    showOutsideDays: {
      control: "boolean",
      description: "Renderiza dias de meses adjacentes para completar a grade semanal.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    disabled: {
      control: false,
      description:
        "Datas desabilitadas — aceita `Date`, array de `Date`, `DateRange` ou função `(date) => boolean`.",
      table: { type: { summary: "Matcher | Matcher[]" } },
    },
    captionLayout: {
      control: "inline-radio",
      options: ["label", "dropdown", "dropdown-months", "dropdown-years"],
      description: "Layout do cabeçalho de mês/ano.",
      table: {
        type: { summary: "'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years'" },
        defaultValue: { summary: "'label'" },
      },
    },
    onSelect: { control: false, table: { category: "Eventos" } },
  },
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    mode: "single",
    numberOfMonths: 1,
    showOutsideDays: true,
    captionLayout: "label",
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(new Date())
    return (
      <Calendar
        {...args}
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    )
  },
}

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date())
    return (
      <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
    )
  },
}
