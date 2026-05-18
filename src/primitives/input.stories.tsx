import type { Meta, StoryObj } from "@storybook/react-vite"
import { MailIcon, SearchIcon } from "lucide-react"

import { Input } from "./input"

const meta: Meta<typeof Input> = {
  title: "Primitives/Input",
  component: Input,
  parameters: {
    docs: { description: { component: "Text input with built-in label/description/error." } },
  },
}
export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: { label: "Nome completo", placeholder: "Digite seu nome" },
}

export const WithDescription: Story = {
  args: {
    label: "E-mail",
    description: "Não compartilharemos com terceiros.",
    placeholder: "voce@exemplo.com",
  },
}

export const WithError: Story = {
  args: { label: "E-mail", value: "abc", error: "Formato inválido" },
}

export const WithLeadingIcon: Story = {
  args: {
    label: "Buscar",
    placeholder: "Digite para buscar",
    leadingIcon: <SearchIcon className="size-4" />,
  },
}

export const WithTrailingIcon: Story = {
  args: {
    label: "E-mail",
    placeholder: "voce@exemplo.com",
    trailingIcon: <MailIcon className="size-4" />,
  },
}

export const LabelHidden: Story = {
  args: { label: "Buscar", labelPosition: "hidden", placeholder: "Buscar..." },
}

export const Required: Story = {
  args: { label: "Nome", required: true, placeholder: "Obrigatório" },
}

export const Disabled: Story = {
  args: { label: "Nome", disabled: true, value: "Não editável" },
}
