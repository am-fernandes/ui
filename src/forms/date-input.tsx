"use client"

import { format, isValid, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Popover } from "../overlays/popover"
import { FieldShell, type LabelPosition } from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"
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
  if (!parsed) return ""
  return format(parsed, "dd/MM/yyyy")
}

export interface DateInputProps {
  id?: string
  value: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  "aria-label"?: string
  ref?: React.Ref<HTMLButtonElement>
}

function DateInput({
  id,
  value,
  onChange,
  disabled,
  className,
  placeholder = "dd/mm/aaaa",
  label,
  description,
  error,
  labelPosition,
  required,
  "aria-label": ariaLabel,
  ref,
}: DateInputProps) {
  const ids = useFieldIds(id)
  const [open, setOpen] = React.useState(false)
  const hasError = error != null && error !== ""

  const selected = parseIsoDate(value)
  const display = value ? formatBrDate(value) : ""
  const hasValidValue = display.length > 0

  const trigger = (
    <Button
      ref={ref}
      id={ids.controlId}
      data-slot="date-input"
      variant="outline"
      aria-label={ariaLabel ?? (typeof label === "string" ? label : "Selecionar data")}
      aria-invalid={hasError ? true : undefined}
      aria-describedby={ids.describedBy({
        description: description != null && description !== "",
        error: hasError,
      })}
      disabled={disabled}
      className={cn(
        "w-full justify-start text-left font-normal h-auto px-3 py-2.5",
        !hasValidValue && "text-muted-foreground",
        className,
      )}
    >
      <CalendarIcon className="h-4 w-4" />
      {hasValidValue ? display : placeholder}
    </Button>
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
      <Popover
        open={open}
        onOpenChange={(next) => !disabled && setOpen(next)}
        align="start"
        trigger={trigger}
        className="w-auto p-0"
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            onChange?.(date ? format(date, "yyyy-MM-dd") : "")
            setOpen(false)
          }}
          defaultMonth={selected}
        />
      </Popover>
    </FieldShell>
  )
}
DateInput.displayName = "DateInput"

export { DateInput }
