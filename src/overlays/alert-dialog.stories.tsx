import { cn } from "@/lib/utils"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "../primitives/button"
import { buttonVariants } from "../primitives/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog"

type PlaygroundArgs = {
  title: string
  description: string
  cancelText: string
  actionText: string
  destructive: boolean
}

const meta = {
  title: "Overlays/AlertDialog",
  component: AlertDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Diálogo modal de **confirmação**. Bloqueia interação até o usuário escolher `Action` ou `Cancel`. Indicado para ações destrutivas ou irreversíveis.",
          "",
          "**API composicional:**",
          "- `AlertDialog` — root controlado/uncontrolled (`open`, `onOpenChange`, `defaultOpen`).",
          "- `AlertDialogTrigger` — botão que abre o diálogo (use `asChild` para customizar).",
          "- `AlertDialogContent` — container do conteúdo (já inclui overlay e portal).",
          "- `AlertDialogHeader` / `AlertDialogFooter` — wrappers para layout.",
          "- `AlertDialogTitle` / `AlertDialogDescription` — texto acessível (obrigatórios para A11y).",
          '- `AlertDialogAction` — botão primário (estiliza com `buttonVariants()`); use `variant="destructive"` via `className` para ações destrutivas.',
          "- `AlertDialogCancel` — botão secundário (estilo `outline`).",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof AlertDialog>

export default meta
type Story = StoryObj<PlaygroundArgs>

export const Playground: Story = {
  args: {
    title: "Você tem certeza?",
    description: "Esta ação não pode ser desfeita.",
    cancelText: "Cancelar",
    actionText: "Excluir",
    destructive: true,
  },
  argTypes: {
    title: {
      control: "text",
      description: "Texto do `AlertDialogTitle`.",
      table: { type: { summary: "string" } },
    },
    description: {
      control: "text",
      description: "Texto do `AlertDialogDescription`.",
      table: { type: { summary: "string" } },
    },
    cancelText: {
      control: "text",
      description: "Label do `AlertDialogCancel`.",
      table: { type: { summary: "string" } },
    },
    actionText: {
      control: "text",
      description: "Label do `AlertDialogAction`.",
      table: { type: { summary: "string" } },
    },
    destructive: {
      control: "boolean",
      description: "Aplica a variante `destructive` no botão de ação.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
  },
  render: ({ title, description, cancelText, actionText, destructive }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={destructive ? "destructive" : "default"}>{actionText}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            className={cn(destructive && buttonVariants({ variant: "destructive" }))}
          >
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Excluir</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction>Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}
