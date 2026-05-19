import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { PercentageInput } from "./percentage-input"

const meta = {
  title: "Domain/PercentageInput",
  component: PercentageInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Input controlado para **percentuais**. Display em pt-BR com sufixo `%` (ex.: `33,33`) enquanto o valor interno é mantido como **número decimal** (0–100 tipicamente), ex.: `33.33`.",
          "",
          "**Props principais:**",
          "- `value` — valor atual em percentual (float). Internamente é convertido para centésimos inteiros para evitar erros de ponto flutuante.",
          "- `onValueChange` — callback `(value: number) => void` disparado a cada edição com o novo decimal.",
          "- `label` — rótulo renderizado pelo próprio componente via `FieldShell`. Prefira esta prop em vez de um `<Label>` externo.",
          "- `disabled` — desabilita a edição.",
          "- `placeholder` — texto exibido quando vazio (repassado ao `<input>`).",
          "- Demais props do `<input>` nativo (exceto `value`, `onChange`, `type`) são repassadas (`id`, `name`, `aria-*`, `className`).",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { PercentageInput } from "@am-fernandes/ui"',
          "",
          "const [value, setValue] = useState(0)",
          "",
          "<PercentageInput",
          '  id="commission"',
          '  label="Comissão (%)"',
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
      control: "number",
      description: "Valor percentual atual como decimal (ex.: `33.33`). Display exibe `33,33 %`.",
      table: { type: { summary: "number" } },
    },
    label: {
      control: "text",
      description:
        "Rótulo renderizado pelo próprio componente via `FieldShell`. Use em vez de `<Label>` externo.",
      table: { type: { summary: "ReactNode" } },
    },
    onValueChange: {
      control: false,
      description: "Callback disparado a cada edição com o novo decimal.",
      table: {
        type: { summary: "(value: number) => void" },
        category: "Eventos",
      },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o campo.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    placeholder: {
      control: "text",
      description: "Placeholder repassado ao `<input>` nativo.",
      table: { type: { summary: "string" } },
    },
  },
} satisfies Meta<typeof PercentageInput>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    value: 0,
    onValueChange: () => {},
    disabled: false,
    placeholder: "",
  },
  render: (args) => {
    const [value, setValue] = React.useState<number>(args.value ?? 0)
    React.useEffect(() => {
      setValue(args.value ?? 0)
    }, [args.value])
    return (
      <div className="flex flex-col gap-2 w-80">
        <PercentageInput
          {...args}
          id="commission"
          label="Comissão (%)"
          value={value}
          onValueChange={(next) => {
            setValue(next)
            args.onValueChange?.(next)
          }}
        />
        <p className="text-xs text-muted-foreground">Valor interno: {value}</p>
      </div>
    )
  },
}

export const Default: Story = {
  args: {
    value: 0,
    onValueChange: () => {},
  },
  render: () => {
    const [value, setValue] = React.useState<number>(0)
    return (
      <div className="w-80">
        <PercentageInput
          id="commission"
          label="Comissão (%)"
          value={value}
          onValueChange={setValue}
        />
      </div>
    )
  },
}
