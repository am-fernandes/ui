"use client"

import { format, isValid, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"
import * as React from "react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { useIsMobile } from "../hooks/use-is-mobile"
import { Popover } from "../overlays/popover"
import {
  FieldShell,
  type LabelPosition,
  fieldTriggerClass,
} from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"
import { Button } from "../primitives/button"
import { Calendar } from "./calendar"

export interface DateRangeValue {
  from: string
  to: string
}

export interface DateRangePickerLabels {
  /** The button that empties the period. */
  clear: string
  /** The button that keeps the days picked. */
  confirm: string
}

export const defaultDateRangePickerLabels: DateRangePickerLabels = {
  clear: "Limpar",
  confirm: "Confirmar",
}

export interface DateRangePickerProps {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  disabled?: boolean
  value: DateRangeValue
  onValueChange: (value: DateRangeValue) => void
  placeholder?: string
  className?: string
  numberOfMonths?: number
  id?: string
  /** Texts of the picker. Defaults in `defaultDateRangePickerLabels`. */
  labels?: Partial<DateRangePickerLabels>
  "aria-label"?: string
  ref?: React.Ref<HTMLButtonElement>
}

function parseIsoDate(value: string): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, "yyyy-MM-dd", new Date())
  return isValid(parsed) ? parsed : undefined
}

function toIsoString(d: Date | undefined): string {
  return d ? format(d, "yyyy-MM-dd") : ""
}

function DateRangePicker({
  id,
  label,
  description,
  error,
  labelPosition,
  required,
  disabled,
  value,
  onValueChange,
  placeholder = "Selecione um período",
  className,
  numberOfMonths = 2,
  labels,
  "aria-label": ariaLabel,
  ref,
}: DateRangePickerProps) {
  const l: DateRangePickerLabels = { ...defaultDateRangePickerLabels, ...labels }
  const ids = useFieldIds(id)
  const [open, setOpen] = React.useState(false)
  // Two months side by side do not fit a phone: one month below `md`.
  const isMobile = useIsMobile()
  const monthsShown = isMobile ? 1 : numberOfMonths
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""

  const fromDate = parseIsoDate(value.from)
  const toDate = parseIsoDate(value.to)
  const committedRange: DateRange | undefined =
    fromDate || toDate ? { from: fromDate, to: toDate } : undefined

  // Local pending selection while the popover is open; only committed to
  // onValueChange when the user clicks "Confirmar".
  const [pendingRange, setPendingRange] = React.useState<DateRange | undefined>(committedRange)

  // Sync pending range from the committed value each time the popover opens.
  // We intentionally only re-sync on the closed→open transition; if the parent
  // mutates `value` while the popover is open we don't want to clobber the
  // user's in-progress selection.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see comment above
  React.useEffect(() => {
    if (open) setPendingRange(committedRange)
  }, [open])

  const handleSelect = (range: DateRange | undefined) => {
    setPendingRange(range)
  }

  const handleConfirm = () => {
    onValueChange({
      from: toIsoString(pendingRange?.from),
      to: toIsoString(pendingRange?.to),
    })
    setOpen(false)
  }

  const handleClear = () => {
    setPendingRange(undefined)
    onValueChange({ from: "", to: "" })
    setOpen(false)
  }

  const display =
    fromDate && toDate
      ? `${format(fromDate, "dd/MM/yyyy")} — ${format(toDate, "dd/MM/yyyy")}`
      : fromDate
        ? `${format(fromDate, "dd/MM/yyyy")} — ...`
        : placeholder

  const trigger = (
    <button
      type="button"
      ref={ref}
      id={ids.controlId}
      disabled={disabled}
      aria-invalid={hasError ? true : undefined}
      aria-label={ariaLabel ?? (typeof label === "string" ? label : "Selecionar período")}
      aria-describedby={ids.describedBy({
        description: hasDescription,
        error: hasError,
      })}
      className={cn(
        fieldTriggerClass,
        "w-full justify-start text-left",
        !fromDate && "text-placeholder",
        hasError && "border-destructive-text field-error",
        className,
      )}
    >
      <CalendarIcon className="size-4" aria-hidden="true" />
      {display}
    </button>
  )

  return (
    <FieldShell
      controlId={ids.controlId}
      labelId={ids.labelId}
      descriptionId={ids.descriptionId}
      errorId={ids.errorId}
      label={label}
      description={description}
      error={error}
      labelPosition={labelPosition}
      required={required}
      disabled={disabled}
    >
      <Popover
        open={open}
        onOpenChange={(next) => !disabled && setOpen(next)}
        align="start"
        trigger={trigger}
        aria-labelledby={label != null && label !== "" ? ids.labelId : undefined}
        // Never taller than the room the popover has on its side of the
        // trigger: the calendar scrolls inside it, the actions stay in view.
        collisionPadding={8}
        className="flex max-h-(--radix-popover-content-available-height) w-auto max-w-(--radix-popover-content-available-width) flex-col p-0"
        onPointerDownOutside={(event) => {
          const target = event.target as HTMLElement | null
          if (target?.closest('[role="grid"], .rdp, .rdp-root')) {
            event.preventDefault()
          }
        }}
        onFocusOutside={(event) => event.preventDefault()}
      >
        <div
          data-slot="date-range-picker-calendar"
          className="min-h-0 overflow-y-auto overscroll-contain"
        >
          <Calendar
            mode="range"
            selected={pendingRange}
            onSelect={handleSelect}
            numberOfMonths={monthsShown}
            // Open on the saved range, not on the current month.
            defaultMonth={fromDate ?? toDate}
            // Hide previous/next-month days inside each calendar pane.
            // Otherwise the range_end day (e.g. June 1) renders twice when the
            // range spans two months: once as range_end in its own pane, and
            // once as the outside-day of the previous month's pane.
            showOutsideDays={false}
          />
        </div>
        <div className="flex shrink-0 justify-end gap-2 border-t p-3">
          <Button variant="ghost" onClick={handleClear}>
            {l.clear}
          </Button>
          <Button onClick={handleConfirm}>{l.confirm}</Button>
        </div>
      </Popover>
    </FieldShell>
  )
}

DateRangePicker.displayName = "DateRangePicker"

export { DateRangePicker }
