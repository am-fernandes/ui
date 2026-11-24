import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "@storybook/test"
import { useState } from "react"

import { Dialog } from "../overlays/dialog"
import { Button } from "../primitives/button"
import { Input } from "../primitives/input"
import { Select, type SelectGroup, type SelectOption } from "./select"

const respostas: SelectOption[] = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
  { value: "talvez", label: "Talvez" },
]

const estagios: SelectOption[] = [
  { value: "novo", label: "Novo" },
  { value: "contato", label: "Em contato" },
  { value: "visita", label: "Visita agendada" },
  { value: "proposta", label: "Proposta enviada" },
  { value: "fechado", label: "Fechado" },
  { value: "perdido", label: "Perdido", disabled: true },
]

const imoveis: SelectGroup[] = [
  {
    label: "Residencial",
    options: [
      { value: "apartamento", label: "Apartamento" },
      { value: "casa", label: "Casa" },
      { value: "cobertura", label: "Cobertura" },
    ],
  },
  {
    label: "Comercial",
    options: [
      { value: "sala", label: "Sala comercial" },
      { value: "loja", label: "Loja" },
      { value: "galpao", label: "Galpão" },
    ],
  },
]

const meta: Meta<typeof Select> = {
  title: "Forms/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          'Seleção simples para listas curtas, sem busca: "Sim / Não / Talvez", estágio do lead, linhas por página. Para listas longas ou com busca, use `Combobox`.',
          "",
          '**Opções:** `options` recebe `{ value, label, disabled? }` ou grupos `{ label, options }`. `value` não pode ser vazio: `""` quer dizer "nada escolhido" e mostra o `placeholder`.',
          "**Valor:** `value` + `onValueChange(value)` (controlado) ou `defaultValue` (não controlado).",
          "**Campo:** `label`, `labelPosition`, `description`, `error`, `required`, `disabled` e `size` (`sm` 32px, `md` 40px, `lg` 44px) como em `Input`; o gatilho tem a mesma altura e o mesmo visual dos outros campos.",
          "**Somente leitura:** `readOnly` mostra o valor com fundo `muted`, continua focável e vai no formulário, mas a lista não abre e o teclado não troca o valor.",
          "**Formulário:** com `name`, um `<select>` nativo escondido leva o valor ao `FormData`; o reset do formulário volta ao `defaultValue`.",
          "**Teclado:** Enter, Espaço e as setas abrem; digitar uma letra escolhe a opção que começa com ela (também com a lista fechada); Esc fecha. A opção escolhida tem um ✓, não só cor.",
          '**Textos:** `placeholder` ou `labels.placeholder` (padrão "Selecione…").',
        ].join("\n"),
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    labelPosition: { control: "select", options: ["up", "left", "hidden"] },
    description: { control: "text" },
    error: { control: "text" },
    placeholder: { control: "text" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
      description: "Altura do gatilho, borda incluída: 32, 40 ou 44px.",
      table: { type: { summary: "'sm' | 'md' | 'lg'" }, defaultValue: { summary: "'md'" } },
    },
    options: { control: false },
    onValueChange: { control: false, table: { category: "Eventos" } },
  },
  args: { options: estagios, label: "Estágio", onValueChange: fn() },
  decorators: [
    (Story) => (
      <div className="w-[320px] max-w-full">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof Select>

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole("combobox", { name: "Estágio" })
    await expect(trigger).toHaveTextContent("Selecione…")
    await userEvent.click(trigger)
    await userEvent.click(await body.findByRole("option", { name: "Visita agendada" }))
    await expect(trigger).toHaveTextContent("Visita agendada")
    await expect(args.onValueChange).toHaveBeenCalledWith("visita")
  },
}

export const WithDescription: Story = {
  args: { description: "Em que ponto da negociação o lead está." },
}

export const WithError: Story = {
  args: { error: "Escolha o estágio do lead." },
}

export const Required: Story = {
  args: { required: true },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "contato" },
}

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: "proposta",
    description: "Muda sozinho quando a proposta é aceita.",
  },
}

export const ShortList: Story = {
  name: "Short list (Sim / Não / Talvez)",
  args: { options: respostas, label: "Aceita financiamento?", placeholder: "Escolha" },
}

export const Groups: Story = {
  args: { options: imoveis, label: "Tipo de imóvel" },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex items-end gap-2">
          <Select size={size} options={respostas} label={`Select ${size}`} />
          <Input size={size} label={`Input ${size}`} placeholder="Texto" />
        </div>
      ))}
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: { story: "Lado a lado com um `Input` do mesmo tamanho: a mesma altura." },
    },
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("10")
    return (
      <div className="flex flex-col gap-2">
        <Select
          label="Linhas por página"
          options={["10", "20", "50"].map((n) => ({ value: n, label: n }))}
          value={value}
          onValueChange={setValue}
        />
        <p className="text-xs text-muted-foreground">Valor: {value}</p>
      </div>
    )
  },
}

export const InForm: Story = {
  name: "In a native form",
  render: () => {
    const [sent, setSent] = useState<string | null>(null)
    return (
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          setSent(
            `estagio=${data.get("estagio") ?? "(vazio)"}; tipo=${data.get("tipo") ?? "(vazio)"}`,
          )
        }}
      >
        <Select name="estagio" options={estagios} label="Estágio" defaultValue="contato" />
        <Select name="tipo" options={imoveis} label="Tipo de imóvel" />
        <div className="flex gap-2">
          <Button type="submit">Enviar</Button>
          <Button type="reset" variant="outline">
            Restaurar
          </Button>
        </div>
        {sent ? (
          <p data-testid="sent" className="text-xs text-muted-foreground">
            Enviado: {sent}
          </p>
        ) : null}
      </form>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Com `name`, o valor vai no `FormData`; sem escolha, o campo não envia nada. "Restaurar" (reset do formulário) volta ao `defaultValue`.',
      },
    },
  },
}

const muitas: SelectOption[] = Array.from({ length: 15 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}º andar`,
}))

export const InsideDialog: Story = {
  render: () => (
    <Dialog trigger={<Button>Abrir dialog</Button>} title="Dados do imóvel" size="md">
      <Select options={muitas} label="Andar" />
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story: "Dentro de um Dialog: a lista abre por cima, rola e escolher não fecha o Dialog.",
      },
    },
  },
}
