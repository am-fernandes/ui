import type { Meta, StoryObj } from "@storybook/react-vite"
import { Plus, Search } from "lucide-react"
import { Button } from "./button"

const meta = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: "Button" },
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="default">default</Button>
      <Button variant="destructive">destructive</Button>
      <Button variant="outline">outline</Button>
      <Button variant="secondary">secondary</Button>
      <Button variant="ghost">ghost</Button>
      <Button variant="link">link</Button>
    </div>
  ),
}

export const WithIconOnly: Story = {
  render: () => (
    <Button size="icon" aria-label="Search">
      <Search className="size-4" />
    </Button>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <Button>
      <Plus className="size-4" />
      Adicionar
    </Button>
  ),
}

export const Disabled: Story = {
  args: { children: "Button", disabled: true },
}
