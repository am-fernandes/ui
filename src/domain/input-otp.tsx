"use client"

import { OTPInput, REGEXP_ONLY_DIGITS, type SlotProps } from "input-otp"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { FieldShell, type LabelPosition } from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"

export interface InputOTPProps {
  length: number
  value: string
  onValueChange: (value: string) => void
  onComplete?: (value: string) => void
  pattern?: string
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  disabled?: boolean
  id?: string
  className?: string
  ref?: React.Ref<HTMLInputElement>
}

function Slot({ slot }: { slot: SlotProps }) {
  return (
    <div
      data-slot="input-otp-slot"
      data-active={slot.isActive || undefined}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border-y border-r border-input font-mono text-sm tabular-nums transition-colors",
        "first:rounded-l-md first:border-l last:rounded-r-md",
        "data-[active=true]:z-10 data-[active=true]:ring-2 data-[active=true]:ring-ring",
      )}
    >
      {slot.char ?? slot.placeholderChar}
      {slot.hasFakeCaret ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      ) : null}
    </div>
  )
}

function InputOTP({
  length,
  value,
  onValueChange,
  onComplete,
  pattern = REGEXP_ONLY_DIGITS,
  label,
  description,
  error,
  labelPosition,
  required,
  disabled,
  id,
  className,
  ref,
}: InputOTPProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""

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
      <OTPInput
        ref={ref}
        id={ids.controlId}
        data-slot="input-otp"
        maxLength={length}
        value={value}
        onChange={onValueChange}
        onComplete={onComplete}
        pattern={pattern}
        disabled={disabled}
        aria-invalid={hasError ? true : undefined}
        aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
        containerClassName={cn("flex items-center has-disabled:opacity-50", className)}
        render={({ slots }) => (
          <div className="flex items-center">
            {slots.map((slot, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: slots are positional and fixed-length
              <Slot key={i} slot={slot} />
            ))}
          </div>
        )}
      />
    </FieldShell>
  )
}

InputOTP.displayName = "InputOTP"

export { InputOTP, REGEXP_ONLY_DIGITS }
