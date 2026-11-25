"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeftIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "../primitives/button"
import { CALENDAR_ROOT_CLASS } from "./_internal/calendar-root"

// Same defaults as MUI's DateCalendar; consumers narrow the list via the
// DayPicker `startMonth`/`endMonth` props they already use for day bounds.
const DEFAULT_START_YEAR = 1900
const DEFAULT_END_YEAR = 2100

// "jan" … "dez" — hoisted, locale and format are static.
const MONTH_LABELS = Array.from({ length: 12 }, (_, i) =>
  format(new Date(2000, i, 1), "MMM", { locale: ptBR }),
)

export type CalendarQuickNavView = "years" | "months"

/** Texts of the Calendar's quick navigation (years and months). */
export interface CalendarLabels {
  /** Name of the grid of years. */
  chooseYear: string
  /** Name of the grid of months. */
  chooseMonth: string
  /** The button that goes back from the months to the years. */
  backToYears: (year: number) => string
}

export const defaultCalendarLabels: CalendarLabels = {
  chooseYear: "Escolher ano",
  chooseMonth: "Escolher mês",
  backToYears: (year) => `${year} — voltar para a seleção de ano`,
}

const COLUMNS = 3

/**
 * Where a key takes the focus in a grid of `count` buttons laid out in rows of
 * three: arrows by one and by a row, Home and End to the ends, PageUp and
 * PageDown by four rows. Buttons that are disabled are skipped. `null` for a
 * key that does not move.
 */
function moveInGrid(
  key: string,
  from: number,
  count: number,
  isDisabled: (index: number) => boolean,
): number | null {
  const enabled = (index: number) => index >= 0 && index < count && !isDisabled(index)
  const scan = (start: number, step: number) => {
    for (let i = start; i >= 0 && i < count; i += step) if (enabled(i)) return i
    return null
  }
  switch (key) {
    case "Home":
      return scan(0, 1)
    case "End":
      return scan(count - 1, -1)
    case "PageDown":
      return scan(Math.min(from + COLUMNS * 4, count - 1), -1)
    case "PageUp":
      return scan(Math.max(from - COLUMNS * 4, 0), 1)
  }
  const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: COLUMNS, ArrowUp: -COLUMNS }[key]
  if (step === undefined) return null
  return scan(from + step, step) ?? from
}

/**
 * The one button of a grid that is in the Tab order (roving tabindex). It
 * starts at `anchor`, follows the focus, and starts over when `resetKey`
 * changes (another panel, another year).
 */
function useRovingIndex(anchor: number, resetKey: string) {
  const [state, setState] = React.useState({ key: resetKey, index: anchor })
  const index = state.key === resetKey ? state.index : anchor
  const setIndex = React.useCallback(
    (next: number) => setState({ key: resetKey, index: next }),
    [resetKey],
  )
  return [index, setIndex] as const
}

export interface CalendarQuickNavProps {
  /** This year, marked in the years panel (São Paulo's, as the calendar's today). */
  currentYear?: number
  view: CalendarQuickNavView
  /** Month currently shown in the day grid (drives the selected highlights). */
  displayedMonth: Date
  /** Year picked in the years view, pending a month pick. */
  pendingYear: number
  startMonth?: Date
  endMonth?: Date
  /**
   * Months side by side in the day grid. The panels take their total width
   * (they are stacked below `md`), so the popover does not change size.
   */
  numberOfMonths?: number
  labels?: CalendarLabels
  className?: string
  onSelectYear: (year: number) => void
  onSelectMonth: (monthIndex: number) => void
  onBackToYears: () => void
  onCancel: () => void
}

// The outline keeps the selection visible in forced colours, which drop fills.
const SELECTED_CLASS =
  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground forced-colors:outline-2 forced-colors:outline-solid forced-colors:-outline-offset-2"

