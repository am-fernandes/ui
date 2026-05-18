import type { Meta, StoryObj } from "@storybook/react-vite"

import { Tabs } from "./tabs"

const meta = {
  title: "Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Tabs horizontais. API via `items={[{value, label, content, disabled?}]}`.",
      },
    },
  },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultValue: "conta",
    className: "w-[400px]",
    items: [
      {
        value: "conta",
        label: "Conta",
        content: (
          <p className="text-sm text-muted-foreground">Gerencie as informações da sua conta.</p>
        ),
      },
      {
        value: "senha",
        label: "Senha",
        content: (
          <p className="text-sm text-muted-foreground">
            Altere sua senha e configurações de segurança.
          </p>
        ),
      },
      {
        value: "notificacoes",
        label: "Notificações",
        content: (
          <p className="text-sm text-muted-foreground">Defina suas preferências de notificação.</p>
        ),
      },
    ],
  },
}
