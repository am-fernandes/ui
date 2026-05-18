"use client"

import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS } from "input-otp"
import { Dot } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { FieldShell, type LabelPosition } from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"

export interface InputOTPProps {
  length: number
  value: string
  onValueChange: (value: string) => void
  onComplete?: (value: string) => void
  pattern?: string
  /** Insert a separator every N slots. */
  separatorEvery?: number
  /** Separator content. Defaults to a dot. */
  separator?: React.ReactNode
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

function Slot({ index }: { index: number }) {
  const ctx = React.useContext(OTPInputContext)
  const slot = ctx?.slots?.[index] ?? {
    char: undefined,
    hasFakeCaret: false,
    isActive: false,
  }
  return (
    <div
      data-slot="input-otp-slot"
      data-active={slot.isActive || undefined}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all",
        "first:rounded-l-md first:border-l last:rounded-r-md",
        "data-[active=true]:z-10 data-[active=true]:ring-2 data-[active=true]:ring-ring",
      )}
    >
      {slot.char}
      {slot.hasFakeCaret ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      ) : null}
    </div>
  )
}

function Separator({ children }: { children: React.ReactNode }) {
  return (
    <div data-slot="input-otp-separator" aria-hidden="true">
      {children ?? <Dot className="size-3" />}
    </div>
  )
}

function InputOTP({
  length,
  value,
  onValueChange,
  onComplete,
  pattern = REGEXP_ONLY_DIGITS,
  separatorEvery,
  separator,
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
  const slots = Array.from({ length }, (_, i) => i)

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
        containerClassName={cn("flex items-center gap-2 has-disabled:opacity-50", className)}
        render={() => (
          <div className="flex items-center">
            {slots.map((i) => {
              const showSeparator =
                separatorEvery && i > 0 && i < length && i % separatorEvery === 0
              return (
                <React.Fragment key={i}>
                  {showSeparator ? <Separator>{separator}</Separator> : null}
                  <Slot index={i} />
                </React.Fragment>
              )
            })}
          </div>
        )}
      />
    </FieldShell>
  )
}

InputOTP.displayName = "InputOTP"

export { InputOTP, REGEXP_ONLY_DIGITS }
