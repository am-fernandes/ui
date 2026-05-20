import type { Meta, StoryObj } from "@storybook/react-vite"
import { enUS } from "date-fns/locale"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { DateRangePicker, type DateRangeValue } from "./date-range-picker"

const meta = {
  title: "Forms/DateRangePicker",
  component: DateRangePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    a11y: {
      // Outside-day text from react-day-picker (popover) fails 4.5:1 against background.
      // Tracked in design-tokens roadmap.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
    docs: {
      description: {
        component: [
          "Seletor de **intervalo de datas** com popover de `Calendar` mostrando dois meses lado a lado por default.",
          "Valor é um objeto `{ from, to }` com strings ISO (`YYYY-MM-DD`). Exibição em pt-BR (`DD/MM/AAAA — DD/MM/AAAA`).",
          "O popover **fecha automaticamente** quando ambos extremos são definidos; possui botão **Limpar** para resetar.",
          "",
          "**Props principais:**",
          "- `value: { from: string; to: string }` — extremos em ISO ou vazios.",
          "- `onValueChange(value)` — recebe `{ from, to }` atualizado.",
          "- `numberOfMonths` — quantos meses renderizar (default `2`).",
          "- `locale` — `Locale` de `date-fns` (default `ptBR`).",
          "- `label`, `description`, `error`, `required`, `labelPosition`, `disabled` — wiring de `FieldShell`.",
          "- `placeholder` — texto exibido quando `from` e `to` estão vazios.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { DateRangePicker, type DateRangeValue } from "@amfernandesinc/ui"',
          'import { useState } from "react"',
          "",
          'const [range, setRange] = useState<DateRangeValue>({ from: "", to: "" })',
          "",
          '<DateRangePicker label="Período" value={range} onValueChange={setRange} />',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    value: {
      control: "object",
      description: "Objeto `{ from, to }` com strings ISO (`YYYY-MM-DD`).",
      table: { type: { summary: "{ from: string; to: string }" } },
    },
    placeholder: {
      control: "text",
      description: "Texto exibido quando nenhum extremo está preenchido.",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "'Selecione um período'" },
      },
    },
    numberOfMonths: {
      control: { type: "number", min: 1, max: 3 },
      description: "Quantos meses lado a lado.",
      table: { type: { summary: "number" }, defaultValue: { summary: "2" } },
    },
    label: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
    required: { control: "boolean" },
    labelPosition: {
      control: "select",
      options: ["up", "left", "hidden"],
      table: { defaultValue: { summary: "'up'" } },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o trigger.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    onValueChange: { control: false, table: { category: "Eventos" } },
  },
} satisfies Meta<typeof DateRangePicker>

export default meta
type Story = StoryObj<typeof DateRangePicker>

export const Playground: Story = {
  args: {
    value: { from: "", to: "" },
    label: "Período",
    placeholder: "Selecione um período",
    numberOfMonths: 2,
    disabled: false,
  },
  render: (args) => {
    const [range, setRange] = useState<DateRangeValue>(args.value)
    return (
      <div className="flex w-[360px] flex-col gap-2">
        <DateRangePicker
          label={args.label}
          value={range}
          onValueChange={setRange}
          placeholder={args.placeholder}
          numberOfMonths={args.numberOfMonths}
          disabled={args.disabled}
          description={args.description}
          error={args.error}
          required={args.required}
          labelPosition={args.labelPosition}
        />
        <span className="text-xs text-muted-foreground">
          ISO: {range.from || "(vazio)"} → {range.to || "(vazio)"}
        </span>
      </div>
    )
  },
}

export const Default: Story = {
  args: { value: { from: "", to: "" } },
  render: () => {
    const [range, setRange] = useState<DateRangeValue>({ from: "", to: "" })
    return (
      <div className="w-[360px]">
        <DateRangePicker label="Período" value={range} onValueChange={setRange} />
      </div>
    )
  },
}

export const PreFilled: Story = {
  args: { value: { from: "2025-03-01", to: "2025-03-31" } },
  parameters: {
    docs: {
      description: {
        story: "Range inicial definido — display em pt-BR (`01/03/2025 — 31/03/2025`).",
      },
    },
  },
  render: () => {
    const [range, setRange] = useState<DateRangeValue>({ from: "2025-03-01", to: "2025-03-31" })
    return (
      <div className="flex w-[360px] flex-col gap-2">
        <DateRangePicker label="Mês de março/2025" value={range} onValueChange={setRange} />
        <span className="text-xs text-muted-foreground">
          ISO: {range.from} → {range.to}
        </span>
      </div>
    )
  },
}

export const WithError: Story = {
  args: {
    value: { from: "", to: "" },
    error: "Selecione um período antes de continuar.",
    required: true,
  },
  render: () => {
    const [range, setRange] = useState<DateRangeValue>({ from: "", to: "" })
    return (
      <div className="w-[360px]">
        <DateRangePicker
          label="Período de validade"
          required
          error="Selecione um período antes de continuar."
          value={range}
          onValueChange={setRange}
        />
      </div>
    )
  },
}

export const Disabled: Story = {
  args: { value: { from: "2025-01-01", to: "2025-01-15" }, disabled: true },
  render: () => (
    <div className="w-[360px]">
      <DateRangePicker
        label="Período"
        value={{ from: "2025-01-01", to: "2025-01-15" }}
        onValueChange={() => {}}
        disabled
      />
    </div>
  ),
}

export const OneMonth: Story = {
  args: { value: { from: "", to: "" }, numberOfMonths: 1 },
  parameters: {
    docs: {
      description: { story: "Layout compacto com um único mês no popover (`numberOfMonths={1}`)." },
    },
  },
  render: () => {
    const [range, setRange] = useState<DateRangeValue>({ from: "", to: "" })
    return (
      <div className="w-[360px]">
        <DateRangePicker
          label="Período (1 mês)"
          numberOfMonths={1}
          value={range}
          onValueChange={setRange}
        />
      </div>
    )
  },
}

export const EnUSLocale: Story = {
  args: { value: { from: "", to: "" } },
  parameters: {
    docs: {
      description: { story: "Locale `enUS` — popover em inglês." },
    },
  },
  render: () => {
    const [range, setRange] = useState<DateRangeValue>({ from: "", to: "" })
    return (
      <div className="w-[360px]">
        <DateRangePicker label="Date range" value={range} onValueChange={setRange} locale={enUS} />
      </div>
    )
  },
}

export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Demonstração do controle externo: presets de range emitidos via botões reescrevendo o estado.",
      },
    },
  },
  render: () => {
    const [range, setRange] = useState<DateRangeValue>({ from: "", to: "" })
    return (
      <div className="flex w-[360px] flex-col gap-2">
        <DateRangePicker
          label="Período"
          description={`ISO: ${range.from || "(vazio)"} → ${range.to || "(vazio)"}`}
          value={range}
          onValueChange={setRange}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRange({ from: "2025-01-01", to: "2025-01-31" })}
            className="rounded-md border px-2 py-1 text-xs"
          >
            Janeiro/2025
          </button>
          <button
            type="button"
            onClick={() => setRange({ from: "2025-06-01", to: "2025-06-30" })}
            className="rounded-md border px-2 py-1 text-xs"
          >
            Junho/2025
          </button>
          <button
            type="button"
            onClick={() => setRange({ from: "", to: "" })}
            className="rounded-md border px-2 py-1 text-xs"
          >
            Limpar
          </button>
        </div>
      </div>
    )
  },
}

