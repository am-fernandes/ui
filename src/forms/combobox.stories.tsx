import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"

import { Combobox, type ComboboxOption } from "./combobox"

const meta = {
  title: "Forms/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

const clients: ComboboxOption[] = [
  { value: "empresa-a", label: "Empresa A" },
  { value: "empresa-b", label: "Empresa B" },
  { value: "empresa-c", label: "Empresa C" },
  { value: "empresa-d", label: "Empresa D" },
  { value: "empresa-e", label: "Empresa E" },
]

export const Default: Story = {
  args: {
    options: clients,
    placeholder: "Selecione um cliente",
  },
  render: (args) => {
    const [value, setValue] = React.useState<string>("")
    return (
      <div className="w-[320px]">
        <Combobox
          options={args.options}
          placeholder={args.placeholder}
          value={value}
          onValueChange={setValue}
        />
      </div>
    )
  },
}
