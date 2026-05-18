import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "@storybook/test"
import { Trash2 } from "lucide-react"
import { useState } from "react"

import { Accordion } from "./accordion"

const meta: Meta<typeof Accordion> = {
  title: "Navigation/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Accordion data-driven baseado em `@radix-ui/react-accordion`. Os itens são descritos via `items: AccordionItemData[]` — sem JSX aninhado.",
          "",
          "**Props principais:**",
          "- `type: 'single' | 'multiple'` — modo de seleção. `'single'` (default) abre um item por vez; `'multiple'` permite múltiplos abertos.",
          "- `collapsible?: boolean` — em `type='single'`, permite fechar o item ativo (clicando nele).",
          "- `items: AccordionItemData[]` — lista de seções.",
          "- `defaultValue?` — em `'single'`: `string` com o `value` aberto. Em `'multiple'`: `string[]`.",
          "- `value?` / `onValueChange?` — modo controlled.",
          "",
          "**Shape do item (`AccordionItemData`):**",
          "```ts",
          "interface AccordionItemData {",
          "  value: string                 // chave estável (controlled / defaultValue)",
          "  title: React.ReactNode        // header clicável",
          "  content: React.ReactNode      // corpo expansível",
          "  action?: React.ReactNode      // botão/elemento à direita do header (independente do trigger)",
          "  disabled?: boolean            // bloqueia expansão",
          "}",
          "```",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Accordion } from "@am-fernandes/ui"',
          "",
          "<Accordion",
          '  type="single"',
          "  collapsible",
          "  items={[",
          '    { value: "perfil", title: "Perfil", content: "Dados pessoais" },',
          '    { value: "seg",    title: "Segurança", content: "Senha e MFA" },',
          "  ]}",
          "/>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    type: {
      control: "inline-radio",
      options: ["single", "multiple"],
      description: "Modo de seleção: `single` abre um por vez, `multiple` permite vários abertos.",
      table: {
        type: { summary: "'single' | 'multiple'" },
        defaultValue: { summary: "'single'" },
      },
    },
    collapsible: {
      control: "boolean",
      description: "Em `type='single'`, permite fechar o item ativo clicando nele.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    items: {
      control: false,
      description: "Lista de seções (`AccordionItemData[]`).",
      table: { type: { summary: "AccordionItemData[]" } },
    },
    defaultValue: {
      control: false,
      description: "Valor inicial. `string` em `single`, `string[]` em `multiple`.",
      table: { type: { summary: "string | string[]" } },
    },
    value: {
      control: false,
      description: "Valor controlado. Use junto com `onValueChange`.",
      table: { type: { summary: "string | string[]" } },
    },
    onValueChange: {
      control: false,
      description: "Disparado a cada alteração do(s) item(ns) aberto(s).",
      table: { type: { summary: "(value: string | string[]) => void" }, category: "Eventos" },
    },
  },
}
export default meta
type Story = StoryObj<typeof Accordion>

const faqItems = [
  {
    value: "frete",
    title: "Qual o prazo de entrega?",
    content: "O prazo médio é de 3 a 7 dias úteis após a confirmação do pagamento.",
  },
  {
    value: "troca",
    title: "Como solicitar troca?",
    content: "Você tem até 7 dias após o recebimento para abrir um pedido de troca pelo painel.",
  },
  {
    value: "pgto",
    title: "Quais formas de pagamento são aceitas?",
    content: "Cartão de crédito, PIX e boleto bancário.",
  },
]

export const Default: Story = {
  args: { type: "single", collapsible: true, items: faqItems },
  render: (args) => (
    <div className="w-[480px]">
      <Accordion {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getAllByRole("button")[0]!
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
  },
}

export const Multiple: Story = {
  args: {
    type: "multiple",
    items: faqItems,
    defaultValue: ["frete", "pgto"],
  },
  render: (args) => (
    <div className="w-[480px]">
      <Accordion {...args} />
    </div>
  ),
}

export const WithAction: Story = {
  render: () => {
    const [items, setItems] = useState([
      { value: "1", title: "Item A", content: "Conteúdo do item A" },
      { value: "2", title: "Item B", content: "Conteúdo do item B" },
      { value: "3", title: "Item C", content: "Conteúdo do item C" },
    ])
    return (
      <div className="w-[480px]">
        <Accordion
          type="single"
          collapsible
          items={items.map((item) => ({
            ...item,
            action: (
              <button
                type="button"
                aria-label={`Remover ${typeof item.title === "string" ? item.title : item.value}`}
                onClick={() => setItems((prev) => prev.filter((p) => p.value !== item.value))}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Trash2 className="size-4" />
              </button>
            ),
          }))}
        />
      </div>
    )
  },
}

export const Disabled: Story = {
  args: {
    type: "single",
    collapsible: true,
    items: [
      { value: "a", title: "Habilitado", content: "Conteúdo disponível." },
      { value: "b", title: "Bloqueado", content: "Sem acesso", disabled: true },
      { value: "c", title: "Também habilitado", content: "Conteúdo disponível." },
    ],
  },
  render: (args) => (
    <div className="w-[480px]">
      <Accordion {...args} />
    </div>
  ),
}

export const DefaultValueOpen: Story = {
  args: {
    type: "single",
    collapsible: true,
    defaultValue: "troca",
    items: faqItems,
  },
  render: (args) => (
    <div className="w-[480px]">
      <Accordion {...args} />
    </div>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string>("frete")
    return (
      <div className="flex w-[480px] flex-col gap-3">
        <Accordion
          type="single"
          collapsible
          items={faqItems}
          value={value}
          onValueChange={setValue}
        />
        <p className="text-sm text-muted-foreground">
          Aberto: <code>{value || "(nenhum)"}</code>
        </p>
      </div>
    )
  },
}
