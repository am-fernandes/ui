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
          "Input controlado para **CNPJ** com máscara `XX.XXX.XXX/XXXX-DD`. O valor interno é o CNPJ **sem máscara** (string de até 14 caracteres), enquanto o display é mascarado em tempo real.",
          "",
          "**CNPJ alfanumérico.** A Receita emite CNPJ com letras desde julho de 2026 (IN RFB 2.229/2024): as doze primeiras posições aceitam dígitos ou letras maiúsculas e os dois dígitos verificadores continuam numéricos. O campo aceita os dois formatos, passa para maiúsculas o que é digitado e abre o teclado de texto no celular.",
          "",
          "**Props principais:**",
          '- `value` — CNPJ atual sem máscara (ex.: `"11222333000181"` ou `"12ABC34501DE35"`).',
          "- `onValueChange` — callback `(value: string) => void` que recebe o CNPJ sem máscara a cada edição.",
          "- `label` — rótulo renderizado pelo próprio componente via `FieldShell`.",
          "- `disabled` — desabilita a edição.",
          "- Demais props do `<input>` (exceto `value`, `onChange`, `type`) são repassadas.",
          "",
          "**Validação:** o componente é apenas um formatador. Para validar o DV use `isValidCNPJ` de `@amfernandesinc/ui/lib/brazil`.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { CNPJInput, isValidCNPJ } from "@amfernandesinc/ui"',
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
      description:
        "CNPJ sem máscara (0–14 caracteres: dígitos e, nas doze primeiras posições, letras).",
      table: { type: { summary: "string" } },
    },
    onValueChange: {
      control: false,
      description: "Callback disparado a cada edição com o CNPJ sem máscara.",
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

export const Alphanumeric: Story = {
  args: { value: "12ABC34501DE35", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("12ABC34501DE35")
    return (
      <div className="w-80">
        <CNPJInput id="cnpj" label="CNPJ" value={value} onValueChange={setValue} />
        <p className="text-xs text-muted-foreground mt-1">
          Valor: {value || "(vazio)"} — válido: {String(isValidCNPJ(value))}
        </p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "O exemplo oficial da Receita, `12.ABC.345/01DE-35`. O pai recebe os 14 caracteres sem máscara (`12ABC34501DE35`) e `isValidCNPJ` confere os dígitos verificadores dos dois formatos.",
      },
    },
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
