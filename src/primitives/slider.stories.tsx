import type { Meta, StoryObj } from "@storybook/react-vite"
import { fn } from "@storybook/test"
import { useState } from "react"

import { Button } from "./button"
import { Slider } from "./slider"

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)

const meta: Meta<typeof Slider> = {
  title: "Primitives/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Escolha de um valor, ou de uma faixa, arrastando: área mínima, faixa de preço, desconto. Quando o número exato importa mais que a ideia de grandeza, prefira `NumberInput`.",
          "",
          '**Valor:** `value` + `onValueChange(número)` ou `defaultValue`. Com `range`, dois polegares e um par `[mínimo, máximo]`; cada polegar tem nome próprio ("Preço mínimo", "Preço máximo", de `labels`).',
          "**Faixa:** `min` (0), `max` (100), `step` (1); `minStepsBetweenThumbs` para manter os polegares afastados.",
          "**Valor visível:** `showValue` mostra o valor ao lado do rótulo, com `formatValue` (padrão: número brasileiro, `1.250`). O leitor de tela ouve o mesmo texto em cada polegar.",
          "**Marcas:** `marks` desenha traços abaixo da trilha, com rótulo opcional (`[0, 50, 100]` ou `{ value, label }`).",
          "**Teclado:** setas andam um `step`; PageUp e PageDown, dez; Home e End vão às pontas.",
          "**Formulário:** com `name`, um campo escondido por polegar leva o valor; uma faixa envia o nome duas vezes (`FormData.getAll`). O reset do formulário volta ao `defaultValue`.",
          "**Campo:** `label` (ou `aria-label`), `description`, `error` e `disabled`. Polegares de 24px com o anel de foco da biblioteca; visível em cores forçadas.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    showValue: { control: "boolean" },
    disabled: { control: "boolean" },
    onValueChange: { control: false, table: { category: "Eventos" } },
  },
  args: {
    label: "Área mínima",
    min: 0,
    max: 500,
    step: 10,
    defaultValue: 120,
    onValueChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[320px] max-w-full">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof Slider>

export const Default: Story = {}

export const WithValue: Story = {
  args: { showValue: true, formatValue: (v) => `${v} m²` },
}

export const WithDescription: Story = {
  args: { description: "Área privativa, em m².", showValue: true },
}

export const WithError: Story = {
  args: { error: "A área mínima deste empreendimento é 40 m².", defaultValue: 20 },
}

export const Disabled: Story = {
  args: { disabled: true, showValue: true },
}

export const PriceRange: Story = {
  args: {
    range: true,
    label: "Preço",
    min: 0,
    max: 2_000_000,
    step: 50_000,
    defaultValue: [300_000, 800_000],
    minStepsBetweenThumbs: 1,
    showValue: true,
    formatValue: brl,
  },
}

export const WithMarks: Story = {
  args: {
    label: "Vagas de garagem",
    min: 0,
    max: 4,
    step: 1,
    defaultValue: 1,
    showValue: true,
    marks: [
      { value: 0, label: "0" },
      { value: 1, label: "1" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4 ou mais" },
    ],
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState(10)
    return (
      <div className="flex flex-col gap-2">
        <Slider
          label="Desconto"
          max={30}
          step={0.5}
          value={value}
          onValueChange={setValue}
          showValue
          formatValue={(v) => `${v.toLocaleString("pt-BR")}%`}
        />
        <p data-testid="value" className="text-xs text-muted-foreground">
          Valor: {value}
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
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          setSent(`area=${data.get("area")}; preco=${data.getAll("preco").join(",")}`)
        }}
      >
        <Slider name="area" label="Área mínima" max={500} step={10} defaultValue={120} showValue />
        <Slider
          range
          name="preco"
          label="Preço"
          max={2_000_000}
          step={50_000}
          defaultValue={[300_000, 800_000]}
          showValue
          formatValue={brl}
        />
        <div className="flex gap-2">
          <Button type="submit">Enviar</Button>
          <Button type="reset" variant="outline">
            Restaurar
          </Button>
        </div>
        {sent ? (
          <p data-testid="sent" className="text-xs text-muted-foreground">
            Enviado: {sent}
          </p>
        ) : null}
      </form>
    )
  },
}
