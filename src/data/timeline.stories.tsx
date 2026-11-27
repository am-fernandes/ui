import type { Meta, StoryObj } from "@storybook/react-vite"
import { Check, Circle, GitBranch, LoaderCircle, X } from "lucide-react"
import type * as React from "react"

import { Collapsible } from "../overlays/collapsible"
import { Avatar } from "../primitives/avatar"
import { Badge, type BadgeProps } from "../primitives/badge"
import { Typography } from "../primitives/typography"
import { Card } from "./card"
import { Timeline } from "./timeline"

function Activity({ actor, action, when }: { actor: string; action: string; when: string }) {
  return (
    <>
      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">{actor}</span> {action}
      </p>
      <Typography variant="caption" as="p">
        {when}
      </Typography>
    </>
  )
}

function Event({
  date,
  title,
  description,
  when,
}: { date?: string; title: string; description: string; when?: string }) {
  return (
    <>
      {date ? (
        <Typography variant="caption" as="p" className="font-medium">
          {date}
        </Typography>
      ) : null}
      <p className="font-medium">{title}</p>
      <p className="text-muted-foreground">{description}</p>
      {when ? (
        <Typography variant="caption" as="p">
          {when}
        </Typography>
      ) : null}
    </>
  )
}

function Heading({
  title,
  badge,
  variant,
}: { title: string; badge: string; variant: BadgeProps["variant"] }) {
  return (
    <p className="flex flex-wrap items-center gap-2 font-medium">
      {title}
      <Badge variant={variant}>{badge}</Badge>
    </p>
  )
}

function Stage({
  author,
  initials,
  children,
  ...heading
}: React.ComponentProps<typeof Heading> & {
  author: string
  initials: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Heading {...heading} />
      <Card padding="none" className="px-3">
        <Collapsible
          defaultOpen
          title={
            <span className="flex items-center gap-2">
              <Avatar aria-hidden="true" alt={author} fallback={initials} className="size-5" />
              {author}
            </span>
          }
        >
          <p className="pb-3 text-muted-foreground">{children}</p>
        </Collapsible>
      </Card>
    </div>
  )
}

function Deploy({
  commit,
  branch,
  duration,
  when,
  ...heading
}: React.ComponentProps<typeof Heading> & {
  commit: string
  branch: string
  duration: string
  when: string
}) {
  return (
    <>
      <Heading {...heading} />
      <Typography variant="caption" as="p">
        <span className="font-mono">{commit}</span> · {branch} · {duration}
      </Typography>
      <Typography variant="caption" as="p">
        {when}
      </Typography>
    </>
  )
}

const meta = {
  title: "Data/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Histórico de eventos: um marcador por evento, ligado ao próximo, com conteúdo livre ao lado.",
          "",
          "- O marcador é o avatar de quem agiu (`actorName`, `avatarUrl`) ou um ícone (`icon`), que o substitui.",
          "- Sem `actorName`, o avatar é o de `labels.system` (“Sistema”).",
          "- `content` quebra linha e nunca é cortado. Quebras escritas pelo usuário pedem `whitespace-pre-wrap` no elemento do texto.",
          "- A ordem de `items` é a ordem na tela; o último fica sem conector.",
          '- `orientation="horizontal"` põe os eventos lado a lado, dividindo a largura. Use com poucos eventos e textos curtos.',
          "- Para o progresso de um fluxo em etapas, use `Stepper`.",
        ].join("\n"),
      },
    },
  },
  decorators: [
    (Story, { args }) => (
      <div
        className={
          args.orientation === "horizontal" ? "w-[48rem] max-w-full" : "w-[28rem] max-w-full"
        }
      >
        <Story />
      </div>
    ),
  ],
  args: {
    "aria-label": "Atividades do repositório",
    items: [
      {
        id: "5",
        actorName: "Alex Moura",
        content: (
          <Activity actor="Alex Moura" action="enviou 3 commits para a main" when="há 5 minutos" />
        ),
      },
      {
        id: "4",
        actorName: "Sara Nunes",
        content: (
          <Activity
            actor="Sara Nunes"
            action="abriu o pull request #284: tema escuro"
            when="há 20 minutos"
          />
        ),
      },
      {
        id: "3",
        actorName: "Davi Lima",
        content: <Activity actor="Davi Lima" action="comentou na issue #142" when="há 1 hora" />,
      },
      {
        id: "2",
        actorName: "Emília Rocha",
        content: <Activity actor="Emília Rocha" action="publicou em produção" when="há 2 horas" />,
      },
      {
        id: "1",
        content: (
          <Activity actor="Sistema" action="mesclou a branch feat/notificacoes" when="há 3 horas" />
        ),
      },
    ],
  },
} satisfies Meta<typeof Timeline>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Pipeline: Story = {
  args: {
    "aria-label": "Etapas do pipeline",
    items: [
      {
        id: "1",
        icon: Check,
        content: (
          <Stage
            title="Checkout do código"
            badge="12s"
            variant="success"
            author="Alex Moura"
            initials="AM"
          >
            Alterações mais recentes da branch principal baixadas.
          </Stage>
        ),
      },
      {
        id: "2",
        icon: Check,
        content: (
          <Stage
            title="Instalação das dependências"
            badge="1m 45s"
            variant="success"
            author="Sara Nunes"
            initials="SN"
          >
            Pacotes instalados e guardados em cache.
          </Stage>
        ),
      },
      {
        id: "3",
        icon: LoaderCircle,
        content: (
          <Stage
            title="Testes unitários e de integração"
            badge="Em execução"
            variant="info"
            author="Davi Lima"
            initials="DL"
          >
            Rodando 142 suítes de teste.
          </Stage>
        ),
      },
      {
        id: "4",
        icon: Circle,
        content: (
          <Stage
            title="Build de produção"
            badge="Pendente"
            variant="warning"
            author="Emília Rocha"
            initials="ER"
          >
            Otimização dos arquivos e geração das páginas estáticas.
          </Stage>
        ),
      },
    ],
  },
}

