import type { Meta, StoryObj } from "@storybook/react-vite"

import { ConfirmButton } from "./confirm-button"

const meta = {
  title: "Composed/ConfirmButton",
  component: ConfirmButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ConfirmButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: "Excluir",
    variant: "destructive",
    confirmTitle: "Confirmar exclusão?",
    onConfirm: () => {
      console.log("confirmed")
    },
  },
}

export const WithMessage: Story = {
  args: {
    children: "Arquivar",
    confirmTitle: "Arquivar contrato",
    confirmMessage: "O contrato será movido para o arquivo. Você pode restaurá-lo depois.",
    confirmActionLabel: "Arquivar",
    onConfirm: () => {
      console.log("archived")
    },
  },
}

export const AsyncAction: Story = {
  args: {
    children: "Excluir",
    variant: "destructive",
    confirmTitle: "Excluir requerimento?",
    confirmMessage: "Esta ação não pode ser desfeita.",
    confirmActionLabel: "Excluir",
    onConfirm: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1200))
    },
  },
}
