import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "@storybook/test"
import { BellIcon, CheckCircle2Icon, ClockIcon, XCircleIcon } from "lucide-react"

import { formatCount } from "../lib/format-count"
import { Badge } from "./badge"

const meta: Meta<typeof Badge> = {
  title: "Primitives/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Etiqueta compacta para status, tags ou contadores.",
          "",
          "**API:**",
          "- `variant` — controla a cor: `default` (primary), `secondary`, `destructive`, `info`, `success`, `warning`, `outline`.",
          "- `dot` — ponto colorido + rótulo, sem fundo. Para tabelas densas, onde uma coluna de badges cheios pesaria mais que o conteúdo.",
          "- `children` — texto, número ou JSX (incluindo ícones).",
          "- `className` — para ajustes pontuais (raio, padding, cores).",
          "- Aceita todos os atributos HTML de `<div>` (`onClick`, `role`, etc.).",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Badge } from "@amfernandesinc/ui"',
          "",
          "<Badge>Novo</Badge>",
          '<Badge variant="secondary">Rascunho</Badge>',
          '<Badge variant="destructive">Erro</Badge>',
          '<Badge variant="outline">Beta</Badge>',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "secondary", "destructive", "info", "success", "warning", "outline"],
      description: "Cor/estilo do badge.",
      table: {
        type: {
          summary:
            "'default' | 'secondary' | 'destructive' | 'info' | 'success' | 'warning' | 'outline'",
        },
        defaultValue: { summary: "'default'" },
      },
    },
    dot: {
      control: "boolean",
      description: "Ponto + rótulo em vez do fundo cheio.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    children: {
      control: "text",
      description: "Conteúdo do badge (texto, número ou JSX).",
      table: { type: { summary: "ReactNode" } },
    },
    className: {
      control: "text",
      description: "Classes Tailwind extras.",
      table: { type: { summary: "string" } },
    },
  },
}
export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: { children: "Badge" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Badge")).toBeInTheDocument()
  },
}

export const Secondary: Story = {
  args: { variant: "secondary", children: "Rascunho" },
}

export const Destructive: Story = {
  args: { variant: "destructive", children: "Erro" },
}

export const Outline: Story = {
  args: { variant: "outline", children: "Beta" },
}

export const Info: Story = {
  args: { variant: "info", children: "Em andamento" },
}

export const Success: Story = {
  args: { variant: "success", children: "Vendido" },
}

export const Warning: Story = {
  args: { variant: "warning", children: "Atenção" },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="default">default</Badge>
      <Badge variant="secondary">secondary</Badge>
      <Badge variant="destructive">destructive</Badge>
      <Badge variant="info">info</Badge>
      <Badge variant="success">success</Badge>
      <Badge variant="warning">warning</Badge>
      <Badge variant="outline">outline</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Galeria com todas as 7 variantes lado a lado para comparação visual.",
      },
    },
  },
}

export const Dot: Story = {
  args: { variant: "success", dot: true, children: "Aprovado" },
  parameters: {
    docs: {
      description: {
        story:
          "Com `dot`, o status é um ponto na cor da variante ao lado de texto comum. A cor acelera a leitura e o rótulo carrega o significado.",
      },
    },
  },
}

export const DotInTable: Story = {
  render: () => (
    <div className="w-96 overflow-hidden rounded-container border border-border-strong bg-card text-sm">
      {(
        [
          ["Ana Souza", "success", "Aprovado"],
          ["Bruno Lima", "warning", "Pendente"],
          ["Carla Dias", "info", "Novo"],
          ["Diego Rocha", "destructive", "Perdido"],
        ] as const
      ).map(([name, variant, label], index) => (
        <div
          key={name}
          className={`grid grid-cols-2 items-center px-4 py-2.5 ${index ? "border-t" : ""}`}
        >
          <span className="font-medium">{name}</span>
          <Badge variant={variant} dot>
            {label}
          </Badge>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Numa tabela, quatro linhas de status não viram quatro blocos de cor. O fundo cheio fica para alertas e contadores.",
      },
    },
  },
}

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>
        <CheckCircle2Icon className="mr-1 size-3" />
        Aprovado
      </Badge>
      <Badge variant="secondary">
        <ClockIcon className="mr-1 size-3" />
        Pendente
      </Badge>
      <Badge variant="destructive">
        <XCircleIcon className="mr-1 size-3" />
        Rejeitado
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Badges com ícone do `lucide-react` para reforçar a semântica visual de status.",
      },
    },
  },
}

export const AsCounter: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {[3, 42, 999, 9999, 12345].map((n) => (
        <div key={n} className="relative inline-flex">
          <BellIcon className="size-6 text-muted-foreground" />
          <Badge
            variant="destructive"
            // 12px (`text-xs`), the smallest text the system uses: 10px was
            // hard to read, and a count is read at a glance.
            className="-right-2 -top-2 absolute h-5 min-w-5 justify-center rounded-full px-1 text-xs"
          >
            {formatCount(n)}
          </Badge>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: [
          "Pattern de contador sobreposto a um ícone — útil para notificações, mensagens, carrinho.",
          "",
          "Use o helper `formatCount(count, max?)` (exportado da lib) para limitar o número exibido — default cap em **9999+**. Acima do max vira `${max}+`; valores negativos/non-finite são clamped para `0`.",
          "",
          "```tsx",
          'import { Badge, formatCount } from "@amfernandesinc/ui"',
          "",
          '<Badge variant="destructive">{formatCount(unreadCount)}</Badge>',
          '// 3       → "3"',
          '// 9999    → "9999"',
          '// 12345   → "9999+"',
          '// custom: formatCount(1234, 99) → "99+"',
          "```",
        ].join("\n"),
      },
    },
  },
}

export const InText: Story = {
  render: () => (
    <p className="max-w-md text-sm">
      A versão atual é <Badge variant="outline">v10.0.0</Badge> e ainda está em{" "}
      <Badge variant="secondary">beta</Badge>. Reporte bugs no canal <Badge>#design-system</Badge>.
    </p>
  ),
  parameters: {
    docs: {
      description: {
        story: "Badges inline em parágrafos de texto, marcando termos de destaque.",
      },
    },
  },
}

export const AsChildLink: Story = {
  render: () => (
    <Badge asChild>
      <a href="/">Tag</a>
    </Badge>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`asChild` delega o elemento renderizado para o filho — útil para envolver `<a>`, `<Link>` (Next/React Router) ou outros elementos sem perder os estilos do Badge.",
      },
    },
  },
}
