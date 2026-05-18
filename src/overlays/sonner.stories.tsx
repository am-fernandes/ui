import type { Meta, StoryObj } from "@storybook/react"

import { Button } from "../primitives/button"
import { Toaster, toast } from "./sonner"

const meta: Meta<typeof Toaster> = {
  title: "Overlays/Sonner",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          'Container de toasts. Coloque um `<Toaster />` no root da app; dispare via `toast.success("...")` em qualquer lugar.',
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof Toaster>

export const Default: Story = {
  render: () => (
    <>
      <Toaster />
      <Button onClick={() => toast.success("Salvo com sucesso!")}>Disparar toast</Button>
    </>
  ),
}
