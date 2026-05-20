import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "@storybook/test"
import * as React from "react"

import { isValidCPF } from "@/lib/brazil"
import { CPFInput } from "./cpf-input"

const meta = {
  title: "Domain/CPFInput",
  component: CPFInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Input controlado para **CPF** com máscara `000.000.000-00`. O valor interno são apenas os **dígitos limpos** (string de até 11 dígitos), enquanto o display é mascarado em tempo real.",
          "",
          "**Props principais:**",
          '- `value` — CPF atual como string de dígitos limpos (ex.: `"12345678909"`).',
          "- `onValueChange` — callback `(value: string) => void` que recebe os dígitos limpos a cada edição.",
          "- `label` — rótulo renderizado pelo próprio componente via `FieldShell`.",
          "- `disabled` — desabilita a edição.",
          "- Demais props do `<input>` (exceto `value`, `onChange`, `type`) são repassadas.",
          "",
          "**Validação:** o componente é apenas um formatador. Para validar o DV use `isValidCPF` de `@amfernandesinc/ui/lib/brazil`.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { CPFInput, isValidCPF } from "@amfernandesinc/ui"',
          "",
          'const [cpf, setCpf] = useState("")',
          'const error = cpf.length === 11 && !isValidCPF(cpf) ? "CPF inválido" : undefined',
          "",
          "<CPFInput",
          '  id="cpf"',
          '  label="CPF"',
          "  value={cpf}",
          "  onValueChange={setCpf}",
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
      description: "Dígitos limpos do CPF (0–11 chars).",
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
} satisfies Meta<typeof CPFInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { value: "", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("")
    return (
      <div className="w-80">
        <CPFInput id="cpf" label="CPF" value={value} onValueChange={setValue} />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText(/CPF/) as HTMLInputElement
    await userEvent.type(input, "12345678909")
    await expect(input).toHaveValue("123.456.789-09")
  },
}

export const Filled: Story = {
  args: { value: "12345678909", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("12345678909")
    return (
      <div className="w-80">
        <CPFInput id="cpf" label="CPF" value={value} onValueChange={setValue} />
      </div>
    )
  },
}

export const ErrorState: Story = {
  args: { value: "12345678900", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("12345678900")
    return (
      <div className="w-80">
        <CPFInput
          id="cpf"
          label="CPF"
          value={value}
          onValueChange={setValue}
          error="CPF inválido"
        />
      </div>
    )
  },
}

export const Disabled: Story = {
  args: { value: "12345678909", onValueChange: () => {}, disabled: true },
  render: () => (
    <div className="w-80">
      <CPFInput id="cpf" label="CPF" value="12345678909" onValueChange={() => {}} disabled />
    </div>
  ),
}

export const Required: Story = {
  args: { value: "", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("")
    return (
      <div className="w-80">
        <CPFInput id="cpf" label="CPF" value={value} onValueChange={setValue} required />
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
        <CPFInput
          id="cpf"
          label="CPF"
          description="Informe apenas dígitos; o formato será aplicado automaticamente."
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
    const showError = value.length === 11 && !isValidCPF(value)
    return (
      <div className="w-80">
        <CPFInput
          id="cpf"
          label="CPF"
          value={value}
          onValueChange={setValue}
          error={showError ? "CPF inválido (DV incorreto)" : undefined}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Dígitos: {value || "(vazio)"} — válido: {String(isValidCPF(value))}
        </p>
      </div>
    )
  },
}
