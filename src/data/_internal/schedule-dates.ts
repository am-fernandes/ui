import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isSameYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { ptBR } from "date-fns/locale"

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

// date-fns' ptBR short names drop the accent ("sab") and the period ("nov"),
// so the abbreviations are spelled out here.
const WEEKDAYS_SHORT = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."] as const
const MONTHS_SHORT = [
  "jan.",
  "fev.",
  "mar.",
  "abr.",
  "mai.",
  "jun.",
  "jul.",
  "ago.",
  "set.",
  "out.",
  "nov.",
  "dez.",
] as const

export function weekdayShort(date: Date): string {
  return WEEKDAYS_SHORT[date.getDay()] as string
}

export function monthShort(date: Date): string {
  return MONTHS_SHORT[date.getMonth()] as string
}

/** "sábado, 21 de novembro" */
export function formatDayLong(date: Date): string {
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR })
}

/** "09:30" */
export function formatTime(date: Date): string {
  return format(date, "HH:mm")
}

/** "2026-11-21" — for `<time dateTime>` and stable keys. */
export function isoDay(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

/** "15 – 21 de nov. de 2026", "29 de nov. – 5 de dez. de 2026", "28 de dez. de 2026 – 3 de jan. de 2027" */
export function formatDayRange(first: Date, last: Date): string {
  const y2 = last.getFullYear()
  if (!isSameYear(first, last)) {
    return `${first.getDate()} de ${monthShort(first)} de ${first.getFullYear()} – ${last.getDate()} de ${monthShort(last)} de ${y2}`
  }
  if (!isSameMonth(first, last)) {
    return `${first.getDate()} de ${monthShort(first)} – ${last.getDate()} de ${monthShort(last)} de ${y2}`
  }
  if (isSameDay(first, last)) {
    return `${first.getDate()} de ${monthShort(first)} de ${y2}`
  }
  return `${first.getDate()} – ${last.getDate()} de ${monthShort(last)} de ${y2}`
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
): string {
  if (view === "month") return format(date, "MMMM 'de' yyyy", { locale: ptBR })
  if (view === "day") return formatDayLong(date)
  const { days } = getViewRange(view, date, weekStartsOn, listDays)
  return formatDayRange(days[0] as Date, days[days.length - 1] as Date)
}

/** First and last calendar day an event covers. */
export function eventDays(event: ScheduleEventInput): { first: Date; last: Date } {
  const first = startOfDay(event.start)
  if (event.end.getTime() <= event.start.getTime()) return { first, last: first }
  // All-day: `end` is the last day, inclusive. Timed: `end` is exclusive, so an
  // event ending at 00:00 does not spill into the next day.
  const last = event.allDay ? startOfDay(event.end) : startOfDay(new Date(event.end.getTime() - 1))
  // end > start here, so `last` is never before `first`.
  return { first, last }
}

/** All-day events and events crossing midnight render as bars; the rest as timed chips. */
export function isBarEvent(event: ScheduleEventInput): boolean {
  if (event.allDay) return true
  const { first, last } = eventDays(event)
  return last.getTime() !== first.getTime()
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
export function formatEventTime(event: ScheduleEventInput, allDayLabel: string): string {
  const { first, last } = eventDays(event)
  const multi = last.getTime() !== first.getTime()
  if (event.allDay) {
    return multi ? `${allDayLabel}, ${formatDayRange(first, last)}` : allDayLabel
  }
  if (multi) {
    return `${event.start.getDate()} de ${monthShort(event.start)}, ${formatTime(event.start)} – ${event.end.getDate()} de ${monthShort(event.end)}, ${formatTime(event.end)}`
  }
  return `${formatTime(event.start)} – ${formatTime(event.end)}`
}

/** Full accessible name: "Reunião, sábado, 21 de novembro, 09:00 – 10:30". */
export function eventAccessibleName(event: ScheduleEventInput, allDayLabel: string): string {
  const { first, last } = eventDays(event)
  const multi = last.getTime() !== first.getTime()
  if (multi) return `${event.title}, ${formatEventTime(event, allDayLabel.toLowerCase())}`
  const day = formatDayLong(first)
  if (event.allDay) return `${event.title}, ${day}, ${allDayLabel.toLowerCase()}`
  return `${event.title}, ${day}, ${formatEventTime(event, allDayLabel)}`
}

/**
 * Time column of a list row, already grouped under `day`: "09:00 – 10:30",
 * "22:00 – …" on the first day of an event crossing midnight, "… – 04:00" on
 * its last day, and the all-day label otherwise.
 */
export function formatRowTime(event: ScheduleEventInput, day: Date, allDayLabel: string): string {
  if (event.allDay) return allDayLabel
  const { first, last } = eventDays(event)
  const d = startOfDay(day).getTime()
  const startsToday = first.getTime() === d
  const endsToday = last.getTime() === d
  if (startsToday && endsToday) return `${formatTime(event.start)} – ${formatTime(event.end)}`
  if (startsToday) return `${formatTime(event.start)} – …`
  if (endsToday) return `… – ${formatTime(event.end)}`
  return allDayLabel
}
