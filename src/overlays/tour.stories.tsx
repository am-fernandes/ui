import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "@storybook/test"
import { Download, Filter, Plus, Search } from "lucide-react"
import * as React from "react"

import { Button } from "../primitives/button"
import { Input } from "../primitives/input"
import { Tour, type TourCloseReason, type TourProps, type TourStep } from "./tour"

const steps: TourStep[] = [
  {
    target: "#tour-novo-lead",
    title: "Cadastre um lead",
    content: "Comece por aqui: cada lead novo entra na fila de atendimento.",
  },
  {
    target: "#tour-busca",
    title: "Encontre qualquer lead",
    content: "Busque por nome, telefone ou CPF.",
  },
  {
    target: "#tour-filtros",
    title: "Filtre a lista",
    content: "Combine origem, status e período.",
    side: "bottom",
    align: "end",
  },
  {
    target: "#tour-exportar",
    title: "Exporte quando precisar",
    content: "Baixe a lista filtrada em CSV.",
    side: "left",
    align: "center",
  },
]

function LeadsScreen({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button id="tour-novo-lead">
          <Plus /> Novo lead
        </Button>
        <div id="tour-busca" className="w-64">
          <Input
            label="Buscar lead"
            labelPosition="hidden"
            placeholder="Buscar lead"
            leadingIcon={<Search className="size-4" />}
          />
        </div>
        <div className="ml-auto flex gap-2">
          <Button id="tour-filtros" variant="outline">
            <Filter /> Filtros
          </Button>
          <Button id="tour-exportar" variant="outline">
            <Download /> Exportar
          </Button>
        </div>
      </div>
      <div className="h-48 rounded-md border bg-muted/40" />
      {children}
    </div>
  )
}

function TourDemo(props: Partial<TourProps>) {
  const [open, setOpen] = React.useState(false)
  const [result, setResult] = React.useState<TourCloseReason | null>(null)
  return (
    <LeadsScreen>
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => {
            setResult(null)
            setOpen(true)
          }}
        >
          Iniciar tour
        </Button>
        {result ? (
          <p className="text-sm text-muted-foreground" data-testid="tour-result">
            {result === "completed" ? "Tour concluído" : "Tour fechado antes do fim"}
          </p>
        ) : null}
      </div>
      <Tour
        steps={steps}
        open={open}
        onClose={(reason) => {
          setOpen(false)
          setResult(reason)
        }}
        {...props}
      />
    </LeadsScreen>
  )
}

const meta = {
  title: "Overlays/Tour",
  component: Tour,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Tour guiado (onboarding): um balão por etapa, apontando para um elemento da página.",
          "",
          "- `steps` — `{ target, title, content?, side?, align? }`. O `target` pode ser um ref, um seletor CSS ou uma função que devolve o elemento.",
          '- `open` controla quando o tour roda; `onClose(reason)` avisa como terminou: `"completed"` (Concluir na última etapa) ou `"dismissed"` (X ou Esc). Salve a conclusão ali para não repetir o tour.',
          "- `spotlight` escurece a página em volta do alvo (padrão ligado). `showProgress` mostra “2 de 5”.",
          "",
          "Não é modal: a página continua usável e clicar fora não encerra o tour. O foco vai para o balão a cada etapa e volta para onde estava no fim.",
          "Mantenha tours curtos e nunca deixe informação essencial só dentro deles.",
        ].join("\n"),
      },
    },
  },
  args: { steps, open: false },
  render: () => <TourDemo />,
} satisfies Meta<typeof Tour>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutSpotlight: Story = {
  render: () => <TourDemo spotlight={false} />,
  parameters: {
    docs: { description: { story: "Sem escurecer a página: só o balão." } },
  },
}

export const WithoutProgress: Story = {
  render: () => <TourDemo showProgress={false} />,
}

function LateTargetDemo() {
  const [open, setOpen] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)
  return (
    <div className="flex flex-col items-start gap-4">
      <Button
        variant="secondary"
        onClick={() => {
          setLoaded(false)
          setOpen(true)
          setTimeout(() => setLoaded(true), 1000)
        }}
      >
        Iniciar tour
      </Button>
      <div className="h-24">
        {loaded ? (
          <Button id="tour-relatorio" variant="outline">
            <Download /> Baixar relatório
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">Carregando relatório…</p>
        )}
      </div>
      <Tour
        open={open}
        onClose={() => setOpen(false)}
        steps={[
          {
            target: "#tour-relatorio",
            title: "Baixe o relatório",
            content: "O botão aparece quando os dados terminam de carregar.",
          },
        ]}
      />
    </div>
  )
}

export const LateTarget: Story = {
  render: () => <LateTargetDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "O alvo só aparece depois que os dados carregam: o balão começa centrado e passa a apontar para ele assim que ele entra na página. O mesmo vale para um alvo trocado por outro nó com o mesmo seletor.",
      },
    },
  },
}

export const Interaction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Teste de interação: abre o tour, avança, volta, conclui e confere que o foco voltou ao botão que iniciou.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)
    const start = canvas.getByRole("button", { name: "Iniciar tour" })
    await userEvent.click(start)
    const callout = await body.findByRole("dialog", { name: "Cadastre um lead" })
    await expect(within(callout).getByText("1 de 4")).toBeInTheDocument()
    await userEvent.click(within(callout).getByRole("button", { name: "Próximo" }))
    await waitFor(() =>
      expect(body.getByRole("dialog")).toHaveAccessibleName("Encontre qualquer lead"),
    )
    await userEvent.click(body.getByRole("button", { name: "Voltar" }))
    await waitFor(() => expect(body.getByRole("dialog")).toHaveAccessibleName("Cadastre um lead"))
    for (let i = 0; i < 3; i++) {
      await userEvent.click(body.getByRole("button", { name: "Próximo" }))
    }
    await userEvent.click(body.getByRole("button", { name: "Concluir" }))
    await waitFor(() => expect(document.querySelector('[data-slot="tour-step"]')).toBeNull())
    await expect(canvas.getByTestId("tour-result")).toHaveTextContent("Tour concluído")
    await waitFor(() => expect(start).toHaveFocus())
  },
}
