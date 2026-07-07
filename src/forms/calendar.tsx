"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import * as React from "react"
import { type DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "../primitives/button"
import { CalendarQuickNav, type CalendarQuickNavView } from "./calendar-quick-nav"

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

// Hoisted once at module load: `getDefaultClassNames()` returns a frozen
// object of react-day-picker's stock per-slot classes — there's no reason to
// call it on every render.
const RDP_DEFAULTS = getDefaultClassNames()

// Hoisted formatter (locale and format are static). The previous inline
// `formatters={{ formatMonthDropdown: ..., ...formatters }}` rebuilt the
// object on every Calendar render, which made DayPicker treat it as a new
// prop and re-do its own internal work.
const STATIC_FORMATTERS = {
  formatMonthDropdown: (date: Date) => date.toLocaleString(ptBR.code, { month: "short" }),
}

// Static class strings for the DayPicker `classNames` slots, pre-joined once
// instead of going through `cn()` on every render. Only the two button slots
// depend on `buttonVariant`, so they live in the per-instance memo below.
const STATIC_CLASS_NAMES = {
  root: `w-fit ${RDP_DEFAULTS.root}`,
  months: `relative flex flex-col gap-4 md:flex-row ${RDP_DEFAULTS.months}`,
  month: `flex w-full flex-col gap-4 ${RDP_DEFAULTS.month}`,
  // The nav is absolutely positioned full-width over the caption row. Its empty
  // middle would otherwise swallow clicks meant for the (now interactive)
  // caption beneath it, so let clicks pass through the container and re-enable
  // pointer events only on the prev/next buttons themselves (see finalClassNames).
  nav: `pointer-events-none absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1 ${RDP_DEFAULTS.nav}`,
  month_caption: `flex h-(--cell-size) w-full items-center justify-center px-(--cell-size) ${RDP_DEFAULTS.month_caption}`,
  caption_label: `text-sm font-medium select-none ${RDP_DEFAULTS.caption_label}`,
  table: "w-full border-collapse",
  weekdays: `flex ${RDP_DEFAULTS.weekdays}`,
  weekday: `flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none ${RDP_DEFAULTS.weekday}`,
  week: `mt-2 flex w-full ${RDP_DEFAULTS.week}`,
  day: `group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius) [&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius) ${RDP_DEFAULTS.day}`,
  range_start: `relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted ${RDP_DEFAULTS.range_start}`,
  range_middle: `rounded-none ${RDP_DEFAULTS.range_middle}`,
  range_end: `relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted ${RDP_DEFAULTS.range_end}`,
  today: `rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none ${RDP_DEFAULTS.today}`,
  outside: `text-muted-foreground aria-selected:text-muted-foreground ${RDP_DEFAULTS.outside}`,
  disabled: `text-muted-foreground opacity-50 ${RDP_DEFAULTS.disabled}`,
  hidden: `invisible ${RDP_DEFAULTS.hidden}`,
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
  month,
  defaultMonth,
  onMonthChange,
  ref,
  ...props
}: CalendarProps) {
  const disabledFn = resolveDisabledDays(disabledDays)
  const resolvedDisabled = disabledFn ?? disabled

  // ── Quick nav (jump to a year/month, MUI-style) ────────────────────────────
  // Clicking the caption swaps the day grid for a years panel, then a months
  // panel. Active only for the default caption; `captionLayout="dropdown"`
  // keeps react-day-picker's native dropdowns.
  const quickNavEnabled = captionLayout === "label"
  const [quickNavView, setQuickNavView] = React.useState<"days" | CalendarQuickNavView>("days")
  const [pendingYear, setPendingYear] = React.useState<number>(() =>
    (month ?? defaultMonth ?? new Date()).getFullYear(),
  )

  // The displayed month becomes controllable here so a year/month pick can
  // jump the grid. A consumer-controlled `month` keeps working: picks are
  // forwarded through their `onMonthChange`.
  const [internalMonth, setInternalMonth] = React.useState<Date>(
    () => month ?? defaultMonth ?? new Date(),
  )
  const displayedMonth = month ?? internalMonth
  const displayedMonthRef = React.useRef(displayedMonth)
  displayedMonthRef.current = displayedMonth

  const handleMonthChange = React.useCallback(
    (next: Date) => {
      setInternalMonth(next)
      onMonthChange?.(next)
    },
    [onMonthChange],
  )

  // Returning to the day grid (month picked or Escape) remounts the caption as
  // a fresh element, so move focus back to it — otherwise keyboard focus drops
  // to <body> and the keyboard flow breaks.
  const captionButtonRef = React.useRef<HTMLButtonElement | null>(null)
  const wasQuickNavOpenRef = React.useRef(false)
  React.useEffect(() => {
    if (wasQuickNavOpenRef.current && quickNavView === "days") {
      captionButtonRef.current?.focus()
    }
    wasQuickNavOpenRef.current = quickNavView !== "days"
  }, [quickNavView])

  // `button_previous` and `button_next` need the `buttonVariant`-derived
  // class, so build the final classNames object only when `buttonVariant` or
  // the user-provided `classNames` override changes — not on every render.
  const finalClassNames = React.useMemo(() => {
    const buttonNavClass =
      "pointer-events-auto size-(--cell-size) p-0 select-none aria-disabled:opacity-50"
    const variantClass = buttonVariants({ variant: buttonVariant })
    return {
      ...STATIC_CLASS_NAMES,
      button_previous: `${variantClass} ${buttonNavClass} ${RDP_DEFAULTS.button_previous}`,
      button_next: `${variantClass} ${buttonNavClass} ${RDP_DEFAULTS.button_next}`,
      ...classNames,
    }
  }, [buttonVariant, classNames])

  const finalFormatters = React.useMemo(
    () => (formatters ? { ...STATIC_FORMATTERS, ...formatters } : STATIC_FORMATTERS),
    [formatters],
  )

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
      ...(quickNavEnabled && {
        CaptionLabel: ({ className, children }: React.ComponentProps<"span">) => (
          <Button
            ref={captionButtonRef}
            type="button"
            variant="ghost"
            data-slot="calendar-caption-button"
            aria-expanded={false}
            className={cn("h-(--cell-size) gap-1 px-2 select-none", className)}
            onClick={() => {
              setPendingYear(displayedMonthRef.current.getFullYear())
              setQuickNavView("years")
            }}
          >
            {children}
            <ChevronDownIcon aria-hidden="true" className="size-4 text-muted-foreground" />
          </Button>
        ),
      }),
    }),
    [ref, quickNavEnabled],
  )

  const finalComponents = React.useMemo(
    () => (components ? { ...memoizedComponents, ...components } : memoizedComponents),
    [memoizedComponents, components],
  )

  if (quickNavEnabled && quickNavView !== "days") {
    return (
      <CalendarQuickNav
        view={quickNavView}
        displayedMonth={displayedMonth}
        pendingYear={pendingYear}
        startMonth={props.startMonth}
        endMonth={props.endMonth}
        className={className}
        onSelectYear={(year) => {
          setPendingYear(year)
          setQuickNavView("months")
        }}
        onSelectMonth={(monthIndex) => {
          handleMonthChange(new Date(pendingYear, monthIndex, 1))
          setQuickNavView("days")
        }}
        onBackToYears={() => setQuickNavView("years")}
        onCancel={() => setQuickNavView("days")}
      />
    )
  }

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
      formatters={finalFormatters}
      classNames={finalClassNames}
      components={finalComponents}
      {...(quickNavEnabled
        ? { month: displayedMonth, onMonthChange: handleMonthChange }
        : { month, defaultMonth, onMonthChange })}
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
//
// `transition-colors duration-150` smooths the bg/text shift when a cell
// becomes selected — combined with React's faster commit, it makes the click
// feel instant even when the actual JS work is a few frames behind.
const DAY_BUTTON_BASE_CLASS = [
  "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal",
  "transition-colors duration-150",
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
        !isOutside &&
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={!isOutside && modifiers.range_start}
      data-range-end={!isOutside && modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={className ? cn(DAY_BUTTON_BASE_CLASS, className) : DAY_BUTTON_BASE_CLASS}
      {...props}
    />
  )
})
CalendarDayButton.displayName = "CalendarDayButton"

export { Calendar }
