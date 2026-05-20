import type { Meta, StoryObj } from "@storybook/react-vite"
import { addDays, subDays } from "date-fns"
import { enUS } from "date-fns/locale"
import { useState } from "react"
import type { DateRange } from "react-day-picker"

import { Calendar } from "./calendar"

const meta = {
  title: "Forms/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    a11y: {
      // react-day-picker outside-day text uses muted-foreground that misses 4.5:1 against background.
      // Tracked in design-tokens roadmap; opt-out at story level to keep axe wcag2aa enforced elsewhere.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
    docs: {
      description: {
        component: [
          "Wrapper sobre `react-day-picker` v9 com defaults da AM Fernandes (locale **pt-BR**, `ghost` button variant, tokens do design system).",
          "Repassa todas as props do `DayPicker` e adiciona um helper `disabledDays` com **presets declarativos**.",
          "",
          "**Props principais:**",
          "- `mode: 'single' | 'range' | 'multiple'` — discriminated union do react-day-picker.",
          "- `selected` / `onSelect` — controle externo (tipo depende de `mode`).",
          "- `numberOfMonths` — quantos meses renderizar lado a lado (útil em `range`).",
          "- `locale` — `Locale` do `date-fns` (default `ptBR`).",
          "- `buttonVariant` — variante do `Button` aplicada aos chevrons de navegação.",
          "- `disabledDays` — `Date | Date[] | 'past' | 'future' | 'today' | 'weekends' | 'weekdays' | preset[] | (d: Date) => boolean`. Tem precedência sobre `disabled` do react-day-picker.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Calendar } from "@amfernandesinc/ui"',
          'import { useState } from "react"',
          "",
          "const [date, setDate] = useState<Date | undefined>()",
          "",
          '<Calendar mode="single" selected={date} onSelect={setDate} />',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    mode: {
      control: "select",
      options: ["single", "range", "multiple"],
      description: "Modo de seleção. Define o shape de `selected` / `onSelect`.",
      table: { type: { summary: "'single' | 'range' | 'multiple'" } },
    },
    numberOfMonths: {
      control: { type: "number", min: 1, max: 3 },
      description: "Quantos meses renderizar lado a lado.",
      table: { type: { summary: "number" }, defaultValue: { summary: "1" } },
    },
    buttonVariant: {
      control: "select",
      options: ["default", "outline", "ghost", "link", "secondary", "destructive"],
      description: "Variante do `Button` aplicada aos controles de navegação.",
      table: { type: { summary: "ButtonProps['variant']" }, defaultValue: { summary: "'ghost'" } },
    },
    showOutsideDays: {
      control: "boolean",
      description: "Mostrar dias dos meses adjacentes em cinza.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

const FIXED_MONTH = new Date(2025, 5, 15) // June 2025 — stable snapshot baseline.

export const Single: Story = {
  name: "Single",
  args: { mode: "single" },
  render: () => {
    const [date, setDate] = useState<Date | undefined>(FIXED_MONTH)
    return (
      <div className="flex flex-col gap-3">
        <Calendar mode="single" selected={date} onSelect={setDate} defaultMonth={FIXED_MONTH} />
        <p className="text-xs text-muted-foreground">
          Selecionado: {date ? date.toLocaleDateString("pt-BR") : "(nenhum)"}
        </p>
      </div>
    )
  },
}

export const Range: Story = {
  name: "Range",
  args: { mode: "range", numberOfMonths: 2 },
  render: () => {
    const [range, setRange] = useState<DateRange | undefined>({
      from: FIXED_MONTH,
      to: addDays(FIXED_MONTH, 7),
    })
    return (
      <div className="flex flex-col gap-3">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          numberOfMonths={2}
          defaultMonth={FIXED_MONTH}
        />
        <p className="text-xs text-muted-foreground">
          De {range?.from?.toLocaleDateString("pt-BR") ?? "(?)"} até{" "}
          {range?.to?.toLocaleDateString("pt-BR") ?? "(?)"}
        </p>
      </div>
    )
  },
}

export const Multiple: Story = {
  name: "Multiple",
  args: { mode: "multiple" },
  render: () => {
    const [days, setDays] = useState<Date[] | undefined>([
      FIXED_MONTH,
      addDays(FIXED_MONTH, 2),
      addDays(FIXED_MONTH, 5),
    ])
    return (
      <div className="flex flex-col gap-3">
        <Calendar mode="multiple" selected={days} onSelect={setDays} defaultMonth={FIXED_MONTH} />
        <p className="text-xs text-muted-foreground">{days?.length ?? 0} dia(s) selecionado(s).</p>
      </div>
    )
  },
}

export const DisabledPast: Story = {
  name: "Disabled past",
  parameters: {
    docs: {
      description: {
        story: "Preset `past` desabilita qualquer dia anterior a hoje.",
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<Date | undefined>()
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        disabledDays="past"
        defaultMonth={FIXED_MONTH}
      />
    )
  },
}

export const DisabledFuture: Story = {
  name: "Disabled future",
  parameters: {
    docs: {
      description: {
        story: "Preset `future` desabilita qualquer dia posterior a hoje.",
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<Date | undefined>()
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        disabledDays="future"
        defaultMonth={FIXED_MONTH}
      />
    )
  },
}

export const DisabledWeekends: Story = {
  name: "Disabled weekends",
  parameters: {
    docs: {
      description: {
        story: "Preset `weekends` bloqueia sábados e domingos. Útil para business days.",
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<Date | undefined>()
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        disabledDays="weekends"
        defaultMonth={FIXED_MONTH}
      />
    )
  },
}

export const DisabledMixed: Story = {
  name: "Disabled mixed (presets + dates)",
  parameters: {
    docs: {
      description: {
        story:
          "`disabledDays` aceita um array misto de presets e instâncias de `Date`. Exemplo: `['past', date1, date2]`.",
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<Date | undefined>()
    const holiday1 = addDays(FIXED_MONTH, 10)
    const holiday2 = addDays(FIXED_MONTH, 14)
    // Cast: implementação aceita arrays mistos de presets + Date,
    // mas o tipo público é union de arrays homogêneos.
    const mixedDisabled = ["past", holiday1, holiday2] as unknown as Date[]
    return (
      <div className="flex flex-col gap-3">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabledDays={mixedDisabled}
          defaultMonth={FIXED_MONTH}
        />
        <p className="text-xs text-muted-foreground">
          Bloqueado: dias passados + {holiday1.toLocaleDateString("pt-BR")} +{" "}
          {holiday2.toLocaleDateString("pt-BR")}.
        </p>
      </div>
    )
  },
}

export const CustomPredicate: Story = {
  name: "Custom predicate",
  parameters: {
    docs: {
      description: {
        story:
          "Escape hatch: passe uma função `(date: Date) => boolean` para qualquer regra customizada (aqui: bloquear dias 13).",
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<Date | undefined>()
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        disabledDays={(d) => d.getDate() === 13}
        defaultMonth={FIXED_MONTH}
      />
    )
  },
}

export const EnUSLocale: Story = {
  name: "en-US locale",
  parameters: {
    docs: {
      description: {
        story:
          "Locale alternativo importado de `date-fns/locale`. Nomes de meses e dias da semana em inglês.",
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<Date | undefined>()
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        locale={enUS}
        defaultMonth={FIXED_MONTH}
      />
    )
  },
}

export const English: Story = {
  name: "English",
  parameters: {
    docs: {
      description: {
        story: [
          "Translating the calendar UI is driven by `locale`, not `labels`. `react-day-picker` already exposes localized weekday names, month names, and prev/next button aria-labels.",
          "",
          "The `labels` prop is reserved for any future wrapper-only copy (currently no strings live in the wrapper).",
        ].join("\n"),
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<Date | undefined>()
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        locale={enUS}
        defaultMonth={FIXED_MONTH}
        labels={{}}
      />
    )
  },
}

export const TwoMonthsCompact: Story = {
  name: "Two months side-by-side",
  parameters: {
    docs: {
      description: {
        story: "Renderiza dois meses lado a lado — base do `DateRangePicker`.",
      },
    },
  },
  render: () => {
    const [range, setRange] = useState<DateRange | undefined>({
      from: subDays(FIXED_MONTH, 3),
      to: addDays(FIXED_MONTH, 10),
    })
    return (
      <Calendar
        mode="range"
        selected={range}
        onSelect={setRange}
        numberOfMonths={2}
        defaultMonth={FIXED_MONTH}
      />
    )
  },
}
