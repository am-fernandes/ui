"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import * as React from "react"
import { type DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "../primitives/button"

/** Preset matchers that translate to a date-fns predicate at render time. */
export type DisabledDayPreset = "past" | "future" | "weekends" | "weekdays" | "today"
export type DisabledDays =
  | Date
  | Date[]
  | DisabledDayPreset
  | DisabledDayPreset[]
  | ((date: Date) => boolean)

function resolveDisabledDays(
  input: DisabledDays | undefined,
): ((date: Date) => boolean) | undefined {
  if (input == null) return undefined
  if (typeof input === "function") return input

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  function matchesPreset(date: Date, preset: DisabledDayPreset): boolean {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    switch (preset) {
      case "past":
        return d.getTime() < startOfToday.getTime()
      case "future":
        return d.getTime() > startOfToday.getTime()
      case "today":
        return d.getTime() === startOfToday.getTime()
      case "weekends":
        return d.getDay() === 0 || d.getDay() === 6
      case "weekdays":
        return d.getDay() >= 1 && d.getDay() <= 5
      default:
        return false
    }
  }

  function isDateInstance(value: unknown): value is Date {
    return value instanceof Date && !Number.isNaN(value.getTime())
  }

  function matchesDate(date: Date, target: Date): boolean {
    return (
      date.getFullYear() === target.getFullYear() &&
      date.getMonth() === target.getMonth() &&
      date.getDate() === target.getDate()
    )
  }

  if (isDateInstance(input)) return (date) => matchesDate(date, input)
  if (typeof input === "string") return (date) => matchesPreset(date, input)
  // Array of presets or dates
  return (date) =>
    (input as Array<Date | DisabledDayPreset>).some((entry) =>
      isDateInstance(entry) ? matchesDate(date, entry) : matchesPreset(date, entry),
    )
}

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
  /**
   * Disable specific days. Accepts a Date, Date[], preset string, preset[], or custom predicate.
   * Takes precedence over `disabled` if both are provided.
   */
  disabledDays?: DisabledDays
  ref?: React.Ref<HTMLDivElement>
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  disabledDays,
  disabled,
  ref,
  ...props
}: CalendarProps) {
  const disabledFn = resolveDisabledDays(disabledDays)
  const resolvedDisabled = disabledFn ?? disabled
  const defaultClassNames = getDefaultClassNames()

  const memoizedComponents = React.useMemo(
    () => ({
      Root: ({
        className,
        rootRef,
        ...rootProps
      }: React.ComponentProps<"div"> & {
        rootRef?: React.Ref<HTMLDivElement>
      }) => (
        <div
          data-slot="calendar"
          ref={(node) => {
            if (typeof rootRef === "function") rootRef(node)
            else if (rootRef)
              (rootRef as React.MutableRefObject<HTMLDivElement | null>).current = node
            if (typeof ref === "function") ref(node)
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
          }}
          className={cn(className)}
          {...rootProps}
        />
      ),
      Chevron: ({
        className,
        orientation,
      }: {
        className?: string
        orientation?: "left" | "right" | "up" | "down"
      }) => {
        if (orientation === "left")
          return <ChevronLeftIcon aria-hidden="true" className={cn("size-4", className)} />
        if (orientation === "right")
          return <ChevronRightIcon aria-hidden="true" className={cn("size-4", className)} />
        return <ChevronDownIcon aria-hidden="true" className={cn("size-4", className)} />
      },
      DayButton: (dayButtonProps: React.ComponentProps<typeof DayButton>) => (
        <CalendarDayButton {...dayButtonProps} />
      ),
    }),
    [ref],
  )

  return (
    <DayPicker
      data-slot="calendar"
      showOutsideDays={showOutsideDays}
      disabled={resolvedDisabled}
      className={cn(
        "group/calendar bg-background p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)]",
        className,
      )}
      captionLayout={captionLayout}
      locale={ptBR}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString(ptBR.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption,
        ),
        caption_label: cn("text-sm font-medium select-none", defaultClassNames.caption_label),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
          defaultClassNames.weekday,
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        day: cn(
          "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius) [&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)",
          defaultClassNames.day,
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted",
          defaultClassNames.range_start,
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted",
          defaultClassNames.range_end,
        ),
        today: cn(
          "rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none",
          defaultClassNames.today,
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside,
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        ...memoizedComponents,
        ...components,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

type CalendarDayButtonProps = React.ComponentProps<typeof DayButton>

// Hoisted so it isn't re-created (and re-frozen) on every day-cell render.
const DAY_BUTTON_DEFAULTS = getDefaultClassNames()

// Stable base class — concatenated once at module load instead of going through
// `cn()` (and tailwind-merge) on every day cell every render. With
// `numberOfMonths={2}` we render ~138 day buttons, so doing this work per cell
// adds up — especially under React StrictMode's double-invoke in dev.
const DAY_BUTTON_BASE_CLASS = [
  "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal",
  "data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
  "data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground",
  "data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
  "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
  DAY_BUTTON_DEFAULTS.day,
]
  .filter(Boolean)
  .join(" ")

const CalendarDayButton = React.memo(function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: CalendarDayButtonProps) {
  const isOutside = !!modifiers.outside

  return (
    <Button
      variant="ghost"
      data-slot="calendar-day-button"
      {...(!isOutside && { "data-day": format(day.date, "yyyy-MM-dd") })}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={className ? cn(DAY_BUTTON_BASE_CLASS, className) : DAY_BUTTON_BASE_CLASS}
      {...props}
    />
  )
})
CalendarDayButton.displayName = "CalendarDayButton"

export { Calendar }
