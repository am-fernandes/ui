import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "@storybook/test"
import { ArrowRightIcon, DownloadIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"

import { Button } from "./button"
import { IconButton } from "./icon-button"
import { Input } from "./input"

const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Botão base do design system. 6 variantes, 3 tamanhos, estados (`loading`, `disabled`) e composição via `asChild`. Para um botão quadrado só de ícone use o `IconButton`.",
          "",
          "**API:**",
          "- `variant` — `default | destructive | outline | secondary | ghost | link`.",
          "- `size` — `sm` (32px), `md` (40px, padrão) ou `lg` (44px). É a altura da caixa inteira, igual à de um `Input`, `IconButton` ou `Toggle` do mesmo tamanho.",
          "- `loading` — spinner no lugar do rótulo, sem mudar a largura; o botão mantém o foco, ignora cliques e é anunciado como ocupado.",
          '- `labels` — textos para o leitor de tela (`loading`: "Carregando…").',
          "- `disabled` — desabilita o botão.",
          "- `asChild` — renderiza o filho como elemento raiz (use com `<a>` ou `<Link>`).",
          '- `type` — `"button"` por padrão: dentro de um `<form>` o botão não envia nada. Use `type="submit"` no botão que envia.',
          "- Repassa os demais atributos HTML de `<button>` (`onClick`, `aria-*`, etc).",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Button } from "@amfernandesinc/ui"',
          "",
          '<Button variant="default">Confirmar</Button>',
          '<Button variant="outline" onClick={handleCancel}>Cancelar</Button>',
          '<Button type="submit" loading={isSaving}>Salvar</Button>',
          '<Button asChild><a href="/docs">Docs</a></Button>',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "Estilo visual.",
      table: {
        type: {
          summary: "'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'",
        },
        defaultValue: { summary: "'default'" },
      },
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
      description: "Altura da caixa, borda incluída: 32, 40 ou 44px.",
      table: {
        type: { summary: "'sm' | 'md' | 'lg'" },
        defaultValue: { summary: "'md'" },
      },
    },
    loading: {
      control: "boolean",
      description:
        "Spinner no lugar do rótulo, com a mesma largura. O botão mantém o foco e ignora cliques (`aria-disabled`, `aria-busy`).",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o botão.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    type: {
      control: "inline-radio",
      options: ["button", "submit", "reset"],
      description:
        'Tipo nativo do botão. O padrão é `"button"`, que não envia o formulário em que estiver.',
      table: {
        type: { summary: "'button' | 'submit' | 'reset'" },
        defaultValue: { summary: "'button'" },
      },
    },
    asChild: {
      control: "boolean",
      description:
        "Renderiza o filho como elemento raiz (mantém estilos via Radix Slot). Use com `<a>` ou `<Link>`.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    children: {
      control: "text",
      description: "Conteúdo (texto, ícone ou ambos).",
      table: { type: { summary: "ReactNode" } },
    },
    className: {
      control: "text",
      description: "Classes Tailwind extras.",
      table: { type: { summary: "string" } },
    },
    onClick: {
      control: false,
      description: "Handler de clique.",
      table: { category: "Eventos", type: { summary: "(e: MouseEvent) => void" } },
    },
  },
}
export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: { children: "Button", onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole("button", { name: "Button" })
    await expect(button).toBeEnabled()
    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

export const Destructive: Story = {
  args: { variant: "destructive", children: "Excluir" },
  parameters: {
    // destructive token (red 500-ish) on white background fails 4.5:1; tracked in design-tokens roadmap.
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
  },
}

export const Outline: Story = {
  args: { variant: "outline", children: "Cancelar" },
}

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secundário" },
}

export const Ghost: Story = {
  args: { variant: "ghost", children: "Ghost" },
}

export const Link: Story = {
  args: { variant: "link", children: "Saiba mais" },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="default">default</Button>
      <Button variant="destructive">destructive</Button>
      <Button variant="outline">outline</Button>
      <Button variant="secondary">secondary</Button>
      <Button variant="ghost">ghost</Button>
      <Button variant="link">link</Button>
    </div>
  ),
  parameters: {
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
    docs: { description: { story: "Galeria com as 6 variantes lado a lado." } },
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">sm · 32px</Button>
      <Button size="md">md · 40px</Button>
      <Button size="lg">lg · 44px</Button>
      <Button size="sm" variant="outline">
        sm · 32px
      </Button>
      <Button size="md" variant="outline">
        md · 40px
      </Button>
      <Button size="lg" variant="outline">
        lg · 44px
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`size` define a altura da caixa inteira. Com ou sem borda, o botão de um tamanho mede o mesmo e fica alinhado com os campos desse tamanho (veja Primitives/Control Size).",
      },
    },
  },
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <PlusIcon />
        Adicionar
      </Button>
      <Button variant="outline">
        <DownloadIcon />
        Baixar
      </Button>
      <Button>
        Continuar
        <ArrowRightIcon />
      </Button>
      <Button variant="destructive">
        <Trash2Icon />
        Excluir
      </Button>
      <IconButton icon={<SearchIcon />} label="Buscar" variant="default" />
    </div>
  ),
  parameters: {
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
    docs: {
      description: {
        story:
          "Ícones (leading ou trailing) recebem `size-4` automaticamente via CSS do componente. Use `lucide-react`. Só o ícone, sem texto: `IconButton`, que exige o nome acessível.",
      },
    },
  },
}

