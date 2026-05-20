import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "@storybook/test"
import * as React from "react"

import { isValidCEP } from "@/lib/brazil"
import { CEPInput } from "./cep-input"

const meta = {
  title: "Domain/CEPInput",
  component: CEPInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Input controlado para **CEP** com máscara `00000-000`. O valor interno são apenas os **dígitos limpos** (string de até 8 dígitos), enquanto o display é mascarado em tempo real.",
          "",
          "**Props principais:**",
          '- `value` — CEP atual como string de dígitos limpos (ex.: `"01310100"`).',
          "- `onValueChange` — callback `(value: string) => void` que recebe os dígitos limpos a cada edição.",
          "- `label` — rótulo renderizado pelo próprio componente via `FieldShell`.",
          "- `disabled` — desabilita a edição.",
          "- Demais props do `<input>` (exceto `value`, `onChange`, `type`) são repassadas.",
          "",
          "**Validação:** o componente é apenas um formatador. Para validar o tamanho use `isValidCEP` de `@amfernandesinc/ui/lib/brazil`.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { CEPInput, isValidCEP } from "@amfernandesinc/ui"',
          "",
          'const [cep, setCep] = useState("")',
          'const error = cep.length > 0 && !isValidCEP(cep) ? "CEP incompleto" : undefined',
          "",
          "<CEPInput",
          '  id="cep"',
          '  label="CEP"',
          "  value={cep}",
          "  onValueChange={setCep}",
          "  error={error}",
          "/>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    value: {
      control: "text",
      description: "Dígitos limpos do CEP (0–8 chars).",
      table: { type: { summary: "string" } },
    },
    onValueChange: {
      control: false,
      description: "Callback disparado a cada edição com os dígitos limpos.",
      table: { type: { summary: "(value: string) => void" }, category: "Eventos" },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o campo.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    label: {
      control: "text",
      description: "Rótulo renderizado via `FieldShell`.",
      table: { type: { summary: "ReactNode" } },
    },
  },
} satisfies Meta<typeof CEPInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { value: "", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("")
    return (
      <div className="w-80">
        <CEPInput id="cep" label="CEP" value={value} onValueChange={setValue} />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText(/CEP/) as HTMLInputElement
    await userEvent.type(input, "01310100")
    await expect(input).toHaveValue("01310-100")
  },
}

export const Filled: Story = {
  args: { value: "01310100", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("01310100")
    return (
      <div className="w-80">
        <CEPInput id="cep" label="CEP" value={value} onValueChange={setValue} />
      </div>
    )
  },
}

export const ErrorState: Story = {
  args: { value: "0131", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("0131")
    return (
      <div className="w-80">
        <CEPInput
          id="cep"
          label="CEP"
          value={value}
          onValueChange={setValue}
          error="CEP incompleto"
        />
      </div>
    )
  },
}

export const Disabled: Story = {
  args: { value: "01310100", onValueChange: () => {}, disabled: true },
  render: () => (
    <div className="w-80">
      <CEPInput id="cep" label="CEP" value="01310100" onValueChange={() => {}} disabled />
    </div>
  ),
}

export const Required: Story = {
  args: { value: "", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("")
    return (
      <div className="w-80">
        <CEPInput id="cep" label="CEP" value={value} onValueChange={setValue} required />
      </div>
    )
  },
}

export const Description: Story = {
  args: { value: "", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("")
    return (
      <div className="w-80">
        <CEPInput
          id="cep"
          label="CEP"
          description="Código de Endereçamento Postal — 8 dígitos."
          value={value}
          onValueChange={setValue}
        />
      </div>
    )
  },
}

export const WithValidationFeedback: Story = {
  args: { value: "", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("")
    const showError = value.length > 0 && value.length < 8 && !isValidCEP(value)
    return (
      <div className="w-80">
        <CEPInput
          id="cep"
          label="CEP"
          value={value}
          onValueChange={setValue}
          error={showError ? "CEP incompleto (precisa de 8 dígitos)" : undefined}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Dígitos: {value || "(vazio)"} — válido: {String(isValidCEP(value))}
        </p>
      </div>
    )
  },
}
