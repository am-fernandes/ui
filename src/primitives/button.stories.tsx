import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowRightIcon, DownloadIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"

import { Button } from "./button"

const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Botão base do design system. 6 variantes × 4 tamanhos + estados (`loading`, `disabled`) + composição via `asChild`.",
          "",
          "**API:**",
          "- `variant` — `default | destructive | outline | secondary | ghost | link`.",
          "- `size` — `default | sm | lg | icon` (`icon` para botões quadrados só com ícone).",
          "- `loading` — exibe um spinner antes do conteúdo e desabilita o botão.",
          "- `disabled` — desabilita o botão.",
          "- `asChild` — renderiza o filho como elemento raiz (use com `<a>` ou `<Link>`).",
          "- Repassa todos os atributos HTML de `<button>` (`onClick`, `type`, `aria-*`, etc).",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Button } from "@am-fernandes/ui"',
          "",
          '<Button variant="default">Confirmar</Button>',
          '<Button variant="outline" onClick={handleCancel}>Cancelar</Button>',
          "<Button loading>Salvando...</Button>",
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
      options: ["default", "sm", "lg", "icon"],
      description: "Tamanho — `icon` para botões só com ícone.",
      table: {
        type: { summary: "'default' | 'sm' | 'lg' | 'icon'" },
        defaultValue: { summary: "'default'" },
      },
    },
    loading: {
      control: "boolean",
      description: "Mostra spinner antes do conteúdo e desabilita o botão.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o botão.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
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
  args: { children: "Button" },
}

export const Destructive: Story = {
  args: { variant: "destructive", children: "Excluir" },
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
    docs: { description: { story: "Galeria com as 6 variantes lado a lado." } },
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">sm</Button>
      <Button size="default">default</Button>
      <Button size="lg">lg</Button>
      <Button size="icon" aria-label="Add">
        <PlusIcon />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Quatro tamanhos disponíveis. Use `size="icon"` para botões quadrados só com ícone (lembre do `aria-label`).',
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
      <Button size="icon" aria-label="Buscar">
        <SearchIcon />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Ícones (leading ou trailing) recebem `size-4` automaticamente via CSS do componente. Use `lucide-react`.",
      },
    },
  },
}

export const Loading: Story = {
  args: { loading: true, children: "Salvando..." },
  parameters: {
    docs: {
      description: {
        story:
          "Com `loading=true` o botão renderiza um spinner antes do conteúdo e fica `disabled` + `aria-busy=true`.",
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
  args: { disabled: true, children: "Indisponível" },
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
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`asChild` faz o botão renderizar como o filho (aqui um `<a>`), preservando estilos. Útil para integrar com bibliotecas de roteamento (Next.js `Link`, etc.).",
      },
    },
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
        <Button variant="ghost" size="sm" onClick={() => setCount(0)}>
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
