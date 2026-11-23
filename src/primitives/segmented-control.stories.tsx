import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "@storybook/test"
import { LayoutGrid, List, Rows3 } from "lucide-react"
import * as React from "react"

import { Button } from "./button"
import { SegmentedControl } from "./segmented-control"

const periods = [
  { value: "dia", label: "Dia" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
]

const views = [
  { value: "lista", label: "Lista", icon: List },
  { value: "grade", label: "Grade", icon: LayoutGrid },
  { value: "compacta", label: "Compacta", icon: Rows3 },
]

const meta = {
  title: "Primitives/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Uma linha de 2 a 5 opções exclusivas, sempre visíveis, com exatamente uma marcada. É um **campo** (um grupo de rádio), não navegação.",
          "",
          "- Use para mudar **como o mesmo conteúdo aparece** (Lista | Grade, Dia | Semana | Mês) ou como escolha compacta num formulário (`name`).",
          "- Para trocar entre **conteúdos diferentes**, cada um com o seu painel, use `Tabs`.",
          "- Para um liga/desliga independente, use `Toggle`.",
          "",
          "`label` é obrigatório: é o nome do grupo para o leitor de tela (não aparece na tela). Setas movem e selecionam; o grupo inteiro é uma parada só do Tab.",
        ].join("\n"),
      },
    },
  },
  args: {
    label: "Período",
    options: periods,
    defaultValue: "semana",
  },
} satisfies Meta<typeof SegmentedControl>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithIcons: Story = {
  args: { label: "Visualização", options: views, defaultValue: "lista" },
}

export const IconOnly: Story = {
  args: { label: "Visualização", options: views, defaultValue: "grade", iconOnly: true },
  parameters: {
    docs: {
      description: {
        story: "Só ícones: cada rótulo vira o nome acessível e um tooltip.",
      },
    },
  },
}

export const Small: Story = {
  args: { size: "sm" },
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      <SegmentedControl {...args} size="sm" />
      <SegmentedControl {...args} size="md" />
      <SegmentedControl {...args} size="lg" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`size` é a altura da trilha inteira: `sm` 32px, `md` 40px (padrão) e `lg` 44px, as mesmas de um `Button` ou `Input` do mesmo tamanho.",
      },
    },
  },
}

export const Fill: Story = {
  args: { fill: true },
  decorators: [
    (Story) => (
      <div className="w-96 max-w-full">
        <Story />
      </div>
    ),
  ],
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const DisabledOption: Story = {
  args: {
    options: [periods[0]!, periods[1]!, { ...periods[2]!, disabled: true }],
  },
}

function SwitchingLayout() {
  const [view, setView] = React.useState("lista")
  const leads = ["Ana Souza", "Bruno Lima", "Carla Dias", "Diego Rocha"]
  return (
    <div className="flex w-[28rem] max-w-full flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium">Leads</h3>
        <SegmentedControl
          label="Visualização"
          options={views.slice(0, 2)}
          value={view}
          onValueChange={setView}
          size="sm"
          iconOnly
        />
      </div>
      <ul className={view === "grade" ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2"}>
        {leads.map((lead) => (
          <li key={lead} className="rounded-md border px-3 py-2 text-sm">
            {lead}
          </li>
        ))}
      </ul>
    </div>
  )
}

export const SameContentDifferentLayout: Story = {
  render: () => <SwitchingLayout />,
  parameters: {
    docs: {
      description: {
        story:
          "O caso típico: o conteúdo é o mesmo, só muda a forma de mostrar. Se cada opção tivesse um conteúdo próprio, seria `Tabs`.",
      },
    },
  },
}

function ControlledExample() {
  const [period, setPeriod] = React.useState("dia")
  const [changes, setChanges] = React.useState<string[]>([])
  return (
    <div className="flex flex-col items-start gap-3">
      <SegmentedControl
        label="Período"
        options={periods}
        value={period}
        onValueChange={(next) => {
          setPeriod(next)
          setChanges((current) => [...current, next])
        }}
      />
      <output className="text-sm" data-testid="changes">
        onValueChange: {changes.length ? changes.join(", ") : "nenhum"}
      </output>
    </div>
  )
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Modo controlado: `value` e `onValueChange`. Cada troca, por clique ou por seta, chama `onValueChange` uma vez só, então dá para buscar dados ou trocar de rota direto nele.",
      },
    },
  },
}

function FormExample() {
  const [sent, setSent] = React.useState<string | null>(null)
  return (
    <form
      className="flex flex-col items-start gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        setSent(String(new FormData(event.currentTarget).get("pessoa")))
      }}
    >
      <span className="text-sm font-medium" aria-hidden="true">
        Tipo de cliente
      </span>
      <SegmentedControl
        label="Tipo de cliente"
        name="pessoa"
        options={[
          { value: "pf", label: "Pessoa física" },
          { value: "pj", label: "Pessoa jurídica" },
        ]}
        defaultValue="pf"
      />
      <Button type="submit">Enviar</Button>
      {sent ? <output className="text-sm">Enviado: {sent}</output> : null}
    </form>
  )
}

export const InForm: Story = {
  render: () => <FormExample />,
  parameters: {
    docs: {
      description: {
        story: "Com `name`, a escolha vai junto quando o formulário é enviado.",
      },
    },
  },
}

export const Interaction: Story = {
  parameters: {
    docs: {
      description: {
        story: "Teste de interação: clique e setas selecionam; o grupo é uma parada só do Tab.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("radio", { name: "Mês" }))
    await expect(canvas.getByRole("radio", { name: "Mês" })).toHaveAttribute("aria-checked", "true")
    await userEvent.keyboard("{ArrowLeft>}")
    await waitFor(() =>
      expect(canvas.getByRole("radio", { name: "Semana" })).toHaveAttribute("aria-checked", "true"),
    )
    await userEvent.keyboard("{/ArrowLeft}")
  },
}
