import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "@storybook/test"
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
          "Campo de data **digitável** (`dd/mm/aaaa`, as barras entram sozinhas) com um botão de calendário no fim. Exibição em **pt-BR** e valor sempre como string **ISO** (`YYYY-MM-DD`) — fácil de serializar e enviar para API.",
          "",
          "Enquanto o texto está incompleto, nada é reportado. Uma data inteira e válida reporta o ISO. Ao sair do campo com uma data incompleta ou que não existe (`31/02/2026`), o campo mostra o erro e reporta `''`. Colar `15/03/1990` ou `1990-03-15` preenche o campo.",
          "",
          "**Props principais:**",
          "- `value` — string ISO (`YYYY-MM-DD`) ou vazio.",
          "- `onValueChange(value)` — recebe nova string ISO ou `''` ao limpar (`onChange` segue funcionando, obsoleto).",
          "- `placeholder` — texto exibido com o campo vazio.",
          "- `disabled` — desabilita o campo e o botão do calendário.",
          "- `labels` — textos do botão e do erro de data inválida.",
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
          "  onValueChange={setValue}",
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
      description: "Desabilita o campo e o botão do calendário.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    id: {
      control: "text",
      description:
        "ID do campo de texto. `FieldShell` deriva o `htmlFor` do label interno a partir disso.",
      table: { type: { summary: "string" } },
    },
    label: {
      control: "text",
      description: "Rótulo renderizado pelo componente. Use em vez de `<Label>` externo.",
      table: { type: { summary: "ReactNode" } },
    },
    onValueChange: { control: false, table: { category: "Eventos" } },
    onChange: { control: false, table: { category: "Eventos", disable: true } },
  },
} satisfies Meta<typeof DateInput>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    value: "",
    placeholder: "dd/mm/aaaa",
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
          onValueChange={setValue}
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
        <DateInput id="birth" label="Data de nascimento" value={value} onValueChange={setValue} />
        <span className="text-xs text-muted-foreground">ISO: {value || "(vazio)"}</span>
      </div>
    )
  },
}

export const Typing: Story = {
  args: { value: "" },
  parameters: {
    docs: {
      description: {
        story:
          "Digitar `15031990` mostra `15/03/1990` e reporta `1990-03-15`. Ao sair com uma data que não existe, o campo diz que ela é inválida e reporta `''`.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState("")
    return (
      <div className="flex w-[280px] flex-col gap-2">
        <DateInput label="Data da visita" value={value} onValueChange={setValue} />
        <span className="text-xs text-muted-foreground">ISO: {value || "(vazio)"}</span>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole("textbox", { name: "Data da visita" })
    await userEvent.type(field, "15031990")
    await expect(field).toHaveValue("15/03/1990")
    await expect(canvas.getByText("ISO: 1990-03-15")).toBeInTheDocument()

    await userEvent.clear(field)
    await userEvent.type(field, "31022026")
    await userEvent.tab()
    await userEvent.tab()
    await expect(canvas.getByRole("alert")).toHaveTextContent("Data inválida")
    await expect(canvas.getByText("ISO: (vazio)")).toBeInTheDocument()
  },
}
