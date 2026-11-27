"use client"

import { addDays, isSameDay, setMinutes, startOfDay } from "date-fns"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Popover } from "../../overlays/popover"
import {
  eventOverlapsDay,
  eventOverlapsRange,
  formatDayLong,
  isAllDayRowEvent,
  isoDay,
  weekdayShort,
} from "./schedule-dates"
import { ScheduleContext, ScheduleEventButton, type ScheduleEventData } from "./schedule-event"
import { type ColumnOverflow, layoutDayColumn, layoutRow, limitColumns } from "./schedule-layout"

interface TimeGridViewProps {
  days: Date[]
  events: ScheduleEventData[]
  minHour: number
  maxHour: number
  hourHeight: number
  scrollToHour: number
  allDayLabel: string
  todayLabel: string
  moreLabel: (count: number) => string
  /** Most events side by side in a day column; the rest go to a "+N". */
  maxColumns: number
  /** Hour the keyboard's "new event" button of a day gives to `onSlotClick`. */
  slotHour: number
  /** Name of the scrolling grid. */
  timeGridLabel: string
  /** Most height of the scrolling grid. */
  maxHeight: number | string
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
  moreLabel,
  maxColumns,
  slotHour,
  timeGridLabel,
  maxHeight,
}: TimeGridViewProps) {
  const { now, onSlotClick, newEventLabel, locale } = React.useContext(ScheduleContext)
  // The day's own zone: `new Date(y, m, d, 0, minutes)` was the machine's.
  const at = (day: Date, minutes: number) => setMinutes(startOfDay(day), minutes)
  const scrollRef = React.useRef<HTMLElement>(null)
  const columns = `${GUTTER} repeat(${days.length}, minmax(0, 1fr))`
  const hours = Array.from({ length: Math.max(0, maxHour - minHour) }, (_, i) => minHour + i)
  const totalHeight = hours.length * hourHeight
  const first = days[0] as Date
  const rangeEnd = addDays(first, days.length)

  const bars = events.filter((e) => isAllDayRowEvent(e) && eventOverlapsRange(e, first, rangeEnd))
  const barSegments = layoutRow(bars, days)
  const barLanes = barSegments.reduce((max, s) => Math.max(max, s.lane + 1), 0)

  React.useLayoutEffect(() => {
    // The ref is attached by the time layout effects run.
    const el = scrollRef.current as HTMLElement
    // A few px less, so the label of `scrollToHour` (centred on its line) is not cut.
    el.scrollTop = Math.max(0, (scrollToHour - minHour) * hourHeight - 8)
  }, [scrollToHour, minHour, hourHeight])

  // No `now` yet (on the server and while hydrating, without `today`): no
  // current-time line and no day marked as today.
  const nowMinutes = now ? (now.getHours() - minHour) * 60 + now.getMinutes() : -1
  const nowVisible = nowMinutes >= 0 && nowMinutes <= hours.length * 60

  return (
    <div data-slot="schedule-time-grid" className="flex flex-col">
      <div
        className={cn("grid border-b bg-muted/50", stableGutter)}
        style={{ gridTemplateColumns: columns }}
      >
        <div aria-hidden="true" />
        {days.map((day) => {
          const isToday = now != null && isSameDay(day, now)
          return (
            <div
              key={isoDay(day)}
              data-slot="schedule-day-header"
              data-date={isoDay(day)}
              aria-current={isToday ? "date" : undefined}
              className="flex min-w-0 flex-col items-center justify-center gap-0.5 border-l px-0.5 py-1 text-xs sm:flex-row sm:gap-1 sm:px-1 sm:py-1.5"
            >
              <span aria-hidden="true" className="truncate text-muted-foreground">
                {weekdayShort(day, locale)}
              </span>
              {onSlotClick ? (
                <button
                  type="button"
                  data-slot="schedule-new-event"
                  aria-label={newEventLabel(formatDayLong(day, locale))}
                  onClick={() => onSlotClick(at(day, slotHour * 60))}
                  className={cn(
                    "inline-flex size-6 cursor-pointer items-center justify-center rounded-full tabular-nums state-layer focus-visible:focus-outline",
                    // Forced colours drop the fill: an outline marks today there.
                    isToday &&
                      "bg-primary font-semibold text-primary-foreground forced-colors:outline forced-colors:outline-2 forced-colors:outline-[Highlight]",
                  )}
                >
                  {day.getDate()}
                </button>
              ) : (
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-full tabular-nums",
                    // Forced colours drop the fill: an outline marks today there.
                    isToday &&
                      "bg-primary font-semibold text-primary-foreground forced-colors:outline forced-colors:outline-2 forced-colors:outline-[Highlight]",
                  )}
                >
                  {day.getDate()}
                </span>
              )}
              <span className="sr-only">
                {formatDayLong(day, locale)}
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
          <div className="flex items-start justify-end px-1.5 py-1 text-right text-xs leading-4 text-muted-foreground">
            {allDayLabel}
          </div>
          <div
            className="grid py-0.5"
            style={{
              gridColumn: `2 / ${days.length + 2}`,
              gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${barLanes}, 1.625rem)`,
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

      {/* A named <section> is a region landmark: the grid of hours. */}
      <section
        ref={scrollRef}
        data-slot="schedule-scroll"
        // Focusable, so the hours can be scrolled from the keyboard even when
        // no event in view is a button.
        // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrolling region must be reachable by keyboard (WCAG 2.1.1).
        tabIndex={0}
        aria-label={timeGridLabel}
        className="relative overflow-y-auto [scrollbar-gutter:stable] focus-visible:focus-outline-inset"
        style={{ maxHeight }}
      >
        <div className="grid" style={{ gridTemplateColumns: columns, height: totalHeight }}>
          <div aria-hidden="true" className="relative">
            {hours.map((hour, i) =>
              i === 0 ? null : (
                <span
                  key={hour}
                  className="absolute right-1.5 -translate-y-1/2 text-xs tabular-nums leading-none text-muted-foreground"
                  style={{ top: i * hourHeight }}
                >
                  {`${String(hour).padStart(2, "0")}:00`}
                </span>
              ),
            )}
          </div>
          {days.map((day) => {
            // A shift from 22:00 to 01:00 is drawn on both days, clipped to each.
            const timed = events.filter((e) => !isAllDayRowEvent(e) && eventOverlapsDay(e, day))
            const { placements, overflows } = limitColumns(
              layoutDayColumn(timed, day, minHour, maxHour, hourHeight),
              maxColumns,
            )
            const isToday = now != null && isSameDay(day, now)
            return (
              // biome-ignore lint/a11y/useKeyWithClickEvents: the keyboard uses the day's button (data-slot="schedule-new-event").
              <div
                key={isoDay(day)}
                data-slot="schedule-day-column"
                data-date={isoDay(day)}
                // A click on the empty grid gives the time under the pointer,
                // rounded down to the half hour. The keyboard has the day's
                // button in the header.
                onClick={
                  onSlotClick
                    ? (event) => {
                        if (event.target !== event.currentTarget) return
                        const y = event.clientY - event.currentTarget.getBoundingClientRect().top
                        const halfHours = Math.floor((y / hourHeight) * 2)
                        onSlotClick(at(day, minHour * 60 + halfHours * 30))
                      }
                    : undefined
                }
                className={cn("relative border-l", onSlotClick && "cursor-pointer")}
                style={{
                  backgroundImage: "linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
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
                {overflows.map((overflow) => (
                  <ColumnMore
                    key={`more-${overflow.top}`}
                    day={day}
                    overflow={overflow}
                    moreLabel={moreLabel}
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
      </section>
    </div>
  )
}

function ColumnMore({
  day,
  overflow,
  moreLabel,
}: {
  day: Date
  overflow: ColumnOverflow<ScheduleEventData>
  moreLabel: (count: number) => string
}) {
  const { locale } = React.useContext(ScheduleContext)
  const label = moreLabel(overflow.events.length)
  const dayLabel = formatDayLong(day, locale)
  return (
    <Popover
      trigger={
        <button
          type="button"
          data-slot="schedule-more"
          aria-label={`${label}, ${dayLabel}`}
          className="absolute z-[1] h-6 cursor-pointer truncate rounded-inner border border-border-strong bg-card px-1 text-left text-xs font-medium text-muted-foreground state-layer hover:text-foreground focus-visible:focus-outline-inset"
          style={{
            top: overflow.top + 1,
            left: `calc(${(overflow.column / overflow.columns) * 100}% + 2px)`,
            width: `calc(${100 / overflow.columns}% - 4px)`,
          }}
        >
          {label}
        </button>
      }
      align="start"
      collisionPadding={8}
      aria-label={dayLabel}
      className="w-64 p-1.25"
    >
      <p className="px-1 pb-1.5 text-xs font-medium text-muted-foreground first-letter:uppercase">
        {dayLabel}
      </p>
      <ul className="flex flex-col gap-0.5">
        {overflow.events.map((event) => (
          <li key={event.id}>
            <ScheduleEventButton event={event} variant="chip" />
          </li>
        ))}
      </ul>
    </Popover>
  )
}
