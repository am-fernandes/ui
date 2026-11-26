import type { Meta, StoryObj } from "@storybook/react-vite"
import { fn } from "@storybook/test"
import { useState } from "react"

import { Button } from "./button"
import { Input } from "./input"
import { NumberInput } from "./number-input"

const meta: Meta<typeof NumberInput> = {
  title: "Primitives/NumberInput",
  component: NumberInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Campo de número para quantidades, áreas, andares, parcelas. Para dinheiro use `CurrencyInput`; para percentual, `PercentageInput`.",
          "",
          "**Valor:** `value` + `onValueChange(value)` ou `defaultValue`. Vazio é `null`, nunca `0`.",
          "**Formato brasileiro:** vírgula decimal; o ponto de milhar aparece quando o campo não tem foco (`1.250,5`) e some durante a edição. `decimals` (padrão 0) é o máximo de casas.",
          "**Digitação:** dígitos, uma vírgula (o ponto do teclado numérico vira vírgula) e o sinal de menos só quando `min` é negativo.",
          "**Colar:** segue a regra da biblioteca (a mesma do `CurrencyInput`): com vírgula, ela é decimal e os pontos são milhar; sem vírgula, um único ponto seguido de 1 ou 2 dígitos é decimal; senão, os pontos são milhar. Outros caracteres são ignorados.",
          "**Limites:** `min` e `max`. Fora da faixa, o número fica como foi digitado, o campo mostra o erro ao sair, no Enter ou no envio, e o envio nativo é barrado. Setas e botões param nos limites. `step` (padrão 1) é o passo deles.",
          "**Teclado:** ↑ e ↓ andam um `step`; PageUp e PageDown, dez; Home e End vão a `min` e `max` quando existem. A roda do mouse nunca muda o valor.",
          "**Botões:** `steppers` mostra − e +, com 24px, que não tiram o foco do campo e repetem enquanto pressionados. Nomes em `labels` (`decrement`, `increment`).",
          "**Unidades:** `prefix` e `suffix` dentro do campo (`m²`, `andares`); o leitor de tela ouve o valor com a unidade.",
          "**Formulário:** com `name`, um campo escondido envia o número bruto com ponto decimal (`1250.5`).",
          "**Campo:** `label`, `labelPosition`, `description`, `error`, `required`, `disabled`, `readOnly` e `size` como em `Input`. Teclado numérico no celular (`inputMode`), texto de 16px em telas de toque.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
    decimals: { control: { type: "number", min: 0, max: 4 } },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    steppers: { control: "boolean" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
      table: { type: { summary: "'sm' | 'md' | 'lg'" }, defaultValue: { summary: "'md'" } },
    },
    onValueChange: { control: false, table: { category: "Eventos" } },
  },
  args: { label: "Quartos", onValueChange: fn() },
  decorators: [
    (Story) => (
      <div className="w-[280px] max-w-full">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof NumberInput>

export const Default: Story = {}

export const WithDescription: Story = {
  args: { description: "Contando suítes.", min: 0, max: 10 },
}

export const WithError: Story = {
  args: { error: "Informe o número de quartos.", min: 0 },
}

export const Required: Story = {
  args: { required: true },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 3 },
}

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: 3,
    steppers: true,
    description: "Vem do cadastro do imóvel.",
  },
}

export const AreaWithUnit: Story = {
  name: "Area (decimals + suffix)",
  args: {
    label: "Área privativa",
    suffix: "m²",
    decimals: 2,
    min: 0,
    defaultValue: 1250.5,
  },
}

export const Steppers: Story = {
  args: { label: "Vagas de garagem", steppers: true, min: 0, max: 6, defaultValue: 2 },
}

export const FloorRange: Story = {
  name: "Range (min, max, Home/End)",
  args: {
    label: "Andar",
    min: -3,
    max: 40,
    defaultValue: 12,
    steppers: true,
    description: "Subsolos são negativos (−3 a 40).",
  },
}

export const Installments: Story = {
  args: {
    label: "Parcelas",
    suffix: "parcelas",
    min: 1,
    max: 420,
    step: 12,
    steppers: true,
    defaultValue: 360,
    description: "As setas andam de 12 em 12 (um ano).",
  },
}

export const WithPrefix: Story = {
  args: { label: "Código do empreendimento", prefix: "#", defaultValue: 1042 },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex items-end gap-2">
          <NumberInput size={size} label={`Number ${size}`} steppers defaultValue={2} />
          <Input size={size} label={`Input ${size}`} placeholder="Texto" />
        </div>
      ))}
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="w-[480px] max-w-full">
        <Story />
      </div>
    ),
  ],
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<number | null>(72.5)
    return (
      <div className="flex flex-col gap-2">
        <NumberInput label="Área" suffix="m²" decimals={2} value={value} onValueChange={setValue} />
        <p data-testid="value" className="text-xs text-muted-foreground">
          Valor: {value === null ? "null" : value}
        </p>
      </div>
    )
  },
}

export const InForm: Story = {
  name: "In a native form",
  render: () => {
    const [sent, setSent] = useState<string | null>(null)
    return (
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          setSent(`area=${data.get("area")}; vagas=${data.get("vagas")}`)
        }}
      >
        <NumberInput name="area" label="Área" suffix="m²" decimals={2} defaultValue={1250.5} />
        <NumberInput name="vagas" label="Vagas" steppers min={0} max={6} />
        <Button type="submit">Enviar</Button>
        {sent ? (
          <p data-testid="sent" className="text-xs text-muted-foreground">
            Enviado: {sent}
          </p>
        ) : null}
      </form>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "O formulário recebe o número bruto, com ponto decimal; um campo vazio envia texto vazio.",
      },
    },
  },
}
