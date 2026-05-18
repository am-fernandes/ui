import type { Meta, StoryObj } from "@storybook/react-vite"

import { Accordion, type AccordionItemData } from "./accordion"

const sampleItems: AccordionItemData[] = [
  {
    value: "item-1",
    title: "É acessível?",
    content: "Sim. Segue as práticas de WAI-ARIA e funciona com leitores de tela.",
  },
  {
    value: "item-2",
    title: "É estilizado?",
    content: "Sim. Vem com estilos prontos baseados no design system, totalmente customizáveis.",
  },
  {
    value: "item-3",
    title: "É animado?",
    content:
      "Sim. Inclui animações suaves de abertura e fechamento, respeitando o motion do usuário.",
  },
]

const meta = {
  title: "Navigation/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Lista expansível de painéis em modo `single` (um aberto por vez) ou `multiple`. API declarativa via `items`.",
          "",
          "**Props principais:**",
          "- `items` — array de `AccordionItemData` que descreve cada painel.",
          "- `type` — `'single'` (default) abre um painel por vez; `'multiple'` permite vários abertos.",
          "- `collapsible` — só no modo `single`: permite fechar o painel ativo clicando nele.",
          "- `defaultValue` — valor inicialmente aberto (`string` em single, `string[]` em multiple).",
          "- `value` / `onValueChange` — modo controlado.",
          "",
          "**`AccordionItemData`:**",
          "- `value` — identificador único do painel (string).",
          "- `title` — conteúdo do gatilho clicável (ReactNode).",
          "- `content` — conteúdo revelado quando aberto (ReactNode).",
          "- `disabled` — desabilita o painel individualmente.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Accordion } from "@am-fernandes/ui"',
          "",
          "const items = [",
          '  { value: "item-1", title: "É acessível?", content: "Sim. Segue as práticas de WAI-ARIA." },',
          '  { value: "item-2", title: "É estilizado?", content: "Sim. Vem com estilos prontos." },',
          "]",
          "",
          '<Accordion type="single" collapsible items={items} />',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    items: {
      control: "object",
      description: "Array de painéis (`AccordionItemData[]`).",
      table: { type: { summary: "AccordionItemData[]" } },
    },
    type: {
      control: "inline-radio",
      options: ["single", "multiple"],
      description: "Modo de seleção dos painéis.",
      table: {
        type: { summary: "'single' | 'multiple'" },
        defaultValue: { summary: "'single'" },
      },
    },
    collapsible: {
      control: "boolean",
      description: "Permite fechar o painel ativo no modo `single`.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    defaultValue: {
      control: "text",
      description: "Valor inicialmente aberto. Em `multiple`, use array.",
      table: { type: { summary: "string | string[]" } },
    },
    value: {
      control: false,
      description: "Valor controlado.",
      table: { type: { summary: "string | string[]" } },
    },
    onValueChange: {
      control: false,
      description: "Callback ao alternar painéis.",
      table: { category: "Eventos" },
    },
  },
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    type: "single",
    collapsible: true,
    className: "w-[400px]",
    items: sampleItems,
  },
}

export const Default: Story = {
  args: {
    type: "single",
    collapsible: true,
    className: "w-[400px]",
    items: sampleItems,
  },
}
