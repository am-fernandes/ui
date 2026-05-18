import type { Meta, StoryObj } from "@storybook/react-vite"

import { Input } from "../primitives/input"
import { Label } from "../primitives/label"
import { Field, FieldGroup, FieldLegend, FieldSet } from "./field"

const meta = {
  title: "Forms/Field",
  component: FieldSet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Wrapper composicional para campos de formulário. `FieldSet` + `FieldLegend` + spacing automático entre Inputs.",
      },
    },
  },
} satisfies Meta<typeof FieldSet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <FieldSet className="w-[360px]">
      <FieldLegend variant="legend">Endereço</FieldLegend>
      <FieldGroup>
        <Field>
          <Label htmlFor="rua">Rua</Label>
          <Input id="rua" placeholder="Av. Paulista" />
        </Field>
        <Field>
          <Label htmlFor="numero">Número</Label>
          <Input id="numero" placeholder="1000" />
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
}
