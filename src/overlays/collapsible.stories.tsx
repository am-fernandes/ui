import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Button } from "../primitives/button"
import { Collapsible } from "./collapsible"

const meta: Meta<typeof Collapsible> = {
  title: "Overlays/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Bloco expansível com trigger embutido (chevron) ou customizado. Animação inline (sem portal).",
          "",
          "**Props principais:**",
          "- `title?: ReactNode` — texto no trigger padrão (mutuamente exclusivo com `trigger`).",
          "- `trigger?: ReactNode` — substitui o trigger padrão (botão custom).",
          "- `triggerSide?: 'left' | 'right'` — posição do chevron. Default `'right'`.",
          "- `triggerLabel?: string` — `aria-label` do botão quando sem `title`. Default `'Alternar seção'`.",
          "- `defaultOpen?: boolean` — uncontrolled inicial.",
          "- `open` / `onOpenChange` — controlled mode.",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Collapsible } from "@amfernandesinc/ui"',
          "",
          '<Collapsible title="Detalhes">',
          "  <p>Conteúdo recolhível</p>",
          "</Collapsible>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    triggerSide: { control: "inline-radio", options: ["left", "right"] },
    triggerLabel: { control: "text" },
    defaultOpen: { control: "boolean" },
    open: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="w-[28rem]">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof Collapsible>

export const Default: Story = {
  args: {
    title: "Detalhes técnicos",
    children: (
      <div className="rounded-md border p-3 text-sm">
        <p>Versão: 8.1.0</p>
        <p>Build: a1b2c3</p>
        <p>Ambiente: production</p>
      </div>
    ),
  },
}

export const TriggerLeft: Story = {
  args: {
    title: "Chevron à esquerda",
    triggerSide: "left",
    children: (
      <div className="rounded-md border p-3 text-sm">
        O chevron fica antes do texto via `flex-row-reverse`.
      </div>
    ),
  },
}

export const DefaultOpen: Story = {
  args: {
    title: "Aberto por padrão",
    defaultOpen: true,
    children: <div className="rounded-md border p-3 text-sm">Esta seção começa expandida.</div>,
  },
}

export const CustomTrigger: Story = {
  args: {
    trigger: <Button variant="outline">Trigger customizado</Button>,
    children: (
      <div className="mt-2 rounded-md border p-3 text-sm">
        Trigger substituído via prop `trigger`.
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use `trigger` quando precisar de visual totalmente custom (ícones, badges, layout).",
      },
    },
  },
}

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">open = {String(open)}</p>
        <Collapsible title="Seção controlada" open={open} onOpenChange={setOpen}>
          <div className="rounded-md border p-3 text-sm">
            Você pode abrir/fechar por código — útil para sincronizar com URL/state global.
          </div>
        </Collapsible>
        <Button variant="outline" onClick={() => setOpen(!open)}>
          {open ? "Fechar" : "Abrir"} programaticamente
        </Button>
      </div>
    )
  },
  parameters: {
    docs: { description: { story: "Modo controlled via `open` + `onOpenChange`." } },
  },
}

export const Nested: Story = {
  render: () => (
    <Collapsible title="Seção pai" defaultOpen>
      <div className="ml-4 flex flex-col gap-2 border-l pl-4 pt-2">
        <Collapsible title="Subseção A">
          <p className="text-sm">Conteúdo A</p>
        </Collapsible>
        <Collapsible title="Subseção B">
          <p className="text-sm">Conteúdo B</p>
        </Collapsible>
      </div>
    </Collapsible>
  ),
  parameters: {
    docs: { description: { story: "Collapsibles aninhados — cada nível tem estado próprio." } },
  },
}
