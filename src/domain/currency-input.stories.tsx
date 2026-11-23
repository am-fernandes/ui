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
          'import { CurrencyInput } from "@amfernandesinc/ui"',
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

export const ReadOnly: Story = {
  args: { value: 1234.56, onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState<number>(1234.56)
    return (
      <div className="flex w-80 flex-col gap-4">
        <CurrencyInput
          id="valor-editable"
          label="Valor do contrato (editável)"
          value={value}
          onValueChange={setValue}
        />
        <CurrencyInput
          id="valor-readonly"
          label="Valor do contrato (somente leitura)"
          value={value}
          onValueChange={setValue}
          readOnly
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "`readOnly` é o estado de tela de consulta: fundo esmaecido, sem reação ao hover, com o valor legível, focável e enviado no formulário. `disabled` (50% de opacidade, fora do Tab e do envio) é para o campo que não se aplica.",
      },
    },
  },
}

export const Sizes: Story = {
  args: { value: 1234.56, onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState<number>(1234.56)
    return (
      <div className="flex w-80 flex-col gap-4">
        <CurrencyInput
          id="valor-sm"
          label="Valor (sm)"
          size="sm"
          value={value}
          onValueChange={setValue}
        />
        <CurrencyInput
          id="valor-md"
          label="Valor (md)"
          size="md"
          value={value}
          onValueChange={setValue}
        />
        <CurrencyInput
          id="valor-lg"
          label="Valor (lg)"
          size="lg"
          value={value}
          onValueChange={setValue}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "`size` define a altura da caixa inteira, borda incluída: 32, 40 e 44px. É o mesmo token de `Button` e dos demais controles, então campo e botão do mesmo tamanho ficam alinhados numa linha.",
      },
    },
  },
}

export const Negative: Story = {
  args: { value: 0, onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState<number>(-150)
    return (
      <div className="flex w-80 flex-col gap-2">
        <CurrencyInput
          id="adjustment"
          label="Ajuste de saldo (R$)"
          description="Use o sinal de menos para um estorno."
          allowNegative
          value={value}
          onValueChange={setValue}
        />
        <p className="text-xs text-muted-foreground">Valor interno: {value}</p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "`allowNegative` aceita valores negativos: a tecla de menos torna o valor negativo, uma segunda (ou `+`) volta a positivo, e um número negativo colado mantém o sinal. O campo abre o teclado de texto no celular, porque o teclado numérico do iOS não tem o sinal de menos.",
      },
    },
  },
}
