import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "@storybook/test"

import { Separator } from "./separator"

const meta: Meta<typeof Separator> = {
  title: "Primitives/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Linha divisória horizontal ou vertical baseada em Radix Separator.",
          "",
          "**API:**",
          "- `orientation` — `'horizontal'` (default) ou `'vertical'`.",
          '- `decorative` — quando `true` (default), é puramente visual; com `false`, expõe `role="separator"` para tecnologias assistivas.',
          "- `className` — para ajustar cor, espessura ou margens.",
          "",
          '**Cuidado:** com `orientation="vertical"` o container precisa ter altura definida (`h-*` ou `flex` com align-items).',
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Separator } from "@am-fernandes/ui"',
          "",
          "<div>",
          "  <p>Acima</p>",
          '  <Separator className="my-4" />',
          "  <p>Abaixo</p>",
          "</div>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
      description: "Direção da linha.",
      table: {
        type: { summary: "'horizontal' | 'vertical'" },
        defaultValue: { summary: "'horizontal'" },
      },
    },
    decorative: {
      control: "boolean",
      description:
        "Se `true` (default), o separador é puramente visual. Use `false` para expor papel semântico (`role=separator`) ao leitor de tela.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    className: {
      control: "text",
      description: "Classes Tailwind extras (cor, espessura, margens).",
      table: { type: { summary: "string" } },
    },
  },
}
export default meta
type Story = StoryObj<typeof Separator>

export const Default: Story = {
  render: () => (
    <div className="w-72 rounded-md border p-4">
      <p className="text-sm font-medium">Card título</p>
      <p className="text-xs text-muted-foreground">Subtítulo opcional do bloco.</p>
      <Separator className="my-3" />
      <p className="text-sm">Conteúdo principal abaixo do separador.</p>
    </div>
  ),
  parameters: {
    docs: {
      description: { story: "Separador horizontal (default) dentro de um card simples." },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const separator = canvas
      .getByText("Card título")
      .parentElement?.querySelector('[data-slot="separator"]')
    await expect(separator).toBeInTheDocument()
    await expect(separator).toHaveAttribute("data-orientation", "horizontal")
  },
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-12 items-center gap-4 rounded-md border px-4">
      <span className="text-sm">Editar</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Excluir</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Compartilhar</span>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Separador vertical entre ações. Container precisa ter altura definida — aqui usamos `h-12` no flex.",
      },
    },
  },
}

export const InAccessibilityTree: Story = {
  render: () => (
    <section className="flex w-72 flex-col gap-3">
      <h2 className="font-semibold text-sm">Seção 1</h2>
      <p className="text-xs text-muted-foreground">Lorem ipsum dolor sit amet.</p>
      <Separator decorative={false} />
      <h2 className="font-semibold text-sm">Seção 2</h2>
      <p className="text-xs text-muted-foreground">Consectetur adipiscing elit.</p>
    </section>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`decorative=false` faz o separador aparecer na árvore de acessibilidade com `role="separator"`. Use entre seções que tenham significado semântico real.',
      },
    },
  },
}

export const InCard: Story = {
  render: () => (
    <div className="w-80 rounded-lg border bg-card">
      <div className="flex flex-col gap-1 p-4">
        <span className="text-xs text-muted-foreground">Cabeçalho</span>
        <span className="font-semibold">João da Silva</span>
        <span className="text-xs text-muted-foreground">joao@am-fernandes.com.br</span>
      </div>
      <Separator />
      <div className="flex flex-col gap-2 p-4 text-sm">
        <span>Plano: Pro</span>
        <span>Membro desde 2023</span>
      </div>
      <Separator />
      <div className="flex items-center justify-end gap-2 p-4">
        <button type="button" className="text-sm text-muted-foreground">
          Cancelar
        </button>
        <button type="button" className="text-sm font-medium">
          Salvar
        </button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Card com 3 zonas (header, content, footer) separadas. Pattern comum em modais e dashboards.",
      },
    },
  },
}

export const Customized: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <p className="text-sm">Linha padrão</p>
      <Separator />
      <p className="text-sm">Mais grossa</p>
      <Separator className="h-0.5" />
      <p className="text-sm">Cor primária</p>
      <Separator className="bg-primary" />
      <p className="text-sm">Tracejada (via border)</p>
      <Separator className="h-0 border-t border-dashed bg-transparent" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Variações de espessura, cor e estilo aplicadas via `className`. Para tracejado, neutralize o `bg-border` e use `border-t border-dashed`.",
      },
    },
  },
}
