import type { Meta, StoryObj } from "@storybook/react-vite"
import { Input } from "./input"
import { Label } from "./label"

const meta = {
  title: "Primitives/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Label associado a controles de formulário via `htmlFor`. Aplica estilos consistentes e respeita `peer-disabled`.",
          "",
          "**Props principais:**",
          "- `htmlFor` — id do controle associado (input, checkbox, switch, etc.).",
          "- `children` — texto da label.",
          "- `className` — classes Tailwind extras (espaçamento, cor).",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Input, Label } from "@am-fernandes/ui"',
          "",
          '<div className="flex flex-col gap-2">',
          '  <Label htmlFor="email">Email</Label>',
          '  <Input id="email" type="email" placeholder="seu.email@exemplo.com" />',
          "</div>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    htmlFor: {
      control: "text",
      description: "ID do controle associado (corresponde ao `id` do input).",
      table: { type: { summary: "string" } },
    },
    children: {
      control: "text",
      description: "Texto da label.",
      table: { type: { summary: "ReactNode" } },
    },
    className: {
      control: "text",
      description: "Classes Tailwind extras.",
      table: { type: { summary: "string" } },
    },
  },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    children: "Email",
    htmlFor: "email-playground",
  },
}

export const Default: Story = {
  args: { children: "Email", htmlFor: "email-default" },
}

export const WithInput: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="seu.email@exemplo.com" />
    </div>
  ),
}
