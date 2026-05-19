import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "@storybook/test"
import * as React from "react"

import { isValidCNPJ } from "@/lib/brazil"
import { CNPJInput } from "./cnpj-input"

const meta = {
  title: "Domain/CNPJInput",
  component: CNPJInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Input controlado para **CNPJ** com máscara `00.000.000/0000-00`. O valor interno são apenas os **dígitos limpos** (string de até 14 dígitos), enquanto o display é mascarado em tempo real.",
          "",
          "**Props principais:**",
          '- `value` — CNPJ atual como string de dígitos limpos (ex.: `"11222333000181"`).',
          "- `onValueChange` — callback `(value: string) => void` que recebe os dígitos limpos a cada edição.",
          "- `label` — rótulo renderizado pelo próprio componente via `FieldShell`.",
          "- `disabled` — desabilita a edição.",
          "- Demais props do `<input>` (exceto `value`, `onChange`, `type`) são repassadas.",
          "",
          "**Validação:** o componente é apenas um formatador. Para validar o DV use `isValidCNPJ` de `@am-fernandes/ui/lib/brazil`.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { CNPJInput, isValidCNPJ } from "@am-fernandes/ui"',
          "",
          'const [cnpj, setCnpj] = useState("")',
          'const error = cnpj.length === 14 && !isValidCNPJ(cnpj) ? "CNPJ inválido" : undefined',
          "",
          "<CNPJInput",
          '  id="cnpj"',
          '  label="CNPJ"',
          "  value={cnpj}",
          "  onValueChange={setCnpj}",
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
      description: "Dígitos limpos do CNPJ (0–14 chars).",
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
} satisfies Meta<typeof CNPJInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { value: "", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("")
    return (
      <div className="w-80">
        <CNPJInput id="cnpj" label="CNPJ" value={value} onValueChange={setValue} />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText(/CNPJ/) as HTMLInputElement
    await userEvent.type(input, "11222333000181")
    await expect(input).toHaveValue("11.222.333/0001-81")
  },
}

export const Filled: Story = {
  args: { value: "11222333000181", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("11222333000181")
    return (
      <div className="w-80">
        <CNPJInput id="cnpj" label="CNPJ" value={value} onValueChange={setValue} />
      </div>
    )
  },
}

export const ErrorState: Story = {
  args: { value: "11222333000180", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("11222333000180")
    return (
      <div className="w-80">
        <CNPJInput
          id="cnpj"
          label="CNPJ"
          value={value}
          onValueChange={setValue}
          error="CNPJ inválido"
        />
      </div>
    )
  },
}

export const Disabled: Story = {
  args: { value: "11222333000181", onValueChange: () => {}, disabled: true },
  render: () => (
    <div className="w-80">
      <CNPJInput id="cnpj" label="CNPJ" value="11222333000181" onValueChange={() => {}} disabled />
    </div>
  ),
}

export const Required: Story = {
  args: { value: "", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("")
    return (
      <div className="w-80">
        <CNPJInput id="cnpj" label="CNPJ" value={value} onValueChange={setValue} required />
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
        <CNPJInput
          id="cnpj"
          label="CNPJ"
          description="Inscrição da empresa na Receita Federal."
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
    const showError = value.length === 14 && !isValidCNPJ(value)
    return (
      <div className="w-80">
        <CNPJInput
          id="cnpj"
          label="CNPJ"
          value={value}
          onValueChange={setValue}
          error={showError ? "CNPJ inválido (DV incorreto)" : undefined}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Dígitos: {value || "(vazio)"} — válido: {String(isValidCNPJ(value))}
        </p>
      </div>
    )
  },
}
