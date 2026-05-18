import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useRef, useState } from "react"

import { Tabs } from "./tabs"

const meta: Meta<typeof Tabs> = {
  title: "Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Tabs data-driven baseado em `@radix-ui/react-tabs`. Cada aba é descrita por um `TabsItemData` — label, conteúdo e flags opcionais (badge, disabled).",
          "",
          "**Props:**",
          "- `items: TabsItemData[]` — abas + conteúdos.",
          "- `defaultValue?: string` — aba inicial (uncontrolled). Default: primeiro item.",
          "- `value?` / `onValueChange?` — modo controlled.",
          "- `orientation?: 'horizontal' | 'vertical'` — layout das abas. Default `'horizontal'`.",
          "- `lazy?: boolean` — quando `true`, apenas o painel ativo é montado.",
          "",
          "**Shape do item (`TabsItemData`):**",
          "```ts",
          "interface TabsItemData {",
          "  value: string                  // chave estável",
          "  label: React.ReactNode         // texto do trigger",
          "  content: React.ReactNode       // conteúdo do painel",
          "  badge?: React.ReactNode        // pílula opcional ao lado do label",
          "  disabled?: boolean             // bloqueia seleção",
          "}",
          "```",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Tabs } from "@am-fernandes/ui"',
          "",
          "<Tabs",
          '  defaultValue="overview"',
          "  items={[",
          '    { value: "overview", label: "Visão geral", content: <Overview /> },',
          '    { value: "billing",  label: "Cobrança",    content: <Billing /> },',
          "  ]}",
          "/>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    items: {
      control: false,
      description: "Lista de abas (`TabsItemData[]`).",
      table: { type: { summary: "TabsItemData[]" } },
    },
    defaultValue: {
      control: "text",
      description: "Aba inicial (uncontrolled).",
      table: { type: { summary: "string" } },
    },
    value: {
      control: false,
      description: "Aba controlada. Use junto com `onValueChange`.",
      table: { type: { summary: "string" } },
    },
    onValueChange: {
      control: false,
      description: "Disparado ao trocar de aba.",
      table: { type: { summary: "(value: string) => void" }, category: "Eventos" },
    },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
      description: "Layout das abas.",
      table: {
        type: { summary: "'horizontal' | 'vertical'" },
        defaultValue: { summary: "'horizontal'" },
      },
    },
    lazy: {
      control: "boolean",
      description: "Quando `true`, apenas o painel ativo é montado/renderizado.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
  },
}
export default meta
type Story = StoryObj<typeof Tabs>

const baseItems = [
  {
    value: "overview",
    label: "Visão geral",
    content: <p className="text-sm">Resumo da conta, métricas chave e atalhos.</p>,
  },
  {
    value: "billing",
    label: "Cobrança",
    content: <p className="text-sm">Faturas, formas de pagamento e histórico.</p>,
  },
  {
    value: "team",
    label: "Equipe",
    content: <p className="text-sm">Membros, convites e permissões.</p>,
  },
]

export const Default: Story = {
  args: { defaultValue: "overview", items: baseItems },
  render: (args) => (
    <div className="w-[520px]">
      <Tabs {...args} />
    </div>
  ),
}

export const WithBadge: Story = {
  args: {
    defaultValue: "inbox",
    items: [
      {
        value: "inbox",
        label: "Caixa de entrada",
        badge: (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
            12
          </span>
        ),
        content: <p className="text-sm">Você tem 12 mensagens não lidas.</p>,
      },
      {
        value: "snoozed",
        label: "Adiados",
        badge: (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            3
          </span>
        ),
        content: <p className="text-sm">3 mensagens retornam amanhã.</p>,
      },
      {
        value: "archive",
        label: "Arquivados",
        content: <p className="text-sm">Histórico completo.</p>,
      },
    ],
  },
  render: (args) => (
    <div className="w-[520px]">
      <Tabs {...args} />
    </div>
  ),
}

export const Vertical: Story = {
  args: {
    orientation: "vertical",
    defaultValue: "perfil",
    items: [
      {
        value: "perfil",
        label: "Perfil",
        content: <p className="text-sm">Editar nome, foto e biografia.</p>,
      },
      {
        value: "seguranca",
        label: "Segurança",
        content: <p className="text-sm">Senha, MFA e sessões.</p>,
      },
      {
        value: "notificacoes",
        label: "Notificações",
        content: <p className="text-sm">E-mail, push e in-app.</p>,
      },
    ],
  },
  render: (args) => (
    <div className="w-[640px]">
      <Tabs {...args} />
    </div>
  ),
}

// Painel rico que registra cada vez que é montado — evidencia o efeito de `lazy`.
function MountCounter({ label }: { label: string }) {
  const mountsRef = useRef(0)
  const [, force] = useState(0)
  useEffect(() => {
    mountsRef.current += 1
    force((n) => n + 1)
    return () => {}
  }, [])
  return (
    <div className="rounded-md border bg-muted/30 p-3 text-sm">
      <p className="font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">Montagens nesta sessão: {mountsRef.current}</p>
    </div>
  )
}

export const Lazy: Story = {
  args: {
    lazy: true,
    defaultValue: "a",
    items: [
      { value: "a", label: "Painel A", content: <MountCounter label="Painel A" /> },
      { value: "b", label: "Painel B", content: <MountCounter label="Painel B" /> },
      { value: "c", label: "Painel C", content: <MountCounter label="Painel C" /> },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Com `lazy={true}` apenas o painel ativo é montado — note como o contador zera ao trocar de aba.",
      },
    },
  },
  render: (args) => (
    <div className="w-[520px]">
      <Tabs {...args} />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    defaultValue: "a",
    items: [
      { value: "a", label: "Ativo", content: <p className="text-sm">Painel ativo.</p> },
      {
        value: "b",
        label: "Bloqueado",
        disabled: true,
        content: <p className="text-sm">Indisponível.</p>,
      },
      { value: "c", label: "Outro", content: <p className="text-sm">Outro painel.</p> },
    ],
  },
  render: (args) => (
    <div className="w-[520px]">
      <Tabs {...args} />
    </div>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("overview")
    return (
      <div className="flex w-[520px] flex-col gap-3">
        <Tabs items={baseItems} value={value} onValueChange={setValue} />
        <p className="text-sm text-muted-foreground">
          Aba ativa: <code>{value}</code>
        </p>
      </div>
    )
  },
}
