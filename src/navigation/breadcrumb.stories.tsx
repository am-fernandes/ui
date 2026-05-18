import type { Meta, StoryObj } from "@storybook/react-vite"

import { Breadcrumb } from "./breadcrumb"

const meta = {
  title: "Navigation/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Trilha de navegação hierárquica. API simplificada via `items={[{label, href, isCurrentPage?}]}`.",
      },
    },
  },
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Contratos", href: "/contratos" },
      { label: "Detalhes" },
    ],
  },
}
