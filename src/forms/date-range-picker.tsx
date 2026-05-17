"use client"

import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import * as React from "react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "../overlays/popover"
import { Button } from "../primitives/button"
import { Calendar } from "./calendar"

interface DateRangePickerProps {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  placeholder?: string
  className?: string
}

const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(
  ({ from, to, onFromChange, onToChange, placeholder = "Selecione o período", className }, ref) => {
    const range: DateRange | undefined =
      from || to
        ? {
            from: from ? parseISO(from) : undefined,
            to: to ? parseISO(to) : undefined,
          }
        : undefined

    const handleSelect = (selected: DateRange | undefined) => {
      onFromChange(selected?.from ? format(selected.from, "yyyy-MM-dd") : "")
      onToChange(selected?.to ? format(selected.to, "yyyy-MM-dd") : "")
    }

    const formatDisplay = () => {
      if (!from && !to) return null
      const fromLabel = from ? format(parseISO(from), "dd/MM/yyyy", { locale: ptBR }) : "..."
      const toLabel = to ? format(parseISO(to), "dd/MM/yyyy", { locale: ptBR }) : "..."
      return `${fromLabel} — ${toLabel}`
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            data-slot="date-range-picker"
            variant="outline"
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
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    )
  },
)
DateRangePicker.displayName = "DateRangePicker"

export { DateRangePicker, type DateRangePickerProps }
