import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, waitFor, within } from "@storybook/test"
import { useState } from "react"

import { Button } from "../primitives/button"
import { Textarea } from "../primitives/textarea"
import { AlertDialog } from "./alert-dialog"

const meta: Meta<typeof AlertDialog> = {
  title: "Overlays/AlertDialog",
  component: AlertDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Modal de confirmação destrutiva. Sempre tem dois botões (`Cancelar` + ação principal) e não fecha em clique fora — é intencional, garante decisão consciente.",
          "",
          "**Props principais:**",
          "- `trigger?: ReactNode` — elemento que abre o modal. Omita para uso controlado.",
          "- `title: ReactNode` — título obrigatório (a11y).",
          "- `description?: ReactNode` — texto secundário.",
          "- `children?: ReactNode` — body adicional (renderiza entre description e botões).",
          "- `onConfirm: () => void` — handler do botão principal.",
          "- `onCancel?: () => void` — handler do botão cancelar.",
          "- `confirmLabel?: string` — default `'Confirmar'`.",
          "- `cancelLabel?: string` — default `'Cancelar'`.",
          "- `confirmVariant?: ButtonProps['variant']` — visual do botão de ação (use `destructive` para ações destrutivas).",
          "- `open` / `onOpenChange` — controlled mode.",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { AlertDialog, Button } from "@amfernandesinc/ui"',
          "",
          "<AlertDialog",
          '  trigger={<Button variant="destructive">Excluir</Button>}',
          '  title="Excluir documento?"',
          '  description="Esta ação não pode ser desfeita."',
          '  confirmLabel="Excluir"',
          '  confirmVariant="destructive"',
          "  onConfirm={() => handleDelete()}",
          "/>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    confirmLabel: { control: "text" },
    cancelLabel: { control: "text" },
    confirmVariant: {
      control: "inline-radio",
      options: ["default", "destructive", "outline", "secondary", "ghost"],
    },
    open: { control: "boolean" },
  },
}
export default meta
type Story = StoryObj<typeof AlertDialog>

export const Default: Story = {
  args: {
    trigger: <Button variant="destructive">Excluir documento</Button>,
    title: "Excluir documento?",
    description: "Esta ação não pode ser desfeita. Tem certeza?",
    confirmLabel: "Excluir",
    cancelLabel: "Cancelar",
    confirmVariant: "destructive",
    onConfirm: fn(),
  },
  parameters: {
    // destructive button token fails 4.5:1; tracked in design-tokens roadmap.
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Excluir documento" })
    await userEvent.click(trigger)
    const body = within(document.body)
    await waitFor(() => expect(body.getByRole("alertdialog")).toBeInTheDocument())
    const confirm = body.getByRole("button", { name: "Excluir" })
    await userEvent.click(confirm)
    await expect(args.onConfirm).toHaveBeenCalled()
  },
}

export const NonDestructive: Story = {
  args: {
    trigger: <Button>Publicar versão</Button>,
    title: "Publicar nova versão?",
    description: "Os usuários receberão a atualização imediatamente.",
    confirmLabel: "Publicar",
    confirmVariant: "default",
    onConfirm: () => console.log("published"),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use `confirmVariant="default"` para confirmações não-destrutivas (publicar, enviar, ativar).',
      },
    },
  },
}

export const ConfirmOnce: Story = {
  render: () => {
    const [sent, setSent] = useState(0)
    const [cancelled, setCancelled] = useState(0)
    return (
      <div className="flex flex-col items-start gap-3">
        <AlertDialog
          trigger={<Button>Aprovar proposta</Button>}
          title="Aprovar a proposta #1042?"
          description="O comprador é avisado por e-mail."
          confirmLabel="Aprovar"
          onConfirm={() => setSent((n) => n + 1)}
          onCancel={() => setCancelled((n) => n + 1)}
        />
        <p className="text-sm text-muted-foreground" data-testid="confirm-count">
          Aprovações enviadas: {sent}
        </p>
        <p className="text-sm text-muted-foreground" data-testid="cancel-count">
          Cancelamentos: {cancelled}
        </p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Um clique duplo em “Aprovar” confirma uma vez só: enquanto o diálogo fecha, os botões não respondem mais.",
      },
    },
  },
}

export const ControlledOpen: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="outline" onClick={() => setOpen(true)}>
          Abrir programaticamente
        </Button>
        <p className="text-sm text-muted-foreground">open = {String(open)}</p>
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
          title="Confirmar logout?"
          description="Você precisará fazer login novamente."
          confirmLabel="Sair"
          onConfirm={() => {
            console.log("logged out")
            setOpen(false)
          }}
        />
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

export const WithBody: Story = {
  render: () => (
    <AlertDialog
      trigger={<Button variant="destructive">Cancelar assinatura</Button>}
      title="Cancelar assinatura?"
      description="Conte-nos o motivo (opcional)."
      confirmLabel="Confirmar cancelamento"
      confirmVariant="destructive"
      onConfirm={() => console.log("subscription canceled")}
    >
      <Textarea label="Motivo (opcional)" placeholder="Por que está cancelando?" autoResize />
    </AlertDialog>
  ),
  parameters: {
    // destructive button token fails 4.5:1; tracked in design-tokens roadmap.
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
    docs: {
      description: {
        story:
          "`children` renderiza acima dos botões — útil para coletar contexto extra antes da decisão.",
      },
    },
  },
}

export const LongBody: Story = {
  render: () => (
    <AlertDialog
      trigger={<Button variant="outline">Arquivar 40 propostas</Button>}
      title="Arquivar 40 propostas?"
      description="As propostas abaixo saem da fila de atendimento."
      confirmLabel="Arquivar"
      onConfirm={() => console.log("archived")}
    >
      <ul className="flex flex-col gap-1 text-sm">
        {Array.from({ length: 40 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static story content
          <li key={i}>
            Proposta #{1000 + i} · Unidade {101 + i}
          </li>
        ))}
      </ul>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Conteúdo mais alto que a tela: o corpo rola e os botões “Cancelar” e a ação continuam à vista.",
      },
    },
  },
}
