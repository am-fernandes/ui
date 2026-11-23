import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "@storybook/test"
import { Building2, CalendarDays, MapPin, Tag } from "lucide-react"
import * as React from "react"

import type { RenderLinkProps } from "@/lib/render-link"
import { Badge } from "./badge"
import { Token, type TokenColor } from "./token"

const COLORS: TokenColor[] = [
  "gray",
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "blue",
  "purple",
  "pink",
]

const meta = {
  title: "Primitives/Token",
  component: Token,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Chip compacto para metadados, filtros e seleções — com 9 cores categóricas, removível, clicável ou link.",
          "",
          "- **Token × Badge** — o `Badge` é um rótulo de **status** em cor sólida (“Aprovado”, “Pendente”). O `Token` é um chip **claro** de categoria, filtro ou seleção, que dá para clicar e remover.",
          "- `onRemove` mostra o × (nome acessível “Remover {label}”). `onClick` torna o chip inteiro um botão; `href`, um link.",
          "- **Roteador:** `renderLink` troca o `<a>` pelo `<Link>` do seu roteador, sem recarregar a página: `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`. O `onClick` recebe o evento, então `event.preventDefault()` também segura o link.",
          "- O clique e o × são irmãos, nunca aninhados: a área clicável cobre o chip todo e o × fica por cima.",
          "- Cores: `gray` (padrão), `red`, `orange`, `yellow`, `green`, `teal`, `blue`, `purple`, `pink`. Texto ≥ 7,3:1 sobre o fundo.",
        ].join("\n"),
      },
    },
  },
  args: { label: "São Paulo" },
} satisfies Meta<typeof Token>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Colors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((color) => (
        <Token key={color} label={color} color={color} icon={Tag} />
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Token label="Pequeno" size="sm" color="blue" icon={MapPin} onRemove={() => {}} />
      <Token label="Médio" size="md" color="blue" icon={MapPin} onRemove={() => {}} />
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Token label="Torre A" icon={Building2} color="teal" />
      <Token label="Entrega em mar/2027" icon={CalendarDays} color="purple" />
    </div>
  ),
}

/**
 * The pattern for a list of removable tokens: when the focused token goes
 * away, the focus moves to the × of the one that takes its place (or of the
 * one before, after the last), and to `fallback` when none is left. Without
 * it the focus lands on <body> and the next Tab starts from the top.
 */
function useFocusAfterRemove(fallback: React.RefObject<HTMLElement | null>) {
  const container = React.useRef<HTMLDivElement>(null)
  const pending = React.useRef<number | null>(null)
  const willRemove = (index: number) => {
    // Only when the focus is in the list: a removal by mouse leaves it alone.
    if (container.current?.contains(document.activeElement)) pending.current = index
  }
  React.useLayoutEffect(() => {
    if (pending.current == null) return
    const buttons = container.current?.querySelectorAll<HTMLElement>('[data-slot="token-remove"]')
    const next = buttons?.[Math.min(pending.current, buttons.length - 1)]
    pending.current = null
    ;(next ?? fallback.current)?.focus()
  })
  return { container, willRemove }
}

function RemovableDemo() {
  const [filters, setFilters] = React.useState([
    { label: "São Paulo", color: "blue" as TokenColor },
    { label: "Pendentes", color: "yellow" as TokenColor },
    { label: "Acima de R$ 400 mil", color: "green" as TokenColor },
  ])
  const empty = React.useRef<HTMLSpanElement>(null)
  const { container, willRemove } = useFocusAfterRemove(empty)
  return (
    <div ref={container} className="flex flex-wrap gap-2">
      {filters.map((filter, index) => (
        <Token
          key={filter.label}
          label={filter.label}
          color={filter.color}
          onRemove={() => {
            willRemove(index)
            setFilters((current) => current.filter((f) => f !== filter))
          }}
        />
      ))}
      {filters.length === 0 ? (
        <span ref={empty} tabIndex={-1} className="text-sm text-muted-foreground outline-none">
          Nenhum filtro.
        </span>
      ) : null}
    </div>
  )
}

