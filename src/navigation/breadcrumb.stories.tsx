import type { Meta, StoryObj } from "@storybook/react-vite"

import { Breadcrumb, type BreadcrumbItemData } from "./breadcrumb"

const sampleItems: BreadcrumbItemData[] = [
  { label: "Home", href: "/" },
  { label: "Contratos", href: "/contratos" },
  { label: "Detalhes" },
]

const meta = {
  title: "Navigation/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Trilha de navegação hierárquica. API declarativa via `items`; o último item sem `href` é tratado como página atual.",
          "",
          "**Props principais:**",
          "- `items` — array de `BreadcrumbItemData` representando a trilha em ordem.",
          "- `separator` — ReactNode customizado entre itens (default: ícone `ChevronRight`).",
          "",
          "**`BreadcrumbItemData`:**",
          "- `label` — texto/ReactNode exibido no item.",
          "- `href` — URL de navegação. Omita no item final (página atual).",
          "- `isCurrentPage` — força o tratamento de página atual. Default: `true` quando `href` está ausente.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    items: {
      control: "object",
      description: "Array com os passos da trilha (`BreadcrumbItemData[]`).",
      table: { type: { summary: "BreadcrumbItemData[]" } },
    },
    separator: {
      control: false,
      description: "Separador customizado (ReactNode). Default: `<ChevronRight />`.",
      table: { type: { summary: "ReactNode" } },
    },
  },
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    items: sampleItems,
  },
}

export const Default: Story = {
  args: {
    items: sampleItems,
  },
}
