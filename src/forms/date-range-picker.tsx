"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import * as React from "react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { useIsMobile } from "../hooks/use-is-mobile"
import { Popover } from "../overlays/popover"
import type { ControlSize } from "../primitives/_internal/control-size"
import {
  FieldShell,
  type LabelPosition,
  fieldTriggerSizeClass,
} from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"
import { Button } from "../primitives/button"
import { assignRef } from "./_internal/assign-ref"
import { dateToIso, isoToDate, toIsoDate } from "./_internal/date-only"
import { type DisabledDays, resolveDisabledDays } from "./_internal/disabled-days"
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
  /** Name of the trigger when it has neither `label` nor `aria-label`. */
  field: string
}

export const defaultDateRangePickerLabels: DateRangePickerLabels = {
  clear: "Limpar",
  confirm: "Confirmar",
  field: "Período",
}

export interface DateRangePickerProps {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  disabled?: boolean
  /**
   * The period, controlled: ISO dates (`"yyyy-MM-dd"`), `""` for an open end.
   * Leave it out to let the picker keep its own, starting from `defaultValue`.
   */
  value?: DateRangeValue
  /** Initial period of an uncontrolled picker. */
  defaultValue?: DateRangeValue
  /** Called when the period is confirmed or cleared. */
  onValueChange?: (value: DateRangeValue) => void
  placeholder?: string
  className?: string
  numberOfMonths?: number
  /**
   * Days that cannot be picked: a preset ("past" | "future" | "weekends" |
   * "weekdays" | "today"), a Date / Date[], or a predicate. For example,
   * `disabledDays="future"` for a period that already happened.
   */
  disabledDays?: DisabledDays
  /** First day that can be picked (ISO). The calendar does not go before its month. */
  min?: string
  /** Last day that can be picked (ISO). The calendar does not go past its month. */
  max?: string
  id?: string
  /**
   * Name of the field in a native form: it sends two values, `<name>-from`
   * and `<name>-to`, with the ISO dates (`""` for an open end).
   */
  name?: string
  /**
   * Shows the period without letting it change: the trigger stays readable
   * and focusable, the calendar does not open, and the period is submitted
   * with the form. For a view-only screen; `disabled` is for a field that
   * does not apply.
   */
  readOnly?: boolean
  /**
   * Height of the trigger: `sm` 32px, `md` 40px, `lg` 44px, the same as a
   * button or input of that size.
   * @default "md"
   */
  size?: ControlSize
  /**
   * Called when the focus leaves the picker as a whole. Moving into the open
   * calendar and its buttons does not count.
   */
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void
  /** Texts of the picker. Defaults in `defaultDateRangePickerLabels`. */
  labels?: Partial<DateRangePickerLabels>
  "aria-label"?: string
  ref?: React.Ref<HTMLButtonElement>
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
  defaultValue,
  onValueChange,
  placeholder = "Selecione um período",
  className,
  numberOfMonths = 2,
  disabledDays,
  min,
  max,
  labels,
  name,
  readOnly = false,
  size = "md",
  onBlur,
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

  const minDate = isoToDate(toIsoDate(min))
  const maxDate = isoToDate(toIsoDate(max))
  const isDayOff = React.useMemo(() => resolveDisabledDays(disabledDays), [disabledDays])
  const calendarDisabled =
    minDate || maxDate || isDayOff
      ? (date: Date) =>
          (minDate != null && date < minDate) ||
          (maxDate != null && date > maxDate) ||
          isDayOff?.(date) === true
      : undefined

  // Controlled with `value`; otherwise the picker keeps its own period.
  const isControlled = value !== undefined
  const initialValue = (): DateRangeValue => ({
    from: defaultValue?.from ?? "",
    to: defaultValue?.to ?? "",
  })
  const [internalValue, setInternalValue] = React.useState(initialValue)
  const current = isControlled ? value : internalValue
  const emit = (next: DateRangeValue) => {
    if (!isControlled) setInternalValue(next)
    onValueChange?.(next)
  }

