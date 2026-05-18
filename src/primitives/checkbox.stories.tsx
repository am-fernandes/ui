import type { Meta, StoryObj } from "@storybook/react-vite"
import { Checkbox } from "./checkbox"
import { Label } from "./label"

const meta = {
  title: "Primitives/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Checkbox controlado/não-controlado baseado em Radix. Pareie com `Label` via `htmlFor`/`id`.",
          "",
          "**Props principais:**",
          "- `checked` / `onCheckedChange` — modo controlado (`boolean | 'indeterminate'`).",
          "- `defaultChecked` — estado inicial em modo não-controlado.",
          "- `disabled` — desabilita interação.",
          "- `required` — marca como obrigatório em forms nativos.",
          "- `id` — para parear com `Label htmlFor`.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    checked: {
      control: "boolean",
      description: "Estado controlado.",
      table: { type: { summary: "boolean | 'indeterminate'" } },
    },
    defaultChecked: {
      control: "boolean",
      description: "Estado inicial em modo não-controlado.",
      table: { type: { summary: "boolean" } },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o checkbox.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    required: {
      control: "boolean",
      description: "Marca como obrigatório.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    id: {
      control: "text",
      description: "ID HTML — use junto com `Label htmlFor`.",
      table: { type: { summary: "string" } },
    },
    className: {
      control: "text",
      description: "Classes Tailwind extras.",
      table: { type: { summary: "string" } },
    },
    onCheckedChange: {
      control: false,
      description: "Disparado quando o estado muda.",
      table: {
        category: "Eventos",
        type: { summary: "(checked: boolean | 'indeterminate') => void" },
      },
    },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    defaultChecked: false,
    disabled: false,
    required: false,
    id: "playground",
  },
}

export const Default: Story = {}

export const Checked: Story = {
  args: { defaultChecked: true },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Aceito os termos de uso</Label>
    </div>
  ),
}
