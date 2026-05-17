import type { Meta, StoryObj } from "@storybook/react"

import { Progress } from "./progress"

const meta: Meta<typeof Progress> = {
  title: "Overlays/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof Progress>

export const Default: Story = {
  args: { value: 60 },
}

export const Indeterminate: Story = {
  args: {},
}

export const Zero: Story = {
  args: { value: 0 },
}

export const Full: Story = {
  args: { value: 100 },
}