  const fieldRef = React.useRef<HTMLDivElement>(null)
  const popoverBodyRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const setTriggerRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node
      assignRef(ref, node)
    },
    [ref],
  )
  // An uncontrolled picker goes back to `defaultValue` when its form is
  // reset. Read through a ref, so the listener is attached once.
  const onFormReset = React.useRef(() => {})
  onFormReset.current = () => {
    if (!isControlled) setInternalValue(initialValue())
  }
  React.useEffect(() => {
    const form = triggerRef.current?.form
    if (form == null) return
    const reset = () => onFormReset.current()
    form.addEventListener("reset", reset)
    return () => form.removeEventListener("reset", reset)
  }, [])

  const fromDate = isoToDate(current.from)
  const toDate = isoToDate(current.to)
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
    emit({
      from: dateToIso(pendingRange?.from),
      to: dateToIso(pendingRange?.to),
    })
    setOpen(false)
  }

  const handleClear = () => {
    setPendingRange(undefined)
    emit({ from: "", to: "" })
    setOpen(false)
  }

  const hasPeriod = fromDate != null
  const display =
    fromDate && toDate
      ? `${format(fromDate, "dd/MM/yyyy")} — ${format(toDate, "dd/MM/yyyy")}`
      : fromDate
        ? `${format(fromDate, "dd/MM/yyyy")} — ...`
        : placeholder

  // The name is the label (or aria-label) and then the period, so a screen
  // reader says what the field is and what it holds. An aria-label made of the
  // label alone hid the period, the "obrigatório" of the label, and any label
  // that is not plain text. The placeholder is left out.
  const hasLabel = label != null && label !== ""
  const nameId = `${ids.controlId}-name`
  const valueId = `${ids.controlId}-value`
  // A consumer aria-label still wins over the label, as before.
  const ownName = ariaLabel != null || !hasLabel
  const labelledBy = [ownName ? nameId : ids.labelId, hasPeriod ? valueId : null]
    .filter(Boolean)
    .join(" ")

  const trigger = (
    <button
      type="button"
      ref={setTriggerRef}
      id={ids.controlId}
      disabled={disabled}
      aria-invalid={hasError ? true : undefined}
      aria-labelledby={labelledBy}
      aria-describedby={ids.describedBy({
        description: hasDescription,
        error: hasError,
      })}
      className={cn(
        fieldTriggerSizeClass(size),
        "justify-start text-left",
        !fromDate && "text-placeholder",
        hasError && "border-destructive-text field-error",
        // Read-only: a muted box that does not answer to hover; the focus
        // look stays, because the trigger still takes focus.
        readOnly && "cursor-default bg-muted [--field-hover-ring:transparent]!",
        className,
      )}
    >
      <CalendarIcon className="size-4" aria-hidden="true" />
      <span id={valueId} className="truncate">
        {display}
      </span>
      {ownName ? (
        <span id={nameId} hidden>
          {ariaLabel ?? l.field}
        </span>
      ) : null}
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
      <div
        ref={fieldRef}
        data-slot="date-range-picker"
        // React brings the focus events of the calendar's portal here too.
        onBlur={(e) => {
          const next = e.relatedTarget as Node | null
          const inside =
            next != null &&
            (fieldRef.current?.contains(next) || popoverBodyRef.current?.contains(next))
          if (!inside) onBlur?.(e)
        }}
      >
        {/* Read-only: the trigger alone, with no popup to announce or open. */}
        {readOnly ? (
          trigger
        ) : (
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
            <div ref={popoverBodyRef} className="flex min-h-0 flex-col">
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
                  // Otherwise the range_end day (e.g. June 1) renders twice when
                  // the range spans two months: once as range_end in its own
                  // pane, and once as the outside-day of the previous month's.
                  showOutsideDays={false}
                  disabledDays={calendarDisabled}
                  startMonth={minDate}
                  endMonth={maxDate}
                />
              </div>
              <div className="flex shrink-0 justify-end gap-2 border-t p-3">
                <Button variant="ghost" onClick={handleClear}>
                  {l.clear}
                </Button>
                <Button onClick={handleConfirm}>{l.confirm}</Button>
              </div>
            </div>
          </Popover>
        )}
        {name != null && name !== "" ? (
          <>
            <input
              type="hidden"
              name={`${name}-from`}
              value={toIsoDate(current.from)}
              disabled={disabled}
            />
            <input
              type="hidden"
              name={`${name}-to`}
              value={toIsoDate(current.to)}
              disabled={disabled}
            />
          </>
        ) : null}
      </div>
    </FieldShell>
  )
}

DateRangePicker.displayName = "DateRangePicker"

export { DateRangePicker }
