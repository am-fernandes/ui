import type { Meta, StoryObj } from "@storybook/react-vite"

import { Label } from "../primitives/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

const meta = {
  title: "Forms/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="cidade">Cidade</Label>
      <Select>
        <SelectTrigger id="cidade" className="w-[260px]">
          <SelectValue placeholder="Selecione uma cidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sao-paulo">São Paulo</SelectItem>
          <SelectItem value="rio-de-janeiro">Rio de Janeiro</SelectItem>
          <SelectItem value="belo-horizonte">Belo Horizonte</SelectItem>
          <SelectItem value="curitiba">Curitiba</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}
