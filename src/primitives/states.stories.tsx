import type { Meta, StoryObj } from "@storybook/react-vite"
import { Star } from "lucide-react"

import { Button } from "./button"
import { Checkbox } from "./checkbox"
import { SegmentedControl } from "./segmented-control"
import { Separator } from "./separator"
import { Skeleton } from "./skeleton"
import { Switch } from "./switch"
import { Toggle } from "./toggle"

const meta: Meta = {
  title: "Primitives/State Without Colour",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "O sistema é flat: muito estado é dito por um preenchimento (Toggle ligado, segmento escolhido, Switch, Checkbox marcado, Button primário). Dois lugares tiram esses fundos:",
          "",
          "- **Cores forçadas** (Alto Contraste do Windows, `forced-colors: active`): o navegador troca as cores pelas do sistema. Cada estado ganha um segundo sinal com as cores do sistema (`Highlight` no que está ligado ou escolhido, borda `ButtonText` nos botões), e o Separator e o Skeleton viram linha e contorno.",
          "- **Impressão** sem gráficos de fundo: os controles com estado pedem `print-color-adjust: exact`, para o Checkbox marcado não sair vazio no papel.",
          "",
          "Esta página reúne cada controle nos dois estados, lado a lado; `tests/e2e/primitives.spec.ts` a abre com cores forçadas e confere que eles continuam diferentes.",
        ].join("\n"),
      },
    },
  },
}
export default meta
type Story = StoryObj

const PERIODS = [
  { value: "dia", label: "Dia" },
  { value: "semana", label: "Semana" },
]

export const OnAndOff: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Toggle data-testid="toggle-off">
          <Star />
          Favorito
        </Toggle>
        <Toggle data-testid="toggle-on" defaultPressed>
          <Star />
          Favorito
        </Toggle>
      </div>
      <SegmentedControl label="Período" options={PERIODS} defaultValue="semana" />
      <div className="flex items-center gap-6">
        <Switch data-testid="switch-off" label="Desligado" />
        <Switch data-testid="switch-on" label="Ligado" defaultChecked />
      </div>
      <div className="flex items-center gap-6">
        <Checkbox data-testid="checkbox-off" label="Desmarcado" />
        <Checkbox data-testid="checkbox-on" label="Marcado" defaultChecked />
        <Checkbox data-testid="checkbox-mixed" label="Misto" defaultChecked="indeterminate" />
      </div>
      <div className="flex items-center gap-3">
        <Button data-testid="button-primary">Salvar</Button>
        <Button data-testid="button-secondary" variant="secondary">
          Rascunho
        </Button>
      </div>
      <Separator data-testid="separator" />
      <Skeleton data-testid="skeleton" className="h-4 w-48" />
    </div>
  ),
}