export const WithRHF: Story = {
  name: "react-hook-form integration",
  parameters: {
    docs: {
      description: {
        story:
          "Integração com `react-hook-form` via `<Controller>`. O valor é objeto `{ from, to }` — passe direto para `field.value`/`field.onChange`.",
      },
    },
  },
  render: () => {
    type FormValues = { period: DateRangeValue }
    const { control, handleSubmit } = useForm<FormValues>({
      defaultValues: { period: { from: "", to: "" } },
    })
    const [submitted, setSubmitted] = useState<FormValues | null>(null)
    return (
      <form
        className="flex w-[360px] flex-col gap-3"
        onSubmit={handleSubmit((data) => setSubmitted(data))}
      >
        <Controller
          name="period"
          control={control}
          rules={{
            validate: (v) => {
              if (!v.from || !v.to) return "Selecione início e fim do período"
              return true
            },
          }}
          render={({ field, fieldState }) => (
            <DateRangePicker
              label="Período de vigência"
              required
              value={field.value}
              onValueChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <button
          type="submit"
          className="rounded-md border border-input bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          Enviar
        </button>
        {submitted ? (
          <p className="text-xs text-muted-foreground">Submitted: {JSON.stringify(submitted)}</p>
        ) : null}
      </form>
    )
  },
}
