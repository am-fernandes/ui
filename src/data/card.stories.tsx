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
        component: [
          "Container composicional para agrupar informação relacionada. `Card` é só um wrapper estilizado com borda e fundo — toda a estrutura interna é montada pelos subcomponentes.",
          "",
          "**Subcomponentes:**",
          "- `Card` — wrapper externo (`<div>`). Aplica `border`, `rounded-md`, `bg-card` e `text-card-foreground`.",
          "- `CardHeader` — bloco superior com padding e `flex-col` + `space-y-1.5`. Use para agrupar `CardTitle` + `CardDescription`.",
          "- `CardTitle` — título do card (`font-semibold leading-none tracking-tight`).",
          "- `CardDescription` — texto secundário (`text-sm text-muted-foreground`).",
          "- `CardContent` — corpo principal. Padding lateral/inferior, sem padding-top (encaixa direto abaixo do header).",
          "- `CardFooter` — rodapé com `flex items-center`, ideal para botões de ação.",
          "",
          "Todos os subcomponentes são `<div>`s com `React.forwardRef` e aceitam `className` + qualquer `HTMLAttributes<HTMLDivElement>` para customização.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          "import {",
          "  Card,",
          "  CardContent,",
          "  CardDescription,",
          "  CardFooter,",
          "  CardHeader,",
          "  CardTitle,",
          '} from "@am-fernandes/ui"',
          "",
          "<Card>",
          "  <CardHeader>",
          "    <CardTitle>Contrato 2026-001</CardTitle>",
          "    <CardDescription>Cliente A · vence em 30/05/2026</CardDescription>",
          "  </CardHeader>",
          "  <CardContent>Conteúdo do card.</CardContent>",
          "  <CardFooter>Rodapé</CardFooter>",
          "</Card>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    className: {
      control: "text",
      description: "Classes Tailwind extras aplicadas ao wrapper `Card`.",
      table: { type: { summary: "string" } },
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
