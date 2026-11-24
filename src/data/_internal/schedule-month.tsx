"use client"

import { addDays, isSameDay, isSameMonth } from "date-fns"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Popover } from "../../overlays/popover"
import {
  compareEvents,
  eventOverlapsDay,
  eventOverlapsRange,
  formatDayLong,
  isBarEvent,
  isoDay,
  weekdayShort,
} from "./schedule-dates"
import { ScheduleContext, ScheduleEventButton, type ScheduleEventData } from "./schedule-event"
import { hiddenCountByColumn, layoutRow } from "./schedule-layout"

/** Lanes shown per week row before the rest collapses into "+N mais". */
export const MONTH_MAX_LANES = 3

interface MonthViewProps {
  /** Visible days (whole weeks). */
  days: Date[]
  /** The focused date — decides which month is "current". */
  date: Date
  events: ScheduleEventData[]
  todayLabel: string
  moreLabel: (count: number) => string
}

// Lanes of 26px: a 24px event (WCAG 2.2 target size) and 1px of air above and below.
const ROW_TEMPLATE = `1.75rem repeat(${MONTH_MAX_LANES}, 1.625rem) 1.625rem`

export function MonthView({ days, date, events, todayLabel, moreLabel }: MonthViewProps) {
  const { now } = React.useContext(ScheduleContext)
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

  return (
    <div data-slot="schedule-month" className="flex flex-col">
      <div aria-hidden="true" className="grid grid-cols-7 border-b bg-muted/50">
        {days.slice(0, 7).map((day) => (
          <div key={day.getDay()} className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            {weekdayShort(day)}
          </div>
        ))}
      </div>
      {weeks.map((week) => {
        const weekStart = week[0] as Date
        const weekEvents = events.filter((e) =>
          eventOverlapsRange(e, weekStart, addDays(weekStart, 7)),
        )
        const segments = layoutRow(weekEvents, week)
        const hidden = hiddenCountByColumn(segments, 7, MONTH_MAX_LANES)
        return (
          <div
            key={isoDay(weekStart)}
            data-slot="schedule-week-row"
            className="grid grid-cols-7 border-b last:border-b-0"
            style={{ gridTemplateRows: ROW_TEMPLATE }}
          >
            {week.map((day, col) => {
              const isToday = isSameDay(day, now)
              const outside = !isSameMonth(day, date)
              return (
                <div
                  key={isoDay(day)}
                  data-slot="schedule-day"
                  data-date={isoDay(day)}
                  data-outside={outside ? "true" : undefined}
                  aria-current={isToday ? "date" : undefined}
                  className={cn(
                    "min-w-0 px-1 pt-1",
                    col < 6 && "border-r",
                    outside && "bg-muted/40",
                  )}
                  style={{ gridColumn: col + 1, gridRow: "1 / -1" }}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
                      outside && "text-muted-foreground",
                      isToday && "bg-primary font-semibold text-primary-foreground",
                    )}
                  >
                    {day.getDate()}
                  </span>
                  <span className="sr-only">
                    {formatDayLong(day)}
                    {isToday ? `, ${todayLabel.toLowerCase()}` : ""}
                  </span>
                </div>
              )
            })}
            {segments
              .filter((s) => s.lane < MONTH_MAX_LANES)
              .map((s) => (
                <div
                  key={`${s.event.id}-${s.startCol}`}
                  className="relative min-w-0 px-0.5 py-px"
                  style={{ gridColumn: `${s.startCol + 1} / ${s.endCol + 2}`, gridRow: s.lane + 2 }}
                >
                  <ScheduleEventButton
                    event={s.event}
                    variant={isBarEvent(s.event) ? "bar" : "chip"}
                    continuesBefore={s.continuesBefore}
                    continuesAfter={s.continuesAfter}
                  />
                </div>
              ))}
            {hidden.map((count, col) =>
              count > 0 ? (
                <div
                  key={`more-${isoDay(week[col] as Date)}`}
                  className="relative min-w-0 px-0.5"
                  style={{ gridColumn: col + 1, gridRow: MONTH_MAX_LANES + 2 }}
                >
                  <MoreEvents
                    day={week[col] as Date}
                    count={count}
                    events={events}
                    moreLabel={moreLabel}
                  />
                </div>
              ) : null,
            )}
          </div>
        )
      })}
    </div>
  )
}

function MoreEvents({
  day,
  count,
  events,
  moreLabel,
}: {
  day: Date
  count: number
  events: ScheduleEventData[]
  moreLabel: (count: number) => string
}) {
  const dayLabel = formatDayLong(day)
  const dayEvents = events.filter((e) => eventOverlapsDay(e, day)).sort(compareEvents)
  return (
    <Popover
      trigger={
        <button
          type="button"
          data-slot="schedule-more"
          aria-label={`${moreLabel(count)}, ${dayLabel}`}
          className="w-full cursor-pointer truncate rounded-inner px-1 text-left text-xs font-medium leading-6 text-muted-foreground state-layer hover:text-foreground focus-visible:focus-outline-inset"
        >
          {moreLabel(count)}
        </button>
      }
      align="start"
      collisionPadding={8}
      aria-label={dayLabel}
      className="w-64 p-2"
    >
      <p className="px-1 pb-1.5 text-xs font-medium text-muted-foreground first-letter:uppercase">
        {dayLabel}
      </p>
      <ul className="flex flex-col gap-0.5">
        {dayEvents.map((event) => (
          <li key={event.id}>
            <ScheduleEventButton event={event} variant={isBarEvent(event) ? "bar" : "chip"} />
          </li>
        ))}
      </ul>
    </Popover>
  )
}
