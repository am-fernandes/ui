import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { Label } from "../primitives/label"
import { CurrencyInput } from "./currency-input"

const meta = {
  title: "Domain/CurrencyInput",
  component: CurrencyInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Input controlado para valores monetários em **BRL**. O display é formatado em pt-BR (`R$ 1.234,56`) enquanto o valor interno permanece como **número decimal em reais** (ex.: `1234.56`).",
          "",
          "**Props principais:**",
          "- `value` — valor atual em reais (float). Use `toCents`/`fromCents` quando precisar persistir centavos inteiros.",
          "- `onValueChange` — callback `(value: number) => void` disparado a cada edição com o novo valor em reais.",
          "- `disabled` — desabilita a edição e aplica estilo desativado.",
          "- `placeholder` — texto exibido quando o campo está vazio (apesar da máscara, é repassado ao `<input>`).",
          "- Demais props do `<input>` nativo (exceto `value`, `onChange`, `type`) são repassadas, incluindo `id`, `name`, `aria-*`, `className`.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    value: {
      control: "number",
      description:
        "Valor monetário atual em **reais** (float). O display é renderizado como `R$ x,yz`.",
      table: { type: { summary: "number" } },
    },
    onValueChange: {
      control: false,
      description: "Callback disparado a cada edição com o novo valor em reais.",
      table: {
        type: { summary: "(value: number) => void" },
        category: "Eventos",
      },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o campo.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    placeholder: {
      control: "text",
      description: "Placeholder repassado ao `<input>` nativo.",
      table: { type: { summary: "string" } },
    },
  },
} satisfies Meta<typeof CurrencyInput>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    value: 0,
    onValueChange: () => {},
    disabled: false,
    placeholder: "",
  },
  render: (args) => {
    const [value, setValue] = React.useState<number>(args.value ?? 0)
    React.useEffect(() => {
      setValue(args.value ?? 0)
    }, [args.value])
    return (
      <div className="flex flex-col gap-2 w-80">
        <Label htmlFor="contract-value">Valor do contrato (R$)</Label>
        <CurrencyInput
          {...args}
          id="contract-value"
          value={value}
          onValueChange={(next) => {
            setValue(next)
            args.onValueChange?.(next)
          }}
        />
        <p className="text-xs text-muted-foreground">Valor interno: {value}</p>
      </div>
    )
  },
}

export const Default: Story = {
  args: {
    value: 0,
    onValueChange: () => {},
  },
  render: () => {
    const [value, setValue] = React.useState<number>(0)
    return (
      <div className="flex flex-col gap-2 w-80">
        <Label htmlFor="contract-value">Valor do contrato (R$)</Label>
        <CurrencyInput id="contract-value" value={value} onValueChange={setValue} />
      </div>
    )
  },
}
