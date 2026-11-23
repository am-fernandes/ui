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
  /** Regular expression every character must match. Default: digits only. */
  pattern?: string
  /**
   * Virtual keyboard on phones. Default: `"numeric"` when `pattern` accepts
   * only digits, `"text"` when it accepts letters.
   */
  inputMode?: "numeric" | "text"
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

function Slot({ slot, invalid }: { slot: SlotProps; invalid: boolean }) {
  return (
    <div
      data-slot="input-otp-slot"
      data-active={slot.isActive || undefined}
      data-invalid={invalid || undefined}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border-y border-r border-input font-mono text-sm tabular-nums transition-colors",
        "first:rounded-l-element first:border-l last:rounded-r-element",
        "data-[active=true]:z-10 data-[active=true]:outline-1 data-[active=true]:-outline-offset-1 data-[active=true]:outline-ring data-[active=true]:shadow-[inset_0_0_0_2px_var(--field-focus-ring)]",
        // With an error the boxes are red, like the border of any other field,
        // and the focused one stays red too.
        invalid && "border-destructive-text data-[active=true]:outline-destructive-text",
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

/** Whether a code of this pattern can hold letters, so needs a text keyboard. */
function acceptsLetters(pattern: string) {
  try {
    const re = new RegExp(pattern)
    return ["a", "A", "z", "Z", "F"].some((c) => re.test(c))
  } catch {
    // An invalid pattern rejects nothing in particular: keep every key.
    return true
  }
}

function InputOTP({
  length,
  value,
  onValueChange,
  onComplete,
  pattern = REGEXP_ONLY_DIGITS,
  inputMode,
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
        inputMode={inputMode ?? (acceptsLetters(pattern) ? "text" : "numeric")}
        disabled={disabled}
        aria-invalid={hasError ? true : undefined}
        aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
        // The field shell already fades the whole field when disabled.
        containerClassName={cn("flex items-center", className)}
        render={({ slots }) => (
          <div className="flex items-center">
            {slots.map((slot, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: slots are positional and fixed-length
              <Slot key={i} slot={slot} invalid={hasError} />
            ))}
          </div>
        )}
      />
    </FieldShell>
  )
}

InputOTP.displayName = "InputOTP"

export { InputOTP, REGEXP_ONLY_DIGITS }