export const Removable: Story = {
  render: () => <RemovableDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Filtros aplicados, removidos pelo ×. Ao remover pelo teclado, o foco vai para o × do token que ocupa o lugar (ou do anterior, depois do último) e, sem nenhum, para a mensagem: nunca para o `<body>`. O padrão está em `useFocusAfterRemove`, no código desta story.",
      },
    },
  },
}

export const LongLabel: Story = {
  render: () => (
    <div className="flex w-56 flex-col items-start gap-2">
      <Token label="Residencial Jardim das Acácias — Torre B, bloco 2" color="teal" />
      <Token label="Torre A" color="teal" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Um rótulo que não cabe é cortado com reticências e mostra o texto inteiro no `title`, ao passar o mouse.",
      },
    },
  },
}

function ClickableAndRemovableDemo() {
  const [tokens, setTokens] = React.useState(["Torre A", "Torre B", "Torre C"])
  const [lastClicked, setLastClicked] = React.useState("nenhum")
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {tokens.map((label) => (
          <Token
            key={label}
            label={label}
            color="teal"
            icon={Building2}
            onClick={() => setLastClicked(label)}
            onRemove={() => setTokens((current) => current.filter((t) => t !== label))}
          />
        ))}
      </div>
      <p className="text-sm" data-testid="last-clicked">
        Último clique: {lastClicked}
      </p>
    </div>
  )
}

export const ClickableAndRemovable: Story = {
  render: () => <ClickableAndRemovableDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Com `onClick` e `onRemove`: o chip inteiro é clicável e o × remove sem disparar o clique.",
      },
    },
  },
}

export const Link: Story = {
  args: { label: "Proposta #1042", href: "#proposta-1042", color: "blue" },
}

function RouterLinkDemo() {
  const [path, setPath] = React.useState("/propostas")
  // Stands in for a router's <Link>: it navigates in the app, with no reload.
  const renderLink = ({ href, onClick, ...props }: RenderLinkProps) => (
    <a
      {...props}
      href={href}
      data-router-link=""
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        event.preventDefault()
        setPath(href)
      }}
    />
  )
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Token label="Proposta #1042" href="/propostas/1042" color="blue" renderLink={renderLink} />
        <Token label="Proposta #1043" href="/propostas/1043" color="blue" renderLink={renderLink} />
      </div>
      <p className="text-sm" data-testid="router-path">
        Rota atual: {path}
      </p>
    </div>
  )
}

export const RouterLink: Story = {
  render: () => <RouterLinkDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Com `renderLink`, o link é o do roteador: navega dentro da aplicação, sem recarregar a página e sem perder um formulário aberto.",
      },
    },
  },
}

export const Disabled: Story = {
  args: { label: "São Paulo", disabled: true, onRemove: () => {}, onClick: () => {} },
}

export const TokenVsBadge: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="success">Aprovado</Badge>
      <Token label="Torre A" color="teal" icon={Building2} />
      <Token label="São Paulo" color="blue" onRemove={() => {}} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "`Badge` para status (sólido); `Token` para categorias, filtros e seleções (claro).",
      },
    },
  },
}

export const Interaction: Story = {
  render: () => <ClickableAndRemovableDemo />,
  parameters: {
    docs: {
      description: { story: "Teste de interação: clicar no chip e remover pelo ×." },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Torre B" }))
    await expect(canvas.getByTestId("last-clicked")).toHaveTextContent("Torre B")
    await userEvent.click(canvas.getByRole("button", { name: "Remover Torre A" }))
    await expect(canvas.queryByRole("button", { name: "Torre A" })).not.toBeInTheDocument()
    await expect(canvas.getByTestId("last-clicked")).toHaveTextContent("Torre B")
  },
}
