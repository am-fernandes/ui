import type { Meta, StoryObj } from "@storybook/react-vite"
import { Input } from "./input"

const meta = {
  title: "Primitives/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Input de texto base. Aceita todos os atributos HTML nativos (`type`, `placeholder`, `disabled`, etc.). Pareie com `Label` para acessibilidade.",
      },
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { placeholder: "Digite aqui" },
}

export const Disabled: Story = {
  args: { placeholder: "Digite aqui", disabled: true },
}

export const WithPlaceholder: Story = {
  args: { placeholder: "seu.email@exemplo.com", type: "email" },
}

export const Types: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Input type="text" placeholder="text" />
      <Input type="email" placeholder="email" />
      <Input type="number" placeholder="number" />
      <Input type="password" placeholder="password" />
    </div>
  ),
}