/**
 * Year / month picker panels rendered in place of the day grid when the user
 * clicks the calendar caption. Kept at the same footprint as the day grid
 * (7 × --cell-size wide) so the popover doesn't jump between views.
 */
export function CalendarQuickNav({
  view,
  displayedMonth,
  pendingYear,
  startMonth,
  endMonth,
  numberOfMonths = 1,
  labels = defaultCalendarLabels,
  className,
  onSelectYear,
  onSelectMonth,
  onBackToYears,
  onCancel,
  currentYear = new Date().getFullYear(),
}: CalendarQuickNavProps) {
  const startYear = startMonth?.getFullYear() ?? DEFAULT_START_YEAR
  const endYear = endMonth?.getFullYear() ?? DEFAULT_END_YEAR
  const selectedYear = displayedMonth.getFullYear()
  const selectedMonthIndex = displayedMonth.getMonth()

  const years: number[] = []
  for (let year = startYear; year <= endYear; year++) years.push(year)

  // Center the selected (or current) year when the panel opens. jsdom has no
  // scrollIntoView, hence the optional call.
  const anchorYear = years.includes(selectedYear)
    ? selectedYear
    : Math.min(Math.max(currentYear, startYear), endYear)
  const anchorYearRef = React.useRef<HTMLButtonElement | null>(null)
  React.useEffect(() => {
    if (view === "years") anchorYearRef.current?.scrollIntoView?.({ block: "center" })
  }, [view])

  function isMonthDisabled(monthIndex: number): boolean {
    if (
      startMonth &&
      (pendingYear < startMonth.getFullYear() ||
        (pendingYear === startMonth.getFullYear() && monthIndex < startMonth.getMonth()))
    ) {
      return true
    }
    if (
      endMonth &&
      (pendingYear > endMonth.getFullYear() ||
        (pendingYear === endMonth.getFullYear() && monthIndex > endMonth.getMonth()))
    ) {
      return true
    }
    return false
  }

  // Which month gets keyboard focus when the months panel opens: the selected
  // one if we're on its year, otherwise the first enabled month — so jumping to
  // a different year doesn't drop focus to <body>. -1 means every month is out
  // of range, in which case the "back" button takes focus instead.
  const firstEnabledMonth = MONTH_LABELS.findIndex((_, i) => !isMonthDisabled(i))
  const anchorMonthIndex =
    pendingYear === selectedYear && !isMonthDisabled(selectedMonthIndex)
      ? selectedMonthIndex
      : firstEnabledMonth

  // One Tab stop per grid; the arrows move inside it. 201 years each in the
  // Tab order made the grid a wall to get through.
  const [yearFocus, setYearFocus] = useRovingIndex(years.indexOf(anchorYear), "years")
  const [monthFocus, setMonthFocus] = useRovingIndex(anchorMonthIndex, `months-${pendingYear}`)
  const yearRefs = React.useRef<Array<HTMLButtonElement | null>>([])
  const monthRefs = React.useRef<Array<HTMLButtonElement | null>>([])

  const handleGridKeyDown = (
    event: React.KeyboardEvent,
    from: number,
    count: number,
    isDisabled: (index: number) => boolean,
    refs: React.RefObject<Array<HTMLButtonElement | null>>,
    setFocus: (index: number) => void,
  ) => {
    const next = moveInGrid(event.key, from, count, isDisabled)
    if (next == null) return
    event.preventDefault()
    setFocus(next)
    refs.current[next]?.focus()
  }

  // Escape closes the quick navigation only. A Radix popover or dialog around
  // the calendar listens to Escape on the document, in the capture phase,
  // before this element sees it, and would close as a whole. A listener on
  // the window runs first: it marks the event handled (Radix leaves a
  // prevented Escape alone), and the element's own handler below goes back
  // to the days.
  const rootRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const view = rootRef.current?.ownerDocument.defaultView
    if (!view) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      if (rootRef.current?.contains(event.target as Node)) event.preventDefault()
    }
    view.addEventListener("keydown", onKeyDown, true)
    return () => view.removeEventListener("keydown", onKeyDown, true)
  }, [])

  return (
    <div
      ref={rootRef}
      data-slot="calendar"
      data-quick-nav=""
      // The width of the day grid it replaces: seven days per month, months
      // side by side from `md` with the 1rem gap of the grid.
      style={{ "--quick-nav-months": numberOfMonths } as React.CSSProperties}
      className={cn(
        CALENDAR_ROOT_CLASS,
        "w-fit [--quick-nav-width:calc(var(--day-size)*7)] md:[--quick-nav-width:calc(var(--day-size)*7*var(--quick-nav-months)+1rem*(var(--quick-nav-months)-1))]",
        className,
      )}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation()
          onCancel()
        }
      }}
    >
      {view === "years" ? (
        // biome-ignore lint/a11y/useSemanticElements: grid de botões; <fieldset> tem quirks históricos com display:grid.
        <div
          role="group"
          aria-label={labels.chooseYear}
          className="grid max-h-[calc(var(--cell-size)*4+0.75rem)] w-(--quick-nav-width) grid-cols-3 content-start gap-1 overflow-y-auto"
        >
          {years.map((year, index) => {
            const isSelected = year === selectedYear
            return (
              <Button
                key={year}
                type="button"
                variant="ghost"
                ref={(node) => {
                  yearRefs.current[index] = node
                  if (year === anchorYear) anchorYearRef.current = node
                }}
                autoFocus={year === anchorYear}
                tabIndex={index === yearFocus ? 0 : -1}
                onFocus={() => setYearFocus(index)}
                onKeyDown={(event) =>
                  handleGridKeyDown(event, index, years.length, () => false, yearRefs, setYearFocus)
                }
                aria-current={isSelected ? "date" : undefined}
                className={cn(
                  "h-(--cell-size) px-0 text-sm font-normal",
                  isSelected && SELECTED_CLASS,
                  !isSelected && year === currentYear && "border border-input",
                )}
                onClick={() => onSelectYear(year)}
              >
                {year}
              </Button>
            )
          })}
        </div>
      ) : (
        // biome-ignore lint/a11y/useSemanticElements: grid de botões; <fieldset> tem quirks históricos com display:grid.
        <div role="group" aria-label={labels.chooseMonth} className="w-(--quick-nav-width)">
          <div className="flex h-(--cell-size) items-center justify-center">
            <Button
              type="button"
              variant="ghost"
              aria-label={labels.backToYears(pendingYear)}
              className="h-(--cell-size) gap-1 px-2 text-sm font-medium"
              onClick={onBackToYears}
            >
              <ChevronLeftIcon aria-hidden="true" className="size-4 text-muted-foreground" />
              {pendingYear}
            </Button>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1">
            {MONTH_LABELS.map((label, monthIndex) => {
              const isSelected = pendingYear === selectedYear && monthIndex === selectedMonthIndex
              return (
                <Button
                  key={label}
                  type="button"
                  variant="ghost"
                  ref={(node) => {
                    monthRefs.current[monthIndex] = node
                  }}
                  disabled={isMonthDisabled(monthIndex)}
                  autoFocus={monthIndex === anchorMonthIndex}
                  tabIndex={monthIndex === monthFocus ? 0 : -1}
                  onFocus={() => setMonthFocus(monthIndex)}
                  onKeyDown={(event) =>
                    handleGridKeyDown(
                      event,
                      monthIndex,
                      MONTH_LABELS.length,
                      isMonthDisabled,
                      monthRefs,
                      setMonthFocus,
                    )
                  }
                  aria-current={isSelected ? "date" : undefined}
                  className={cn(
                    "h-(--cell-size) px-0 text-sm font-normal",
                    isSelected && SELECTED_CLASS,
                  )}
                  onClick={() => onSelectMonth(monthIndex)}
                >
                  {label}
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
