import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "../primitives/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet"

type PlaygroundArgs = {
  side: "top" | "right" | "bottom" | "left"
  title: string
  description: string
}

const meta = {
  title: "Overlays/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Painel lateral que desliza da borda. Use para navegação mobile, drawers de detalhe ou formulários extensos.",
          "",
          "**API composicional:**",
          "- `Sheet` — root (props `open`, `defaultOpen`, `onOpenChange`, `modal`).",
          "- `SheetTrigger` — abre o sheet (use `asChild` para customizar).",
          "- `SheetContent` — container deslizante. Aceita `side: 'top' | 'right' | 'bottom' | 'left'` (default `'right'`).",
          "- `SheetHeader` / `SheetFooter` — wrappers de layout.",
          "- `SheetTitle` / `SheetDescription` — texto acessível (obrigatórios para A11y).",
          "- `SheetClose` — fecha programaticamente (use `asChild` em botões internos).",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<PlaygroundArgs>

export const Playground: Story = {
  args: {
    side: "right",
    title: "Configurações",
    description: "Ajuste suas preferências da conta.",
  },
  argTypes: {
    side: {
      control: "inline-radio",
      options: ["top", "right", "bottom", "left"],
      description: "Borda de onde o painel desliza.",
      table: {
        type: { summary: "'top' | 'right' | 'bottom' | 'left'" },
        defaultValue: { summary: "'right'" },
      },
    },
    title: {
      control: "text",
      description: "Texto do `SheetTitle`.",
      table: { type: { summary: "string" } },
    },
    description: {
      control: "text",
      description: "Texto do `SheetDescription`.",
      table: { type: { summary: "string" } },
    },
  },
  render: ({ side, title, description }) => (
    <div className="flex min-h-screen items-center justify-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button>Abrir sheet</Button>
        </SheetTrigger>
        <SheetContent side={side}>
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  ),
}

export const Right: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button>Abrir à direita</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Configurações</SheetTitle>
            <SheetDescription>Ajuste suas preferências da conta.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  ),
}

export const Left: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button>Abrir à esquerda</Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Configurações</SheetTitle>
            <SheetDescription>Ajuste suas preferências da conta.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  ),
}

export const Top: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button>Abrir no topo</Button>
        </SheetTrigger>
        <SheetContent side="top">
          <SheetHeader>
            <SheetTitle>Configurações</SheetTitle>
            <SheetDescription>Ajuste suas preferências da conta.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  ),
}

export const Bottom: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button>Abrir embaixo</Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Configurações</SheetTitle>
            <SheetDescription>Ajuste suas preferências da conta.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  ),
}
