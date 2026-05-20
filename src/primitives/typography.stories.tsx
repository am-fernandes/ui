import type { Meta, StoryObj } from "@storybook/react-vite"

import { Typography } from "./typography"

const meta: Meta<typeof Typography> = {
  title: "Primitives/Typography",
  component: Typography,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Componente polimórfico com 6 variantes semânticas. Cada variante mapeia para um elemento HTML padrão; sobrescreva com `as`.",
          "",
          "**Mapeamento padrão:**",
          "- `heading` → `<h1>` — text-3xl (30px), semibold, tracking-tight",
          "- `title` → `<h2>` — text-2xl (24px), semibold, tracking-tight",
          "- `subtitle` → `<h3>` — text-xl (20px), medium",
          "- `lead` → `<p>` — text-base (16px), leading-7 — parágrafo introdutório",
          "- `body` → `<p>` — text-sm (14px), leading-6 (default)",
          "- `caption` → `<span>` — text-xs (12px), muted",
          "",
          "**API:**",
          "- `variant` — escolhe o estilo tipográfico.",
          "- `as` — sobrescreve o elemento HTML renderizado.",
          "- `className` — classes Tailwind extras.",
          "- Aceita todos os atributos HTML do elemento gerado.",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Typography } from "@amfernandesinc/ui"',
          "",
          '<Typography variant="heading">AM Fernandes</Typography>',
          '<Typography variant="title" as="h1">Título principal da página</Typography>',
          '<Typography variant="body" as="blockquote">Citação</Typography>',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["heading", "title", "subtitle", "lead", "body", "caption"],
      description: "Estilo tipográfico.",
      table: {
        type: { summary: "'heading' | 'title' | 'subtitle' | 'lead' | 'body' | 'caption'" },
        defaultValue: { summary: "'body'" },
      },
    },
    as: {
      control: "select",
      options: [
        "div",
        "span",
        "p",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "label",
        "small",
        "blockquote",
      ],
      description: "Elemento HTML renderizado (sobrescreve o padrão da variante).",
      table: {
        type: {
          summary:
            "'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'small' | 'blockquote'",
        },
      },
    },
    children: {
      control: "text",
      description: "Conteúdo (texto ou JSX).",
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
type Story = StoryObj<typeof Typography>

const COPY = "AM Fernandes Incorporadora."

export const Default: Story = {
  args: { variant: "body", children: COPY },
}

export const Heading: Story = {
  args: { variant: "heading", children: COPY },
  parameters: {
    docs: {
      description: { story: "Maior escala — renderiza `<h1>`. Use para hero/heading principal." },
    },
  },
}

export const Title: Story = {
  args: { variant: "title", children: COPY },
  parameters: {
    docs: { description: { story: "Título de seção — renderiza `<h2>`." } },
  },
}

export const Subtitle: Story = {
  args: { variant: "subtitle", children: COPY },
  parameters: {
    docs: { description: { story: "Subtítulo de bloco — renderiza `<h3>`." } },
  },
}

export const Lead: Story = {
  args: { variant: "lead", children: COPY },
  parameters: {
    docs: { description: { story: "Parágrafo introdutório (16px) — renderiza `<p>`." } },
  },
}

export const Body: Story = {
  args: { variant: "body", children: COPY },
  parameters: {
    docs: {
      description: { story: "Texto corrido — renderiza `<p>`. É o default da prop `variant`." },
    },
  },
}

export const Caption: Story = {
  args: { variant: "caption", children: COPY },
  parameters: {
    docs: {
      description: {
        story: "Texto auxiliar pequeno (`text-xs`, muted) — renderiza `<span>` por padrão.",
      },
    },
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex w-[480px] flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">heading → h1</span>
        <Typography variant="heading">{COPY}</Typography>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">title → h2</span>
        <Typography variant="title">{COPY}</Typography>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">subtitle → h3</span>
        <Typography variant="subtitle">{COPY}</Typography>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">lead → p</span>
        <Typography variant="lead">{COPY}</Typography>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">body → p</span>
        <Typography variant="body">{COPY}</Typography>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">caption → span</span>
        <Typography variant="caption">{COPY}</Typography>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Hierarquia completa lado a lado, com a tag HTML padrão de cada variante.",
      },
    },
  },
}

export const PolymorphicAs: Story = {
  render: () => (
    <div className="flex w-[480px] flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          variant=&quot;title&quot; (default: &lt;h2&gt;)
        </span>
        <Typography variant="title">Aparece como h2</Typography>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          variant=&quot;title&quot; as=&quot;h1&quot;
        </span>
        <Typography variant="title" as="h1">
          Mesmo estilo, mas como h1
        </Typography>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          variant=&quot;title&quot; as=&quot;h6&quot;
        </span>
        <Typography variant="title" as="h6">
          Mesmo estilo, mas como h6
        </Typography>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          variant=&quot;body&quot; as=&quot;blockquote&quot;
        </span>
        <Typography variant="body" as="blockquote" className="border-l-2 border-primary pl-3">
          “Design is not just what it looks like and feels like. Design is how it works.”
        </Typography>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          variant=&quot;caption&quot; as=&quot;small&quot;
        </span>
        <Typography variant="caption" as="small">
          Renderizado como &lt;small&gt; (semântica de texto auxiliar/legenda).
        </Typography>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Separe estilo (variant) de semântica (as). Mantém o visual de `title` mas adapta o nível do heading conforme o contexto da página.",
      },
    },
  },
}

export const WithClassName: Story = {
  render: () => (
    <div className="flex w-[480px] flex-col gap-3">
      <Typography variant="title" className="text-primary">
        Cor primária via className
      </Typography>
      <Typography variant="body" className="italic">
        Itálico via className
      </Typography>
      <Typography variant="body" className="text-destructive">
        Texto destrutivo
      </Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "`className` permite override pontual de cor, peso, decoração, etc.",
      },
    },
  },
}
