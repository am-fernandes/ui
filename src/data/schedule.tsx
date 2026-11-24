"use client"

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "../primitives/button"
import { IconButton } from "../primitives/icon-button"
import { SegmentedControl } from "../primitives/segmented-control"
import {
  type ScheduleColor,
  type ScheduleView,
  type WeekStart,
  compareEvents,
  eventOverlapsRange,
  formatPeriodTitle,
  getViewRange,
  shiftDate,
} from "./_internal/schedule-dates"
import { ScheduleContext, type ScheduleContextValue } from "./_internal/schedule-event"
import { ListView } from "./_internal/schedule-list"
import { MonthView } from "./_internal/schedule-month"
import { TimeGridView } from "./_internal/schedule-time-grid"

export type { ScheduleColor, ScheduleView }

export interface ScheduleEvent {
  /** Stable identity (React key, `data-event-id`). */
  id: string
  title: string
  start: Date
  /**
   * Timed events: the end instant (exclusive — ending at 00:00 does not spill
   * into the next day). All-day events (`allDay`): the last day, inclusive.
   */
  end: Date
  /** Shown as a bar in the month and all-day rows, without a time. */
  allDay?: boolean
  /** Category colour. @default "blue" */
  color?: ScheduleColor
  /** Free content for `renderEventDetails`. Not rendered by the schedule itself. */
  description?: React.ReactNode
}

export interface ScheduleLabels {
  today: string
  previous: Record<ScheduleView, string>
  next: Record<ScheduleView, string>
  views: Record<ScheduleView, string>
  /** Accessible name of the view switcher. */
  viewSwitcher: string
  allDay: string
  /** Month view: collapsed events of a day. */
  more: (count: number) => string
  /** List view with no events in the period. */
  empty: string
  loading: string
}

export const defaultScheduleLabels: ScheduleLabels = {
  today: "Hoje",
  previous: {
    month: "Mês anterior",
    week: "Semana anterior",
    day: "Dia anterior",
    list: "Período anterior",
  },
  next: {
    month: "Próximo mês",
    week: "Próxima semana",
    day: "Próximo dia",
    list: "Próximo período",
  },
  views: { month: "Mês", week: "Semana", day: "Dia", list: "Lista" },
  viewSwitcher: "Visualização",
  allDay: "Dia inteiro",
  more: (count) => `+${count} mais`,
  empty: "Nenhum evento neste período",
  loading: "Carregando…",
}

const ALL_VIEWS: ScheduleView[] = ["month", "week", "day", "list"]

export interface ScheduleProps {
  events: ScheduleEvent[]
  view?: ScheduleView
  /** @default "month" */
  defaultView?: ScheduleView
  onViewChange?: (view: ScheduleView) => void
  /** Views offered in the switcher. The switcher hides when there is only one. @default all four */
  views?: ScheduleView[]
  /** Focused date — decides the visible period. */
  date?: Date
  defaultDate?: Date
  onDateChange?: (date: Date) => void
  /**
   * What counts as "today" (highlight, "Hoje" button, current-time line).
   * Defaults to the real clock, refreshed every minute. Pass a fixed date for
   * deterministic renders (tests, screenshots).
   */
  today?: Date
  onEventClick?: (event: ScheduleEvent) => void
  /** When set, clicking an event opens a popover with this content. */
  renderEventDetails?: (event: ScheduleEvent) => React.ReactNode
  /** First day of the week. @default 0 (domingo) */
  weekStartsOn?: WeekStart
  /** Week/day views: first hour shown. @default 0 */
  minHour?: number
  /** Week/day views: hour where the grid ends (exclusive). @default 24 */
  maxHour?: number
  /** Week/day views: hour the grid scrolls to when it appears. @default 8 */
  scrollToHour?: number
  /** Week/day views: height of one hour, in px. @default 48 */
  hourHeight?: number
  /**
   * Week/day views: most events side by side in a day column. When more
   * happen at the same time, the last column shows "+N" with the rest, so
   * the blocks never get too narrow to read. @default 3 in the week, 6 in the day
   */
  maxColumns?: number
  /** List view: days shown from `date`. @default 7 */
  listDays?: number
  /** Shows a spinner with "Carregando…" in the header and marks the body `aria-busy`. */
  loading?: boolean
  /** Heading tag of the period title. @default 2 */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  labels?: Partial<ScheduleLabels>
  className?: string
}

function mergeLabels(labels?: Partial<ScheduleLabels>): ScheduleLabels {
  const merged = { ...defaultScheduleLabels, ...labels }
  return {
    ...merged,
    previous: { ...defaultScheduleLabels.previous, ...labels?.previous },
    next: { ...defaultScheduleLabels.next, ...labels?.next },
    views: { ...defaultScheduleLabels.views, ...labels?.views },
  }
}

