import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "../primitives/button"
import { Input } from "../primitives/input"
import { Label } from "../primitives/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"

type PlaygroundArgs = {
  title: string
  description: string
  triggerLabel: string
  confirmLabel: string
}

const meta = {
  title: "Overlays/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Diálogo modal genérico. Use para formulários, confirmações não-destrutivas ou conteúdo focal. Para confirmação destrutiva prefira `AlertDialog`.",
          "",
          "**API composicional:**",
          "- `Dialog` — root (props `open`, `defaultOpen`, `onOpenChange`, `modal`).",
          "- `DialogTrigger` — abre o diálogo (use `asChild` para customizar o botão).",
          "- `DialogContent` — container do conteúdo, já inclui overlay, portal e botão de fechar (X).",
          "- `DialogHeader` / `DialogFooter` — wrappers de layout.",
          "- `DialogTitle` / `DialogDescription` — texto acessível (obrigatórios para A11y).",
          "- `DialogClose` — fecha programaticamente (use `asChild` em botões internos).",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<PlaygroundArgs>

export const Playground: Story = {
  args: {
    title: "Editar perfil",
    description: "Atualize suas informações pessoais e clique em salvar.",
    triggerLabel: "Abrir diálogo",
    confirmLabel: "Salvar",
  },
  argTypes: {
    title: {
      control: "text",
      description: "Texto do `DialogTitle`.",
      table: { type: { summary: "string" } },
    },
    description: {
      control: "text",
      description: "Texto do `DialogDescription`.",
      table: { type: { summary: "string" } },
    },
    triggerLabel: {
      control: "text",
      description: "Label do botão `DialogTrigger`.",
      table: { type: { summary: "string" } },
    },
    confirmLabel: {
      control: "text",
      description: "Label do botão de confirmação no `DialogFooter`.",
      table: { type: { summary: "string" } },
    },
  },
  render: ({ title, description, triggerLabel, confirmLabel }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" placeholder="Seu nome" />
        </div>
        <DialogFooter>
          <Button>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Abrir diálogo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais e clique em salvar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" placeholder="Seu nome" />
        </div>
        <DialogFooter>
          <Button>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
