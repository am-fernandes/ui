import type { Meta, StoryObj } from "@storybook/react-vite"

import { Tabs, type TabsItemData } from "./tabs"

const sampleItems: TabsItemData[] = [
  {
    value: "conta",
    label: "Conta",
    content: <p className="text-sm text-muted-foreground">Gerencie as informações da sua conta.</p>,
  },
  {
    value: "senha",
    label: "Senha",
    content: (
      <p className="text-sm text-muted-foreground">
        Altere sua senha e configurações de segurança.
      </p>
    ),
  },
  {
    value: "notificacoes",
    label: "Notificações",
    content: (
      <p className="text-sm text-muted-foreground">Defina suas preferências de notificação.</p>
    ),
  },
]

const meta = {
  title: "Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Tabs com triggers + conteúdo declarativos. API via `items` em vez de composição manual.",
          "",
          "**Props principais:**",
          "- `items` — array de `TabsItemData` (uma aba por entrada).",
          "- `defaultValue` — valor da aba ativa inicial (não controlado).",
          "- `value` / `onValueChange` — modo controlado.",
          "- `orientation` — `'horizontal'` (default) ou `'vertical'`.",
          "",
          "**`TabsItemData`:**",
          "- `value` — identificador único da aba.",
          "- `label` — conteúdo do trigger (ReactNode).",
          "- `content` — conteúdo do painel correspondente (ReactNode).",
          "- `disabled` — desabilita a aba.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Tabs } from "@am-fernandes/ui"',
          "",
          "const items = [",
          '  { value: "geral", label: "Geral", content: <p>Configurações gerais.</p> },',
          '  { value: "config", label: "Configurações", content: <p>Preferências avançadas.</p> },',
          "]",
          "",
          '<Tabs items={items} defaultValue="geral" />',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    items: {
      control: "object",
      description: "Array de abas (`TabsItemData[]`).",
      table: { type: { summary: "TabsItemData[]" } },
    },
    defaultValue: {
      control: "text",
      description: "Aba ativa inicial.",
      table: { type: { summary: "string" } },
    },
    value: {
      control: false,
      description: "Aba ativa controlada.",
      table: { type: { summary: "string" } },
    },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
      description: "Orientação dos triggers.",
      table: {
        type: { summary: "'horizontal' | 'vertical'" },
        defaultValue: { summary: "'horizontal'" },
      },
    },
    onValueChange: {
      control: false,
      description: "Callback ao trocar de aba.",
      table: { category: "Eventos" },
    },
  },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    defaultValue: "conta",
    orientation: "vertical",
    className: "w-[400px]",
    items: sampleItems,
  },
}

export const Default: Story = {
  args: {
    defaultValue: "conta",
    className: "w-[400px]",
    items: sampleItems,
  },
}
