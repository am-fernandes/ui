import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "@storybook/test"
import * as React from "react"
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
          "",
          "**Rótulo:** prefira a prop `label` (renderizada internamente pelo `FieldShell` como `<label htmlFor>`) em vez de um `<Label>` externo.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { CurrencyInput } from "@am-fernandes/ui"',
          "",
          "const [value, setValue] = useState(0)",
          "",
          "<CurrencyInput",
          '  id="contract-value"',
          '  label="Valor do contrato (R$)"',
          "  value={value}",
          "  onValueChange={setValue}",
          "/>",
          "```",
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
    label: {
      control: "text",
      description:
        "Rótulo renderizado pelo próprio componente via `FieldShell`. Use em vez de `<Label>` externo.",
      table: { type: { summary: "ReactNode" } },
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
        <CurrencyInput
          {...args}
          id="contract-value"
          label="Valor do contrato (R$)"
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
      <div className="w-80">
        <CurrencyInput
          id="contract-value"
          label="Valor do contrato (R$)"
          value={value}
          onValueChange={setValue}
        />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText(/Valor do contrato/) as HTMLInputElement
    await expect(input).toHaveValue("0,00")
    await userEvent.type(input, "123456")
    await expect(input).toHaveValue("1.234,56")
  },
}
