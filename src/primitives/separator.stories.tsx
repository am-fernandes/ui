import type { Meta, StoryObj } from "@storybook/react-vite"
import { Separator } from "./separator"

const meta = {
  title: "Primitives/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          'Linha divisória horizontal ou vertical. Use `orientation="vertical"` em containers com altura definida.',
      },
    },
  },
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <div className="w-64">
      <p className="text-sm">Acima</p>
      <Separator className="my-4" />
      <p className="text-sm">Abaixo</p>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-12 items-center gap-4">
      <span className="text-sm">Esquerda</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Direita</span>
    </div>
  ),
}
