import type { Meta, StoryObj } from "@storybook/react-vite"
import { Briefcase, Building2, GraduationCap, Scale, Users } from "lucide-react"
import { useState } from "react"

import { Combobox } from "./combobox"

const meta = {
  title: "Forms/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

const options = [
  { value: "advocacia", label: "Advocacia", icon: Scale },
  { value: "consultoria", label: "Consultoria", icon: Briefcase },
  { value: "academia", label: "Academia", icon: GraduationCap },
  { value: "corporativo", label: "Corporativo", icon: Building2 },
  { value: "rh", label: "Recursos Humanos", icon: Users },
]

export const Default: Story = {
  args: { options, placeholder: "Selecione uma área" },
  render: (args) => {
    const [value, setValue] = useState<string | undefined>()
    return (
      <div className="w-[320px]">
        <Combobox
          options={args.options}
          value={value}
          onValueChange={setValue}
          placeholder={args.placeholder}
        />
      </div>
    )
  },
}

export const Multiple: Story = {
  args: { multiple: true, options, placeholder: "Selecione áreas" },
  render: (args) => {
    const [value, setValue] = useState<string[]>(["advocacia", "consultoria"])
    return (
      <div className="w-[320px]">
        <Combobox
          multiple
          options={args.options}
          value={value}
          onValueChange={setValue}
          placeholder={args.placeholder}
        />
      </div>
    )
  },
}

export const Disabled: Story = {
  args: { options, disabled: true, placeholder: "Indisponível" },
  render: (args) => (
    <div className="w-[320px]">
      <Combobox options={args.options} disabled placeholder={args.placeholder} />
    </div>
  ),
}
