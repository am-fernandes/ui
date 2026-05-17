"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TimePickerProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  id?: string
  className?: string
  "aria-label"?: string
}

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min
  return Math.min(max, Math.max(min, n))
}

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

function parseValue(value: string | undefined): { hour: string; minute: string } {
  if (!value) return { hour: "", minute: "" }
  const [h = "", m = ""] = value.split(":")
  return { hour: h.slice(0, 2), minute: m.slice(0, 2) }
}

const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ value, onChange, disabled, id, className, "aria-label": ariaLabel = "Horário" }, ref) => {
    const minuteRef = React.useRef<HTMLInputElement>(null)
    const parsed = parseValue(value)
    const [hour, setHour] = React.useState(parsed.hour)
    const [minute, setMinute] = React.useState(parsed.minute)

    // Sync external value into local state when the prop changes
    React.useEffect(() => {
      const next = parseValue(value)
      setHour(next.hour)
      setMinute(next.minute)
    }, [value])

    function emit(h: string, m: string) {
      if (!onChange) return
      // Only emit a clean value when both fields parse to numbers.
      if (h === "" || m === "") {
        onChange("")
        return
      }
      const hh = pad(clamp(Number.parseInt(h, 10), 0, 23))
      const mm = pad(clamp(Number.parseInt(m, 10), 0, 59))
      onChange(`${hh}:${mm}`)
    }

    function handleHourChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 2)
      setHour(raw)
      if (raw.length === 2) {
        emit(raw, minute)
        minuteRef.current?.focus()
        minuteRef.current?.select()
      }
    }

    function handleMinuteChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 2)
      setMinute(raw)
      if (raw.length === 2) emit(hour, raw)
    }

    function handleHourBlur() {
      if (hour === "") return emit("", minute)
      const h = pad(clamp(Number.parseInt(hour, 10), 0, 23))
      setHour(h)
      emit(h, minute)
    }

    function handleMinuteBlur() {
      if (minute === "") return emit(hour, "")
      const m = pad(clamp(Number.parseInt(minute, 10), 0, 59))
      setMinute(m)
      emit(hour, m)
    }

    function handleHourKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === ":" || e.key === "Tab") {
        if (e.key === ":") {
          e.preventDefault()
          minuteRef.current?.focus()
          minuteRef.current?.select()
        }
        return
      }
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault()
        const current = hour === "" ? 0 : Number.parseInt(hour, 10)
        const next = pad(clamp(current + (e.key === "ArrowUp" ? 1 : -1), 0, 23))
        setHour(next)
        emit(next, minute)
      }
    }

    function handleMinuteKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault()
        const current = minute === "" ? 0 : Number.parseInt(minute, 10)
        const next = pad(clamp(current + (e.key === "ArrowUp" ? 1 : -1), 0, 59))
        setMinute(next)
        emit(hour, next)
      }
    }

    const containerClasses = cn(
      "inline-flex h-9 items-center gap-1 rounded-md border border-input bg-transparent px-3 py-1 text-base transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-ring md:text-sm",
      disabled && "cursor-not-allowed opacity-50",
      className,
    )

    const fieldClasses =
      "w-7 bg-transparent text-center tabular-nums outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"

    return (
      <fieldset
        className={containerClasses}
        aria-label={ariaLabel}
        data-slot="time-picker"
        disabled={disabled}
      >
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode="numeric"
          aria-label="Horas"
          maxLength={2}
          placeholder="--"
          value={hour}
          onChange={handleHourChange}
          onBlur={handleHourBlur}
          onKeyDown={handleHourKeyDown}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className={fieldClasses}
        />
        <span aria-hidden className="text-muted-foreground">
          :
        </span>
        <input
          ref={minuteRef}
          type="text"
          inputMode="numeric"
          aria-label="Minutos"
          maxLength={2}
          placeholder="--"
          value={minute}
          onChange={handleMinuteChange}
          onBlur={handleMinuteBlur}
          onKeyDown={handleMinuteKeyDown}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className={fieldClasses}
        />
      </fieldset>
    )
  },
)
TimePicker.displayName = "TimePicker"

export { TimePicker }
