"use client"

import { format, isValid, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import * as React from "react"
import type { DateRange, Locale } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "../overlays/popover"
import { Button } from "../primitives/button"
import { Calendar } from "./calendar"

function parseIsoDate(value: string | undefined): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, "yyyy-MM-dd", new Date())
  return isValid(parsed) ? parsed : undefined
}

function toIsoString(date: Date | undefined): string {
  return date ? format(date, "yyyy-MM-dd") : ""
}

export interface DateRangeValue {
  from: string
  to: string
}

interface DateRangePickerSplitProps {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  /** Controlled-range API (not used when split props are provided). */
  value?: undefined
  onChange?: undefined
}

interface DateRangePickerControlledProps {
  value: DateRangeValue
  onChange: (range: DateRangeValue) => void
  /** Split API (not used when controlled value is provided). */
  from?: undefined
  to?: undefined
  onFromChange?: undefined
  onToChange?: undefined
}

interface DateRangePickerCommonProps {
  placeholder?: string
  className?: string
  disabled?: boolean
  numberOfMonths?: number
  locale?: Locale
  ref?: React.Ref<HTMLButtonElement>
}

type DateRangePickerProps = DateRangePickerCommonProps &
  (DateRangePickerSplitProps | DateRangePickerControlledProps)

function DateRangePicker(props: DateRangePickerProps) {
  const {
    placeholder = "Selecione o período",
    className,
    disabled = false,
    numberOfMonths = 2,
    locale = ptBR,
    ref,
  } = props

  // Determine which API is in use.
  const hasSplitApi =
    typeof props.onFromChange !== "undefined" ||
    typeof props.onToChange !== "undefined" ||
    typeof props.from !== "undefined" ||
    typeof props.to !== "undefined"
  const hasControlledApi =
    typeof props.value !== "undefined" || typeof props.onChange !== "undefined"

  if (process.env.NODE_ENV !== "production" && hasSplitApi && hasControlledApi) {
    // eslint-disable-next-line no-console
    console.warn(
      "[DateRangePicker] Both controlled (value/onChange) and split (from/to/onFromChange/onToChange) APIs were provided. Prefer one — the controlled API takes precedence.",
    )
  }

  const from = hasControlledApi ? (props.value?.from ?? "") : (props.from ?? "")
  const to = hasControlledApi ? (props.value?.to ?? "") : (props.to ?? "")

  const emit = (nextFrom: string, nextTo: string) => {
    if (hasControlledApi) {
      props.onChange?.({ from: nextFrom, to: nextTo })
      return
    }
    if (nextFrom !== from) props.onFromChange?.(nextFrom)
    if (nextTo !== to) props.onToChange?.(nextTo)
  }

  const [open, setOpen] = React.useState(false)

  const range: DateRange | undefined =
    from || to
      ? {
          from: parseIsoDate(from),
          to: parseIsoDate(to),
        }
      : undefined

  const handleSelect = (selected: DateRange | undefined) => {
    if (!selected) {
      emit("", "")
      return
    }

    const nextFrom = toIsoString(selected.from)

    if (selected.to) {
      const nextTo = toIsoString(selected.to)
      emit(nextFrom, nextTo)
      setOpen(false)
      return
    }

    // Only `from` was picked. Preserve existing `to` to avoid the silent wipe.
    emit(nextFrom, to)
  }

  const handleClear = () => {
    emit("", "")
    setOpen(false)
  }

  const formatDisplay = () => {
    if (!from && !to) return null
    const fromDate = parseIsoDate(from)
    const toDate = parseIsoDate(to)
    const fromLabel = fromDate ? format(fromDate, "dd/MM/yyyy") : "..."
    const toLabel = toDate ? format(toDate, "dd/MM/yyyy") : "..."
    return `${fromLabel} — ${toLabel}`
  }

  return (
    <Popover open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          data-slot="date-range-picker"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal min-h-10 h-auto",
            !from && !to && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {formatDisplay() ?? <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={range?.from}
          selected={range}
          onSelect={handleSelect}
          numberOfMonths={numberOfMonths}
          locale={locale}
        />
        {(from || to) && (
          <div className="flex justify-end border-t p-2">
            <Button
              type="button"
              variant="ghost"
              size="default"
              className="h-8 px-2 text-xs"
              onClick={handleClear}
            >
              Limpar
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
DateRangePicker.displayName = "DateRangePicker"

export { DateRangePicker, type DateRangePickerProps }
