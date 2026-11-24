"use client"

import { CalendarIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { type MaskSpec, applyEdit, applyPaste } from "../domain/_internal/masked-input"
import { Popover } from "../overlays/popover"
import { controlHeight, controlPaddingX } from "../primitives/_internal/control-size"
import { FieldShell, type LabelPosition } from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"
import { assignRef } from "./_internal/assign-ref"
import {
  dateToIso,
  digitsToIso,
  isoToDate,
  isoToDigits,
  maskDateDigits,
} from "./_internal/date-only"
import { Calendar, type DisabledDays } from "./calendar"

export interface DateInputLabels {
  /** Accessible name of the button that opens the calendar. */
  openCalendar: string
  /** Shown when the field is left with an incomplete date or a day that does not exist. */
  invalidDate: string
  /** Accessible name of the field when it has neither `label` nor `aria-label`. */
  field: string
}

export const defaultDateInputLabels: DateInputLabels = {
  openCalendar: "Abrir calendário",
  invalidDate: "Data inválida. Use o formato dd/mm/aaaa.",
  field: "Data",
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
   * The date as an ISO string (`"yyyy-MM-dd"`), or `""` for no date. It
   * changes only when the typed text is a whole valid date, when a day is
   * picked in the calendar, or (to `""`) when the field is emptied or left
   * with a date that is not valid.
   */
  value: string
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
  labels,
  "aria-label": ariaLabel,
  ref,
}: DateInputProps) {
  const l: DateInputLabels = { ...defaultDateInputLabels, ...labels }
  const ids = useFieldIds(id)
  const [open, setOpen] = React.useState(false)
  const hasLabel = label != null && label !== ""
  const hasDescription = description != null && description !== ""

  const current = value ?? ""
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

  const [ownError, setOwnError] = React.useState<string | null>(null)
  const shownError = error != null && error !== "" ? error : (ownError ?? undefined)
  const hasError = shownError != null

  const report = (next: string) => {
    setSynced(next)
    if (next === current) return
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
    if (iso != null) {
      setOwnError(null)
      report(iso)
    }
    // Incomplete or impossible: nothing is reported until the field is left.
  }

  const commit = (edit: { raw: string; caret: number }) => {
    pendingCaret.current = edit.caret
    takeDigits(edit.raw)
    forceRender()
  }

  /** The focus left the field: the text box, its button and the calendar. */
  const leaveField = () => {
    if (digits === "" || digitsToIso(digits) != null) return
    setOwnError(l.invalidDate)
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
      className="absolute top-1/2 right-1 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-inner text-muted-foreground state-layer focus-visible:focus-outline disabled:pointer-events-none disabled:cursor-default"
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
        onBlur={(e) => {
          if (!isInsideField(e.relatedTarget as Node | null)) leaveField()
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
            e.preventDefault()
            const el = e.currentTarget
            const start = el.selectionStart ?? el.value.length
            const end = el.selectionEnd ?? start
            commit(applyPaste(dateSpec, digits, e.clipboardData?.getData("text") ?? "", start, end))
          }}
          onKeyDown={(e) => {
            // Alt + ↓ opens the calendar, as in a native date field.
            if (e.altKey && e.key === "ArrowDown" && !disabled) {
              e.preventDefault()
              setOpen(true)
            }
          }}
          className={cn(
            // 16px on touch screens: iOS zooms the page into a focused field
            // whose text is smaller.
            "flex w-full rounded-element border border-input bg-card text-sm pointer-coarse:text-base tabular-nums field-states disabled:cursor-default",
            controlHeight.md,
            controlPaddingX.md,
            // Room for the calendar button.
            "pr-11",
            hasError && "border-destructive-text field-error",
            className,
          )}
        />
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
              disabledDays={disabledDays}
            />
          </div>
        </Popover>
      </div>
    </FieldShell>
  )
}
DateInput.displayName = "DateInput"

export { DateInput }
