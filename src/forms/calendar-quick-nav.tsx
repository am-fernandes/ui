"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeftIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "../primitives/button"

// Same defaults as MUI's DateCalendar; consumers narrow the list via the
// DayPicker `startMonth`/`endMonth` props they already use for day bounds.
const DEFAULT_START_YEAR = 1900
const DEFAULT_END_YEAR = 2100

// "jan" … "dez" — hoisted, locale and format are static.
const MONTH_LABELS = Array.from({ length: 12 }, (_, i) =>
  format(new Date(2000, i, 1), "MMM", { locale: ptBR }),
)

export type CalendarQuickNavView = "years" | "months"

export interface CalendarQuickNavProps {
  view: CalendarQuickNavView
  /** Month currently shown in the day grid (drives the selected highlights). */
  displayedMonth: Date
  /** Year picked in the years view, pending a month pick. */
  pendingYear: number
  startMonth?: Date
  endMonth?: Date
  className?: string
  onSelectYear: (year: number) => void
  onSelectMonth: (monthIndex: number) => void
  onBackToYears: () => void
  onCancel: () => void
}

const SELECTED_CLASS =
  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"

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
  className,
  onSelectYear,
  onSelectMonth,
  onBackToYears,
  onCancel,
}: CalendarQuickNavProps) {
  const startYear = startMonth?.getFullYear() ?? DEFAULT_START_YEAR
  const endYear = endMonth?.getFullYear() ?? DEFAULT_END_YEAR
  const currentYear = new Date().getFullYear()
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

  return (
    <div
      data-slot="calendar"
      className={cn(
        "group/calendar w-fit bg-background p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)]",
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
          aria-label="Escolher ano"
          className="grid max-h-[calc(var(--cell-size)*4+0.75rem)] w-[calc(var(--cell-size)*7)] grid-cols-3 content-start gap-1 overflow-y-auto"
        >
          {years.map((year) => {
            const isSelected = year === selectedYear
            return (
              <Button
                key={year}
                variant="ghost"
                ref={year === anchorYear ? anchorYearRef : undefined}
                autoFocus={year === anchorYear}
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
        <div role="group" aria-label="Escolher mês" className="w-[calc(var(--cell-size)*7)]">
          <div className="flex h-(--cell-size) items-center justify-center">
            <Button
              variant="ghost"
              aria-label={`${pendingYear} — voltar para a seleção de ano`}
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
                  variant="ghost"
                  disabled={isMonthDisabled(monthIndex)}
                  autoFocus={isSelected}
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