export const DeployLog: Story = {
  args: {
    "aria-label": "Histórico de publicações",
    items: [
      {
        id: "3",
        icon: Check,
        content: (
          <Deploy
            title="Publicação em produção"
            badge="sucesso"
            variant="success"
            commit="a1b2c3d"
            branch="main"
            duration="42s"
            when="há 2 minutos"
          />
        ),
      },
      {
        id: "2",
        icon: X,
        content: (
          <Deploy
            title="Publicação de prévia"
            badge="falhou"
            variant="destructive"
            commit="i7j8k9l"
            branch="feat/login"
            duration="1m 12s"
            when="há 1 hora"
          />
        ),
      },
      {
        id: "1",
        icon: GitBranch,
        content: (
          <Deploy
            title="Publicação em homologação"
            badge="sucesso"
            variant="success"
            commit="e4f5g6h"
            branch="staging"
            duration="38s"
            when="há 3 horas"
          />
        ),
      },
    ],
  },
}

export const OwnerHistory: Story = {
  decorators: [
    (Story) => (
      <div className="w-[22rem] max-w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    "aria-label": "Histórico de responsável",
    items: [
      {
        id: "3",
        actorName: "Camila Barros",
        content: (
          <>
            <p>De Rafael Teixeira para Camila Barros · 12/11/2026 09:40</p>
            <p>Motivo: Rafael foi para a obra Jardim das Acácias e recebeu outro notebook.</p>
            <p>Patrimônio AMF-NOTEBOOK-000000000000000000000000000000001234</p>
            <p>Permanência: 15d 2h</p>
          </>
        ),
      },
      {
        id: "2",
        actorName: "Rafael Teixeira",
        content: (
          <>
            <p>De Larissa Monteiro para Rafael Teixeira · 03/08/2026 14:05</p>
            <p>Motivo: Larissa passou a trabalhar em um desktop.</p>
            <p>Permanência: 100d 19h</p>
          </>
        ),
      },
      {
        id: "1",
        actorName: "Larissa Monteiro",
        content: (
          <>
            <p>Atribuição inicial: Larissa Monteiro · 16/03/2026 08:30</p>
            <p>Motivo: admissão no setor de Suprimentos.</p>
            <p>Permanência: 140d 5h</p>
          </>
        ),
      },
    ],
  },
}

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    "aria-label": "Marcos da obra",
    items: [
      {
        id: "1",
        icon: Check,
        content: (
          <Event date="Março de 2026" title="Fundação" description="Estacas e blocos concluídos." />
        ),
      },
      {
        id: "2",
        icon: LoaderCircle,
        content: (
          <Event
            date="Agosto de 2026"
            title="Estrutura"
            description="Concretagem do 8º pavimento."
          />
        ),
      },
      {
        id: "3",
        icon: Circle,
        content: (
          <Event
            date="Fevereiro de 2027"
            title="Acabamento"
            description="Revestimentos e pintura."
          />
        ),
      },
    ],
  },
}
