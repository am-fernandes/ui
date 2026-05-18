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

const meta = {
  title: "Overlays/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Painel lateral que desliza da borda. 4 lados (top/right/bottom/left). Use para navegação mobile ou drawers de detalhe.",
      },
    },
  },
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

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
