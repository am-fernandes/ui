import type { Meta, StoryObj } from "@storybook/react-vite"
import { Label } from "./label"
import { Switch } from "./switch"

const meta = {
  title: "Primitives/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Toggle on/off para preferências binárias. Pareie com `Label` para acessibilidade.",
          "",
          "**Props principais:**",
          "- `checked` / `onCheckedChange` — modo controlado.",
          "- `defaultChecked` — estado inicial em modo não-controlado.",
          "- `disabled` — desabilita interação.",
          "- `required` — marca como obrigatório.",
          "- `id` / `name` — integração com `Label` e forms nativos.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Label, Switch } from "@am-fernandes/ui"',
          "",
          '<div className="flex items-center gap-2">',
          '  <Switch id="notifications" />',
          '  <Label htmlFor="notifications">Notificações por email</Label>',
          "</div>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    checked: {
      control: "boolean",
      description: "Estado controlado.",
      table: { type: { summary: "boolean" } },
    },
    defaultChecked: {
      control: "boolean",
      description: "Estado inicial em modo não-controlado.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o switch.",
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
    name: {
      control: "text",
      description: "Atributo `name` para forms nativos.",
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
      table: { category: "Eventos", type: { summary: "(checked: boolean) => void" } },
    },
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    defaultChecked: false,
    disabled: false,
    required: false,
    id: "switch-playground",
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
      <Switch id="notifications" />
      <Label htmlFor="notifications">Notificações por email</Label>
    </div>
  ),
}
