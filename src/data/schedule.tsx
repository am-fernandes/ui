"use client"

import { TZDate } from "@date-fns/tz"
import { isValid } from "date-fns"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import * as React from "react"

import { DEFAULT_TIME_ZONE } from "@/lib/date"
import { cn } from "@/lib/utils"
import { useHydrated } from "../primitives/_internal/use-hydrated"
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
  /** Name of the button on a day that calls `onSlotClick` ("Novo evento em sábado, 21 de novembro"). */
  newEvent: (day: string) => string
  /** Name of the scrolling grid of hours (week and day views). */
  timeGrid: string
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
  newEvent: (day) => `Novo evento em ${day}`,
  timeGrid: "Grade de horários",
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
  /**
   * Focused date of an uncontrolled schedule. Without it (and without `date`
   * and `today`), the server renders the frame and the period comes in the
   * browser: the server cannot know the browser's date. Pass it to have the
   * period in the server HTML.
   */
  defaultDate?: Date
  onDateChange?: (date: Date) => void
  /**
   * What counts as "today" (highlight, "Hoje" button, current-time line).
   * Defaults to the real clock, refreshed every minute, read once the page
   * is in the browser: the server renders no "today" and no current-time
   * line. Pass a fixed date for deterministic renders (tests, screenshots,
   * a server render with "today" in it).
   */
  today?: Date
  /**
   * Time zone the days and hours are shown in, an IANA name. Events are
   * instants (`Date`s); a meeting at 13:00 in São Paulo sits at 13:00 on any
   * machine, server or browser, so the server HTML and the hydration agree.
   * All-day events start at midnight of this zone.
   * @default "America/Sao_Paulo"
   */
  timeZone?: string
  /**
   * Click on an event. Without it (and without `renderEventDetails`) the
   * events are plain content, not buttons, so the keyboard does not stop on
   * each of them.
   */
  onEventClick?: (event: ScheduleEvent) => void
  /**
   * Click on an empty day (month) or time slot (week, day): receives the
   * day at 00:00, or the time clicked rounded down to the half hour. From
   * the keyboard, each day's number or header becomes a button that gives
   * the day at `scrollToHour`. Use it to start "Agendar visita".
   */
  onSlotClick?: (date: Date) => void
  /**
   * Called with the period on screen whenever it changes, and once on
   * mount: fetch the events of `{ start, end }` (end exclusive). Same range
   * as `getScheduleRange`.
   */
  onRangeChange?: (range: { start: Date; end: Date; view: ScheduleView }) => void
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
  /**
   * Week/day views: most height of the scrolling grid of hours. A number is
   * px. Pass `"none"` to show every hour without an inner scroll.
   * @default "36rem"
   */
  timeGridMaxHeight?: number | string
  /** Month view: events shown per day before "+N mais". @default 3 */
  monthMaxEvents?: number
  /** List view: days shown from `date`. @default 7 */
  listDays?: number
  /** Shows a spinner with "Carregando…" in the header and marks the body `aria-busy`. */
  loading?: boolean
  /**
   * Language of the day and month names and of the date formats, as a BCP 47
   * tag ("pt-BR", "en-US", "es"). The fixed texts come from `labels`.
   * @default "pt-BR"
   */
  locale?: string
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
 * `events` (`Date`s, shown in `timeZone`) and the schedule lays them out —
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
  today: todayProp,
  timeZone = DEFAULT_TIME_ZONE,
  onEventClick,
  onSlotClick,
  onRangeChange,
  renderEventDetails,
  weekStartsOn = 0,
  minHour = 0,
  maxHour = 24,
  scrollToHour = 8,
  hourHeight = 48,
  maxColumns,
  timeGridMaxHeight = "36rem",
  monthMaxEvents = 3,
  listDays = 7,
  loading = false,
  locale = "pt-BR",
  headingLevel = 2,
  labels,
  className,
}: ScheduleProps) {
  const l = mergeLabels(labels)
  const titleId = React.useId()

  // Every date inside is a TZDate of `timeZone`: date-fns does its sums in
  // that zone, and the texts print its wall clock (schedule-dates.ts). With
  // the machine's zone, a server in UTC and a browser in Brasília wrote
  // different hours and days, and React threw the server HTML away.
  const zoned = React.useCallback((date: Date) => new TZDate(date.getTime(), timeZone), [timeZone])
  const plain = (date: Date) => new Date(date.getTime())

  // An invalid `today` (a malformed date from the server) counts as none: it
  // gave no period, no "today" and an Invalid Date to the "Hoje" button.
  const today = todayProp && isValid(todayProp) ? todayProp : undefined
  // The browser's clock, read once the page is in the browser: on the server
  // and while hydrating there is no "now" (unless `today` gives one).
  const hydrated = useHydrated()
  const [clock, setClock] = React.useState(() => new Date())
  React.useEffect(() => {
    if (today) return
    setClock(new Date())
    const id = window.setInterval(() => setClock(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [today])
  const nowInstant = today ?? (hydrated ? clock : null)
  // Kept while the instant is the same: a new Date of the same time would
  // re-render every event.
  const nowTime = nowInstant?.getTime()
  const now = React.useMemo(
    () => (nowTime == null ? null : zoned(new Date(nowTime))),
    [nowTime, zoned],
  )

  const [innerView, setInnerView] = React.useState<ScheduleView>(defaultView)
  const view = viewProp ?? innerView
  const setView = (next: ScheduleView) => {
    if (viewProp === undefined) setInnerView(next)
    onViewChange?.(next)
  }

  const [innerDate, setInnerDate] = React.useState<Date | null>(defaultDate ?? today ?? null)
  // Without a date of its own, the period is the one of when the schedule
  // appeared in the browser, and stays: the clock moves "today", not the
  // period the user is looking at.
  const [mountedAt] = React.useState(() => new Date())
  const focused = [dateProp, innerDate, today, hydrated ? mountedAt : null].find(isValid) ?? null
  const setDate = (next: Date) => {
    if (dateProp === undefined) setInnerDate(plain(next))
    onDateChange?.(plain(next))
  }

  // The events in the zone, each pointing back at the app's own object for
  // the callbacks.
  const zonedEvents = React.useMemo(() => {
    const originals = new WeakMap<ScheduleEvent, ScheduleEvent>()
    const list = events.map((event) => {
      const copy = { ...event, start: zoned(event.start), end: zoned(event.end) }
      originals.set(copy, event)
      return copy
    })
    return { list, original: (event: ScheduleEvent) => originals.get(event) ?? event }
  }, [events, zoned])

  const focusedTime = focused?.getTime()
  const date = React.useMemo(
    () => (focusedTime == null ? null : zoned(new Date(focusedTime))),
    [focusedTime, zoned],
  )
  const range = date ? getViewRange(view, date, weekStartsOn, listDays) : null
  const rangeStart = range?.start.getTime() ?? null
  const rangeEnd = range?.end.getTime() ?? null
  const onRangeChangeRef = React.useRef(onRangeChange)
  onRangeChangeRef.current = onRangeChange
  React.useEffect(() => {
    if (rangeStart == null || rangeEnd == null) return
    onRangeChangeRef.current?.({ start: new Date(rangeStart), end: new Date(rangeEnd), view })
  }, [rangeStart, rangeEnd, view])
  // Filtered and sorted only when the events or the period change, not on
  // every render (the clock ticks every minute).
  const visible = React.useMemo(
    () =>
      rangeStart == null || rangeEnd == null
        ? []
        : zonedEvents.list
            .filter((e) => eventOverlapsRange(e, new Date(rangeStart), new Date(rangeEnd)))
            .sort(compareEvents),
    [zonedEvents, rangeStart, rangeEnd],
  )
  const Heading = `h${headingLevel}` as const
  const subHeading = Math.min(headingLevel + 1, 6) as 3 | 4 | 5 | 6

  // The app hears its own events and plain Dates, not the zoned copies.
  const { original } = zonedEvents
  const context = React.useMemo<ScheduleContextValue>(
    () => ({
      allDayLabel: l.allDay,
      onEventClick: onEventClick
        ? (((event) =>
            onEventClick(original(event as ScheduleEvent))) as ScheduleContextValue["onEventClick"])
        : undefined,
      renderEventDetails: renderEventDetails
        ? (((event) =>
            renderEventDetails(
              original(event as ScheduleEvent),
            )) as ScheduleContextValue["renderEventDetails"])
        : undefined,
      now,
      onSlotClick: onSlotClick ? (slot: Date) => onSlotClick(new Date(slot.getTime())) : undefined,
      newEventLabel: l.newEvent,
      locale,
    }),
    [l.allDay, onEventClick, renderEventDetails, original, now, onSlotClick, l.newEvent, locale],
  )

  // No date yet (on the server and while hydrating, with no `date`,
  // `defaultDate` or `today`): the frame, and the period once in the browser.
  if (date == null || range == null) {
    return (
      <ScheduleFrame
        className={className}
        view={view}
        views={views}
        labels={l}
        titleId={titleId}
        heading={Heading}
        loading={loading}
        onViewChange={setView}
      />
    )
  }
  const title = formatPeriodTitle(view, date, weekStartsOn, listDays, locale)

  let body: React.ReactNode
  if (view === "month") {
    body = (
      <MonthView
        days={range.days}
        date={date}
        events={visible}
        todayLabel={l.today}
        moreLabel={l.more}
        maxLanes={Math.max(1, Math.floor(monthMaxEvents))}
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
        loading={loading}
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
        slotHour={scrollToHour}
        timeGridLabel={l.timeGrid}
        maxHeight={timeGridMaxHeight}
        maxColumns={maxColumns ?? (view === "day" ? 6 : 3)}
      />
    )
  }

  return (
    <ScheduleContext.Provider value={context}>
      <ScheduleFrame
        className={className}
        view={view}
        views={views}
        labels={l}
        titleId={titleId}
        heading={Heading}
        title={title}
        loading={loading}
        onViewChange={setView}
        onToday={() => setDate(now ?? new Date())}
        onPrevious={() => setDate(shiftDate(view, date, -1, listDays))}
        onNext={() => setDate(shiftDate(view, date, 1, listDays))}
      >
        {body}
      </ScheduleFrame>
    </ScheduleContext.Provider>
  )
}

/**
 * The header and the box of the schedule. Without `children` (no date yet:
 * on the server and while hydrating, with nothing to take the date from)
 * the box is empty and busy, at the height the grid will take, so the page
 * does not jump when the period comes in.
 */
function ScheduleFrame({
  className,
  view,
  views,
  labels: l,
  titleId,
  heading: Heading,
  title,
  loading,
  onViewChange,
  onToday,
  onPrevious,
  onNext,
  children,
}: {
  className?: string
  view: ScheduleView
  views: ScheduleView[]
  labels: ScheduleLabels
  titleId: string
  heading: `h${2 | 3 | 4 | 5 | 6}`
  title?: string
  loading: boolean
  onViewChange: (view: ScheduleView) => void
  onToday?: () => void
  onPrevious?: () => void
  onNext?: () => void
  children?: React.ReactNode
}) {
  const pending = children == null
  return (
    <section
      data-slot="schedule"
      data-view={view}
      data-pending={pending ? "" : undefined}
      aria-labelledby={titleId}
      className={cn("flex min-w-0 flex-col gap-3 text-sm text-foreground", className)}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={onToday}>
          {l.today}
        </Button>
        <div className="flex items-center">
          <IconButton icon={<ChevronLeft />} label={l.previous[view]} onClick={onPrevious} />
          <IconButton icon={<ChevronRight />} label={l.next[view]} onClick={onNext} />
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
            onValueChange={(next) => onViewChange(next as ScheduleView)}
            options={views.map((v) => ({ value: v, label: l.views[v] }))}
          />
        ) : null}
      </div>
      <div
        data-slot="schedule-body"
        aria-busy={loading || pending || undefined}
        // Not dimmed while loading: fading the events would drop their text
        // below WCAG contrast. The header spinner and aria-busy carry the state.
        className={cn(
          "overflow-hidden rounded-container border border-border-strong bg-card",
          pending && "min-h-96",
        )}
      >
        {children}
      </div>
    </section>
  )
}

Schedule.displayName = "Schedule"

/**
 * The period a view shows, the same one `onRangeChange` reports: `start` is
 * the first visible day at 00:00 and `end` the day after the last one
 * (exclusive), midnights of `timeZone` (São Paulo unless you pass the
 * schedule's). Use it to fetch the events before the first render.
 */
function getScheduleRange(
  view: ScheduleView,
  date: Date,
  options: { weekStartsOn?: WeekStart; listDays?: number; timeZone?: string } = {},
): { start: Date; end: Date } {
  const zoned = new TZDate(date.getTime(), options.timeZone ?? DEFAULT_TIME_ZONE)
  const { start, end } = getViewRange(view, zoned, options.weekStartsOn ?? 0, options.listDays ?? 7)
  return { start: new Date(start.getTime()), end: new Date(end.getTime()) }
}

export { Schedule, getScheduleRange }
