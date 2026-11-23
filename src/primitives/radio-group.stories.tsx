import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "@storybook/test"
import { BuildingIcon, CrownIcon, ZapIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "./button"
import { RadioGroup } from "./radio-group"

const meta: Meta<typeof RadioGroup> = {
  title: "Primitives/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "RadioGroup data-driven. Passe `options: RadioGroupItemData[]` (o nome antigo, `values`, ainda funciona e está obsoleto).",
          "",
          "Cada item: `value`, `label`, opcional `icon`, `disabled`.",
          "",
          "Com `error`, os rádios também ficam com a borda de erro, não só o texto abaixo.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
    orientation: { control: "select", options: ["vertical", "horizontal"] },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
}
export default meta
type Story = StoryObj<typeof RadioGroup>

const PLANS = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
]

const PLANS_RICH = [
  { value: "free", label: "Free", icon: ZapIcon },
  { value: "pro", label: "Pro", icon: CrownIcon },
  { value: "team", label: "Team", icon: BuildingIcon, disabled: true },
]

export const Default: Story = {
  args: { label: "Plano", options: PLANS, onValueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const pro = canvas.getByRole("radio", { name: "Pro" })
    await expect(pro).toHaveAttribute("aria-checked", "false")
    await userEvent.click(pro)
    await expect(args.onValueChange).toHaveBeenCalledWith("pro")
    await expect(pro).toHaveAttribute("aria-checked", "true")
  },
}

export const Horizontal: Story = {
  args: {
    label: "Tamanho",
    orientation: "horizontal",
    options: [
      { value: "s", label: "P" },
      { value: "m", label: "M" },
      { value: "l", label: "G" },
      { value: "xl", label: "GG" },
    ],
  },
}

export const WithError: Story = {
  args: { label: "Plano", error: "Selecione uma opção", options: PLANS, required: true },
  parameters: {
    // error-foreground fails 4.5:1 against background; tracked in design-tokens roadmap.
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
  },
}

export const DefaultValue: Story = {
  args: { label: "Plano (default Pro)", defaultValue: "pro", options: PLANS },
}

export const Disabled: Story = {
  args: { label: "Plano", disabled: true, defaultValue: "free", options: PLANS },
}

export const InForm: Story = {
  render: () => {
    const [sent, setSent] = useState<string | null>(null)
    return (
      <form
        className="flex flex-col items-start gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          setSent(String(new FormData(event.currentTarget).get("plano")))
        }}
      >
        <RadioGroup label="Plano" name="plano" required options={PLANS} />
        <Button type="submit">Enviar</Button>
        {sent ? <output className="text-sm">Enviado: {sent}</output> : null}
      </form>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Com `name`, a escolha vai junto no envio. Com `required`, o grupo é anunciado como obrigatório e o formulário não é enviado enquanto nenhuma opção estiver marcada.",
      },
    },
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("free")
    return (
      <div className="flex flex-col gap-4">
        <RadioGroup label="Plano" options={PLANS_RICH} value={value} onValueChange={setValue} />
        <p className="text-sm text-muted-foreground">Selecionado: {value}</p>
      </div>
    )
  },
}
