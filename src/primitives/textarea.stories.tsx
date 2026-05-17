import type { Meta, StoryObj } from "@storybook/react-vite"
import { Textarea } from "./textarea"

const meta = {
  title: "Primitives/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { placeholder: "Digite sua mensagem" },
}

export const Disabled: Story = {
  args: { placeholder: "Digite sua mensagem", disabled: true },
}

export const WithRows: Story = {
  args: { rows: 6, placeholder: "Mensagem longa..." },
}
