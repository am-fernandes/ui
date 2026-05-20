import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { DateInput } from "./date-input"

const meta = {
  title: "Forms/DateInput",
  component: DateInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Input de data com popover `Calendar` integrado. Exibição em formato **pt-BR** (`DD/MM/AAAA`) e valor sempre como string **ISO** (`YYYY-MM-DD`) — fácil de serializar e enviar para API.",
          "",
          "**Props principais:**",
          "- `value` — string ISO (`YYYY-MM-DD`) ou vazio.",
          "- `onChange(value)` — recebe nova string ISO ou `''` ao limpar.",
          "- `placeholder` — texto exibido quando `value` está vazio.",
          "- `disabled` — alterna para um `Input` somente leitura com fundo `muted`.",
          "- `label` — rótulo renderizado pelo próprio componente (via `FieldShell`). Use em vez de envolver com `<Label>` externo.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { DateInput } from "@amfernandesinc/ui"',
          'import { useState } from "react"',
          "",
          'const [value, setValue] = useState("")',
          "",
          "<DateInput",
          '  id="birth"',
          '  label="Data de nascimento"',
          "  value={value}",
          "  onChange={setValue}",
          '  placeholder="DD/MM/AAAA"',
          "/>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    value: {
      control: "text",
      description: "Data em formato ISO (`YYYY-MM-DD`). Vazio para nenhuma data.",
      table: { type: { summary: "string" } },
    },
    placeholder: {
      control: "text",
      description: "Texto exibido quando `value` está vazio.",
      table: { type: { summary: "string" }, defaultValue: { summary: "'dd/mm/aaaa'" } },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o trigger e renderiza um Input somente leitura.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    id: {
      control: "text",
      description: "ID do trigger. `FieldShell` deriva o `htmlFor` do label interno a partir disso.",
      table: { type: { summary: "string" } },
    },
    label: {
      control: "text",
      description: "Rótulo renderizado pelo componente. Use em vez de `<Label>` externo.",
      table: { type: { summary: "ReactNode" } },
    },
    onChange: { control: false, table: { category: "Eventos" } },
  },
} satisfies Meta<typeof DateInput>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    value: "",
    placeholder: "DD/MM/AAAA",
    disabled: false,
    id: "playground-date",
    label: "Data",
  },
  render: (args) => {
    const [value, setValue] = useState(args.value)
    return (
      <div className="flex w-[280px] flex-col gap-2">
        <DateInput
          id={args.id}
          label={args.label}
          value={value}
          onChange={setValue}
          placeholder={args.placeholder}
          disabled={args.disabled}
        />
        <span className="text-xs text-muted-foreground">ISO: {value || "(vazio)"}</span>
      </div>
    )
  },
}

export const Default: Story = {
  args: { value: "" },
  render: () => {
    const [value, setValue] = useState("")
    return (
      <div className="flex w-[280px] flex-col gap-2">
        <DateInput
          id="birth"
          label="Data de nascimento"
          value={value}
          onChange={setValue}
          placeholder="DD/MM/AAAA"
        />
      </div>
    )
  },
}
