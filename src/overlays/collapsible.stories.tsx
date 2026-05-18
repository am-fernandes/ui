import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Collapsible, CollapsibleContent, CollapsibleHeader } from "./collapsible"

const meta = {
  title: "Overlays/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          'Toggle de mostrar/esconder conteúdo. Use o convenience `CollapsibleHeader` (com `triggerSide="left" | "right"`) ou componha manualmente via `CollapsibleTrigger` + `CollapsibleContent`.',
      },
    },
  },
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

function Body() {
  return (
    <CollapsibleContent className="space-y-2">
      <div className="rounded-md border px-4 py-2 text-sm">Cliente: Empresa A</div>
      <div className="rounded-md border px-4 py-2 text-sm">Valor: R$ 12.000,00</div>
      <div className="rounded-md border px-4 py-2 text-sm">Vencimento: 30/05/2026</div>
    </CollapsibleContent>
  )
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
