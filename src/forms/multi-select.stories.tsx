import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"

import { MultiSelect, type MultiSelectOption } from "./multi-select"

const meta = {
  title: "Forms/MultiSelect",
  component: MultiSelect,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof MultiSelect>

export default meta
type Story = StoryObj<typeof meta>

const clients: MultiSelectOption[] = [
  { value: "empresa-a", label: "Empresa A" },
  { value: "empresa-b", label: "Empresa B" },
  { value: "empresa-c", label: "Empresa C" },
  { value: "empresa-d", label: "Empresa D" },
  { value: "empresa-e", label: "Empresa E" },
]

export const Default: Story = {
  args: {
    options: clients,
    placeholder: "Selecione clientes",
  },
  render: (args) => {
    const [value, setValue] = React.useState<string[]>(["empresa-a", "empresa-c"])
    return (
      <div className="w-[320px]">
        <MultiSelect {...args} value={value} onValueChange={setValue} />
      </div>
    )
  },
}
