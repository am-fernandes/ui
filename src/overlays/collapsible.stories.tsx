import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Collapsible, CollapsibleContent, CollapsibleHeader } from "./collapsible"

type PlaygroundArgs = {
  title: string
  triggerSide: "left" | "right"
  triggerLabel: string
}

const meta = {
  title: "Overlays/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Toggle de mostrar/esconder conteúdo. Use o helper `CollapsibleHeader` ou componha manualmente via `CollapsibleTrigger` + `CollapsibleContent`.",
          "",
          "**Props principais (`Collapsible` — root do Radix):**",
          "- `open` / `defaultOpen` — estado controlado/uncontrolled.",
          "- `onOpenChange(open)` — callback de mudança de estado.",
          "- `disabled` — desabilita o toggle.",
          "",
          "**`CollapsibleHeader` (helper):**",
          "- `title: React.ReactNode` — label do header (obrigatório).",
          "- `triggerSide: 'left' | 'right'` — posição do botão. Default `'right'`.",
          "- `triggerLabel: string` — `aria-label` do botão padrão. Default `'Alternar seção'`.",
          "- `trigger: React.ReactNode` — substitui o botão padrão (`ChevronsUpDown` em ghost icon).",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<PlaygroundArgs>

function Body() {
  return (
    <CollapsibleContent className="space-y-2">
      <div className="rounded-md border px-4 py-2 text-sm">Cliente: Empresa A</div>
      <div className="rounded-md border px-4 py-2 text-sm">Valor: R$ 12.000,00</div>
      <div className="rounded-md border px-4 py-2 text-sm">Vencimento: 30/05/2026</div>
    </CollapsibleContent>
  )
}

export const Playground: Story = {
  args: {
    title: "Detalhes do contrato",
    triggerSide: "right",
    triggerLabel: "Alternar detalhes",
  },
  argTypes: {
    title: {
      control: "text",
      description: "Label do `CollapsibleHeader`.",
      table: { type: { summary: "React.ReactNode" } },
    },
    triggerSide: {
      control: "inline-radio",
      options: ["left", "right"],
      description: "Posição do botão de toggle em relação ao título.",
      table: {
        type: { summary: "'left' | 'right'" },
        defaultValue: { summary: "'right'" },
      },
    },
    triggerLabel: {
      control: "text",
      description: "`aria-label` do botão padrão (ignorado se `trigger` for fornecido).",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "'Alternar seção'" },
      },
    },
  },
  render: ({ title, triggerSide, triggerLabel }) => {
    const [open, setOpen] = useState(false)
    return (
      <Collapsible open={open} onOpenChange={setOpen} className="w-[320px] space-y-2">
        <CollapsibleHeader title={title} triggerSide={triggerSide} triggerLabel={triggerLabel} />
        <Body />
      </Collapsible>
    )
  },
}

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Collapsible open={open} onOpenChange={setOpen} className="w-[320px] space-y-2">
        <CollapsibleHeader title="Detalhes do contrato" triggerLabel="Alternar detalhes" />
        <Body />
      </Collapsible>
    )
  },
}

export const TriggerLeft: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Collapsible open={open} onOpenChange={setOpen} className="w-[320px] space-y-2">
        <CollapsibleHeader
          title="Detalhes do contrato"
          triggerSide="left"
          triggerLabel="Alternar detalhes"
        />
        <Body />
      </Collapsible>
    )
  },
}

export const TriggerRight: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Collapsible open={open} onOpenChange={setOpen} className="w-[320px] space-y-2">
        <CollapsibleHeader
          title="Detalhes do contrato"
          triggerSide="right"
          triggerLabel="Alternar detalhes"
        />
        <Body />
      </Collapsible>
    )
  },
}
