import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "@storybook/test"
import * as React from "react"

import { isValidPhone } from "@/lib/brazil"
import { PhoneInput } from "./phone-input"

const meta = {
  title: "Domain/PhoneInput",
  component: PhoneInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Input controlado para **telefone brasileiro**. A máscara se ajusta automaticamente:",
          "- 10 dígitos (fixo) → `(00) 0000-0000`",
          "- 11 dígitos (celular) → `(00) 00000-0000`",
          "",
          "O valor interno são apenas os **dígitos limpos** (string de até 11 dígitos).",
          "",
          "**Props principais:**",
          '- `value` — telefone atual como string de dígitos limpos (ex.: `"11987654321"`).',
          "- `onValueChange` — callback `(value: string) => void` que recebe os dígitos limpos a cada edição.",
          "- `label` — rótulo renderizado pelo próprio componente via `FieldShell`.",
          "- `disabled` — desabilita a edição.",
          "- Demais props do `<input>` (exceto `value`, `onChange`, `type`) são repassadas.",
          "",
          "**Validação:** o componente é apenas um formatador. Para validar use `isValidPhone` de `@am-fernandes/ui/lib/brazil`.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { PhoneInput, isValidPhone } from "@am-fernandes/ui"',
          "",
          'const [phone, setPhone] = useState("")',
          'const error = phone.length >= 10 && !isValidPhone(phone) ? "Telefone inválido" : undefined',
          "",
          "<PhoneInput",
          '  id="phone"',
          '  label="Telefone"',
          "  value={phone}",
          "  onValueChange={setPhone}",
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
      description: "Dígitos limpos do telefone (0–11 chars).",
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
} satisfies Meta<typeof PhoneInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { value: "", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("")
    return (
      <div className="w-80">
        <PhoneInput id="phone" label="Telefone" value={value} onValueChange={setValue} />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText(/Telefone/) as HTMLInputElement
    await userEvent.type(input, "11987654321")
    await expect(input).toHaveValue("(11) 98765-4321")
  },
}

export const Filled: Story = {
  args: { value: "11987654321", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("11987654321")
    return (
      <div className="w-80">
        <PhoneInput id="phone" label="Telefone" value={value} onValueChange={setValue} />
      </div>
    )
  },
}

export const ErrorState: Story = {
  args: { value: "1098765432", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("1098765432")
    return (
      <div className="w-80">
        <PhoneInput
          id="phone"
          label="Telefone"
          value={value}
          onValueChange={setValue}
          error="DDD inválido"
        />
      </div>
    )
  },
}

export const Disabled: Story = {
  args: { value: "11987654321", onValueChange: () => {}, disabled: true },
  render: () => (
    <div className="w-80">
      <PhoneInput
        id="phone"
        label="Telefone"
        value="11987654321"
        onValueChange={() => {}}
        disabled
      />
    </div>
  ),
}

export const Required: Story = {
  args: { value: "", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("")
    return (
      <div className="w-80">
        <PhoneInput id="phone" label="Telefone" value={value} onValueChange={setValue} required />
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
        <PhoneInput
          id="phone"
          label="Telefone"
          description="Inclua DDD. Aceita fixo (10 dígitos) ou celular (11 dígitos)."
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
    const showError = value.length >= 10 && !isValidPhone(value)
    return (
      <div className="w-80">
        <PhoneInput
          id="phone"
          label="Telefone"
          value={value}
          onValueChange={setValue}
          error={showError ? "Telefone inválido (verifique o DDD)" : undefined}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Dígitos: {value || "(vazio)"} — válido: {String(isValidPhone(value))}
        </p>
      </div>
    )
  },
}
