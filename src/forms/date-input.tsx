"use client"

import { format, isValid, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type * as React from "react"
import { useState } from "react"
import type { Locale } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "../overlays/popover"
import { Button } from "../primitives/button"
import { Calendar } from "./calendar"

function parseIsoDate(value: string): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, "yyyy-MM-dd", new Date())
  return isValid(parsed) ? parsed : undefined
}

function formatBrDate(isoDate: string): string {
  if (!isoDate) return ""
  const parsed = parseIsoDate(isoDate)
  if (!parsed) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[DateInput] Invalid ISO date received: ${isoDate}`)
    }
    return ""
  }
  return format(parsed, "dd/MM/yyyy")
}

interface DateInputProps {
  id?: string
  value: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  /** Accessible label for the trigger button. */
  "aria-label"?: string
  /** Locale used by the Calendar popover. Defaults to ptBR. */
  locale?: Locale
  ref?: React.Ref<HTMLButtonElement>
}

function DateInput({
  id,
  value,
  onChange,
  disabled,
  className,
  placeholder = "dd/mm/aaaa",
  "aria-label": ariaLabel = "Selecionar data",
  locale = ptBR,
  ref,
}: DateInputProps) {
  const [open, setOpen] = useState(false)

  const selected = parseIsoDate(value)
  const display = value ? formatBrDate(value) : ""
  const hasValidValue = display.length > 0

  return (
    <Popover open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          id={id}
          data-slot="date-input"
          variant="outline"
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-9",
            !hasValidValue && "text-muted-foreground",
            disabled && "bg-muted",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {hasValidValue ? display : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            onChange?.(date ? format(date, "yyyy-MM-dd") : "")
            setOpen(false)
          }}
          locale={locale}
          defaultMonth={selected}
        />
      </PopoverContent>
    </Popover>
  )
}
DateInput.displayName = "DateInput"

export { DateInput, type DateInputProps }
