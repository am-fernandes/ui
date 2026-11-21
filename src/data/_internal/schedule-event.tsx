"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Popover } from "../../overlays/popover"
import {
  type ScheduleColor,
  type ScheduleEventInput,
  eventAccessibleName,
  formatEventTime,
  formatRowTime,
  formatTime,
} from "./schedule-dates"

export interface ScheduleEventData extends ScheduleEventInput {
  description?: React.ReactNode
}

export interface ScheduleContextValue {
  allDayLabel: string
  onEventClick?: (event: ScheduleEventData) => void
  renderEventDetails?: (event: ScheduleEventData) => React.ReactNode
  /** "Now" — today's date and the time used by the current-time line. */
  now: Date
}

export const ScheduleContext = React.createContext<ScheduleContextValue>({
  allDayLabel: "Dia inteiro",
  now: new Date(0),
})

export const DEFAULT_EVENT_COLOR: ScheduleColor = "blue"

// Literal class strings: Tailwind only generates classes it can find verbatim.
export const EVENT_COLOR_CLASSES: Record<
  ScheduleColor,
  { surface: string; border: string; dot: string }
> = {
  gray: {
    surface: "bg-category-gray-bg text-category-gray-text",
    border: "border-category-gray-solid",
    dot: "bg-category-gray-solid",
  },
  red: {
    surface: "bg-category-red-bg text-category-red-text",
    border: "border-category-red-solid",
    dot: "bg-category-red-solid",
  },
  orange: {
    surface: "bg-category-orange-bg text-category-orange-text",
    border: "border-category-orange-solid",
    dot: "bg-category-orange-solid",
  },
  yellow: {
    surface: "bg-category-yellow-bg text-category-yellow-text",
    border: "border-category-yellow-solid",
    dot: "bg-category-yellow-solid",
  },
  green: {
    surface: "bg-category-green-bg text-category-green-text",
    border: "border-category-green-solid",
    dot: "bg-category-green-solid",
  },
  teal: {
    surface: "bg-category-teal-bg text-category-teal-text",
    border: "border-category-teal-solid",
    dot: "bg-category-teal-solid",
  },
  blue: {
    surface: "bg-category-blue-bg text-category-blue-text",
    border: "border-category-blue-solid",
    dot: "bg-category-blue-solid",
  },
  purple: {
    surface: "bg-category-purple-bg text-category-purple-text",
    border: "border-category-purple-solid",
    dot: "bg-category-purple-solid",
  },
  pink: {
    surface: "bg-category-pink-bg text-category-pink-text",
    border: "border-category-pink-solid",
    dot: "bg-category-pink-solid",
  },
}

export function eventColors(event: ScheduleEventInput) {
  return EVENT_COLOR_CLASSES[event.color ?? DEFAULT_EVENT_COLOR]
}

const focusRing = "focus-visible:focus-outline-inset"

export type ScheduleEventVariant = "chip" | "bar" | "block" | "row"

interface ScheduleEventButtonProps {
  event: ScheduleEventData
  variant: ScheduleEventVariant
  continuesBefore?: boolean
  continuesAfter?: boolean
  /** Block variant: show the time line under the title. */
  showTime?: boolean
  /** Row variant: the day the row is listed under (for "22:00 – …"). */
  day?: Date
  style?: React.CSSProperties
  className?: string
}

/**
 * One event, rendered as a button with its full accessible name (title + day
 * + time). With `renderEventDetails`, the button opens a popover.
 */
export function ScheduleEventButton({
  event,
  variant,
  continuesBefore = false,
  continuesAfter = false,
  showTime = true,
  day,
  style,
  className,
}: ScheduleEventButtonProps) {
  const { allDayLabel, onEventClick, renderEventDetails } = React.useContext(ScheduleContext)
  const colors = eventColors(event)
  const name = eventAccessibleName(event, allDayLabel)

  let content: React.ReactNode
  let variantClass: string
  switch (variant) {
    case "chip":
      variantClass =
        "flex w-full min-w-0 items-center gap-1 overflow-hidden rounded-sm px-1 text-xs leading-5 hover:bg-accent"
      content = (
        <>
          <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", colors.dot)} />
          {/* Narrow month cells have no room for the time: dot + title only. */}
          <span
            aria-hidden="true"
            className="hidden shrink-0 tabular-nums text-muted-foreground sm:inline"
          >
            {formatTime(event.start)}
          </span>
          <span aria-hidden="true" className="min-w-0 truncate">
            {event.title}
          </span>
        </>
      )
      break
    case "bar":
      variantClass = cn(
        "flex w-full min-w-0 items-center rounded-sm border-l-[3px] px-1.5 text-xs font-medium leading-5 hover:brightness-95",
        colors.surface,
        colors.border,
        continuesBefore && "rounded-l-none border-l-0 pl-2",
        continuesAfter && "rounded-r-none",
      )
      content = (
        <span aria-hidden="true" className="min-w-0 truncate">
          {event.title}
        </span>
      )
      break
    case "block":
      variantClass = cn(
        "absolute flex flex-col overflow-hidden rounded-sm border-l-[3px] px-1.5 py-0.5 text-xs leading-4 hover:brightness-95",
        colors.surface,
        colors.border,
      )
      content = (
        <>
          <span aria-hidden="true" className="truncate font-medium">
            {event.title}
          </span>
          {showTime ? (
            <span aria-hidden="true" className="truncate tabular-nums">
              {formatEventTime(event, allDayLabel)}
            </span>
          ) : null}
        </>
      )
      break
    default:
      variantClass =
        "flex w-full min-w-0 items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
      content = (
        <>
          <span aria-hidden="true" className="w-28 shrink-0 tabular-nums text-muted-foreground">
            {formatRowTime(event, day ?? event.start, allDayLabel)}
          </span>
          <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", colors.dot)} />
          <span aria-hidden="true" className="min-w-0 flex-1 truncate font-medium">
            {event.title}
          </span>
        </>
      )
  }

  const button = (
    <button
      type="button"
      data-slot="schedule-event"
      data-event-id={event.id}
      data-variant={variant}
      aria-label={name}
      onClick={() => onEventClick?.(event)}
      style={style}
      className={cn("cursor-pointer text-left transition", focusRing, variantClass, className)}
    >
      {content}
    </button>
  )

  if (!renderEventDetails) return button
  return (
    <Popover trigger={button} align="start" collisionPadding={8} aria-label={event.title}>
      {renderEventDetails(event)}
    </Popover>
  )
}
