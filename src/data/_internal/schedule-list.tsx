"use client"

import { isSameDay } from "date-fns"
import { CalendarDays } from "lucide-react"
import * as React from "react"

import { EmptyState } from "../empty-state"
import { compareEvents, eventOverlapsDay, formatDayLong, isoDay } from "./schedule-dates"
import { ScheduleContext, ScheduleEventButton, type ScheduleEventData } from "./schedule-event"

interface ListViewProps {
  days: Date[]
  events: ScheduleEventData[]
  /** Heading level of the day headings (one below the schedule title). */
  headingLevel: 3 | 4 | 5 | 6
  emptyLabel: string
  todayLabel: string
}

export function ListView({ days, events, headingLevel, emptyLabel, todayLabel }: ListViewProps) {
  const { now, locale } = React.useContext(ScheduleContext)
  const Heading = `h${headingLevel}` as const
  const idPrefix = React.useId()
  const groups = days
    .map((day) => ({
      day,
      events: events.filter((e) => eventOverlapsDay(e, day)).sort(compareEvents),
    }))
    .filter((group) => group.events.length > 0)

  if (groups.length === 0) {
    return (
      <EmptyState compact icon={<CalendarDays />} title={emptyLabel} headingLevel={headingLevel} />
    )
  }

  return (
    <div data-slot="schedule-list" className="flex flex-col divide-y">
      {groups.map(({ day, events: dayEvents }) => {
        const isToday = now != null && isSameDay(day, now)
        const headingId = `${idPrefix}-${isoDay(day)}`
        return (
          <section key={isoDay(day)} aria-labelledby={headingId} className="px-2 py-3">
            <Heading
              id={headingId}
              aria-current={isToday ? "date" : undefined}
              className="flex items-center gap-2 px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {formatDayLong(day, locale)}
              {isToday ? (
                <span className="rounded-inner bg-primary px-1.5 py-0.5 text-xs text-primary-foreground normal-case tracking-normal">
                  {todayLabel}
                </span>
              ) : null}
            </Heading>
            <ul className="flex flex-col">
              {dayEvents.map((event) => (
                <li key={event.id}>
                  <ScheduleEventButton event={event} variant="row" day={day} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
