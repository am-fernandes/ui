import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"

import { Label } from "../primitives/label"
import { MultiInput } from "./multi-input"

const meta = {
  title: "Domain/MultiInput",
  component: MultiInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          'Input de múltiplos tokens (badges removíveis). Use `type="string"` (padrão) para texto livre ou `type="number"` para inteiros positivos. `prefix`/`suffix` aplicam-se a cada token (ex.: `R$ `, ` dias`, `#`).',
      },
    },
  },
} satisfies Meta<typeof MultiInput>

export default meta
type Story = StoryObj<typeof meta>

export const StringDefault: Story = {
  args: { value: [], onValueChange: () => {} },
  render: () => {
    const [values, setValues] = React.useState<string[]>(["urgente", "fiscal"])
    return (
      <div className="flex flex-col gap-2 w-80">
        <Label htmlFor="tags">Tags</Label>
        <MultiInput value={values} onValueChange={setValues} />
      </div>
    )
  },
}

export const StringWithPrefixHash: Story = {
  args: { value: [], onValueChange: () => {} },
  render: () => {
    const [values, setValues] = React.useState<string[]>(["jurídico", "compliance"])
    return (
      <div className="flex flex-col gap-2 w-80">
        <Label htmlFor="areas">Áreas</Label>
        <MultiInput value={values} onValueChange={setValues} prefix="#" />
      </div>
    )
  },
}

export const NumberDefault: Story = {
  args: { type: "number", value: [], onValueChange: () => {} },
  render: () => {
    const [values, setValues] = React.useState<number[]>([30, 60, 90])
    return (
      <div className="flex flex-col gap-2 w-80">
        <Label htmlFor="numbers">Lista de números</Label>
        <MultiInput type="number" value={values} onValueChange={setValues} />
      </div>
    )
  },
}

export const NumberWithSuffixDias: Story = {
  args: { type: "number", value: [], onValueChange: () => {} },
  render: () => {
    const [values, setValues] = React.useState<number[]>([15, 30, 45])
    return (
      <div className="flex flex-col gap-2 w-80">
        <Label htmlFor="installments">Parcelamento</Label>
        <MultiInput type="number" value={values} onValueChange={setValues} suffix=" dias" />
      </div>
    )
  },
}

export const NumberWithPrefixCurrency: Story = {
  args: { type: "number", value: [], onValueChange: () => {} },
  render: () => {
    const [values, setValues] = React.useState<number[]>([1000, 2500, 5000])
    return (
      <div className="flex flex-col gap-2 w-80">
        <Label htmlFor="amounts">Valores</Label>
        <MultiInput type="number" value={values} onValueChange={setValues} prefix="R$ " />
      </div>
    )
  },
}

export const Disabled: Story = {
  args: { value: ["fixo"], onValueChange: () => {}, disabled: true },
  render: () => (
    <div className="flex flex-col gap-2 w-80">
      <Label>Read-only</Label>
      <MultiInput value={["fixo-a", "fixo-b"]} onValueChange={() => {}} disabled />
    </div>
  ),
}
