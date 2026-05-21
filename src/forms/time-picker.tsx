"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { FieldShell, type LabelPosition } from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"

const MIN_HOUR = 0
const MAX_HOUR = 23
const MIN_MINUTE = 0
const MAX_MINUTE = 59

const containerClasses =
  "inline-flex items-center gap-1 rounded-md border border-input bg-transparent px-3 py-3 text-base transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-ring md:text-sm"

const fieldClasses =
  "w-7 bg-transparent text-center tabular-nums outline-none placeholder:text-placeholder disabled:cursor-not-allowed"

export interface TimePickerProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  id?: string
  className?: string
  "aria-label"?: string
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  /** Forwarded to the hour input. */
  ref?: React.Ref<HTMLInputElement>
}

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

function isInRange(n: number, min: number, max: number) {
  return Number.isFinite(n) && n >= min && n <= max
}

function parseValue(value: string | undefined): { hour: string; minute: string } {
  if (!value) return { hour: "", minute: "" }
  const [h = "", m = ""] = value.split(":")
  return { hour: h.slice(0, 2), minute: m.slice(0, 2) }
}

interface TimeFieldProps {
  id?: string
  min: number
  max: number
  value: string
  ariaLabel: string
  ariaInvalid?: boolean
  ariaDescribedBy?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  onChange: (raw: string) => void
  onBlur: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  disabled?: boolean
  ref?: React.Ref<HTMLInputElement>
}

function TimeField({
  id,
  value,
  ariaLabel,
  ariaInvalid,
  ariaDescribedBy,
  inputMode = "numeric",
  onChange,
  onBlur,
  onKeyDown,
  disabled,
  ref,
}: TimeFieldProps) {
  return (
    <input
      ref={ref}
      id={id}
      type="text"
      inputMode={inputMode}
      aria-label={ariaLabel}
      aria-invalid={ariaInvalid ? true : undefined}
      aria-describedby={ariaDescribedBy}
      maxLength={2}
      placeholder="--"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onFocus={(e) => e.target.select()}
      disabled={disabled}
      className={fieldClasses}
    />
  )
}
TimeField.displayName = "TimeField"

