"use client"

import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import * as React from "react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "../overlays/popover"
import { Button } from "../primitives/button"
import { Input } from "../primitives/input"
import { Calendar } from "./calendar"

function formatBrDate(isoDate: string): string {
  if (!isoDate) return ""
  try {
    return format(parseISO(isoDate), "dd/MM/yyyy")
  } catch {
    return isoDate
  }
}

interface DateInputProps {
  id?: string
  value: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

const DateInput = React.forwardRef<HTMLButtonElement, DateInputProps>(
  ({ id, value, onChange, disabled, className, placeholder = "dd/mm/aaaa" }, ref) => {
    const [open, setOpen] = useState(false)

    if (disabled) {
      return (
        <Input
          id={id}
          data-slot="date-input"
          value={formatBrDate(value)}
          disabled
          className={cn("bg-muted", className)}
          placeholder={placeholder}
        />
      )
    }

    const selected = value ? parseISO(value) : undefined

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            id={id}
            data-slot="date-input"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-9",
              !value && "text-muted-foreground",
              className,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? formatBrDate(value) : placeholder}
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
            locale={ptBR}
            defaultMonth={selected}
          />
        </PopoverContent>
      </Popover>
    )
  },
)
DateInput.displayName = "DateInput"

export { DateInput, type DateInputProps }
