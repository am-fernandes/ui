import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "@storybook/test"
import * as React from "react"

import { Schedule, type ScheduleEvent } from "./schedule"

/** Wednesday, 18 Nov 2026, 10:30 — fixed so every render is identical. */
const TODAY = new Date(2026, 10, 18, 10, 30)

const at = (day: number, hour: number, minute = 0) => new Date(2026, 10, day, hour, minute)

const events: ScheduleEvent[] = [
  {
    id: "visita-1",
    title: "Visita à obra — Torre A",
    start: at(16, 9),
    end: at(16, 11),
    color: "orange",
  },
  {
    id: "cliente-1",
    title: "Reunião com cliente",
    start: at(17, 14),
    end: at(17, 15),
    color: "blue",
  },
  {
    id: "daily",
    title: "Daily de engenharia",
    start: at(18, 9),
    end: at(18, 9, 30),
    color: "teal",
  },
  {
    id: "proposta",
    title: "Revisão de proposta",
    start: at(18, 9, 15),
    end: at(18, 10, 30),
    color: "purple",
  },
  {
    id: "almoco",
    title: "Almoço com fornecedor",
    start: at(18, 12),
    end: at(18, 13, 30),
    color: "green",
  },
  { id: "vistoria", title: "Vistoria Caixa", start: at(18, 10), end: at(18, 11), color: "red" },
  {
    id: "assinatura",
    title: "Assinatura de contrato",
    start: at(18, 16),
    end: at(18, 17),
    color: "pink",
  },
  {
    id: "feriado",
    title: "Dia da Consciência Negra",
    start: at(20, 0),
    end: at(20, 0),
    allDay: true,
    color: "gray",
  },
  {
    id: "treinamento",
    title: "Treinamento NR-35",
    start: at(23, 0),
    end: at(25, 0),
    allDay: true,
    color: "yellow",
  },
  {
    id: "concretagem",
    title: "Concretagem — laje 12",
    start: at(19, 22),
    end: at(20, 4),
    color: "orange",
  },
  {
    id: "entrega",
    title: "Entrega de chaves — Residencial Ipê",
    start: at(27, 10),
    end: at(27, 12),
    color: "green",
  },
  { id: "comite", title: "Comitê de obras", start: at(3, 15), end: at(3, 16, 30), color: "blue" },
]

const meta = {
  title: "Data/Schedule",
  component: Schedule,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Calendário de eventos com visões de **mês**, **semana**, **dia** e **lista**.",
          "",
          "- Data-driven: passe `events` com `start`/`end` em `Date` (hora local). `allDay` vira barra sem horário.",
          "- Eventos de dia inteiro e que atravessam a meia-noite viram barras que se estendem pelos dias; horários que se sobrepõem ficam lado a lado.",
          "- No mês, cada dia mostra até 3 linhas; o resto vira **+N mais**, que abre a lista do dia.",
          "- Semana e dia têm a linha da hora atual e começam rolados em `scrollToHour` (8h).",
          "- `renderEventDetails` abre um popover ao clicar no evento; `onEventClick` só avisa o clique.",
          "- `today` fixa o que conta como hoje — use em testes e capturas.",
        ].join("\n"),
      },
    },
  },
  args: {
    events,
    today: TODAY,
    defaultDate: TODAY,
  },
} satisfies Meta<typeof Schedule>
export default meta
type Story = StoryObj<typeof meta>

export const Month: Story = {}

export const Week: Story = {
  args: { defaultView: "week" },
}

export const Day: Story = {
  args: { defaultView: "day" },
}

export const List: Story = {
  args: { defaultView: "list" },
}

export const WithEventDetails: Story = {
  args: {
    defaultView: "week",
    events: events.map((event) =>
      event.id === "proposta"
        ? { ...event, description: "Conferir planilha de custos e prazos antes de enviar." }
        : event,
    ),
    renderEventDetails: (event) => (
      <div className="flex flex-col gap-1">
        <p className="font-semibold">{event.title}</p>
        <p className="text-xs text-muted-foreground">
          {event.allDay
            ? "Dia inteiro"
            : `${event.start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} – ${event.end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
        </p>
        {event.description ? <p className="text-sm">{event.description}</p> : null}
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Com `renderEventDetails`, o clique no evento abre um popover com o conteúdo que você montar.",
      },
    },
  },
}

export const BusinessHours: Story = {
  args: { defaultView: "week", weekStartsOn: 1, minHour: 7, maxHour: 19, scrollToHour: 7 },
  parameters: {
    docs: {
      description: {
        story:
          "Semana começando na segunda (`weekStartsOn={1}`) e só o horário comercial (`minHour`/`maxHour`).",
      },
    },
  },
}

export const OnlyMonthAndList: Story = {
  args: { views: ["month", "list"] },
}

export const Loading: Story = {
  args: { loading: true },
}

export const EmptyList: Story = {
  args: { defaultView: "list", events: [] },
}

function ControlledSchedule() {
  const [date, setDate] = React.useState(TODAY)
  const [view, setView] = React.useState<"month" | "week" | "day" | "list">("week")
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        Estado no app: {view} · {date.toLocaleDateString("pt-BR")}
      </p>
      <Schedule
        events={events}
        today={TODAY}
        date={date}
        onDateChange={setDate}
        view={view}
        onViewChange={setView}
      />
    </div>
  )
}

export const Controlled: Story = {
  render: () => <ControlledSchedule />,
}

export const Interaction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Teste de interação: navega para o próximo mês e volta com “Hoje”, troca para a semana e abre o “+N mais” de um dia cheio.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)
    await expect(canvas.getByRole("heading", { name: "novembro de 2026" })).toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "Próximo mês" }))
    await expect(canvas.getByRole("heading", { name: "dezembro de 2026" })).toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "Hoje" }))
    await expect(canvas.getByRole("heading", { name: "novembro de 2026" })).toBeInTheDocument()

    const more = canvas.getByRole("button", { name: /mais, quarta-feira, 18 de novembro/ })
    await userEvent.click(more)
    const popover = await body.findByRole("dialog", { name: "quarta-feira, 18 de novembro" })
    await expect(within(popover).getAllByRole("button")).toHaveLength(5)
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(document.querySelector('[data-slot="popover-content"]')).toBeNull())

    await userEvent.click(canvas.getByRole("radio", { name: "Semana" }))
    await expect(
      canvas.getByRole("heading", { name: "15 – 21 de nov. de 2026" }),
    ).toBeInTheDocument()
  },
}
