"use client"

import { addDays, isSameDay } from "date-fns"
import * as React from "react"

import { cn } from "@/lib/utils"
import {
  eventOverlapsDay,
  eventOverlapsRange,
  formatDayLong,
  isBarEvent,
  isoDay,
  weekdayShort,
} from "./schedule-dates"
import { ScheduleContext, ScheduleEventButton, type ScheduleEventData } from "./schedule-event"
import { layoutDayColumn, layoutRow } from "./schedule-layout"

interface TimeGridViewProps {
  days: Date[]
  events: ScheduleEventData[]
  minHour: number
  maxHour: number
  hourHeight: number
  scrollToHour: number
  allDayLabel: string
  todayLabel: string
}

const GUTTER = "3.5rem"
// Header rows reserve the same scrollbar gutter as the scrolling body, so the
// day columns line up whatever the platform's scrollbar width is.
const stableGutter = "overflow-y-hidden [scrollbar-gutter:stable]"

export function TimeGridView({
  days,
  events,
  minHour,
  maxHour,
  hourHeight,
  scrollToHour,
  allDayLabel,
  todayLabel,
}: TimeGridViewProps) {
  const { now } = React.useContext(ScheduleContext)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const columns = `${GUTTER} repeat(${days.length}, minmax(0, 1fr))`
  const hours = Array.from({ length: Math.max(0, maxHour - minHour) }, (_, i) => minHour + i)
  const totalHeight = hours.length * hourHeight
  const first = days[0] as Date
  const rangeEnd = addDays(first, days.length)

  const bars = events.filter((e) => isBarEvent(e) && eventOverlapsRange(e, first, rangeEnd))
  const barSegments = layoutRow(bars, days)
  const barLanes = barSegments.reduce((max, s) => Math.max(max, s.lane + 1), 0)

  React.useLayoutEffect(() => {
    // The ref is attached by the time layout effects run.
    const el = scrollRef.current as HTMLDivElement
    // A few px less, so the label of `scrollToHour` (centred on its line) is not cut.
    el.scrollTop = Math.max(0, (scrollToHour - minHour) * hourHeight - 8)
  }, [scrollToHour, minHour, hourHeight])

  const nowMinutes = (now.getHours() - minHour) * 60 + now.getMinutes()
  const nowVisible = nowMinutes >= 0 && nowMinutes <= hours.length * 60

  return (
    <div data-slot="schedule-time-grid" className="flex flex-col">
      <div
        className={cn("grid border-b bg-muted/50", stableGutter)}
        style={{ gridTemplateColumns: columns }}
      >
        <div aria-hidden="true" />
        {days.map((day) => {
          const isToday = isSameDay(day, now)
          return (
            <div
              key={isoDay(day)}
              data-slot="schedule-day-header"
              data-date={isoDay(day)}
              aria-current={isToday ? "date" : undefined}
              className="flex min-w-0 flex-col items-center justify-center gap-0.5 border-l px-0.5 py-1 text-xs sm:flex-row sm:gap-1 sm:px-1 sm:py-1.5"
            >
              <span aria-hidden="true" className="truncate text-muted-foreground">
                {weekdayShort(day)}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full tabular-nums",
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
      </div>

      {barLanes > 0 ? (
        <div
          data-slot="schedule-all-day"
          className={cn("grid border-b", stableGutter)}
          style={{ gridTemplateColumns: columns }}
        >
          <div className="flex items-start justify-end px-1.5 py-1 text-right text-[11px] leading-4 text-muted-foreground">
            {allDayLabel}
          </div>
          <div
            className="grid py-0.5"
            style={{
              gridColumn: `2 / ${days.length + 2}`,
              gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${barLanes}, 1.375rem)`,
            }}
          >
            {barSegments.map((s) => (
              <div
                key={`${s.event.id}-${s.startCol}`}
                className="min-w-0 px-0.5 py-px"
                style={{ gridColumn: `${s.startCol + 1} / ${s.endCol + 2}`, gridRow: s.lane + 1 }}
              >
                <ScheduleEventButton
                  event={s.event}
                  variant="bar"
                  continuesBefore={s.continuesBefore}
                  continuesAfter={s.continuesAfter}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div
        ref={scrollRef}
        data-slot="schedule-scroll"
        className="relative max-h-[36rem] overflow-y-auto [scrollbar-gutter:stable]"
      >
        <div className="grid" style={{ gridTemplateColumns: columns, height: totalHeight }}>
          <div aria-hidden="true" className="relative">
            {hours.map((hour, i) =>
              i === 0 ? null : (
                <span
                  key={hour}
                  className="absolute right-1.5 -translate-y-1/2 text-[11px] tabular-nums leading-none text-muted-foreground"
                  style={{ top: i * hourHeight }}
                >
                  {`${String(hour).padStart(2, "0")}:00`}
                </span>
              ),
            )}
          </div>
          {days.map((day) => {
            const timed = events.filter((e) => !isBarEvent(e) && eventOverlapsDay(e, day))
            const placements = layoutDayColumn(timed, day, minHour, maxHour, hourHeight)
            const isToday = isSameDay(day, now)
            return (
              <div
                key={isoDay(day)}
                data-slot="schedule-day-column"
                data-date={isoDay(day)}
                className="relative border-l"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
                  backgroundSize: `100% ${hourHeight}px`,
                }}
              >
                {placements.map((p) => (
                  <ScheduleEventButton
                    key={p.event.id}
                    event={p.event}
                    variant="block"
                    showTime={p.height >= 36}
                    style={{
                      top: p.top + 1,
                      height: p.height - 2,
                      left: `calc(${(p.column / p.columns) * 100}% + 2px)`,
                      width: `calc(${100 / p.columns}% - 4px)`,
                    }}
                  />
                ))}
                {isToday && nowVisible ? (
                  <div
                    aria-hidden="true"
                    data-slot="schedule-now"
                    className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-destructive"
                    style={{ top: (nowMinutes / 60) * hourHeight }}
                  >
                    <span className="absolute -left-1 -top-[5px] size-2 rounded-full bg-destructive" />
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
