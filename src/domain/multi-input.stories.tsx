import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"

import { Label } from "../primitives/label"
import { MultiInput } from "./multi-input"

const meta = {
  title: "Domain/MultiInput",
  component: MultiInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Input de **múltiplos tokens** (badges removíveis). Pressione `Enter` ou cole texto separado por vírgula/quebra de linha (string) ou por vírgula/espaço/`/` (number) para confirmar tokens. `Backspace` em campo vazio remove o último token.",
          "",
          "**Discriminated union em `type`:**",
          "- `type='string'` (default): `value: string[]`, `onValueChange: (values: string[]) => void` — tokens de texto livre, deduplicados, ordem de inserção preservada.",
          "- `type='number'`: `value: number[]`, `onValueChange: (values: number[]) => void` — apenas inteiros positivos, ordenados ascendente, deduplicados.",
          "",
          "**Props comuns:**",
          "- `value` — array atual de tokens (string[] ou number[] conforme `type`).",
          "- `onValueChange` — callback com o novo array.",
          "- `placeholder` — texto exibido quando não há tokens (default varia por `type`).",
          "- `prefix` / `suffix` — texto adicionado ao redor de cada token na Badge (ex.: `R$ `, ` dias`, `#`).",
          "- `disabled` — desabilita edição e remoção.",
          "- `error` — aplica borda destrutiva (use junto com `Field`).",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { MultiInput } from "@am-fernandes/ui"',
          "",
          "const [tags, setTags] = useState<string[]>([])",
          "const [numeros, setNumeros] = useState<number[]>([])",
          "",
          "<MultiInput value={tags} onValueChange={setTags} />",
          '<MultiInput type="number" value={numeros} onValueChange={setNumeros} />',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    type: {
      control: "inline-radio",
      options: ["string", "number"],
      description:
        "Discrimina o tipo de token aceito. Define o shape de `value` e `onValueChange`.",
      table: {
        type: { summary: "'string' | 'number'" },
        defaultValue: { summary: "'string'" },
      },
    },
    value: {
      control: "object",
      description: "Array de tokens atual (`string[]` ou `number[]` conforme `type`).",
      table: { type: { summary: "string[] | number[]" } },
    },
    onValueChange: {
      control: false,
      description: "Callback com o array atualizado de tokens.",
      table: {
        type: { summary: "(values: string[] | number[]) => void" },
        category: "Eventos",
      },
    },
    placeholder: {
      control: "text",
      description: "Texto exibido quando a lista está vazia.",
      table: { type: { summary: "string" } },
    },
    prefix: {
      control: "text",
      description: "Texto adicionado **antes** de cada token na Badge (ex.: `#`, `R$ `).",
      table: { type: { summary: "string" } },
    },
    suffix: {
      control: "text",
      description: "Texto adicionado **depois** de cada token na Badge (ex.: ` dias`, ` %`).",
      table: { type: { summary: "string" } },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita edição e remoção.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    error: {
      control: "boolean",
      description: "Aplica borda destrutiva.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
  },
} satisfies Meta<typeof MultiInput>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    type: "string",
    value: ["urgente", "fiscal"],
    onValueChange: () => {},
    placeholder: "",
    prefix: "",
    suffix: "",
    disabled: false,
    error: false,
  },
  render: (args) => {
    const isNumber = args.type === "number"
    const [stringValues, setStringValues] = React.useState<string[]>(
      isNumber ? [] : ((args.value as string[]) ?? []),
    )
    const [numberValues, setNumberValues] = React.useState<number[]>(
      isNumber ? ((args.value as number[]) ?? []) : [],
    )

    React.useEffect(() => {
      if (args.type === "number") {
        setNumberValues((args.value as number[]) ?? [])
      } else {
        setStringValues((args.value as string[]) ?? [])
      }
    }, [args.type, args.value])

    return (
      <div className="flex flex-col gap-2 w-80">
        <Label>Tokens</Label>
        {isNumber ? (
          <MultiInput
            type="number"
            value={numberValues}
            onValueChange={setNumberValues}
            placeholder={args.placeholder}
            prefix={args.prefix}
            suffix={args.suffix}
            disabled={args.disabled}
            error={args.error}
          />
        ) : (
          <MultiInput
            value={stringValues}
            onValueChange={setStringValues}
            placeholder={args.placeholder}
            prefix={args.prefix}
            suffix={args.suffix}
            disabled={args.disabled}
            error={args.error}
          />
        )}
      </div>
    )
  },
}

export const StringDefault: Story = {
  args: { value: [], onValueChange: () => {} },
  render: () => {
    const [values, setValues] = React.useState<string[]>(["urgente", "fiscal"])
    return (
      <div className="flex flex-col gap-2 w-80">
        <Label htmlFor="tags">Tags</Label>
        <MultiInput value={values} onValueChange={setValues} />
      </div>
    )
  },
}

export const StringWithPrefixHash: Story = {
  args: { value: [], onValueChange: () => {} },
  render: () => {
    const [values, setValues] = React.useState<string[]>(["jurídico", "compliance"])
    return (
      <div className="flex flex-col gap-2 w-80">
        <Label htmlFor="areas">Áreas</Label>
        <MultiInput value={values} onValueChange={setValues} prefix="#" />
      </div>
    )
  },
}

export const NumberDefault: Story = {
  args: { type: "number", value: [], onValueChange: () => {} },
  render: () => {
    const [values, setValues] = React.useState<number[]>([30, 60, 90])
    return (
      <div className="flex flex-col gap-2 w-80">
        <Label htmlFor="numbers">Lista de números</Label>
        <MultiInput type="number" value={values} onValueChange={setValues} />
      </div>
    )
  },
}

export const NumberWithSuffixDias: Story = {
  args: { type: "number", value: [], onValueChange: () => {} },
  render: () => {
    const [values, setValues] = React.useState<number[]>([15, 30, 45])
    return (
      <div className="flex flex-col gap-2 w-80">
        <Label htmlFor="installments">Parcelamento</Label>
        <MultiInput type="number" value={values} onValueChange={setValues} suffix=" dias" />
      </div>
    )
  },
}

export const NumberWithPrefixCurrency: Story = {
  args: { type: "number", value: [], onValueChange: () => {} },
  render: () => {
    const [values, setValues] = React.useState<number[]>([1000, 2500, 5000])
    return (
      <div className="flex flex-col gap-2 w-80">
        <Label htmlFor="amounts">Valores</Label>
        <MultiInput type="number" value={values} onValueChange={setValues} prefix="R$ " />
      </div>
    )
  },
}

export const Disabled: Story = {
  args: { value: ["fixo"], onValueChange: () => {}, disabled: true },
  render: () => (
    <div className="flex flex-col gap-2 w-80">
      <Label>Read-only</Label>
      <MultiInput value={["fixo-a", "fixo-b"]} onValueChange={() => {}} disabled />
    </div>
  ),
}
