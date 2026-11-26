"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useComposedRefs } from "./_internal/compose-refs"
import { type ControlSize, controlHeight, controlPaddingX } from "./_internal/control-size"
import { FieldShell, type LabelPosition, fieldReadOnlyClass } from "./_internal/field-shell"
import { useFieldIds } from "./_internal/use-field-ids"

// The icon slots take the horizontal padding of the size on their outer side.
const affixPadding: Record<ControlSize, { leading: string; trailing: string }> = {
  sm: { leading: "pl-2.5", trailing: "pr-2.5" },
  md: { leading: "pl-3", trailing: "pr-3" },
  lg: { leading: "pl-4", trailing: "pr-4" },
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: React.ReactNode
  labelPosition?: LabelPosition
  description?: React.ReactNode
  error?: string
  required?: boolean
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  /**
   * `sm` 32px, `md` 40px, `lg` 44px: the height of the bordered box, the same
   * as a `Button` of that size. (Not the native `size` attribute.)
   * @default "md"
   */
  size?: ControlSize
  /**
   * Classes for the `<input>` itself: text alignment, `tabular-nums`, the
   * placeholder. The bordered box is `wrapperClassName`, and the field
   * around label and messages (width, margins) is `fieldClassName`.
   */
  className?: string
  /** Classes for the box that draws the border and the fill (`data-slot="input-wrapper"`). */
  wrapperClassName?: string
  /** Classes for the whole field: label, box and messages (`data-slot="field-shell"`). */
  fieldClassName?: string
  ref?: React.Ref<HTMLInputElement>
}

function Input({
  id,
  label,
  labelPosition,
  description,
  error,
  required,
  leadingIcon,
  trailingIcon,
  size = "md",
  className,
  wrapperClassName,
  fieldClassName,
  disabled,
  readOnly,
  "aria-describedby": describedBy,
  ref,
  ...props
}: InputProps) {
  const ids = useFieldIds(id)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const mergedRef = useComposedRefs(inputRef, ref)
  // Disabled wins: a disabled field is dimmed, not filled.
  const isReadOnly = Boolean(readOnly) && !disabled
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""

  const inputEl = (
    <div
      data-slot="input-wrapper"
      data-readonly={isReadOnly ? "" : undefined}
      // The whole box is the field: a press on an icon or on the padding
      // focuses the input, as one on its text does. A button or a link in a
      // slot (show password, clear) keeps its own click.
      onMouseDown={(event) => {
        const input = inputRef.current
        if (!input || disabled || event.button !== 0) return
        const target = event.target as Element
        if (target === input || target.closest("button, a, input, select, textarea, [tabindex]"))
          return
        event.preventDefault()
        input.focus()
      }}
      className={cn(
        "relative flex w-full items-center rounded-element border border-input bg-card text-sm field-states",
        fieldReadOnlyClass,
        controlHeight[size],
        hasError && "border-destructive-text field-error",
        disabled && "cursor-default",
        wrapperClassName,
      )}
    >
      {leadingIcon ? (
        <span
          data-slot="input-leading"
          className={cn("flex items-center text-muted-foreground", affixPadding[size].leading)}
        >
          {leadingIcon}
        </span>
      ) : null}
      <input
        ref={mergedRef}
        id={ids.controlId}
        data-slot="input"
        aria-invalid={hasError ? true : undefined}
        aria-describedby={ids.describedBy(
          { description: hasDescription, error: hasError },
          describedBy,
        )}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        className={cn(
          "h-full w-full min-w-0 bg-transparent placeholder:text-placeholder outline-none disabled:cursor-default",
          controlPaddingX[size],
          leadingIcon && "pl-2",
          trailingIcon && "pr-2",
          className,
        )}
        {...props}
        // Read-only, no placeholder: a hint to type in a field that takes no
        // typing, drawn on the muted fill below 4.5:1.
        placeholder={isReadOnly ? undefined : props.placeholder}
      />
      {trailingIcon ? (
        <span
          data-slot="input-trailing"
          className={cn("flex items-center text-muted-foreground", affixPadding[size].trailing)}
        >
          {trailingIcon}
        </span>
      ) : null}
    </div>
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
      nativeRequired
      disabled={disabled}
      size={size}
      className={fieldClassName}
    >
      {inputEl}
    </FieldShell>
  )
}

Input.displayName = "Input"

export { Input }
