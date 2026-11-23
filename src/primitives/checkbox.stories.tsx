import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "@storybook/test"
import { useState } from "react"

import { Checkbox } from "./checkbox"

const meta: Meta<typeof Checkbox> = {
  title: "Primitives/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Checkbox baseado em Radix com `label`, `description` e `error` embutidos.",
          "",
          "**API:**",
          "- `label` — texto ou JSX exibido ao lado do controle (parea via `htmlFor` automaticamente).",
          "- `description` — texto auxiliar abaixo do label, vinculado via `aria-describedby`.",
          '- `error` — mensagem de erro com `role="alert"` e `aria-invalid` no controle.',
          "- `checked` / `defaultChecked` — `boolean`.",
          "- `onCheckedChange` — `(checked: boolean) => void`.",
          '- `checked` — `true`, `false` ou `"indeterminate"` (estado misto de um "selecionar todos").',
          "- `disabled`, `required` — comportamentos padrão.",
          "- `id` — opcional; o componente gera um ID estável quando omitido.",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Checkbox } from "@amfernandesinc/ui"',
          "",
          '<Checkbox label="Aceito os termos" required />',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "Texto do label." },
    description: { control: "text", description: "Texto auxiliar abaixo do label." },
    error: { control: "text", description: "Mensagem de erro (renderiza `role=alert`)." },
    checked: {
      control: "boolean",
      description: "Estado controlado (`true` ou `false`).",
      table: { type: { summary: "boolean" } },
    },
    defaultChecked: {
      control: "boolean",
      description: "Estado inicial em modo não-controlado.",
      table: { type: { summary: "boolean" } },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o checkbox.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    required: {
      control: "boolean",
      description: "Marca como obrigatório (asterisco no label).",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    id: { control: "text", description: "ID HTML (auto-gerado se omitido)." },
    className: { control: "text", description: "Classes Tailwind extras no controle." },
    onCheckedChange: {
      control: false,
      description: "Handler de mudança.",
      table: {
        category: "Eventos",
        type: { summary: "(checked: boolean) => void" },
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  args: { label: "Aceito os termos", onCheckedChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const checkbox = canvas.getByRole("checkbox", { name: "Aceito os termos" })
    await expect(checkbox).toHaveAttribute("aria-checked", "false")
    await userEvent.click(checkbox)
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true)
    await expect(checkbox).toHaveAttribute("aria-checked", "true")
  },
}

export const WithDescription: Story = {
  args: {
    label: "Receber newsletter",
    description: "Enviamos no máximo um e-mail por semana.",
  },
}

export const WithError: Story = {
  args: {
    label: "Aceito os termos",
    error: "Você precisa aceitar para continuar.",
  },
  parameters: {
    // error-foreground fails 4.5:1 against background; tracked in design-tokens roadmap.
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
  },
}

export const Required: Story = {
  args: { label: "Política de privacidade", required: true },
}

export const Disabled: Story = {
  args: { label: "Opção indisponível", disabled: true },
}

export const Checked: Story = {
  args: { label: "Selecionado", defaultChecked: true },
}

export const LongLabel: Story = {
  args: {
    label:
      "Declaro que li a proposta, conferi os dados do comprador e autorizo o envio para análise de crédito.",
  },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Um rótulo que quebra em várias linhas mantém a altura de linha do texto, e a caixa fica na altura da primeira linha, não no meio do bloco.",
      },
    },
  },
}

export const RichLabel: Story = {
  args: {
    label: (
      <>
        Li e aceito os{" "}
        <a className="underline" href="/termos" target="_blank" rel="noreferrer">
          termos de uso
        </a>{" "}
        e a{" "}
        <a className="underline" href="/privacidade" target="_blank" rel="noreferrer">
          política de privacidade
        </a>
        .
      </>
    ),
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story: "`label` aceita `ReactNode`, permitindo links inline mesmo quando obrigatório.",
      },
    },
  },
}

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)
    return (
      <div className="flex flex-col gap-3">
        <Checkbox
          label="Notificações por e-mail"
          description="Você pode alterar a qualquer momento."
          checked={checked}
          onCheckedChange={setChecked}
        />
        <p className="text-xs text-muted-foreground">
          Estado: <strong>{checked ? "ativado" : "desativado"}</strong>
        </p>
      </div>
    )
  },
  parameters: {
    docs: { description: { story: "Modo controlado clássico via `useState`." } },
  },
}

const UNIDADES = ["Torre A · 0611", "Torre B · 1204", "Gleba 7 · L196"]

export const Indeterminate: Story = {
  render: () => {
    const [selecionadas, setSelecionadas] = useState<string[]>([UNIDADES[1] as string])
    const todas = selecionadas.length === UNIDADES.length
    const nenhuma = selecionadas.length === 0
    return (
      <div className="flex flex-col gap-2">
        <Checkbox
          label="Selecionar todas as unidades"
          checked={todas ? true : nenhuma ? false : "indeterminate"}
          onCheckedChange={(marcar) => setSelecionadas(marcar ? UNIDADES : [])}
        />
        <div className="flex flex-col gap-2 pl-6">
          {UNIDADES.map((unidade) => (
            <Checkbox
              key={unidade}
              label={unidade}
              checked={selecionadas.includes(unidade)}
              onCheckedChange={(marcar) =>
                setSelecionadas((atual) =>
                  marcar ? [...atual, unidade] : atual.filter((u) => u !== unidade),
                )
              }
            />
          ))}
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          '`checked="indeterminate"` é o estado misto de um "selecionar todos" quando só parte dos itens está marcada: a caixa mostra um traço e o leitor de tela anuncia "parcialmente marcada". Um clique no estado misto marca tudo.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const todas = canvas.getByRole("checkbox", { name: "Selecionar todas as unidades" })
    await expect(todas).toHaveAttribute("aria-checked", "mixed")
    await userEvent.click(todas)
    await expect(todas).toHaveAttribute("aria-checked", "true")
    for (const unidade of UNIDADES) {
      await expect(canvas.getByRole("checkbox", { name: unidade })).toHaveAttribute(
        "aria-checked",
        "true",
      )
    }
    await userEvent.click(canvas.getByRole("checkbox", { name: UNIDADES[0] as string }))
    await expect(todas).toHaveAttribute("aria-checked", "mixed")
  },
}
