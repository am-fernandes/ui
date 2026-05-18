import type { Meta, StoryObj } from "@storybook/react-vite"

import { Accordion } from "./accordion"

const meta = {
  title: "Navigation/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Lista expansível de painéis. Modo `single` (um aberto por vez) ou `multiple`. API via `items` array.",
      },
    },
  },
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    type: "single",
    collapsible: true,
    className: "w-[400px]",
    items: [
      {
        value: "item-1",
        title: "É acessível?",
        content: "Sim. Segue as práticas de WAI-ARIA e funciona com leitores de tela.",
      },
      {
        value: "item-2",
        title: "É estilizado?",
        content:
          "Sim. Vem com estilos prontos baseados no design system, totalmente customizáveis.",
      },
      {
        value: "item-3",
        title: "É animado?",
        content:
          "Sim. Inclui animações suaves de abertura e fechamento, respeitando o motion do usuário.",
      },
    ],
  },
}
