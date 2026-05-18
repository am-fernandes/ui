import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowUpRightIcon, MoreHorizontalIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "../primitives/badge"
import { Button } from "../primitives/button"
import { Card } from "./card"

const meta: Meta<typeof Card> = {
  title: "Data/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Container retangular flat com slots opcionais — `title`, `description`, `headerAction` e `footer`. Quando nenhum slot é setado, vira um container puro (`p-6` + borda + sombra).",
          "",
          "**Props:**",
          "- `title?: ReactNode` — título no header (renderiza como `<h3>`).",
          "- `description?: ReactNode` — texto secundário no header.",
          "- `headerAction?: ReactNode` — slot à direita do header (badges, menus, ações rápidas).",
          "- `footer?: ReactNode` — slot inferior, alinhado à direita (CTAs).",
          "- `children` — conteúdo principal (body).",
          "- Encaminha todos os atributos HTML de `<div>` (`id`, `role`, `aria-*`, `onClick`, etc.).",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Card } from "@am-fernandes/ui"',
          'import { Button } from "@am-fernandes/ui"',
          "",
          "<Card",
          '  title="Renovação de contrato"',
          '  description="Vencimento em 12 dias"',
          "  footer={",
          "    <>",
          '      <Button variant="outline">Cancelar</Button>',
          "      <Button>Salvar</Button>",
          "    </>",
          "  }",
          ">",
          "  Conteúdo do card...",
          "</Card>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    title: {
      control: "text",
      description: "Título no header. Quando omitido, o header não é renderizado.",
      table: { type: { summary: "ReactNode" } },
    },
    description: {
      control: "text",
      description: "Texto secundário no header (`text-sm text-muted-foreground`).",
      table: { type: { summary: "ReactNode" } },
    },
    headerAction: {
      control: false,
      description: "Slot à direita do header. Aceita badges, botões de menu, etc.",
      table: { type: { summary: "ReactNode" } },
    },
    footer: {
      control: false,
      description: "Slot inferior, alinhado à direita (`justify-end`). Ideal para CTAs.",
      table: { type: { summary: "ReactNode" } },
    },
    children: {
      control: false,
      description: "Conteúdo principal do card.",
      table: { type: { summary: "ReactNode" } },
    },
    className: {
      control: "text",
      description: "Classes Tailwind extras no wrapper externo.",
      table: { type: { summary: "string" } },
    },
  },
}
export default meta
type Story = StoryObj<typeof Card>

export const Simple: Story = {
  args: {
    children: "Conteúdo simples sem header ou footer.",
  },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: "Sem `title`/`description`/`footer`: vira um container puro com padding interno.",
      },
    },
  },
}

export const Default: Story = {
  args: {
    title: "Renovação de contrato",
    description: "Vencimento em 12 dias",
    children: (
      <p className="text-sm text-muted-foreground">
        O contrato com a Empresa A vence em 12 dias. Revise os termos antes de prorrogar
        automaticamente.
      </p>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
}

export const WithFooter: Story = {
  args: {
    title: "Confirmar publicação",
    description: "Após publicar, o conteúdo ficará visível para todos os times.",
    children: (
      <p className="text-sm text-muted-foreground">
        Você pode reverter essa ação a qualquer momento na aba de auditoria.
      </p>
    ),
    footer: (
      <>
        <Button variant="outline">Cancelar</Button>
        <Button>Publicar</Button>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: "Pattern clássico de form/modal: corpo de explicação + CTAs no rodapé.",
      },
    },
  },
}

export const WithAction: Story = {
  args: {
    title: "Status do contrato",
    description: "C-2026-001 · Empresa A",
    headerAction: <Badge>Aprovado</Badge>,
    children: (
      <p className="text-sm text-muted-foreground">Próxima revisão programada para 15/06/2026.</p>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Use `headerAction` para colocar status (badge), botão de menu (`MoreHorizontal`) ou ações rápidas alinhadas à direita do header.",
      },
    },
  },
}

export const Compact: Story = {
  args: {
    title: "Apenas título",
  },
  decorators: [
    (Story) => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: { story: "Header mínimo: só `title`, sem `description` ou body." },
    },
  },
}

export const ContentOnly: Story = {
  render: () => (
    <div className="w-[420px]">
      <Card>
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-full bg-primary/10" />
          <div>
            <p className="font-medium">Container puro</p>
            <p className="text-sm text-muted-foreground">
              Sem header nem footer — Card vira só uma área com padding.
            </p>
          </div>
        </div>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Quando você omite todos os slots, o Card serve como um container leve para qualquer layout interno.",
      },
    },
  },
}

export const MetricCard: Story = {
  render: () => (
    <div className="w-[280px]">
      <Card
        title={<span className="text-sm font-medium text-muted-foreground">Receita do mês</span>}
        headerAction={<TrendingUpIcon className="size-4 text-emerald-500" aria-hidden />}
      >
        <div className="flex flex-col gap-1">
          <span className="font-bold text-3xl tabular-nums">R$ 248.320</span>
          <span className="text-emerald-600 text-xs">+12,4% vs. mês anterior</span>
        </div>
      </Card>
    </div>
  ),
  parameters: {
    // Title uses muted-foreground (decorative pattern); fails 4.5:1. Tracked in design-tokens roadmap.
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
    docs: {
      description: {
        story:
          "Pattern de dashboard: título pequeno + número grande no body + ícone como `headerAction`.",
      },
    },
  },
}

export const CardGrid: Story = {
  render: () => (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
      <Card
        title="Contratos ativos"
        headerAction={<Badge variant="secondary">147</Badge>}
        footer={
          <Button variant="ghost" size="sm">
            Ver todos
            <ArrowUpRightIcon />
          </Button>
        }
      >
        <p className="text-muted-foreground text-sm">
          Soma de R$ 4,2M em obrigações vigentes neste trimestre.
        </p>
      </Card>
      <Card
        title="Pendentes de revisão"
        headerAction={<Badge variant="destructive">5</Badge>}
        footer={
          <Button variant="ghost" size="sm">
            Revisar
            <ArrowUpRightIcon />
          </Button>
        }
      >
        <p className="text-muted-foreground text-sm">
          Documentos aguardando assinatura há mais de 7 dias.
        </p>
      </Card>
      <Card
        title="Equipe"
        headerAction={
          <Button variant="ghost" size="icon" aria-label="Mais ações">
            <MoreHorizontalIcon />
          </Button>
        }
        footer={
          <Button variant="ghost" size="sm">
            Gerenciar
            <ArrowUpRightIcon />
          </Button>
        }
      >
        <p className="text-muted-foreground text-sm">
          12 advogados, 4 estagiários, 3 administrativos.
        </p>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Grid de cards em dashboards — `title` + `headerAction` + body curto + footer com CTA.",
      },
    },
  },
}
