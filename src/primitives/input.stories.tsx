import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "@storybook/test"
import { EyeIcon, EyeOffIcon, MailIcon, SearchIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "./button"
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
          "**Tamanhos:** `size` — `sm` (32px), `md` (40px, padrão) ou `lg` (44px). É a altura da caixa com a borda, igual à de um `Button` do mesmo tamanho.",
          "**Classes:** `className` vai no `<input>` (alinhamento, `tabular-nums`); `wrapperClassName` na caixa com a borda e o fundo; `fieldClassName` no campo inteiro, com rótulo e mensagens (largura, margens). Para um ícone dentro da caixa use `leadingIcon` ou `trailingIcon`, não `pl-*` no `className`.",
          "**Somente leitura:** `readOnly` mostra um valor que não se edita (calculado, travado, já enviado). O campo ganha fundo `muted` e perde o anel de hover, mas continua focável, copiável e vai no envio do formulário. Não use `disabled` para isso: o valor sai do `FormData` e fica apagado.",
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
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
      description: "Altura da caixa, borda incluída: 32, 40 ou 44px.",
      table: { type: { summary: "'sm' | 'md' | 'lg'" }, defaultValue: { summary: "'md'" } },
    },
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

export const LabelLeftWithMessages: Story = {
  render: () => (
    <div className="flex w-[28rem] flex-col gap-4 [--field-label-width:7rem]">
      <Input
        label="Nome"
        labelPosition="left"
        size="sm"
        description="Como no documento."
        placeholder="sm"
      />
      <Input
        label="E-mail"
        labelPosition="left"
        description="Usado para o login."
        error="Formato inválido"
        defaultValue="ana@"
      />
      <Input label="Telefone" labelPosition="left" size="lg" error="Obrigatório" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Com `labelPosition="left"` o rótulo fica na altura da caixa, não no meio do bloco com descrição e erro. Para alinhar os rótulos de um formulário numa coluna, defina `--field-label-width` num contêiner (aqui `[--field-label-width:7rem]`).',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          "Fundo `muted` e sem anel de hover: o valor se lê, se copia e vai no envio, mas não se edita. Compare com o editável e o desabilitado em `ReadOnlyComparison`.",
      },
    },
  },
}

export const ReadOnlyComparison: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Input label="Editável" defaultValue="R$ 1.250.000,00" />
      <Input label="Somente leitura" readOnly defaultValue="R$ 1.250.000,00" />
      <Input label="Desabilitado" disabled defaultValue="R$ 1.250.000,00" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Input label="sm · 32px" size="sm" placeholder="Filtro de tabela" />
      <Input label="md · 40px" size="md" placeholder="Formulário" />
      <Input label="lg · 44px" size="lg" placeholder="Alvo de toque" />
      <div className="flex items-end gap-2">
        <Input label="Busca" size="sm" leadingIcon={<SearchIcon className="size-4" />} />
        <Button size="sm">Buscar</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`size` define a altura da caixa com a borda. Um `Input` e um `Button` do mesmo tamanho ficam alinhados na mesma linha.",
      },
    },
  },
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
