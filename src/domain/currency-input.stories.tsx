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
          "Input para valores monetários em **BRL**. O display é formatado em pt-BR (`R$ 1.234,56`) enquanto o valor é um **número decimal em reais** (ex.: `1234.56`).",
          "",
          "**Digitação e colagem.** Os dígitos digitados preenchem os centavos primeiro (`1`, `5`, `0`, `0` mostra `0,01`, `0,15`, `1,50`, `15,00`). Um texto colado é lido como um número escrito por um brasileiro e substitui o valor: `1500` e `1.500` são R$ 1.500,00; `1500,5` é R$ 1.500,50; `2350.9` é R$ 2.350,90.",
          "",
          "**Props principais:**",
          "- `value` — valor em reais (float), controlado. Use `toCents`/`fromCents` quando precisar persistir centavos inteiros.",
          "- `defaultValue` — valor inicial quando o campo não é controlado: sem `value`, ele guarda o próprio valor.",
          "- `onValueChange` — callback `(value: number) => void` disparado a cada edição com o novo valor em reais.",
          '- `emptyValue` — o que vale um campo vazio. `"zero"` (padrão): o campo sempre tem um número e limpar volta a `0,00`. `"null"`: o campo pode ficar vazio, `value` aceita `null`, `onValueChange` passa a receber `number | null`, o placeholder aparece e o `required` nativo funciona.',
          "- `allowNegative` — aceita valores negativos (estorno, desconto, saldo devedor).",
          "- `min` / `max` — limites em reais. Fora deles o valor fica como foi digitado, o campo mostra o erro e o envio nativo é barrado.",
          "- `name` — nome no formulário nativo. O form recebe o número (`1234.56`), por um input oculto.",
          "- `size` — altura do campo: `sm` (32px), `md` (40px, padrão) ou `lg` (44px).",
          "- `readOnly` — somente leitura: o valor fica legível, recebe foco e é enviado, mas não é editável.",
          "- `disabled` — desabilita a edição e aplica estilo desativado.",
          "- Demais props do `<input>` nativo (exceto `value`, `onChange`, `type`) são repassadas, incluindo `id`, `aria-*`, `className`.",
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
  // `emptyValue` e `defaultValue` ficam de fora: esta story é a do campo
  // controlado que sempre tem um número.
  render: ({ value: initial, onValueChange, emptyValue, defaultValue, ...args }) => {
    const [value, setValue] = React.useState<number>(initial ?? 0)
    React.useEffect(() => {
      setValue(initial ?? 0)
    }, [initial])
    return (
      <div className="flex flex-col gap-2 w-80">
        <CurrencyInput
          {...args}
          id="contract-value"
          label="Valor do contrato (R$)"
          value={value}
          onValueChange={(next) => {
            setValue(next)
            onValueChange?.(next)
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

export const Empty: Story = {
  args: {},
  render: () => {
    const [value, setValue] = React.useState<number | null>(null)
    return (
      <div className="flex w-80 flex-col gap-2">
        <CurrencyInput
          id="entry-value"
          label="Valor de entrada (R$)"
          description="Deixe em branco se não houver entrada."
          emptyValue="null"
          value={value}
          onValueChange={setValue}
        />
        <p className="text-xs text-muted-foreground">Valor interno: {String(value)}</p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Com `emptyValue="null"` o campo sabe ficar vazio: `null` é "não informado", diferente de zero. Limpar o campo reporta `null`, o placeholder aparece e o `required` nativo passa a acusar. Zero digitado continua sendo um valor.',
      },
    },
  },
}

export const MinMax: Story = {
  args: {},
  render: () => {
    const [value, setValue] = React.useState<number>(0)
    return (
      <div className="flex w-80 flex-col gap-2">
        <CurrencyInput
          id="installment"
          label="Valor da parcela (R$)"
          description="Entre R$ 100,00 e R$ 5.000,00."
          min={100}
          max={5000}
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
          "Fora da faixa, o valor fica como foi digitado: o erro aparece ao sair do campo, no Enter ou no envio, e some quando o valor volta para a faixa. O envio nativo do formulário é barrado.",
      },
    },
  },
}
