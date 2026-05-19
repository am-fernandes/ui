"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { FieldShell, type LabelPosition } from "./_internal/field-shell"
import { useFieldIds } from "./_internal/use-field-ids"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode
  labelPosition?: LabelPosition
  description?: React.ReactNode
  error?: string
  required?: boolean
  autoResize?: boolean
  ref?: React.Ref<HTMLTextAreaElement>
}

function Textarea({
  id,
  label,
  labelPosition,
  description,
  error,
  required,
  autoResize,
  maxLength,
  className,
  disabled,
  ref,
  value,
  defaultValue,
  onChange,
  ...props
}: TextareaProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""

  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState<string>(
    typeof defaultValue === "string" ? defaultValue : "",
  )
  const current = isControlled ? String(value ?? "") : internal

  const localRef = React.useRef<HTMLTextAreaElement | null>(null)
  const mergedRef = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      localRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
    },
    [ref],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: `current` is the trigger — re-run on value change.
  React.useEffect(() => {
    if (!autoResize || !localRef.current) return
    localRef.current.style.height = "auto"
    localRef.current.style.height = `${localRef.current.scrollHeight}px`
  }, [autoResize, current])

  const textareaEl = (
    <textarea
      ref={mergedRef}
      id={ids.controlId}
      data-slot="textarea"
      aria-invalid={hasError ? true : undefined}
      aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
      disabled={disabled}
      required={required}
      maxLength={maxLength}
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => {
        if (!isControlled) setInternal(e.target.value)
        onChange?.(e)
      }}
      className={cn(
        "min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm transition-colors",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        hasError && "border-destructive focus-visible:ring-destructive",
        autoResize && "resize-none overflow-hidden",
        className,
      )}
      {...props}
    />
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
      {textareaEl}
      {maxLength ? (
        <p className="text-right text-xs text-muted-foreground" aria-live="polite">
          {current.length}/{maxLength}
        </p>
      ) : null}
    </FieldShell>
  )
}

Textarea.displayName = "Textarea"

export { Textarea }
