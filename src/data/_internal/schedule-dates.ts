import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMilliseconds,
} from "date-fns"

export type ScheduleView = "month" | "week" | "day" | "list"

export type ScheduleColor =
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "blue"
  | "purple"
  | "pink"

export interface ScheduleEventInput {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  color?: ScheduleColor
}

export type WeekStart = 0 | 1

/**
 * Names and formats come from `Intl.DateTimeFormat` in the schedule's
 * `locale` ("pt-BR" by default): "dom.", "nov.", "sábado, 21 de novembro",
 * "15 – 21 de nov. de 2026". Another locale gets its own words and order.
 */
export const DEFAULT_LOCALE = "pt-BR"

interface Formatter {
  format: (date: Date) => string
  formatRange: (start: Date, end: Date) => string
}

// Intl puts thin and no-break spaces around the dash of a range ("15 – 21");
// plain spaces keep the text the same to copy, search and test.
const plainSpaces = (text: string) => text.replace(/[\u2009\u202f\u00a0]/g, " ")

/**
 * The wall clock of `date` as the same numbers in UTC. Inside the schedule
 * every date is a `TZDate` of its `timeZone`, whose getters give that zone's
 * day and hour; printed from UTC, the text is that wall clock on any machine.
 * `Intl` without a `timeZone` printed the machine's: the server (in UTC) and
 * the browser (in Brasília) wrote different hours, and hydration failed.
 */
function asWallClock(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds(),
    ),
  )
}

const formatters = new Map<string, Formatter>()
function formatter(locale: string, options: Intl.DateTimeFormatOptions): Formatter {
  const key = `${locale}|${JSON.stringify(options)}`
  let f = formatters.get(key)
  if (!f) {
    const intl = new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" })
    f = {
      format: (date) => plainSpaces(intl.format(asWallClock(date))),
      formatRange: (start, end) =>
        plainSpaces(intl.formatRange(asWallClock(start), asWallClock(end))),
    }
    formatters.set(key, f)
  }
  return f
}

export function weekdayShort(date: Date, locale = DEFAULT_LOCALE): string {
  return formatter(locale, { weekday: "short" }).format(date)
}

export function monthShort(date: Date, locale = DEFAULT_LOCALE): string {
  return formatter(locale, { month: "short" }).format(date)
}

/** "sábado, 21 de novembro" */
export function formatDayLong(date: Date, locale = DEFAULT_LOCALE): string {
  return formatter(locale, { weekday: "long", day: "numeric", month: "long" }).format(date)
}

/** "09:30" */
export function formatTime(date: Date, locale = DEFAULT_LOCALE): string {
  return formatter(locale, { hour: "2-digit", minute: "2-digit" }).format(date)
}

