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
  "inline-flex items-center gap-1 rounded-element border border-input bg-card px-3 py-3 text-base field-states md:text-sm"

const fieldClasses =
  "w-7 bg-transparent text-center tabular-nums outline-none placeholder:text-placeholder disabled:cursor-default"

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

function normalizeSegment(raw: string, min: number, max: number) {
  if (raw === "") return ""
  const n = Number.parseInt(raw, 10)
  if (!isInRange(n, min, max)) return ""
  return pad(n)
}

function emitIfComplete(hour: string, minute: string, onChange: (value: string) => void) {
  if (hour === "" || minute === "") return
  const hNum = Number.parseInt(hour, 10)
  const mNum = Number.parseInt(minute, 10)
  if (!isInRange(hNum, MIN_HOUR, MAX_HOUR) || !isInRange(mNum, MIN_MINUTE, MAX_MINUTE)) return
  onChange(`${pad(hNum)}:${pad(mNum)}`)
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
  const skipHourBlurRef = React.useRef(false)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const describedBy = ids.describedBy({ description: hasDescription, error: hasError })

  const [hour, setHour] = React.useState(() => parseValue(value).hour)
  const [minute, setMinute] = React.useState(() => parseValue(value).minute)

  // The fields follow `value` when it changes from outside, but not when it
  // changes because this picker reported it: an invalid hour reported as ""
  // must not take the minutes with it.
  const [synced, setSynced] = React.useState(value)
  if (value !== undefined && value !== synced) {
    setSynced(value)
    const next = parseValue(value)
    setHour(next.hour)
    setMinute(next.minute)
  }
  const report = (next: string) => {
    setSynced(next)
    onChange?.(next)
  }

  const focusMinute = () => {
    skipHourBlurRef.current = true
    minuteRef.current?.focus()
    minuteRef.current?.select()
  }

  const handleHourChange = (raw: string) => {
    setHour(raw)
    if (raw.length !== 2) return
    const hNum = Number.parseInt(raw, 10)
    if (!isInRange(hNum, MIN_HOUR, MAX_HOUR)) return
    emitIfComplete(raw, minute, report)
    focusMinute()
  }

  const handleMinuteChange = (raw: string) => {
    setMinute(raw)
    if (raw.length === 2) {
      emitIfComplete(hour, raw, report)
    }
  }

  const handleHourBlur = () => {
    if (skipHourBlurRef.current) {
      skipHourBlurRef.current = false
      return
    }
    const nextHour = normalizeSegment(hour, MIN_HOUR, MAX_HOUR)
    setHour(nextHour)
    if (nextHour === "") {
      report("")
      return
    }
    emitIfComplete(nextHour, minute, report)
  }

  const handleMinuteBlur = () => {
    const nextMinute = normalizeSegment(minute, MIN_MINUTE, MAX_MINUTE)
    setMinute(nextMinute)
    if (nextMinute === "") {
      report("")
      return
    }
    emitIfComplete(hour, nextMinute, report)
  }

  const handleHourKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ":") {
      e.preventDefault()
      // "9:" is 09: the colon completes the hour and moves to the minutes.
      const padded = hour.length === 1 ? `0${hour}` : hour
      const valid = padded === "" || isInRange(Number.parseInt(padded, 10), MIN_HOUR, MAX_HOUR)
      if (padded !== hour) setHour(padded)
      if (valid) {
        if (padded !== "") emitIfComplete(padded, minute, report)
        focusMinute()
      } else {
        // Leaving normally: the blur clears the invalid hour.
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
      setHour(next)
      if (minute === "") {
        report("")
      } else {
        emitIfComplete(next, minute, report)
      }
    }
  }

  const handleMinuteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ":") {
      e.preventDefault()
      return
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault()
      const current = minute === "" ? 0 : Number.parseInt(minute, 10)
      const delta = e.key === "ArrowUp" ? 1 : -1
      const span = MAX_MINUTE - MIN_MINUTE + 1
      const wrapped = ((((current - MIN_MINUTE + delta) % span) + span) % span) + MIN_MINUTE
      const next = pad(wrapped)
      setMinute(next)
      if (hour === "") {
        report("")
      } else {
        emitIfComplete(hour, next, report)
      }
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
        className={cn(containerClasses, disabled && "cursor-default", className)}
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
