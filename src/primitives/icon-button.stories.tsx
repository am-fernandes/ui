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
  args: { icon: <Download />, label: "Baixando", loading: true, variant: "outline" },
}

export const Disabled: Story = {
  args: { icon: <Trash2 />, label: "Excluir", disabled: true, variant: "destructive" },
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