/**
 * Calendar of events with month, week, day and list views. Data-driven: pass
 * `events` (plain `Date`s, local time) and the schedule lays them out —
 * spanning bars for all-day and multi-day events, side-by-side blocks for
 * overlapping times, "+N mais" when a month day is full.
 */
function Schedule({
  events,
  view: viewProp,
  defaultView = "month",
  onViewChange,
  views = ALL_VIEWS,
  date: dateProp,
  defaultDate,
  onDateChange,
  today,
  onEventClick,
  renderEventDetails,
  weekStartsOn = 0,
  minHour = 0,
  maxHour = 24,
  scrollToHour = 8,
  hourHeight = 48,
  maxColumns,
  listDays = 7,
  loading = false,
  headingLevel = 2,
  labels,
  className,
}: ScheduleProps) {
  const l = mergeLabels(labels)
  const titleId = React.useId()

  const [clock, setClock] = React.useState(() => new Date())
  React.useEffect(() => {
    if (today) return
    const id = window.setInterval(() => setClock(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [today])
  const now = today ?? clock

  const [innerView, setInnerView] = React.useState<ScheduleView>(defaultView)
  const view = viewProp ?? innerView
  const setView = (next: ScheduleView) => {
    if (viewProp === undefined) setInnerView(next)
    onViewChange?.(next)
  }

  const [innerDate, setInnerDate] = React.useState<Date>(() => defaultDate ?? today ?? new Date())
  const date = dateProp ?? innerDate
  const setDate = (next: Date) => {
    if (dateProp === undefined) setInnerDate(next)
    onDateChange?.(next)
  }

  const range = getViewRange(view, date, weekStartsOn, listDays)
  const visible = events
    .filter((e) => eventOverlapsRange(e, range.start, range.end))
    .sort(compareEvents)
  const title = formatPeriodTitle(view, date, weekStartsOn, listDays)
  const Heading = `h${headingLevel}` as const
  const subHeading = Math.min(headingLevel + 1, 6) as 3 | 4 | 5 | 6

  const context = React.useMemo<ScheduleContextValue>(
    () => ({
      allDayLabel: l.allDay,
      onEventClick: onEventClick as ScheduleContextValue["onEventClick"],
      renderEventDetails: renderEventDetails as ScheduleContextValue["renderEventDetails"],
      now,
    }),
    [l.allDay, onEventClick, renderEventDetails, now],
  )

  let body: React.ReactNode
  if (view === "month") {
    body = (
      <MonthView
        days={range.days}
        date={date}
        events={visible}
        todayLabel={l.today}
        moreLabel={l.more}
      />
    )
  } else if (view === "list") {
    body = (
      <ListView
        days={range.days}
        events={visible}
        headingLevel={subHeading}
        emptyLabel={l.empty}
        todayLabel={l.today}
      />
    )
  } else {
    body = (
      <TimeGridView
        days={range.days}
        events={visible}
        minHour={minHour}
        maxHour={maxHour}
        hourHeight={hourHeight}
        scrollToHour={scrollToHour}
        allDayLabel={l.allDay}
        todayLabel={l.today}
        moreLabel={l.more}
        maxColumns={maxColumns ?? (view === "day" ? 6 : 3)}
      />
    )
  }

  return (
    <ScheduleContext.Provider value={context}>
      <section
        data-slot="schedule"
        data-view={view}
        aria-labelledby={titleId}
        className={cn("flex min-w-0 flex-col gap-3 text-sm text-foreground", className)}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setDate(now)}>
            {l.today}
          </Button>
          <div className="flex items-center">
            <IconButton
              icon={<ChevronLeft />}
              label={l.previous[view]}
              onClick={() => setDate(shiftDate(view, date, -1, listDays))}
            />
            <IconButton
              icon={<ChevronRight />}
              label={l.next[view]}
              onClick={() => setDate(shiftDate(view, date, 1, listDays))}
            />
          </div>
          <Heading
            id={titleId}
            aria-live="polite"
            className="flex-1 text-lg font-semibold first-letter:uppercase"
          >
            {title}
          </Heading>
          {loading ? (
            <output
              data-slot="schedule-loading"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {l.loading}
            </output>
          ) : null}
          {views.length > 1 ? (
            <SegmentedControl
              label={l.viewSwitcher}
              size="sm"
              value={view}
              onValueChange={(next) => setView(next as ScheduleView)}
              options={views.map((v) => ({ value: v, label: l.views[v] }))}
            />
          ) : null}
        </div>
        <div
          data-slot="schedule-body"
          aria-busy={loading || undefined}
          // Not dimmed while loading: fading the events would drop their text
          // below WCAG contrast. The header spinner and aria-busy carry the state.
          className="overflow-hidden rounded-container border border-border-strong bg-card"
        >
          {body}
        </div>
      </section>
    </ScheduleContext.Provider>
  )
}

Schedule.displayName = "Schedule"

export { Schedule }
