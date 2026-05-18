import type { Meta, StoryObj } from "@storybook/react"

import { Button } from "../primitives/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

type PlaygroundArgs = {
  side: "top" | "right" | "bottom" | "left"
  align: "start" | "center" | "end"
  delayDuration: number
  content: string
}

const meta: Meta<typeof Tooltip> = {
  title: "Overlays/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Dica contextual em hover/focus. Envolva o trigger em `TooltipTrigger asChild` e o conteúdo em `TooltipContent`.",
          "",
          "**API composicional:**",
          "- `TooltipProvider` — provider obrigatório (envolve a árvore ou o grupo de tooltips). Aceita `delayDuration` e `skipDelayDuration`.",
          "- `Tooltip` — root (props `open`, `defaultOpen`, `onOpenChange`, `delayDuration`, `disableHoverableContent`).",
          "- `TooltipTrigger` — elemento que dispara o tooltip (use `asChild` para reaproveitar um botão existente).",
          "- `TooltipContent` — balão flutuante.",
          "",
          "**Props relevantes do `TooltipContent`:**",
          "- `side: 'top' | 'right' | 'bottom' | 'left'` — lado preferencial. Default `'top'`.",
          "- `align: 'start' | 'center' | 'end'` — alinhamento na borda. Default `'center'`.",
          "- `sideOffset: number` — distância em px do trigger. Default `4`.",
          "- `alignOffset: number` — offset perpendicular à `align`.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, Button } from "@am-fernandes/ui"',
          "",
          "<TooltipProvider>",
          "  <Tooltip>",
          "    <TooltipTrigger asChild>",
          '      <Button variant="outline">Hover</Button>',
          "    </TooltipTrigger>",
          "    <TooltipContent>Dica</TooltipContent>",
          "  </Tooltip>",
          "</TooltipProvider>",
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
    side: "top",
    align: "center",
    delayDuration: 200,
    content: "Dica",
  },
  argTypes: {
    side: {
      control: "inline-radio",
      options: ["top", "right", "bottom", "left"],
      description: "Lado preferencial do `TooltipContent` em relação ao trigger.",
      table: {
        type: { summary: "'top' | 'right' | 'bottom' | 'left'" },
        defaultValue: { summary: "'top'" },
      },
    },
    align: {
      control: "inline-radio",
      options: ["start", "center", "end"],
      description: "Alinhamento do conteúdo na borda do trigger.",
      table: {
        type: { summary: "'start' | 'center' | 'end'" },
        defaultValue: { summary: "'center'" },
      },
    },
    delayDuration: {
      control: { type: "number", min: 0, step: 50 },
      description: "Atraso em ms antes de abrir no hover (`TooltipProvider.delayDuration`).",
      table: { type: { summary: "number" }, defaultValue: { summary: "700" } },
    },
    content: {
      control: "text",
      description: "Texto exibido dentro do `TooltipContent`.",
      table: { type: { summary: "string" } },
    },
  },
  render: ({ side, align, delayDuration, content }) => (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover</Button>
        </TooltipTrigger>
        <TooltipContent side={side} align={align}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover</Button>
        </TooltipTrigger>
        <TooltipContent>Dica</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}
