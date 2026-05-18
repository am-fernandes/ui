import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "../primitives/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card"

const meta = {
  title: "Data/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Container modular: `Card` + `CardHeader` + `CardTitle` + `CardDescription` + `CardContent` + `CardFooter`.",
      },
    },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Contrato 2026-001</CardTitle>
        <CardDescription>Cliente A · vence em 30/05/2026</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Contrato de prestação de serviços técnicos com renovação automática mediante notificação
          prévia de 30 dias.
        </p>
      </CardContent>
      <CardFooter>
        <Button>Ver detalhes</Button>
      </CardFooter>
    </Card>
  ),
}
