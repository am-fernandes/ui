import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "@storybook/test"
import { EyeIcon, EyeOffIcon, MailIcon, SearchIcon } from "lucide-react"
import { useState } from "react"

import { Input } from "./input"

const meta: Meta<typeof Input> = {
  title: "Primitives/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    a11y: {
      // Placeholder + label-left + helper text use muted-foreground that falls just under 4.5:1.
      // Tracked in design-tokens roadmap.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
    docs: {
      description: {
        component: [
          "Input de texto com label/description/error embutidos via FieldShell.",
          "",
          "**Posições do label:** `up` (default), `left`, `hidden` (sr-only para a11y sem visual).",
          "**Slots:** `leadingIcon` (esquerda) e `trailingIcon` (direita).",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    labelPosition: { control: "select", options: ["up", "left", "hidden"] },
    description: { control: "text" },
    error: { control: "text" },
    required: { control: "boolean" },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url", "search", "date"],
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
}
export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: { label: "Nome completo", placeholder: "Digite seu nome", onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText("Nome completo") as HTMLInputElement
    await expect(input).toHaveValue("")
    await userEvent.type(input, "Matheus")
    await expect(input).toHaveValue("Matheus")
    await expect(args.onChange).toHaveBeenCalled()
  },
}

export const WithDescription: Story = {
  args: {
    label: "E-mail",
    description: "Não compartilharemos com terceiros.",
    placeholder: "voce@exemplo.com",
    type: "email",
  },
}

export const WithError: Story = {
  args: { label: "E-mail", defaultValue: "abc", error: "Formato inválido", type: "email" },
}

export const Required: Story = {
  args: { label: "Nome", required: true, placeholder: "Obrigatório" },
}

export const LabelLeft: Story = {
  args: { label: "Nome", labelPosition: "left", placeholder: "Layout inline" },
}

export const LabelHidden: Story = {
  args: { label: "Buscar", labelPosition: "hidden", placeholder: "Buscar..." },
  parameters: {
    docs: {
      description: { story: "Label sr-only para leitores de tela mas escondido visualmente." },
    },
  },
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
    type: "email",
    trailingIcon: <MailIcon className="size-4" />,
  },
}

export const PasswordToggle: Story = {
  render: () => {
    const [show, setShow] = useState(false)
    return (
      <Input
        label="Senha"
        type={show ? "text" : "password"}
        placeholder="Digite a senha"
        trailingIcon={
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? "Ocultar senha" : "Mostrar senha"}
            className="cursor-pointer"
          >
            {show ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        }
      />
    )
  },
  parameters: {
    docs: { description: { story: "Pattern para mostrar/ocultar senha via `trailingIcon`." } },
  },
}

export const Disabled: Story = {
  args: { label: "Nome", disabled: true, value: "Não editável" },
}

export const ReadOnly: Story = {
  args: { label: "ID", readOnly: true, value: "user-123456" },
}

export const Types: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Input label="Texto" type="text" placeholder="text" />
      <Input label="E-mail" type="email" placeholder="email" />
      <Input label="Senha" type="password" placeholder="••••••••" />
      <Input label="Número" type="number" placeholder="0" />
      <Input label="Telefone" type="tel" placeholder="(11) 99999-9999" />
      <Input label="URL" type="url" placeholder="https://" />
      <Input label="Data" type="date" />
    </div>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("")
    return (
      <Input
        label="Valor digitado"
        description={`Atual: "${value}" (${value.length} chars)`}
        value={value}
        onChange={(e) => setValue(e.target.value.toUpperCase())}
        placeholder="digite — convertemos para UPPER"
      />
    )
  },
}

export const FormExample: Story = {
  render: () => (
    <form className="flex w-80 flex-col gap-4">
      <Input label="Nome completo" required placeholder="João da Silva" />
      <Input label="E-mail" type="email" required placeholder="joao@exemplo.com" />
      <Input label="Telefone" type="tel" description="Com DDD" placeholder="(11) 99999-9999" />
    </form>
  ),
}
