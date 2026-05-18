import type { Meta, StoryObj } from "@storybook/react-vite"

import { Typography } from "./typography"

const meta = {
  title: "Primitives/Typography",
  component: Typography,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Componente polimórfico com 5 variantes semânticas (display, title, subtitle, body, caption). Mapeia para elemento HTML padrão por variante; override com `as`.",
          "",
          "**Props principais:**",
          "- `variant` — `display`, `title`, `subtitle`, `body` (default), `caption`.",
          "- `as` — substitui o elemento HTML renderizado (default depende da variante: `h1`, `h2`, `h3`, `p`, `span`).",
          "- `className` — classes Tailwind extras (cor, espaçamento).",
          "- Aceita todos os atributos HTML do elemento gerado.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Typography } from "@am-fernandes/ui"',
          "",
          '<Typography variant="display">AM Fernandes</Typography>',
          '<Typography variant="title">Incorporadora</Typography>',
          '<Typography variant="body">Texto padrão do parágrafo.</Typography>',
          '<Typography variant="caption" as="span">Legenda</Typography>',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["display", "title", "subtitle", "body", "caption"],
      description: "Estilo tipográfico.",
      table: {
        type: { summary: "'display' | 'title' | 'subtitle' | 'body' | 'caption'" },
        defaultValue: { summary: "'body'" },
      },
    },
    as: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "div"],
      description: "Elemento HTML renderizado (sobrescreve o padrão da variante).",
      table: { type: { summary: "keyof JSX.IntrinsicElements" } },
    },
    children: {
      control: "text",
      description: "Texto/conteúdo.",
      table: { type: { summary: "ReactNode" } },
    },
    className: {
      control: "text",
      description: "Classes Tailwind extras.",
      table: { type: { summary: "string" } },
    },
  },
} satisfies Meta<typeof Typography>

export default meta
type Story = StoryObj<typeof meta>

const COPY = "AM Fernandes Incorporadora."

export const Playground: Story = {
  args: {
    variant: "body",
    children: COPY,
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex w-[480px] flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">display</span>
        <Typography variant="display">{COPY}</Typography>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">title</span>
        <Typography variant="title">{COPY}</Typography>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">subtitle</span>
        <Typography variant="subtitle">{COPY}</Typography>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">body</span>
        <Typography variant="body">{COPY}</Typography>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">caption</span>
        <Typography variant="caption">{COPY}</Typography>
      </div>
    </div>
  ),
}

export const Display: Story = {
  args: { variant: "display", children: COPY },
}

export const Title: Story = {
  args: { variant: "title", children: COPY },
}

export const Subtitle: Story = {
  args: { variant: "subtitle", children: COPY },
}

export const Body: Story = {
  args: { variant: "body", children: COPY },
}

export const Caption: Story = {
  args: { variant: "caption", children: COPY },
}
