import type { Meta, StoryObj } from "@storybook/react-vite"
import { HelpCircleIcon, InfoIcon, TrashIcon } from "lucide-react"

import { Button } from "../primitives/button"
import { Tooltip } from "./tooltip"

const meta: Meta<typeof Tooltip> = {
  title: "Overlays/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Dica contextual ancorada a um elemento. Aparece em hover/focus.",
          "**Não** é interativo (use `Popover` se precisar de inputs).",
          "",
          "**Props principais:**",
          "- `content: ReactNode` — texto/JSX exibido (obrigatório).",
          "- `children: ReactNode` — elemento âncora (1 filho).",
          "- `side?: 'top' | 'right' | 'bottom' | 'left'` — lado de aparição. Default `'top'` (radix).",
          "- `align?: 'start' | 'center' | 'end'` — alinhamento. Default `'center'`.",
          "- `sideOffset?: number` — distância do trigger. Default `4`.",
          "- `delayDuration?: number` — delay até abrir em ms. Default `200`.",
          "- `open` / `onOpenChange` — controlled mode.",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Tooltip, Button } from "@am-fernandes/ui"',
          "",
          '<Tooltip content="Excluir item">',
          '  <Button size="icon" aria-label="Excluir">',
          "    <TrashIcon />",
          "  </Button>",
          "</Tooltip>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    side: { control: "inline-radio", options: ["top", "right", "bottom", "left"] },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    sideOffset: { control: { type: "number", min: 0, max: 40, step: 1 } },
    delayDuration: { control: { type: "number", min: 0, max: 2000, step: 50 } },
    open: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="flex h-32 items-center justify-center">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
  args: {
    content: "Tooltip simples",
    children: <Button variant="outline">Passe o mouse</Button>,
  },
}

export const RichContent: Story = {
  args: {
    content: (
      <span>
        <strong>Atalho:</strong> ⌘K —{" "}
        <a href="/" className="underline">
          ver mais
        </a>
      </span>
    ),
    children: <Button variant="outline">Tooltip rico</Button>,
  },
  parameters: {
    docs: {
      description: {
        story:
          "`content` aceita qualquer `ReactNode` — útil para destacar atalhos, formatar texto, etc. Links dentro do tooltip podem ser problemáticos para a11y (o tooltip não é interativo).",
      },
    },
  },
}

export const DelayLong: Story = {
  args: {
    content: "Apareci depois de 1s",
    delayDuration: 1000,
    children: <Button variant="outline">Hover 1s+</Button>,
  },
  parameters: {
    docs: {
      description: {
        story: "Aumente `delayDuration` para reduzir acionamento acidental em listas densas.",
      },
    },
  },
}

export const Sides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8">
      <Tooltip content="side=top" side="top">
        <Button variant="outline">top</Button>
      </Tooltip>
      <Tooltip content="side=right" side="right">
        <Button variant="outline">right</Button>
      </Tooltip>
      <Tooltip content="side=bottom" side="bottom">
        <Button variant="outline">bottom</Button>
      </Tooltip>
      <Tooltip content="side=left" side="left">
        <Button variant="outline">left</Button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: { description: { story: "Os 4 lados disponíveis para posicionamento." } },
  },
}

export const OnIconButton: Story = {
  render: () => (
    <div className="flex gap-2">
      <Tooltip content="Ajuda">
        <Button variant="ghost" size="icon" aria-label="Ajuda">
          <HelpCircleIcon className="size-4" />
        </Button>
      </Tooltip>
      <Tooltip content="Mais informações">
        <Button variant="ghost" size="icon" aria-label="Informação">
          <InfoIcon className="size-4" />
        </Button>
      </Tooltip>
      <Tooltip content="Excluir item permanentemente">
        <Button variant="ghost" size="icon" aria-label="Excluir">
          <TrashIcon className="size-4" />
        </Button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Uso canônico: explicar a função de ícones em `size="icon"`. Sempre preserve `aria-label` no botão — o tooltip é complementar, não substituto da acessibilidade.',
      },
    },
  },
}
