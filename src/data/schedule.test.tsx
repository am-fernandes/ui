import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Schedule, type ScheduleEvent, type ScheduleProps, defaultScheduleLabels } from "./schedule"

const TODAY = new Date(2026, 10, 18, 10, 30) // qua. 18 nov. 2026, 10:30
const at = (day: number, hour = 0, minute = 0, month = 10) =>
  new Date(2026, month, day, hour, minute)

const events: ScheduleEvent[] = [
  { id: "daily", title: "Daily", start: at(18, 9), end: at(18, 9, 30), color: "teal" },
  { id: "review", title: "Revisão", start: at(18, 9, 15), end: at(18, 10, 30), color: "purple" },
  { id: "visit", title: "Vistoria", start: at(18, 10), end: at(18, 11), color: "red" },
  { id: "lunch", title: "Almoço", start: at(18, 12), end: at(18, 13) },
  { id: "holiday", title: "Feriado", start: at(20), end: at(20), allDay: true, color: "gray" },
  { id: "trip", title: "Viagem", start: at(20), end: at(23), allDay: true, color: "yellow" },
  { id: "night", title: "Concretagem", start: at(19, 22), end: at(20, 4), color: "orange" },
]

function renderSchedule(props: Partial<ScheduleProps> = {}) {
  return render(<Schedule events={events} today={TODAY} defaultDate={TODAY} {...props} />)
}

const eventButton = (name: string | RegExp) => screen.getByRole("button", { name })

afterEach(() => {
  vi.useRealTimers()
})

