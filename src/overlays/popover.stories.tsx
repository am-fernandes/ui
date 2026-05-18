import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "../primitives/button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

type PlaygroundArgs = {
  align: "start" | "center" | "end"
  side: "top" | "right" | "bottom" | "left"
  content: string
}

const meta: Meta<typeof Popover> = {
  title: "Overlays/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Painel flutuante ancorado em um trigger. Use para conteúdo contextual leve (filtros, ações secundárias, formulários pequenos).",
          "",
          "**API composicional:**",
          "- `Popover` — root (props `open`, `defaultOpen`, `onOpenChange`, `modal`).",
          "- `PopoverTrigger` — botão de abertura (use `asChild` para customizar).",
          "- `PopoverAnchor` — âncora alternativa quando o trigger não deve ser o ponto de ancoragem.",
          "- `PopoverContent` — conteúdo flutuante.",
          "",
          "**Props relevantes do `PopoverContent`:**",
          "- `side: 'top' | 'right' | 'bottom' | 'left'` — lado preferencial em relação ao trigger.",
          "- `align: 'start' | 'center' | 'end'` — alinhamento na borda. Default `'center'`.",
          "- `sideOffset: number` — distância em px do trigger. Default `4`.",
          "- `alignOffset: number` — offset perpendicular à `align`.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Popover, PopoverTrigger, PopoverContent, Button } from "@am-fernandes/ui"',
          "",
          "<Popover>",
          "  <PopoverTrigger asChild>",
          '    <Button variant="outline">Abrir</Button>',
          "  </PopoverTrigger>",
          "  <PopoverContent>",
          '    <p className="text-sm">Conteúdo do popover.</p>',
          "  </PopoverContent>",
          "</Popover>",
          "```",
        ].join("\n"),
      },
    },
  },
}

export default meta

type Story = StoryObj<PlaygroundArgs>

export const Playground: Story = {
  args: {
    align: "center",
    side: "bottom",
    content: "Conteúdo do popover.",
  },
  argTypes: {
    align: {
      control: "inline-radio",
      options: ["start", "center", "end"],
      description: "Alinhamento do conteúdo na borda do trigger.",
      table: {
        type: { summary: "'start' | 'center' | 'end'" },
        defaultValue: { summary: "'center'" },
      },
    },
    side: {
      control: "inline-radio",
      options: ["top", "right", "bottom", "left"],
      description: "Lado preferencial do conteúdo em relação ao trigger.",
      table: {
        type: { summary: "'top' | 'right' | 'bottom' | 'left'" },
        defaultValue: { summary: "'bottom'" },
      },
    },
    content: {
      control: "text",
      description: "Texto exibido dentro do `PopoverContent`.",
      table: { type: { summary: "string" } },
    },
  },
  render: ({ align, side, content }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Abrir</Button>
      </PopoverTrigger>
      <PopoverContent align={align} side={side}>
        <p className="text-sm">{content}</p>
      </PopoverContent>
    </Popover>
  ),
}

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Abrir</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm">Conteúdo do popover.</p>
      </PopoverContent>
    </Popover>
  ),
}
