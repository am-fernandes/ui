import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "@storybook/test"
import { SettingsIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "../primitives/button"
import { Input } from "../primitives/input"
import { Dialog } from "./dialog"
import { Popover } from "./popover"
import { Sheet } from "./sheet"

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
    "aria-label": "Informações do popover",
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
    "aria-label": "Popover alinhado ao início",
    trigger: <Button variant="outline">align=start</Button>,
    align: "start",
    children: <p className="text-sm">Alinhado ao início do trigger.</p>,
  },
}

export const AlignEnd: Story = {
  args: {
    "aria-label": "Popover alinhado ao fim",
    trigger: <Button variant="outline">align=end</Button>,
    align: "end",
    children: <p className="text-sm">Alinhado ao fim do trigger.</p>,
  },
}

export const SideTop: Story = {
  args: {
    "aria-label": "Popover acima",
    trigger: <Button variant="outline">side=top</Button>,
    side: "top",
    children: <p className="text-sm">Aparece acima.</p>,
  },
}

export const SideBottom: Story = {
  args: {
    "aria-label": "Popover abaixo",
    trigger: <Button variant="outline">side=bottom (default)</Button>,
    side: "bottom",
    children: <p className="text-sm">Aparece abaixo (default).</p>,
  },
}

export const WithForm: Story = {
  args: {
    "aria-labelledby": "popover-form-title",
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
        <h4 id="popover-form-title" className="text-sm font-medium">
          Renomear documento
        </h4>
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
          aria-label="Popover controlado"
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

const cities = Array.from({ length: 40 }, (_, i) => `Cidade ${i + 1}`)

function CityPicker() {
  const [city, setCity] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  return (
    <div className="flex items-center gap-3">
      <Popover
        open={open}
        onOpenChange={setOpen}
        align="start"
        aria-label="Cidades"
        className="w-56 p-1"
        trigger={<Button variant="outline">{city ?? "Escolher cidade"}</Button>}
      >
        <ul data-testid="city-list" className="flex max-h-48 flex-col overflow-y-auto">
          {cities.map((name) => (
            <li key={name}>
              <button
                type="button"
                className="w-full cursor-pointer rounded-element px-2 py-1.5 text-left text-sm state-layer focus-visible:focus-outline-inset"
                onClick={() => {
                  setCity(name)
                  setOpen(false)
                }}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      </Popover>
    </div>
  )
}

export const TallContent: Story = {
  render: () => (
    <Popover
      trigger={<Button variant="outline">Colunas visíveis</Button>}
      aria-label="Colunas visíveis"
      align="start"
      collisionPadding={8}
    >
      <ul className="flex flex-col gap-2 text-sm">
        {Array.from({ length: 40 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static story content
          <li key={i}>Coluna {i + 1}</li>
        ))}
      </ul>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Conteúdo mais alto que o espaço até a borda da tela: o popover para no espaço disponível (menos `collisionPadding`) e rola.",
      },
    },
  },
}

export const InsideDialog: Story = {
  render: () => (
    <Dialog
      trigger={<Button>Abrir dialog</Button>}
      title="Filtrar leads"
      description="A lista abre dentro do diálogo e rola com a roda do mouse e com o dedo."
    >
      <CityPicker />
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Dentro de um `Dialog`, `AlertDialog` ou `Sheet`, o popover é renderizado dentro do conteúdo do modal (e não no `<body>`): a lista rola, um clique nela não fecha o modal e ela acompanha a animação dele.",
      },
    },
  },
}

export const InsideSheet: Story = {
  render: () => (
    <Sheet trigger={<Button>Abrir sheet</Button>} title="Filtrar leads" description="Por cidade.">
      <CityPicker />
    </Sheet>
  ),
}
