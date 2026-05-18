import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "@storybook/test"
import { SlashIcon } from "lucide-react"

import { Breadcrumb } from "./breadcrumb"

const meta: Meta<typeof Breadcrumb> = {
  title: "Navigation/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    a11y: {
      // The `<li role="presentation">` separator between breadcrumb items trips axe's `list` rule.
      // Separator is semantically presentational; tracked in design-tokens roadmap for refactor to non-li wrapper.
      config: { rules: [{ id: "list", enabled: false }] },
    },
    docs: {
      description: {
        component: [
          'Breadcrumb data-driven. Cada entrada é descrita por `BreadcrumbItemData`; o último item sem `href` recebe `aria-current="page"` automaticamente.',
          "",
          "**Props:**",
          "- `items: BreadcrumbItemData[]` — trilha (do raiz ao atual).",
          "- `separator?: ReactNode` — separador entre itens. Default: ícone `ChevronRight`.",
          "- `ariaLabel?: string` — `aria-label` do `<nav>`. Default `'Breadcrumb'`.",
          "- `maxItems?: number` — quando definido, colapsa o miolo da trilha em `…` para manter no máximo N itens.",
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
          'import { Breadcrumb } from "@am-fernandes/ui"',
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
    separator: {
      control: false,
      description: "Conteúdo renderizado entre os itens. Default: ícone `ChevronRight`.",
      table: { type: { summary: "ReactNode" } },
    },
    ariaLabel: {
      control: "text",
      description: "`aria-label` aplicado ao `<nav>`.",
      table: { type: { summary: "string" }, defaultValue: { summary: "'Breadcrumb'" } },
    },
    maxItems: {
      control: { type: "number", min: 2 },
      description: "Quando definido, colapsa o miolo da trilha para no máximo N itens.",
      table: { type: { summary: "number" } },
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

export const CustomSeparator: Story = {
  args: {
    separator: <SlashIcon className="size-3.5" />,
    items: [
      { label: "Home", href: "/" },
      { label: "Configurações", href: "/settings" },
      { label: "Perfil" },
    ],
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

export const Collapsed: Story = {
  args: { items: longTrail, maxItems: 3 },
}

export const CustomAriaLabel: Story = {
  args: {
    ariaLabel: "Trilha de navegação",
    items: [
      { label: "Início", href: "/" },
      { label: "Documentos", href: "/docs" },
      { label: "Política de privacidade" },
    ],
  },
}
