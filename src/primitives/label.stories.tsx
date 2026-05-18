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
        component:
          "Label associado a controles de formulário via `htmlFor`. Aplica estilos consistentes e respeita `peer-disabled`.",
      },
    },
  },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

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
