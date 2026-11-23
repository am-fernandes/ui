import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "@storybook/test"
import {
  Bell,
  Bold,
  Copy,
  Download,
  Italic,
  Pencil,
  Plus,
  Settings,
  Trash2,
  Underline,
} from "lucide-react"

import * as React from "react"

import { Button } from "./button"
import { IconButton } from "./icon-button"

const meta = {
  title: "Primitives/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Botão quadrado só com ícone.",
          "",
          "- `label` é obrigatório: vira o nome acessível e o tooltip (desligue com `tooltip={false}`).",
          "- Mesmas cores do `Button` (`variant`), mas o padrão é `ghost`.",
          "- `size`: `sm` (32px), `md` (40px, a altura do `Button`) e `lg` (44px, alvo de toque).",
          '- Nasce com `type="button"`, para não enviar o formulário em que estiver.',
          "- `disabled` e `loading` usam `aria-disabled`, nunca o `disabled` nativo: o botão continua na ordem do Tab e com o tooltip, e ignora o clique e o teclado.",
        ].join("\n"),
      },
    },
  },
  args: {
    icon: <Pencil />,
    label: "Editar",
  },
} satisfies Meta<typeof IconButton>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole("button", { name: "Editar" })
    await userEvent.tab()
    await expect(button).toHaveFocus()
    // The tooltip renders in a portal outside the story root.
    await waitFor(() =>
      expect(within(document.body).getByRole("tooltip")).toHaveTextContent("Editar"),
    )
    await userEvent.tab()
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton icon={<Plus />} label="Novo" variant="default" />
      <IconButton icon={<Copy />} label="Duplicar" variant="secondary" />
      <IconButton icon={<Download />} label="Baixar" variant="outline" />
      <IconButton icon={<Settings />} label="Configurações" variant="ghost" />
      <IconButton icon={<Trash2 />} label="Excluir" variant="destructive" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton icon={<Bell />} label="Notificações (sm)" size="sm" variant="outline" />
      <IconButton icon={<Bell />} label="Notificações (md)" size="md" variant="outline" />
      <IconButton icon={<Bell />} label="Notificações (lg)" size="lg" variant="outline" />
    </div>
  ),
}

export const Loading: Story = {
  args: { icon: <Download />, label: "Baixar relatório", loading: true, variant: "outline" },
  parameters: {
    docs: {
      description: {
        story:
          "Com `loading` um spinner entra no lugar do ícone. O botão mantém o foco e ignora cliques (`aria-busy`, `aria-disabled`), e o início é anunciado ao leitor de tela.",
      },
    },
  },
}

export const Disabled: Story = {
  args: { icon: <Trash2 />, label: "Excluir", disabled: true, variant: "destructive" },
  parameters: {
    docs: {
      description: {
        story:
          "Um IconButton desabilitado nunca recebe o `disabled` nativo: fica `aria-disabled`. Assim o Tab continua chegando nele e o tooltip continua dizendo o que ele é, e o clique e o teclado são ignorados.",
      },
    },
  },
}

function RowActionsExample() {
  const [last, setLast] = React.useState("nenhuma")
  return (
    <div className="flex w-96 flex-col gap-2">
      <div className="flex items-center gap-1 rounded-element border border-border-strong bg-card py-1.5 pr-1.5 pl-3">
        <span className="min-w-0 flex-1 truncate text-sm">Proposta nº 1042 · aprovada</span>
        <IconButton
          icon={<Pencil />}
          label="Editar proposta"
          size="sm"
          onClick={() => setLast("editar")}
        />
        <IconButton
          icon={<Trash2 />}
          label="Excluir proposta"
          size="sm"
          disabled
          onClick={() => setLast("excluir")}
        />
      </div>
      <output className="text-sm" data-testid="last-action">
        Última ação: {last}
      </output>
    </div>
  )
}

export const RowActions: Story = {
  render: () => <RowActionsExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Ações de uma linha de tabela. A proposta aprovada não pode ser excluída: o botão fica esmaecido e não faz nada, mas quem passa o mouse ou chega pelo Tab ainda lê “Excluir proposta” e sabe que a ação existe e está indisponível.",
      },
    },
  },
}

export const WithoutTooltip: Story = {
  args: { tooltip: false },
  parameters: {
    docs: {
      description: {
        story:
          "Sem tooltip quando o contexto já explica o ícone (ex.: dentro de um campo). O `label` continua sendo o nome acessível.",
      },
    },
  },
}

export const Toolbar: Story = {
  render: () => (
    <div role="toolbar" aria-label="Formatação" className="inline-flex gap-1 rounded-md border p-1">
      <IconButton icon={<Bold />} label="Negrito" size="sm" />
      <IconButton icon={<Italic />} label="Itálico" size="sm" />
      <IconButton icon={<Underline />} label="Sublinhado" size="sm" />
    </div>
  ),
}

export const TightRow: Story = {
  render: () => (
    <div className="flex w-56 items-center gap-2 rounded-element border border-border-strong bg-card p-2">
      <span className="min-w-0 truncate text-sm">
        Proposta comercial nº 1042 — Torre B, unidade 1204
      </span>
      <IconButton icon={<Pencil />} label="Editar proposta" variant="outline" />
      <IconButton icon={<Trash2 />} label="Excluir proposta" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Numa linha apertada quem cede é o texto, que trunca. O IconButton continua quadrado.",
      },
    },
  },
}

export const NextToButton: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button>Salvar proposta</Button>
      <IconButton icon={<Copy />} label="Duplicar proposta" variant="outline" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "No tamanho `md` (padrão), o IconButton tem a mesma altura do `Button`.",
      },
    },
  },
}
