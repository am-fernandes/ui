import type { Meta, StoryObj } from "@storybook/react-vite"
import { ChevronsUpDown } from "lucide-react"
import { useState } from "react"

import { Button } from "../primitives/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible"

const meta = {
  title: "Overlays/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Collapsible open={open} onOpenChange={setOpen} className="w-[320px] space-y-2">
        <div className="flex items-center justify-between gap-4 rounded-md border px-4 py-2">
          <h4 className="text-sm font-semibold">Detalhes do contrato</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Alternar detalhes">
              <ChevronsUpDown className="size-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-2 text-sm">Cliente: Empresa A</div>
          <div className="rounded-md border px-4 py-2 text-sm">Valor: R$ 12.000,00</div>
          <div className="rounded-md border px-4 py-2 text-sm">Vencimento: 30/05/2026</div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
}
