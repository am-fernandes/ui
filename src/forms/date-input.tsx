"use client"

import { CalendarIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { type MaskSpec, applyEdit, applyPaste } from "../domain/_internal/masked-input"
import { Popover } from "../overlays/popover"
import {
  type ControlSize,
  controlHeight,
  controlPaddingX,
} from "../primitives/_internal/control-size"
import { FieldShell, type LabelPosition } from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"
import { assignRef } from "./_internal/assign-ref"
import {
  dateToIso,
  digitsToIso,
  formatIsoDate,
  isoToDate,
  isoToDigits,
  maskDateDigits,
  toIsoDate,
} from "./_internal/date-only"
import { type DisabledDays, resolveDisabledDays } from "./_internal/disabled-days"
import { Calendar } from "./calendar"

export interface DateInputLabels {
  /** Accessible name of the button that opens the calendar. */
  openCalendar: string
  /** Shown when the field is left with an incomplete date or a day that does not exist. */
  invalidDate: string
  /** Accessible name of the field when it has neither `label` nor `aria-label`. */
  field: string
  /** Shown when the field is left with a date before `min` (given as dd/mm/aaaa). */
  beforeMin: (min: string) => string
  /** Shown when the field is left with a date after `max` (given as dd/mm/aaaa). */
  afterMax: (max: string) => string
  /** Shown when the field is left with a day that `disabledDays` rules out. */
  unavailableDate: string
}

export const defaultDateInputLabels: DateInputLabels = {
  openCalendar: "Abrir calendário",
  invalidDate: "Data inválida. Use o formato dd/mm/aaaa.",
  field: "Data",
  beforeMin: (min) => `A data deve ser a partir de ${min}.`,
  afterMax: (max) => `A data deve ser até ${max}.`,
  unavailableDate: "Esta data não está disponível.",
}

// The calendar button sits 4px inside the field's border, and the text stops
// before it.
const calendarButtonClasses: Record<ControlSize, { button: string; input: string }> = {
  sm: { button: "size-6", input: "pr-8" },
  md: { button: "size-8", input: "pr-11" },
  lg: { button: "size-9", input: "pr-12" },
}

const dateSpec: MaskSpec = {
  maxLength: 8,
  filter: (text) => text.replace(/\D/g, ""),
  mask: maskDateDigits,
  // A whole date in a pasted text, written dd/mm/aaaa or as ISO (aaaa-mm-dd).
  extract: (text) => {
    const iso = /(?:^|\D)(\d{4})-(\d{2})-(\d{2})(?!\d)/.exec(text)
    if (iso) return `${iso[3]}${iso[2]}${iso[1]}`
    const br = /(?:^|\D)(\d{2})[/.-](\d{2})[/.-](\d{4})(?!\d)/.exec(text)
    return br ? `${br[1]}${br[2]}${br[3]}` : null
  },
}

export interface DateInputProps {
  id?: string
  /**
   * The date as an ISO string (`"yyyy-MM-dd"`), or `""` for no date,
   * controlled. It changes only when the typed text is a whole valid date,
   * when a day is picked in the calendar, or (to `""`) when the field is
   * emptied or left with a date that is not valid. Leave it out to let the
   * field keep its own date, starting from `defaultValue`.
   */
  value?: string
  /** Initial date (ISO) of an uncontrolled field. */
  defaultValue?: string
  /** Called with the new ISO date, or `""`. */
  onValueChange?: (value: string) => void
  /** @deprecated Use `onValueChange`; it receives the same value. */
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
  /** @default "dd/mm/aaaa" */
  placeholder?: string
  label?: React.ReactNode
  description?: React.ReactNode
  /**
   * Error message. While it is set, it replaces the field's own message for
   * an invalid date.
   */
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  /**
   * Forwarded to the underlying Calendar's `disabledDays` — accepts a
   * preset ("past" | "future" | "weekends" | "weekdays" | "today"), a
   * Date / Date[], or a custom predicate. Use this to lock the picker
   * to a valid range (e.g. `disabledDays="future"` for birthdates or
   * event entry dates).
   */
  disabledDays?: DisabledDays
  /**
   * First date allowed (ISO). Days before it are off in the calendar, and a
   * typed date before it is an error when the field is left.
   */
  min?: string
  /** Last date allowed (ISO), as `min`. */
  max?: string
  /**
   * Name of the field in a native form. The form receives the ISO date (what
   * `onValueChange` reports), carried by a hidden input; the visible input,
   * which shows `dd/mm/aaaa`, has no name.
   */
  name?: string
  /**
   * Called when the focus leaves the field as a whole, after an invalid date
   * was turned into `""`. Moving between the text, the calendar button and
   * the open calendar does not count.
   */
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void
  /**
   * Shows the date without letting it be edited: it stays readable, takes
   * focus, can be copied and is submitted with the form; the calendar button
   * goes away. For a view-only screen; `disabled` is for a field that does
   * not apply.
   */
  readOnly?: boolean
  /**
   * Height of the field: `sm` 32px, `md` 40px, `lg` 44px, the same as a
   * button or input of that size.
   * @default "md"
   */
  size?: ControlSize
  /** Texts of the field. Defaults in `defaultDateInputLabels`. */
  labels?: Partial<DateInputLabels>
  "aria-label"?: string
  /** The text field. */
  ref?: React.Ref<HTMLInputElement>
}

/**
 * A date field: type it (`dd/mm/aaaa`, the separators come by themselves) or
 * pick it in the calendar of the button at the end. The value is the ISO
 * date (`yyyy-MM-dd`), with no time and no time zone.
 */
function DateInput({
  id,
  value,
  defaultValue,
  onValueChange,
  onChange,
  disabled,
  className,
  placeholder = "dd/mm/aaaa",
  label,
  description,
  error,
  labelPosition,
  required,
  disabledDays,
  min,
  max,
  labels,
  name,
  onBlur,
  readOnly = false,
  size = "md",
  "aria-label": ariaLabel,
  ref,
}: DateInputProps) {
  const l: DateInputLabels = { ...defaultDateInputLabels, ...labels }
  const ids = useFieldIds(id)
  const [open, setOpen] = React.useState(false)
  const hasLabel = label != null && label !== ""
  const hasDescription = description != null && description !== ""

  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState(() => toIsoDate(defaultValue))
  const current = isControlled ? (value ?? "") : internal
  // What is typed, as digits. It follows `value` when that changes from
  // outside, but not when it changes because this field reported it: an
  // invalid text reported as "" stays on screen to be fixed.
  const [digits, setDigits] = React.useState(() => isoToDigits(current))
  // The last value seen from outside or reported from here.
  const [synced, setSynced] = React.useState(current)
  if (current !== synced) {
    setSynced(current)
    if (digitsToIso(digits) !== current) setDigits(isoToDigits(current))
  }

  // min, max and disabledDays hold for typed dates as for the calendar.
  const minIso = toIsoDate(min)
  const maxIso = toIsoDate(max)
  const isDayOff = React.useMemo(() => resolveDisabledDays(disabledDays), [disabledDays])
  /** Why a real day cannot be taken, or `null` when it can. */
  const problemWith = (iso: string): string | null => {
    if (minIso !== "" && iso < minIso) return l.beforeMin(formatIsoDate(minIso))
    if (maxIso !== "" && iso > maxIso) return l.afterMax(formatIsoDate(maxIso))
    const date = isoToDate(iso)
    if (date && isDayOff?.(date)) return l.unavailableDate
    return null
  }
  const minDate = isoToDate(minIso)
  const maxDate = isoToDate(maxIso)
  const calendarDisabled =
    minDate || maxDate || isDayOff
      ? (date: Date) =>
          (minDate != null && date < minDate) ||
          (maxDate != null && date > maxDate) ||
          isDayOff?.(date) === true
      : undefined

  const [ownError, setOwnError] = React.useState<string | null>(null)
  const shownError = error != null && error !== "" ? error : (ownError ?? undefined)
  const hasError = shownError != null

  const report = (next: string) => {
    setSynced(next)
    if (next === current) return
    if (!isControlled) setInternal(next)
    onValueChange?.(next)
    onChange?.(next)
  }

  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const setInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node
      assignRef(ref, node)
    },
    [ref],
  )
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  // An uncontrolled field goes back to `defaultValue` when its form is reset,
  // like a native input. Read through a ref, so the listener is attached once.
  const onFormReset = React.useRef(() => {})
  onFormReset.current = () => {
    if (isControlled) return
    const initial = toIsoDate(defaultValue)
    setInternal(initial)
    setSynced(initial)
    setDigits(isoToDigits(initial))
    setOwnError(null)
  }
  React.useEffect(() => {
    const form = inputRef.current?.form
    if (form == null) return
    const reset = () => onFormReset.current()
    form.addEventListener("reset", reset)
    return () => form.removeEventListener("reset", reset)
  }, [])
  const popoverBodyRef = React.useRef<HTMLDivElement>(null)

  // React rewrites the input's value after every edit, which throws the caret
  // to the end; put it back where the edit left it.
  const pendingCaret = React.useRef<number | null>(null)
  const display = maskDateDigits(digits)
  React.useLayoutEffect(() => {
    const caret = pendingCaret.current
    const el = inputRef.current
    if (caret == null || el == null) return
    pendingCaret.current = null
    if (el.value !== display) el.value = display
    const root = el.getRootNode() as Document | ShadowRoot
    if (root.activeElement === el) el.setSelectionRange(caret, caret)
  })
  const [, forceRender] = React.useReducer((n: number) => n + 1, 0)

  const takeDigits = (next: string) => {
    setDigits(next)
    if (next === "") {
      setOwnError(null)
      report("")
      return
    }
    const iso = digitsToIso(next)
    if (iso != null && problemWith(iso) == null) {
      setOwnError(null)
      report(iso)
    }
    // Incomplete, impossible or not allowed: nothing is reported until the
    // field is left.
  }

  const commit = (edit: { raw: string; caret: number }) => {
    pendingCaret.current = edit.caret
    takeDigits(edit.raw)
    forceRender()
  }

  /** The focus left the field: the text box, its button and the calendar. */
  const leaveField = () => {
    if (digits === "") return
    const iso = digitsToIso(digits)
    const problem = iso == null ? l.invalidDate : problemWith(iso)
    if (problem == null) return
    setOwnError(problem)
    report("")
  }

  const isInsideField = (node: Node | null) =>
    node != null &&
    (wrapperRef.current?.contains(node) === true || popoverBodyRef.current?.contains(node) === true)

  const selected = isoToDate(digitsToIso(digits) ?? "")

  const calendarButton = (
    <button
      type="button"
      aria-label={l.openCalendar}
      disabled={disabled}
      data-slot="date-input-calendar-button"
      className={cn(
        "absolute top-1/2 right-1 inline-flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-inner text-muted-foreground state-layer focus-visible:focus-outline disabled:pointer-events-none disabled:cursor-default",
        calendarButtonClasses[size].button,
      )}
    >
      <CalendarIcon aria-hidden="true" className="size-4" />
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
      error={shownError}
      labelPosition={labelPosition}
      required={required}
      disabled={disabled}
    >
      <div
        ref={wrapperRef}
        className="relative"
        data-slot="date-input"
        // React brings the focus events of the calendar's portal here too.
        onBlur={(e) => {
          if (isInsideField(e.relatedTarget as Node | null)) return
          leaveField()
          onBlur?.(e)
        }}
      >
        <input
          ref={setInputRef}
          id={ids.controlId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder}
          aria-label={ariaLabel ?? (hasLabel ? undefined : l.field)}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
          required={required}
          aria-required={required ? true : undefined}
          disabled={disabled}
          readOnly={readOnly}
          value={display}
          onChange={(e) => {
            const el = e.target
            commit(
              applyEdit(
                dateSpec,
                digits,
                el.value,
                el.selectionStart ?? el.value.length,
                (e.nativeEvent as InputEvent).inputType,
              ),
            )
          }}
          onPaste={(e) => {
            // A read-only field takes no paste; the browser already ignores it.
            if (readOnly) return
            e.preventDefault()
            const el = e.currentTarget
            const start = el.selectionStart ?? el.value.length
            const end = el.selectionEnd ?? start
            commit(applyPaste(dateSpec, digits, e.clipboardData?.getData("text") ?? "", start, end))
          }}
          onKeyDown={(e) => {
            // Alt + ↓ opens the calendar, as in a native date field.
            if (e.altKey && e.key === "ArrowDown" && !disabled && !readOnly) {
              e.preventDefault()
              setOpen(true)
            }
          }}
          className={cn(
            // 16px on touch screens: iOS zooms the page into a focused field
            // whose text is smaller.
            "flex w-full rounded-element border border-input bg-card text-sm pointer-coarse:text-base tabular-nums field-states disabled:cursor-default",
            controlHeight[size],
            controlPaddingX[size],
            // Room for the calendar button.
            !readOnly && calendarButtonClasses[size].input,
            hasError && "border-destructive-text field-error",
            // Read-only: a muted box that does not answer to hover (important,
            // so it also wins over the hover tint of `field-error`).
            readOnly && "bg-muted [--field-hover-ring:transparent]!",
            className,
          )}
        />
        {readOnly ? null : (
          <Popover
            open={open}
            onOpenChange={(next) => !disabled && setOpen(next)}
            align="end"
            trigger={calendarButton}
            aria-labelledby={hasLabel ? ids.labelId : undefined}
            aria-label={hasLabel ? undefined : (ariaLabel ?? l.field)}
            className="w-auto p-0"
          >
            <div ref={popoverBodyRef}>
              <Calendar
                mode="single"
                // The chosen day stays chosen when picked again: emptying the
                // field is how a date is removed. Otherwise Enter on the day the
                // calendar opens on would erase the date.
                required
                selected={selected}
                onSelect={(date: Date | undefined) => {
                  if (!date) return
                  const iso = dateToIso(date)
                  setDigits(isoToDigits(iso))
                  setOwnError(null)
                  report(iso)
                  setOpen(false)
                }}
                defaultMonth={selected}
                // The chosen day (or today) takes the focus when the calendar opens.
                autoFocus
                disabledDays={calendarDisabled}
                startMonth={minDate}
                endMonth={maxDate}
              />
            </div>
          </Popover>
        )}
        {name != null && name !== "" ? (
          <input type="hidden" name={name} value={toIsoDate(current)} disabled={disabled} />
        ) : null}
      </div>
    </FieldShell>
  )
}
DateInput.displayName = "DateInput"

export { DateInput }
