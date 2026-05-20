"use client"

import { format, isValid, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"
import * as React from "react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Popover } from "../overlays/popover"
import { FieldShell, type LabelPosition } from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"
import { Button } from "../primitives/button"
import { Calendar } from "./calendar"

export interface DateRangeValue {
  from: string
  to: string
}

export interface DateRangePickerProps {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  disabled?: boolean
  value: DateRangeValue
  onValueChange: (value: DateRangeValue) => void
  placeholder?: string
  className?: string
  numberOfMonths?: number
  id?: string
  "aria-label"?: string
  ref?: React.Ref<HTMLButtonElement>
}

function parseIsoDate(value: string): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, "yyyy-MM-dd", new Date())
  return isValid(parsed) ? parsed : undefined
}

function toIsoString(d: Date | undefined): string {
  return d ? format(d, "yyyy-MM-dd") : ""
}

function DateRangePicker({
  id,
  label,
  description,
  error,
  labelPosition,
  required,
  disabled,
  value,
  onValueChange,
  placeholder = "Selecione um período",
  className,
  numberOfMonths = 2,
  "aria-label": ariaLabel,
  ref,
}: DateRangePickerProps) {
  const ids = useFieldIds(id)
  const [open, setOpen] = React.useState(false)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""

  const fromDate = parseIsoDate(value.from)
  const toDate = parseIsoDate(value.to)
  const committedRange: DateRange | undefined =
    fromDate || toDate ? { from: fromDate, to: toDate } : undefined

  // Local pending selection while the popover is open; only committed to
  // onValueChange when the user clicks "Confirmar".
  const [pendingRange, setPendingRange] = React.useState<DateRange | undefined>(committedRange)

  // Sync pending range from the committed value each time the popover opens.
  React.useEffect(() => {
    if (open) setPendingRange(committedRange)
  }, [open])

  const handleSelect = (range: DateRange | undefined) => {
    setPendingRange(range)
  }

  const handleConfirm = () => {
    onValueChange({
      from: toIsoString(pendingRange?.from),
      to: toIsoString(pendingRange?.to),
    })
    setOpen(false)
  }

  const handleClear = () => {
    setPendingRange(undefined)
    onValueChange({ from: "", to: "" })
    setOpen(false)
  }

  const display =
    fromDate && toDate
      ? `${format(fromDate, "dd/MM/yyyy")} — ${format(toDate, "dd/MM/yyyy")}`
      : fromDate
        ? `${format(fromDate, "dd/MM/yyyy")} — ...`
        : placeholder

  const trigger = (
    <Button
      ref={ref}
      id={ids.controlId}
      variant="outline"
      disabled={disabled}
      aria-invalid={hasError ? true : undefined}
      aria-label={ariaLabel ?? (typeof label === "string" ? label : "Selecionar período")}
      aria-describedby={ids.describedBy({
        description: hasDescription,
        error: hasError,
      })}
      className={cn(
        "w-full justify-start text-left",
        !fromDate && "text-muted-foreground",
        className,
      )}
    >
      <CalendarIcon className="size-4" aria-hidden="true" />
      {display}
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
        onPointerDownOutside={(event) => {
          const target = event.target as HTMLElement | null
          if (target?.closest('[role="grid"], .rdp, .rdp-root')) {
            event.preventDefault()
          }
        }}
        onFocusOutside={(event) => event.preventDefault()}
      >
        <Calendar
          mode="range"
          selected={pendingRange}
          onSelect={handleSelect}
          numberOfMonths={numberOfMonths}
        />
        <div className="flex justify-end gap-2 border-t p-3">
          <Button variant="ghost" onClick={handleClear}>
            Limpar
          </Button>
          <Button onClick={handleConfirm}>Confirmar</Button>
        </div>
      </Popover>
    </FieldShell>
  )
}

DateRangePicker.displayName = "DateRangePicker"

export { DateRangePicker }