/** "2026-11-21" — for `<time dateTime>` and stable keys. */
export function isoDay(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

/** "15 – 21 de nov. de 2026", "29 de nov. – 5 de dez. de 2026", "28 de dez. de 2026 – 3 de jan. de 2027" */
export function formatDayRange(first: Date, last: Date, locale = DEFAULT_LOCALE): string {
  const f = formatter(locale, { day: "numeric", month: "short", year: "numeric" })
  if (isSameDay(first, last)) return f.format(first)
  return f.formatRange(first, last)
}

export interface ViewRange {
  /** First visible day (00:00). */
  start: Date
  /** Day after the last visible day (00:00) — exclusive. */
  end: Date
  /** Every visible day, in order. */
  days: Date[]
}

export function getViewRange(
  view: ScheduleView,
  date: Date,
  weekStartsOn: WeekStart,
  listDays: number,
): ViewRange {
  let start: Date
  let count: number
  switch (view) {
    case "month": {
      start = startOfWeek(startOfMonth(date), { weekStartsOn })
      const last = endOfWeek(endOfMonth(date), { weekStartsOn })
      count = differenceInCalendarDays(last, start) + 1
      break
    }
    case "week":
      start = startOfWeek(date, { weekStartsOn })
      count = 7
      break
    case "day":
      start = startOfDay(date)
      count = 1
      break
    default:
      start = startOfDay(date)
      count = Math.max(1, Math.floor(listDays))
  }
  const days = Array.from({ length: count }, (_, i) => addDays(start, i))
  return { start, end: addDays(start, count), days }
}

/** Date one period before (-1) or after (+1) `date`, for the prev/next buttons. */
export function shiftDate(
  view: ScheduleView,
  date: Date,
  direction: 1 | -1,
  listDays: number,
): Date {
  switch (view) {
    case "month":
      return addMonths(date, direction)
    case "week":
      return addWeeks(date, direction)
    case "day":
      return addDays(date, direction)
    default:
      return addDays(date, direction * Math.max(1, Math.floor(listDays)))
  }
}

/** Heading of the period on screen. */
export function formatPeriodTitle(
  view: ScheduleView,
  date: Date,
  weekStartsOn: WeekStart,
  listDays: number,
  locale = DEFAULT_LOCALE,
): string {
  if (view === "month") return formatter(locale, { month: "long", year: "numeric" }).format(date)
  if (view === "day") return formatDayLong(date, locale)
  const { days } = getViewRange(view, date, weekStartsOn, listDays)
  return formatDayRange(days[0] as Date, days[days.length - 1] as Date, locale)
}

/** First and last calendar day an event covers. */
export function eventDays(event: ScheduleEventInput): { first: Date; last: Date } {
  const first = startOfDay(event.start)
  if (event.end.getTime() <= event.start.getTime()) return { first, last: first }
  // All-day: `end` is the last day, inclusive. Timed: `end` is exclusive, so an
  // event ending at 00:00 does not spill into the next day.
  // (subMilliseconds keeps the date's zone; a `new Date` would take the machine's.)
  const last = event.allDay ? startOfDay(event.end) : startOfDay(subMilliseconds(event.end, 1))
  // end > start here, so `last` is never before `first`.
  return { first, last }
}

/** Month view: all-day events and events crossing midnight render as bars; the rest as chips. */
export function isBarEvent(event: ScheduleEventInput): boolean {
  if (event.allDay) return true
  const { first, last } = eventDays(event)
  return last.getTime() !== first.getTime()
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Week and day views: what goes to the "Dia inteiro" row. All-day events and
 * timed events of 24 hours or more. A shorter timed event that crosses
 * midnight (a 22:00–01:00 shift) stays in the time grid, drawn on both days.
 */
export function isAllDayRowEvent(event: ScheduleEventInput): boolean {
  if (event.allDay) return true
  return event.end.getTime() - event.start.getTime() >= DAY_MS
}

export function eventOverlapsDay(event: ScheduleEventInput, day: Date): boolean {
  const { first, last } = eventDays(event)
  const d = startOfDay(day).getTime()
  return first.getTime() <= d && d <= last.getTime()
}

export function eventOverlapsRange(event: ScheduleEventInput, start: Date, end: Date): boolean {
  const { first, last } = eventDays(event)
  return first.getTime() < end.getTime() && last.getTime() >= start.getTime()
}

/** Chronological order: earlier first, all-day before timed, longer first. */
export function compareEvents(a: ScheduleEventInput, b: ScheduleEventInput): number {
  const da = eventDays(a)
  const db = eventDays(b)
  if (da.first.getTime() !== db.first.getTime()) return da.first.getTime() - db.first.getTime()
  if (Boolean(a.allDay) !== Boolean(b.allDay)) return a.allDay ? -1 : 1
  if (a.start.getTime() !== b.start.getTime()) return a.start.getTime() - b.start.getTime()
  if (b.end.getTime() !== a.end.getTime()) return b.end.getTime() - a.end.getTime()
  return a.title.localeCompare(b.title, "pt-BR")
}

/** "09:00 – 10:30", or with dates when the event crosses midnight. */
export function formatEventTime(
  event: ScheduleEventInput,
  allDayLabel: string,
  locale = DEFAULT_LOCALE,
): string {
  const { first, last } = eventDays(event)
  const multi = last.getTime() !== first.getTime()
  if (event.allDay) {
    return multi ? `${allDayLabel}, ${formatDayRange(first, last, locale)}` : allDayLabel
  }
  if (multi) {
    return formatter(locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).formatRange(event.start, event.end)
  }
  return `${formatTime(event.start, locale)} – ${formatTime(event.end, locale)}`
}

/** Full accessible name: "Reunião, sábado, 21 de novembro, 09:00 – 10:30". */
export function eventAccessibleName(
  event: ScheduleEventInput,
  allDayLabel: string,
  locale = DEFAULT_LOCALE,
): string {
  const { first, last } = eventDays(event)
  const multi = last.getTime() !== first.getTime()
  if (multi) return `${event.title}, ${formatEventTime(event, allDayLabel.toLowerCase(), locale)}`
  const day = formatDayLong(first, locale)
  if (event.allDay) return `${event.title}, ${day}, ${allDayLabel.toLowerCase()}`
  return `${event.title}, ${day}, ${formatEventTime(event, allDayLabel, locale)}`
}

/**
 * The accessible name of an event as a variant draws it. It starts with the
 * text on the event, in the order the eye reads it (WCAG 2.5.3, Label in
 * Name: someone using voice control says what is on screen), and goes on
 * with what the event does not show, the day and the full time.
 *
 * - chip (month): "15:00 Comitê de obras, terça-feira, 3 de novembro, 15:00 – 16:30"
 * - block (week, day): "Comitê de obras, 15:00 – 16:30, terça-feira, 3 de novembro"
 * - row (list): "09:00 – 10:30 Daily, quarta-feira, 18 de novembro"
 * - bar (all day, several days): the title leads, as in `eventAccessibleName`
 */
export function eventNameAsShown(
  variant: "chip" | "bar" | "block" | "row",
  event: ScheduleEventInput,
  allDayLabel: string,
  locale = DEFAULT_LOCALE,
  options: { showTime?: boolean; day?: Date } = {},
): string {
  const name = eventAccessibleName(event, allDayLabel, locale)
  if (variant === "row") {
    const day = options.day ?? event.start
    return `${formatRowTime(event, day, allDayLabel, locale)} ${event.title}, ${formatDayLong(day, locale)}`
  }
  if (event.allDay) return name
  if (variant === "chip") return `${formatTime(event.start, locale)} ${name}`
  if (variant === "block" && options.showTime !== false) {
    const { first, last } = eventDays(event)
    // Several days: the name is already the title, then the time.
    if (last.getTime() !== first.getTime()) return name
    return `${event.title}, ${formatEventTime(event, allDayLabel, locale)}, ${formatDayLong(first, locale)}`
  }
  return name
}

/**
 * Time column of a list row, already grouped under `day`: "09:00 – 10:30",
 * "22:00 – …" on the first day of an event crossing midnight, "… – 04:00" on
 * its last day, and the all-day label otherwise.
 */
export function formatRowTime(
  event: ScheduleEventInput,
  day: Date,
  allDayLabel: string,
  locale = DEFAULT_LOCALE,
): string {
  if (event.allDay) return allDayLabel
  const { first, last } = eventDays(event)
  const d = startOfDay(day).getTime()
  const startsToday = first.getTime() === d
  const endsToday = last.getTime() === d
  const time = (date: Date) => formatTime(date, locale)
  if (startsToday && endsToday) return `${time(event.start)} – ${time(event.end)}`
  if (startsToday) return `${time(event.start)} – …`
  if (endsToday) return `… – ${time(event.end)}`
  return allDayLabel
}
