import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "@storybook/test"
import { SettingsIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "../primitives/button"
import { Input } from "../primitives/input"
import { Popover } from "./popover"

const meta: Meta<typeof Popover> = {
  title: "Overlays/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Float container ancorado a um trigger. Diferente do `Tooltip`, é interativo (pode conter inputs, botões, links).",
          "",
          "**Props principais:**",
          "- `trigger?: ReactNode` — elemento âncora.",
          "- `children?: ReactNode` — conteúdo do popover.",
          "- `align?: 'start' | 'center' | 'end'` — alinhamento relativo ao trigger. Default `'center'`.",
          "- `side?: 'top' | 'right' | 'bottom' | 'left'` — lado de aparição. Default `'bottom'`.",
          "- `sideOffset?: number` — distância do trigger em px. Default `4`.",
          "- `modal?: boolean` — quando `true`, bloqueia interação com o resto da página.",
          "- `open` / `onOpenChange` — controlled mode.",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Popover, Button } from "@amfernandesinc/ui"',
          "",
          "<Popover trigger={<Button>Abrir</Button>}>",
          "  <p>Conteúdo do popover</p>",
          "</Popover>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    side: { control: "inline-radio", options: ["top", "right", "bottom", "left"] },
    sideOffset: { control: { type: "number", min: 0, max: 40, step: 1 } },
    modal: { control: "boolean" },
    open: { control: "boolean" },
  },
}
export default meta
type Story = StoryObj<typeof Popover>

export const Default: Story = {
  args: {
    trigger: <Button variant="outline">Abrir popover</Button>,
    children: (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Olá!</p>
        <p className="text-sm text-muted-foreground">
          Este é um popover básico, centralizado abaixo do trigger.
        </p>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Abrir popover" })
    await userEvent.click(trigger)
    const body = within(document.body)
    await waitFor(() => expect(body.getByText("Olá!")).toBeInTheDocument())
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
  },
}

export const AlignStart: Story = {
  args: {
    trigger: <Button variant="outline">align=start</Button>,
    align: "start",
    children: <p className="text-sm">Alinhado ao início do trigger.</p>,
  },
}

export const AlignEnd: Story = {
  args: {
    trigger: <Button variant="outline">align=end</Button>,
    align: "end",
    children: <p className="text-sm">Alinhado ao fim do trigger.</p>,
  },
}

export const SideTop: Story = {
  args: {
    trigger: <Button variant="outline">side=top</Button>,
    side: "top",
    children: <p className="text-sm">Aparece acima.</p>,
  },
}

export const SideBottom: Story = {
  args: {
    trigger: <Button variant="outline">side=bottom (default)</Button>,
    side: "bottom",
    children: <p className="text-sm">Aparece abaixo (default).</p>,
  },
}

export const WithForm: Story = {
  args: {
    trigger: (
      <Button variant="outline" className="size-9 p-0" aria-label="Configurações">
        <SettingsIcon className="size-4" />
      </Button>
    ),
    children: (
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          console.log("submitted")
        }}
      >
        <h4 className="text-sm font-medium">Renomear documento</h4>
        <Input label="Nome" labelPosition="hidden" placeholder="Novo nome..." />
        <Button type="submit">Salvar</Button>
      </form>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Popovers podem conter formulários completos — o foco é gerenciado automaticamente pelo Radix.",
      },
    },
  },
}

export const ControlledOpen: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div className="flex items-center gap-3">
        <Popover
          open={open}
          onOpenChange={setOpen}
          trigger={<Button variant="outline">Trigger</Button>}
        >
          <p className="text-sm">open = {String(open)}</p>
        </Popover>
        <Button variant="ghost" onClick={() => setOpen(!open)}>
          Toggle externo
        </Button>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: "Modo controlled via `open` + `onOpenChange`.",
      },
    },
  },
}
