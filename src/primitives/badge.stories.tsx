import type { Meta, StoryObj } from "@storybook/react-vite"
import { Badge } from "./badge"

const meta = {
  title: "Primitives/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Etiqueta compacta para status, tags ou contadores. 4 variantes (default, secondary, destructive, outline) com cores semânticas.",
      },
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: "Badge" },
}

export const Variants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge variant="default">default</Badge>
      <Badge variant="secondary">secondary</Badge>
      <Badge variant="destructive">destructive</Badge>
      <Badge variant="outline">outline</Badge>
    </div>
  ),
}