export const Loading: Story = {
  args: { loading: true, children: "Salvar proposta", onClick: fn() },
  parameters: {
    docs: {
      description: {
        story:
          'Com `loading` um spinner fica no lugar do rótulo, que continua ocupando o seu espaço (a largura não muda) e sendo o nome acessível. O botão não é desabilitado de verdade: fica `aria-disabled` e `aria-busy`, mantém o foco e ignora o clique. Não troque o texto para "Salvando...": ele não aparece. Para o leitor de tela, o início é anunciado com `labels.loading` ("Carregando…").',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole("button", { name: "Salvar proposta" })
    await expect(button).toHaveAttribute("aria-disabled", "true")
    await expect(button).toHaveAttribute("aria-busy", "true")
    await expect(button).not.toHaveAttribute("disabled")
    // A click on a loading button must not fire onClick
    await userEvent.click(button)
    await expect(args.onClick).not.toHaveBeenCalled()
  },
}

function PendingSubmitExample() {
  const [saving, setSaving] = useState(false)
  const [submits, setSubmits] = useState(0)
  return (
    <form
      className="flex w-80 flex-col items-start gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        setSubmits((count) => count + 1)
        setSaving(true)
      }}
    >
      <Input label="Nome da proposta" defaultValue="Torre B · 1204" />
      <div className="flex gap-2">
        <Button type="submit" loading={saving}>
          Salvar proposta
        </Button>
        <Button variant="outline" onClick={() => setSaving(false)}>
          Concluir envio
        </Button>
      </div>
      <output className="text-sm" data-testid="submits">
        Envios: {submits}
      </output>
    </form>
  )
}

export const LoadingOnSubmit: Story = {
  render: () => <PendingSubmitExample />,
  parameters: {
    docs: {
      description: {
        story:
          'Enquanto `loading`, o botão continua com o foco e com a mesma largura, é anunciado como ocupado e ignora clique, Enter e o Enter dado num campo do formulário: o envio não se repete. Aqui o envio fica pendente até "Concluir envio".',
      },
    },
  },
}

export const LoadingVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button loading>default</Button>
      <Button loading variant="destructive">
        destructive
      </Button>
      <Button loading variant="outline">
        outline
      </Button>
      <Button loading variant="secondary">
        secondary
      </Button>
      <Button loading variant="ghost">
        ghost
      </Button>
    </div>
  ),
  parameters: {
    docs: { description: { story: "Spinner combinado com cada variant." } },
  },
}

export const Disabled: Story = {
  args: { disabled: true, children: "Indisponível", onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole("button", { name: "Indisponível" })
    await expect(button).toBeDisabled()
    await userEvent.click(button, { pointerEventsCheck: 0 })
    await expect(args.onClick).not.toHaveBeenCalled()
  },
}

export const AllStates: Story = {
  render: () => {
    const variants = ["default", "destructive", "outline", "secondary", "ghost", "link"] as const
    return (
      <div className="grid grid-cols-4 items-center gap-3">
        <span className="text-xs text-muted-foreground">variant</span>
        <span className="text-xs text-muted-foreground">normal</span>
        <span className="text-xs text-muted-foreground">disabled</span>
        <span className="text-xs text-muted-foreground">loading</span>
        {variants.map((v) => (
          <div key={v} className="contents">
            <span className="text-xs font-medium">{v}</span>
            <Button variant={v}>Action</Button>
            <Button variant={v} disabled>
              Action
            </Button>
            <Button variant={v} loading>
              Action
            </Button>
          </div>
        ))}
      </div>
    )
  },
  parameters: {
    layout: "padded",
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
    docs: {
      description: {
        story: "Matriz `variant × estado` — útil para auditoria visual de todos os cenários.",
      },
    },
  },
}

export const AsChild: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button asChild>
        <a href="https://am-fernandes.com.br" target="_blank" rel="noreferrer">
          Link externo
        </a>
      </Button>
      <Button asChild variant="outline">
        <a href="/docs">Ir para docs</a>
      </Button>
      <Button asChild variant="outline" disabled>
        <a href="#relatorio">Relatório indisponível</a>
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`asChild` faz o botão renderizar como o filho (aqui um `<a>`), preservando estilos. Útil para integrar com bibliotecas de roteamento (Next.js `Link`, etc.). Com `disabled` ou `loading`, o filho recebe `aria-disabled` e `data-disabled` (um link não tem `disabled`), fica esmaecido, continua alcançável pelo teclado e o clique não navega nem chama os handlers. O spinner não é injetado no filho.",
      },
    },
  },
}

function FormExample() {
  const [log, setLog] = useState<string[]>([])
  return (
    <form
      className="flex flex-col items-start gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        setLog((current) => [...current, "enviado"])
      }}
    >
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setLog((current) => [...current, "cancelado"])}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </div>
      <output className="text-sm" data-testid="log">
        {log.length ? log.join(", ") : "nada ainda"}
      </output>
    </form>
  )
}

export const InForm: Story = {
  render: () => <FormExample />,
  parameters: {
    docs: {
      description: {
        story:
          'O `Button` nasce com `type="button"`: dentro de um `<form>`, "Cancelar" só dispara o próprio `onClick`. Quem envia o formulário recebe `type="submit"`.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Cancelar" }))
    await expect(canvas.getByTestId("log")).toHaveTextContent("cancelado")
    await expect(canvas.getByTestId("log")).not.toHaveTextContent("enviado")
    await userEvent.click(canvas.getByRole("button", { name: "Salvar" }))
    await expect(canvas.getByTestId("log")).toHaveTextContent("cancelado, enviado")
  },
}

export const Controlled: Story = {
  render: () => {
    const [count, setCount] = useState(0)
    return (
      <div className="flex flex-col items-center gap-3">
        <Button onClick={() => setCount((n) => n + 1)}>
          <PlusIcon />
          Cliques: {count}
        </Button>
        <Button variant="ghost" onClick={() => setCount(0)}>
          Resetar
        </Button>
      </div>
    )
  },
  parameters: {
    docs: {
      description: { story: "Exemplo com `onClick` controlando estado externo via `useState`." },
    },
  },
}
