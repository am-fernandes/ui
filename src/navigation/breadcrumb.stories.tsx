import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "@storybook/test"

import { Breadcrumb } from "./breadcrumb"

const meta: Meta<typeof Breadcrumb> = {
  title: "Navigation/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          'Breadcrumb data-driven. Cada entrada é descrita por `BreadcrumbItemData`; o último item sem `href` recebe `aria-current="page"` automaticamente.',
          "",
          "**Props:**",
          "- `items: BreadcrumbItemData[]` — trilha (do raiz ao atual).",
          '- `maxItems?: number` — mostra no máximo esse número de passos: o primeiro, um botão "…" com os ocultos e os últimos.',
          "- `renderLink?: RenderLink` — desenha os links com o `<Link>` do seu roteador, sem recarregar a página.",
          '- `labels?: Partial<BreadcrumbLabels>` — `navigation` (nome do `<nav>`, padrão "Trilha de navegação") e `showHidden` (nome do botão "…").',
          "- `ariaLabel?: string` — obsoleto; use `labels.navigation`.",
          "",
          "Um passo do meio sem `href` aparece como texto simples; só o atual fica em destaque.",
          "",
          "**Shape do item (`BreadcrumbItemData`):**",
          "```ts",
          "interface BreadcrumbItemData {",
          "  label: React.ReactNode    // texto/JSX exibido",
          "  href?: string             // omita no item atual",
          "  isCurrentPage?: boolean   // força aria-current; auto-detectado no último sem href",
          "}",
          "```",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Breadcrumb } from "@amfernandesinc/ui"',
          "",
          "<Breadcrumb",
          "  items={[",
          '    { label: "Home", href: "/" },',
          '    { label: "Contratos", href: "/contratos" },',
          '    { label: "C-2026-001" },',
          "  ]}",
          "/>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    items: {
      control: "object",
      description: "Trilha do raiz ao item atual.",
      table: { type: { summary: "BreadcrumbItemData[]" } },
    },
    maxItems: {
      control: "number",
      description: 'Número máximo de passos visíveis; o excesso vai para o menu "…".',
      table: { type: { summary: "number" } },
    },
    labels: {
      control: "object",
      description: 'Textos: `navigation` (nome do `<nav>`) e `showHidden` (botão "…").',
      table: {
        type: { summary: "Partial<BreadcrumbLabels>" },
        defaultValue: { summary: '{ navigation: "Trilha de navegação", … }' },
      },
    },
    ariaLabel: {
      control: "text",
      description: "Obsoleto: use `labels.navigation`.",
      table: { type: { summary: "string" } },
    },
  },
}
export default meta
type Story = StoryObj<typeof Breadcrumb>

export const Default: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Contratos", href: "/contratos" },
      { label: "C-2026-001" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const current = canvas.getByText("C-2026-001")
    await expect(current).toHaveAttribute("aria-current", "page")
  },
}

const longTrail = [
  { label: "Home", href: "/" },
  { label: "Empresa", href: "/empresa" },
  { label: "Departamentos", href: "/empresa/departamentos" },
  { label: "Engenharia", href: "/empresa/departamentos/engenharia" },
  { label: "Equipes", href: "/empresa/departamentos/engenharia/equipes" },
  { label: "Frontend", href: "/empresa/departamentos/engenharia/equipes/frontend" },
  { label: "Membros" },
]

export const LongTrail: Story = {
  args: { items: longTrail },
}

export const CollapsedTrail: Story = {
  name: "Collapsed Trail",
  args: { items: longTrail, maxItems: 3 },
  parameters: {
    docs: {
      description: {
        story:
          'Com `maxItems={3}`, a trilha mostra o primeiro passo, o botão "…" e os dois últimos. O menu do "…" lista os passos ocultos como links.',
      },
    },
  },
}

export const WithRouterLink: Story = {
  name: "With Router Link",
  args: {
    items: [
      { label: "Início", href: "/" },
      { label: "Contratos", href: "/contratos" },
      { label: "C-2026-001" },
    ],
    renderLink: ({ href, ...props }) => (
      // Num app real: <Link to={href} {...props} /> do React Router.
      <a data-router-link="" href={`#${href}`} {...props} />
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "`renderLink` troca o `<a>` da lib pelo link do roteador. Repasse todas as props: elas trazem as classes e o clique.",
      },
    },
  },
}

export const CustomLabel: Story = {
  args: {
    labels: { navigation: "Caminho até o documento" },
    items: [
      { label: "Início", href: "/" },
      { label: "Documentos", href: "/docs" },
      { label: "Política de privacidade" },
    ],
  },
}
