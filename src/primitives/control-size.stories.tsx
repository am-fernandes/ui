import type { Meta, StoryObj } from "@storybook/react-vite"
import { Pencil, Trash2 } from "lucide-react"

import type { ControlSize } from "./_internal/control-size"
import { Button } from "./button"
import { IconButton } from "./icon-button"

const meta: Meta = {
  title: "Primitives/Control Size",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Todo controle que fica numa linha com outros tem um de três tamanhos, pela prop `size`:",
          "",
          "| `size` | altura | uso |",
          "|---|---|---|",
          "| `sm` | 32px | linhas densas: ações de tabela, barras de filtro |",
          "| `md` (padrão) | 40px | formulários e barras de ação |",
          "| `lg` | 44px | alvo de toque |",
          "",
          "A altura é a da caixa inteira, borda incluída, e vem dos tokens `--spacing-control-*` (`h-control-md`). Por isso um botão com borda, um sem borda e um campo do mesmo tamanho ficam exatamente alinhados.",
        ].join("\n"),
      },
    },
  },
}
export default meta
type Story = StoryObj

const SIZES: ControlSize[] = ["sm", "md", "lg"]
const BUTTON_VARIANTS = ["default", "destructive", "outline", "secondary", "ghost", "link"] as const

function Row({ size }: { size: ControlSize }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{size}</span>
      <div data-testid={`row-${size}`} className="flex flex-wrap items-center gap-2">
        {BUTTON_VARIANTS.map((variant) => (
          <Button key={variant} variant={variant} size={size}>
            {variant}
          </Button>
        ))}
        <IconButton icon={<Pencil />} label="Editar" size={size} variant="outline" />
        <IconButton icon={<Trash2 />} label="Excluir" size={size} />
      </div>
    </div>
  )
}

export const Alignment: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {SIZES.map((size) => (
        <Row key={size} size={size} />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Cada linha junta controles do mesmo `size`. Todos têm a mesma altura e o mesmo centro, com ou sem borda.",
      },
    },
  },
}
