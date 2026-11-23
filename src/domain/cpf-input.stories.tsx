import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "@storybook/test"
import * as React from "react"

import { isValidCPF } from "@/lib/brazil"
import { Button } from "../primitives/button"
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
          "Input para **CPF** com máscara `000.000.000-00`. O valor interno são apenas os **dígitos limpos** (string de até 11 dígitos), enquanto o display é mascarado em tempo real.",
          "",
          "**Props principais:**",
          '- `value` — CPF atual como string de dígitos limpos (ex.: `"12345678909"`).',
          "- `onValueChange` — callback `(value: string) => void` que recebe os dígitos limpos a cada edição.",
          "- `label` — rótulo renderizado pelo próprio componente via `FieldShell`.",
          "- `disabled` — desabilita a edição.",
          "- `defaultValue` — valor inicial (sem máscara) quando o campo não é controlado: sem `value`, ele guarda o próprio valor.",
          "- `name` — nome no formulário nativo. O form recebe o valor **sem máscara**, por um input oculto.",
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

export const NativeForm: Story = {
  args: {},
  render: () => {
    const [sent, setSent] = React.useState<string | null>(null)
    return (
      <form
        className="flex w-80 flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          setSent(String(new FormData(event.currentTarget).get("cpf")))
        }}
      >
        <CPFInput id="cpf-native" label="CPF" name="cpf" defaultValue="529982" required />
        <div className="flex gap-2">
          <Button type="submit">Enviar</Button>
          <Button type="reset" variant="outline">
            Desfazer
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Enviado: {sent ?? "(nada ainda)"}</p>
      </form>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText(/CPF/) as HTMLInputElement
    await expect(input).toHaveValue("529.982")
    await userEvent.click(input)
    await userEvent.keyboard("{End}24725")
    await expect(input).toHaveValue("529.982.247-25")
    await userEvent.click(canvas.getByRole("button", { name: "Enviar" }))
    // O form recebe os dígitos, não a máscara.
    await expect(canvas.getByText("Enviado: 52998224725")).toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "Desfazer" }))
    await expect(input).toHaveValue("529.982")
  },
  parameters: {
    docs: {
      description: {
        story:
          "Sem `value`, o campo é **não controlado**: parte de `defaultValue` e guarda o que é digitado. Com `name`, o `<form>` nativo recebe os dígitos limpos (`52998224725`), e o botão de reset devolve o `defaultValue`.",
      },
    },
  },
}