describe("Schedule", () => {
  describe("header", () => {
    it("titles the period in a live heading and labels the region by it", () => {
      renderSchedule()
      const heading = screen.getByRole("heading", { level: 2, name: "novembro de 2026" })
      expect(heading).toHaveAttribute("aria-live", "polite")
      expect(screen.getByRole("region", { name: "novembro de 2026" })).toHaveAttribute(
        "data-view",
        "month",
      )
    })

    it("honours headingLevel", () => {
      renderSchedule({ headingLevel: 4, defaultView: "list" })
      expect(screen.getByRole("heading", { level: 4, name: /nov\. de 2026/ })).toBeInTheDocument()
      expect(screen.getAllByRole("heading", { level: 5 }).length).toBeGreaterThan(0)
    })

    it("caps the day headings at h6", () => {
      renderSchedule({ headingLevel: 6, defaultView: "list" })
      expect(screen.getAllByRole("heading", { level: 6 }).length).toBeGreaterThan(1)
    })

    it("navigates with previous/next and returns with Hoje", async () => {
      const onDateChange = vi.fn()
      renderSchedule({ onDateChange })
      await userEvent.click(screen.getByRole("button", { name: "Próximo mês" }))
      expect(screen.getByRole("heading", { name: "dezembro de 2026" })).toBeInTheDocument()
      await userEvent.click(screen.getByRole("button", { name: "Mês anterior" }))
      await userEvent.click(screen.getByRole("button", { name: "Mês anterior" }))
      expect(screen.getByRole("heading", { name: "outubro de 2026" })).toBeInTheDocument()
      await userEvent.click(screen.getByRole("button", { name: "Hoje" }))
      expect(screen.getByRole("heading", { name: "novembro de 2026" })).toBeInTheDocument()
      expect(onDateChange).toHaveBeenCalledTimes(4)
      expect(onDateChange).toHaveBeenLastCalledWith(TODAY)
    })

    it("names previous/next after the view", () => {
      const { rerender } = renderSchedule({ view: "week" })
      expect(screen.getByRole("button", { name: "Semana anterior" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Próxima semana" })).toBeInTheDocument()
      rerender(<Schedule events={events} today={TODAY} defaultDate={TODAY} view="day" />)
      expect(screen.getByRole("button", { name: "Dia anterior" })).toBeInTheDocument()
      rerender(<Schedule events={events} today={TODAY} defaultDate={TODAY} view="list" />)
      expect(screen.getByRole("button", { name: "Próximo período" })).toBeInTheDocument()
    })

    it("switches views with the segmented control", async () => {
      const onViewChange = vi.fn()
      renderSchedule({ onViewChange })
      const switcher = screen.getByRole("radiogroup", { name: "Visualização" })
      expect(
        within(switcher)
          .getAllByRole("radio")
          .map((r) => r.textContent),
      ).toEqual(["Mês", "Semana", "Dia", "Lista"])
      expect(within(switcher).getByRole("radio", { name: "Mês" })).toBeChecked()
      await userEvent.click(within(switcher).getByRole("radio", { name: "Semana" }))
      expect(onViewChange).toHaveBeenCalledWith("week")
      expect(screen.getByRole("heading", { name: "15 – 21 de nov. de 2026" })).toBeInTheDocument()
    })

    it("can be controlled", async () => {
      const onViewChange = vi.fn()
      const onDateChange = vi.fn()
      renderSchedule({ view: "day", date: at(5), onViewChange, onDateChange })
      expect(
        screen.getByRole("heading", { name: "quinta-feira, 5 de novembro" }),
      ).toBeInTheDocument()
      await userEvent.click(screen.getByRole("radio", { name: "Mês" }))
      await userEvent.click(screen.getByRole("button", { name: "Próximo dia" }))
      expect(onViewChange).toHaveBeenCalledWith("month")
      expect(onDateChange).toHaveBeenCalledWith(at(6))
      // Nothing moved: the parent owns the state.
      expect(
        screen.getByRole("heading", { name: "quinta-feira, 5 de novembro" }),
      ).toBeInTheDocument()
    })

    it("limits the switcher to `views` and hides it for a single view", () => {
      const { rerender } = renderSchedule({ views: ["month", "list"] })
      expect(screen.getAllByRole("radio")).toHaveLength(2)
      rerender(
        <Schedule
          events={events}
          today={TODAY}
          defaultDate={TODAY}
          views={["list"]}
          defaultView="list"
        />,
      )
      expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument()
    })

    it("shows the loading state", () => {
      const { container } = renderSchedule({ loading: true })
      expect(screen.getByText("Carregando…").closest("output")).toBeInTheDocument()
      const body = container.querySelector('[data-slot="schedule-body"]')
      expect(body).toHaveAttribute("aria-busy", "true")
      // Not faded: that would fail text contrast.
      expect(body).not.toHaveClass("opacity-60")
    })

    it("is not busy by default", () => {
      const { container } = renderSchedule()
      expect(container.querySelector('[data-slot="schedule-body"]')).not.toHaveAttribute(
        "aria-busy",
      )
      expect(screen.queryByText("Carregando…")).not.toBeInTheDocument()
    })

    it("overrides labels, including the per-view ones", () => {
      renderSchedule({
        labels: {
          today: "Agora",
          next: { month: "Avançar", week: "w", day: "d", list: "l" },
          views: { month: "M", week: "S", day: "D", list: "L" },
          viewSwitcher: "Modo",
        },
      })
      expect(screen.getByRole("button", { name: "Agora" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Avançar" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Mês anterior" })).toBeInTheDocument()
      expect(screen.getByRole("radiogroup", { name: "Modo" })).toBeInTheDocument()
      expect(screen.getByRole("radio", { name: "M" })).toBeInTheDocument()
    })

    it("exports the pt-BR defaults", () => {
      expect(defaultScheduleLabels.more(3)).toBe("+3 mais")
      expect(defaultScheduleLabels.views).toEqual({
        month: "Mês",
        week: "Semana",
        day: "Dia",
        list: "Lista",
      })
    })
  })

  describe("month view", () => {
    it("renders whole weeks with the outside days marked and today highlighted", () => {
      const { container } = renderSchedule()
      const days = container.querySelectorAll('[data-slot="schedule-day"]')
      expect(days).toHaveLength(35)
      expect(container.querySelectorAll('[data-slot="schedule-week-row"]')).toHaveLength(5)
      const outside = container.querySelectorAll('[data-slot="schedule-day"][data-outside="true"]')
      expect(Array.from(outside).map((el) => el.getAttribute("data-date"))).toEqual([
        "2026-12-01",
        "2026-12-02",
        "2026-12-03",
        "2026-12-04",
        "2026-12-05",
      ])
      const today = container.querySelector('[data-slot="schedule-day"][aria-current="date"]')
      expect(today).toHaveAttribute("data-date", "2026-11-18")
      expect(today).toHaveTextContent("quarta-feira, 18 de novembro, hoje")
      // No right border on the last column.
      expect(days[6]).not.toHaveClass("border-r")
      expect(days[5]).toHaveClass("border-r")
    })

    it("renders timed events as chips and all-day/multi-day events as bars", () => {
      renderSchedule()
      const chip = eventButton("Vistoria, quarta-feira, 18 de novembro, 10:00 – 11:00")
      expect(chip).toHaveAttribute("data-variant", "chip")
      expect(chip.querySelector(".bg-category-red-solid")).not.toBeNull()
      const holiday = eventButton("Feriado, sexta-feira, 20 de novembro, dia inteiro")
      expect(holiday).toHaveAttribute("data-variant", "bar")
      expect(holiday).toHaveClass("bg-category-gray-bg", "text-category-gray-text")
      expect(eventButton(/^Concretagem, 19 de nov\., 22:00 – 20 de nov\., 04:00$/)).toHaveAttribute(
        "data-variant",
        "bar",
      )
    })

    it("uses blue when an event has no colour", () => {
      renderSchedule({ defaultView: "week" })
      expect(eventButton(/^Almoço/)).toHaveClass(
        "bg-category-blue-bg",
        "border-category-blue-solid",
      )
    })

    it("splits a bar across weeks with continuation edges", () => {
      renderSchedule()
      const parts = screen.getAllByRole("button", { name: /^Viagem, dia inteiro/ })
      expect(parts).toHaveLength(2)
      expect(parts[0]).toHaveClass("rounded-r-none")
      expect(parts[0]).not.toHaveClass("rounded-l-none")
      expect(parts[1]).toHaveClass("rounded-l-none", "border-l-0")
      // Fri 20 → Sat 21 in the first row, Sun 22 → Mon 23 in the next.
      expect(parts[0]?.parentElement?.style.gridColumn).toBe("6 / 8")
      expect(parts[1]?.parentElement?.style.gridColumn).toBe("1 / 3")
    })

    it("collapses the rest of a full day into “+N mais” with the day's events", async () => {
      renderSchedule()
      const more = screen.getByRole("button", { name: "+1 mais, quarta-feira, 18 de novembro" })
      expect(more).toHaveTextContent("+1 mais")
      await userEvent.click(more)
      const popover = screen.getByRole("dialog", { name: "quarta-feira, 18 de novembro" })
      expect(
        within(popover)
          .getAllByRole("button")
          .map((b) => b.getAttribute("aria-label")),
      ).toEqual([
        "Daily, quarta-feira, 18 de novembro, 09:00 – 09:30",
        "Revisão, quarta-feira, 18 de novembro, 09:15 – 10:30",
        "Vistoria, quarta-feira, 18 de novembro, 10:00 – 11:00",
        "Almoço, quarta-feira, 18 de novembro, 12:00 – 13:00",
      ])
    })

    it("lists bars too in the “+N mais” popover", async () => {
      const crowded: ScheduleEvent[] = [
        { id: "b1", title: "B1", start: at(10), end: at(10), allDay: true },
        { id: "b2", title: "B2", start: at(10), end: at(10), allDay: true },
        { id: "b3", title: "B3", start: at(10), end: at(10), allDay: true },
        { id: "b4", title: "B4", start: at(10), end: at(10), allDay: true },
      ]
      renderSchedule({ events: crowded })
      await userEvent.click(screen.getByRole("button", { name: /^\+1 mais, terça-feira, 10/ }))
      const popover = screen.getByRole("dialog")
      expect(within(popover).getAllByRole("button")).toHaveLength(4)
      expect(within(popover).getAllByRole("button")[0]).toHaveAttribute("data-variant", "bar")
    })

    it("starts the grid on Monday with weekStartsOn={1}", () => {
      const { container } = renderSchedule({ weekStartsOn: 1 })
      const first = container.querySelector('[data-slot="schedule-day"]')
      expect(first).toHaveAttribute("data-date", "2026-10-26")
      expect(container.querySelectorAll('[data-slot="schedule-day"]')).toHaveLength(42)
    })
  })

  describe("week and day views", () => {
    it("lays out the week with an all-day row and positioned blocks", () => {
      const { container } = renderSchedule({ defaultView: "week" })
      const headers = container.querySelectorAll('[data-slot="schedule-day-header"]')
      expect(headers).toHaveLength(7)
      expect(headers[3]).toHaveAttribute("aria-current", "date")
      expect(headers[3]).toHaveTextContent("quarta-feira, 18 de novembro, hoje")

      const allDay = container.querySelector('[data-slot="schedule-all-day"]') as HTMLElement
      expect(within(allDay).getByText("Dia inteiro")).toBeInTheDocument()
      expect(
        within(allDay)
          .getAllByRole("button")
          .map((b) => b.getAttribute("data-variant")),
      ).toEqual(["bar", "bar"])

      // A 22:00–04:00 shift is under 24h: it stays in the time grid, drawn on
      // both days (until midnight, then from midnight), not in "Dia inteiro".
      const night = [...container.querySelectorAll('[data-event-id="night"]')] as HTMLElement[]
      expect(night.map((b) => b.getAttribute("data-variant"))).toEqual(["block", "block"])
      expect(
        night.map((b) => b.closest('[data-slot="schedule-day-column"]')?.getAttribute("data-date")),
      ).toEqual(["2026-11-19", "2026-11-20"])
      expect(night[0]?.style.top).toBe(`${22 * 48 + 1}px`)
      expect(night[0]?.style.height).toBe(`${2 * 48 - 2}px`)
      expect(night[1]?.style.top).toBe("1px")
      expect(night[1]?.style.height).toBe(`${4 * 48 - 2}px`)

      const review = eventButton(/^Revisão/)
      expect(review).toHaveAttribute("data-variant", "block")
      expect(review.style.top).toBe(`${9.25 * 48 + 1}px`)
      expect(review.style.height).toBe(`${1.25 * 48 - 2}px`)
      expect(review.style.left).toBe("calc(50% + 2px)")
      expect(review.style.width).toBe("calc(50% - 4px)")
      expect(within(review).getByText("09:15 – 10:30")).toBeInTheDocument()
      // Daily is 30 min (24px): no room for the time line.
      expect(within(eventButton(/^Daily/)).queryByText("09:00 – 09:30")).not.toBeInTheDocument()
    })

    it("draws the current-time line on today's column", () => {
      const { container } = renderSchedule({ defaultView: "week" })
      const lines = container.querySelectorAll('[data-slot="schedule-now"]')
      expect(lines).toHaveLength(1)
      expect(lines[0]?.closest('[data-slot="schedule-day-column"]')).toHaveAttribute(
        "data-date",
        "2026-11-18",
      )
      expect((lines[0] as HTMLElement).style.top).toBe(`${10.5 * 48}px`)
    })

    it("omits the time line when now is outside the visible hours or days", () => {
      const { container, rerender } = renderSchedule({ defaultView: "week", minHour: 12 })
      expect(container.querySelector('[data-slot="schedule-now"]')).toBeNull()
      rerender(<Schedule events={events} today={TODAY} defaultDate={at(2)} defaultView="week" />)
      // defaultDate only applies on mount, so remount on another week.
      render(<Schedule events={events} today={TODAY} defaultDate={at(2)} defaultView="week" />)
      const columns = document.querySelectorAll('[data-slot="schedule-time-grid"]')
      expect(columns[1]?.querySelector('[data-slot="schedule-now"]')).toBeNull()
    })

    it("hides the all-day row when there are no bars", () => {
      const { container } = renderSchedule({
        defaultView: "day",
        events: events.filter((e) => !e.allDay && e.id !== "night"),
      })
      expect(container.querySelector('[data-slot="schedule-all-day"]')).toBeNull()
      expect(container.querySelectorAll('[data-slot="schedule-day-column"]')).toHaveLength(1)
    })

    it("scrolls to scrollToHour and labels the hours", () => {
      const { container } = renderSchedule({ defaultView: "week", scrollToHour: 7, hourHeight: 40 })
      const scroll = container.querySelector('[data-slot="schedule-scroll"]') as HTMLElement
      expect(scroll.scrollTop).toBe(7 * 40 - 8)
      const grid = scroll.firstElementChild as HTMLElement
      expect(grid.style.height).toBe(`${24 * 40}px`)
      expect(within(scroll).getByText("07:00")).toBeInTheDocument()
      // The first hour has no label (it would sit on the top edge).
      expect(within(scroll).queryByText("00:00")).not.toBeInTheDocument()
    })

    it("never scrolls above the first hour", () => {
      const { container } = renderSchedule({ defaultView: "day", scrollToHour: 0 })
      expect(
        (container.querySelector('[data-slot="schedule-scroll"]') as HTMLElement).scrollTop,
      ).toBe(0)
    })

    it("restricts the grid to minHour/maxHour", () => {
      const { container } = renderSchedule({ defaultView: "day", minHour: 8, maxHour: 18 })
      const scroll = container.querySelector('[data-slot="schedule-scroll"]') as HTMLElement
      expect((scroll.firstElementChild as HTMLElement).style.height).toBe(`${10 * 48}px`)
      expect(eventButton(/^Daily/).style.top).toBe(`${48 + 1}px`)
    })

    it("handles an empty hour range", () => {
      const { container } = renderSchedule({ defaultView: "day", minHour: 10, maxHour: 10 })
      const scroll = container.querySelector('[data-slot="schedule-scroll"]') as HTMLElement
      expect((scroll.firstElementChild as HTMLElement).style.height).toBe("0px")
    })
  })

  describe("list view", () => {
    it("groups events under day headings with per-day times", () => {
      renderSchedule({ defaultView: "list" })
      const sections = screen
        .getAllByRole("region")
        .filter((r) => r.tagName === "SECTION" && r.closest('[data-slot="schedule-list"]'))
      expect(sections.map((s) => within(s).getByRole("heading").textContent)).toEqual([
        "quarta-feira, 18 de novembroHoje",
        "quinta-feira, 19 de novembro",
        "sexta-feira, 20 de novembro",
        "sábado, 21 de novembro",
        "domingo, 22 de novembro",
        "segunda-feira, 23 de novembro",
      ])
      expect(within(sections[0] as HTMLElement).getByRole("heading")).toHaveAttribute(
        "aria-current",
        "date",
      )
      expect(within(sections[1] as HTMLElement).getByText("22:00 – …")).toBeInTheDocument()
      expect(within(sections[2] as HTMLElement).getByText("… – 04:00")).toBeInTheDocument()
      expect(within(sections[2] as HTMLElement).getAllByText("Dia inteiro")).toHaveLength(2)
      expect(within(sections[0] as HTMLElement).getAllByRole("button")[0]).toHaveAttribute(
        "data-variant",
        "row",
      )
    })

    it("respects listDays", () => {
      renderSchedule({ defaultView: "list", listDays: 1 })
      expect(screen.getByRole("heading", { name: "18 de nov. de 2026" })).toBeInTheDocument()
      expect(screen.getAllByRole("button", { name: /novembro/ })).toHaveLength(4)
    })

    it("shows the empty state when the period has no events", () => {
      renderSchedule({ defaultView: "list", events: [] })
      expect(
        screen.getByRole("heading", { level: 3, name: "Nenhum evento neste período" }),
      ).toBeInTheDocument()
    })
  })

  describe("events", () => {
    it("reports clicks with onEventClick", async () => {
      const onEventClick = vi.fn()
      renderSchedule({ onEventClick })
      await userEvent.click(eventButton(/^Feriado/))
      expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: "holiday" }))
    })

    it("opens renderEventDetails in a popover and still reports the click", async () => {
      const onEventClick = vi.fn()
      renderSchedule({
        defaultView: "week",
        onEventClick,
        renderEventDetails: (event) => <p>Detalhes de {event.title}</p>,
      })
      const trigger = eventButton(/^Almoço/)
      expect(trigger).toHaveAttribute("aria-haspopup", "dialog")
      await userEvent.click(trigger)
      const popover = screen.getByRole("dialog", { name: "Almoço" })
      expect(within(popover).getByText("Detalhes de Almoço")).toBeInTheDocument()
      expect(onEventClick).toHaveBeenCalledTimes(1)
    })

    it("ignores events outside the visible period", () => {
      renderSchedule({ defaultView: "day", defaultDate: at(5) })
      expect(screen.queryAllByRole("button", { name: /novembro|nov\./ })).toHaveLength(0)
    })
  })

  describe("today", () => {
    it("falls back to the real clock and refreshes every minute", () => {
      vi.useFakeTimers({ shouldAdvanceTime: false })
      vi.setSystemTime(new Date(2026, 10, 18, 23, 59, 30))
      const { container } = render(<Schedule events={[]} />)
      const current = () =>
        container
          .querySelector('[data-slot="schedule-day"][aria-current="date"]')
          ?.getAttribute("data-date")
      expect(current()).toBe("2026-11-18")
      act(() => {
        vi.advanceTimersByTime(60_000)
      })
      expect(current()).toBe("2026-11-19")
    })

    it("starts on today's date when there is no defaultDate", () => {
      render(<Schedule events={[]} today={new Date(2027, 1, 3)} />)
      expect(screen.getByRole("heading", { name: "fevereiro de 2027" })).toBeInTheDocument()
    })
  })
})
