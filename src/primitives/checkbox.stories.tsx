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
        component:
          "Checkbox controlado/não-controlado baseado em Radix. Pareie com `Label` via `htmlFor`/`id`.",
      },
    },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

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