function TimePicker({
  value,
  onChange,
  disabled,
  id,
  className,
  "aria-label": ariaLabel,
  label,
  description,
  error,
  labelPosition,
  required,
  ref,
}: TimePickerProps) {
  const ids = useFieldIds(id)
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const describedBy = ids.describedBy({ description: hasDescription, error: hasError })

  // Derive the committed values directly from the prop.
  const { hour: committedHour, minute: committedMinute } = React.useMemo(
    () => parseValue(value),
    [value],
  )

  // Draft state is only used while the user is actively typing.
  const [draft, setDraft] = React.useState<{ hour: string | null; minute: string | null }>({
    hour: null,
    minute: null,
  })

  // Whenever the committed values change, drop the draft.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional re-init when committed values change.
  React.useEffect(() => {
    setDraft({ hour: null, minute: null })
  }, [committedHour, committedMinute])

  const hour = draft.hour ?? committedHour
  const minute = draft.minute ?? committedMinute

  const emit = React.useCallback(
    (h: string, m: string) => {
      if (!onChange) return
      if (h === "" || m === "") {
        onChange("")
        return
      }
      const hNum = Number.parseInt(h, 10)
      const mNum = Number.parseInt(m, 10)
      if (!isInRange(hNum, MIN_HOUR, MAX_HOUR) || !isInRange(mNum, MIN_MINUTE, MAX_MINUTE)) {
        onChange("")
        return
      }
      onChange(`${pad(hNum)}:${pad(mNum)}`)
    },
    [onChange],
  )

  const handleHourChange = (raw: string) => {
    setDraft((d) => ({ ...d, hour: raw }))
    if (raw.length === 2) {
      const hNum = Number.parseInt(raw, 10)
      if (isInRange(hNum, MIN_HOUR, MAX_HOUR)) {
        emit(raw, minute)
      }
      minuteRef.current?.focus()
      minuteRef.current?.select()
    }
  }

  const handleMinuteChange = (raw: string) => {
    setDraft((d) => ({ ...d, minute: raw }))
    if (raw.length === 2) emit(hour, raw)
  }

  const handleHourBlur = () => {
    if (hour === "") {
      emit("", minute)
      setDraft((d) => ({ ...d, hour: null }))
      return
    }
    const hNum = Number.parseInt(hour, 10)
    if (!isInRange(hNum, MIN_HOUR, MAX_HOUR)) {
      // Out-of-range -> clear the field rather than clamping.
      setDraft((d) => ({ ...d, hour: "" }))
      emit("", minute)
      return
    }
    const padded = pad(hNum)
    setDraft((d) => ({ ...d, hour: null }))
    emit(padded, minute)
  }

  const handleMinuteBlur = () => {
    if (minute === "") {
      emit(hour, "")
      setDraft((d) => ({ ...d, minute: null }))
      return
    }
    const mNum = Number.parseInt(minute, 10)
    if (!isInRange(mNum, MIN_MINUTE, MAX_MINUTE)) {
      setDraft((d) => ({ ...d, minute: "" }))
      emit(hour, "")
      return
    }
    const padded = pad(mNum)
    setDraft((d) => ({ ...d, minute: null }))
    emit(hour, padded)
  }

  const handleHourKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ":") {
      e.preventDefault()
      // Only honour the colon shortcut once the hour has two digits — otherwise
      // a single-digit hour like "1" gets silently padded to "01" on focus loss
      // and the user ends up with 01:HH when they meant 11:HH.
      if (hour.length === 2) {
        minuteRef.current?.focus()
        minuteRef.current?.select()
      }
      return
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault()
      const current = hour === "" ? 0 : Number.parseInt(hour, 10)
      const delta = e.key === "ArrowUp" ? 1 : -1
      const span = MAX_HOUR - MIN_HOUR + 1
      const wrapped = ((((current - MIN_HOUR + delta) % span) + span) % span) + MIN_HOUR
      const next = pad(wrapped)
      setDraft((d) => ({ ...d, hour: null }))
      emit(next, minute)
    }
  }

  const handleMinuteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault()
      const current = minute === "" ? 0 : Number.parseInt(minute, 10)
      const delta = e.key === "ArrowUp" ? 1 : -1
      const span = MAX_MINUTE - MIN_MINUTE + 1
      const wrapped = ((((current - MIN_MINUTE + delta) % span) + span) % span) + MIN_MINUTE
      const next = pad(wrapped)
      setDraft((d) => ({ ...d, minute: null }))
      emit(hour, next)
      return
    }
    if (e.key === "Backspace" && minute === "") {
      e.preventDefault()
      const hourInput = e.currentTarget.parentElement?.querySelector<HTMLInputElement>(
        'input[aria-label="Horas"]',
      )
      hourInput?.focus()
      hourInput?.select()
    }
  }

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
        // biome-ignore lint/a11y/useSemanticElements: a <fieldset> would force a <legend>, breaking the inline flex layout intended.
        role="group"
        aria-label={ariaLabel ?? (typeof label === "string" ? label : "Horário")}
        data-slot="time-picker"
        data-disabled={disabled ? "true" : undefined}
        className={cn(containerClasses, disabled && "cursor-not-allowed", className)}
      >
        <TimeField
          ref={ref}
          id={ids.controlId}
          value={hour}
          ariaLabel="Horas"
          ariaInvalid={hasError}
          ariaDescribedBy={describedBy}
          min={MIN_HOUR}
          max={MAX_HOUR}
          onChange={handleHourChange}
          onBlur={handleHourBlur}
          onKeyDown={handleHourKeyDown}
          disabled={disabled}
        />
        <span aria-hidden className="text-muted-foreground">
          :
        </span>
        <TimeField
          ref={minuteRef}
          value={minute}
          ariaLabel="Minutos"
          ariaInvalid={hasError}
          ariaDescribedBy={describedBy}
          min={MIN_MINUTE}
          max={MAX_MINUTE}
          onChange={handleMinuteChange}
          onBlur={handleMinuteBlur}
          onKeyDown={handleMinuteKeyDown}
          disabled={disabled}
        />
      </div>
    </FieldShell>
  )
}
TimePicker.displayName = "TimePicker"

export { TimePicker }
