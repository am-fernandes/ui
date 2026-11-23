"use client"

import * as SwitchPrimitive from "@radix-ui/react-switch"
import * as React from "react"

import { cn } from "@/lib/utils"
import { useComposedRefs } from "./_internal/compose-refs"
import { Label } from "./_internal/label"
import { useControllableState } from "./_internal/use-controllable-state"
import { useFieldIds } from "./_internal/use-field-ids"
import { useFormReset } from "./_internal/use-form-reset"

export interface SwitchProps extends Omit<React.ComponentProps<typeof SwitchPrimitive.Root>, "id"> {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  id?: string
  ref?: React.Ref<HTMLButtonElement>
}

function Switch({
  id,
  label,
  description,
  error,
  required,
  disabled,
  className,
  checked: checkedProp,
  defaultChecked,
  onCheckedChange,
  "aria-describedby": describedBy,
  ref,
  ...props
}: SwitchProps) {
  const ids = useFieldIds(id)
  const [checked, setChecked] = useControllableState(
    checkedProp,
    defaultChecked ?? false,
    onCheckedChange,
  )
  // A form reset brings back the state the switch was created with.
  const initialChecked = React.useRef(checked)
  const [node, setNode] = React.useState<HTMLButtonElement | null>(null)
  const composedRef = useComposedRefs(ref, setNode)
  useFormReset(node, () => setChecked(initialChecked.current))
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const hasLabel = label != null && label !== ""

  const switchEl = (
    <SwitchPrimitive.Root
      ref={composedRef}
      id={ids.controlId}
      data-slot="switch"
      checked={checked}
      onCheckedChange={setChecked}
      disabled={disabled}
      required={required}
      aria-invalid={hasError ? true : undefined}
      aria-describedby={ids.describedBy(
        { description: hasDescription, error: hasError },
        describedBy,
      )}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
        "focus-visible:focus-outline",
        "disabled:cursor-default",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        // Forced colours: on is the system's selection colour, off an outline
        // with a solid thumb. On paper the fills are kept.
        "forced-colors:border-[ButtonText] forced-colors:data-[state=checked]:border-[Highlight] forced-colors:data-[state=checked]:bg-[Highlight] [print-color-adjust:exact]",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-5 rounded-full bg-card ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 forced-colors:bg-[ButtonText] forced-colors:data-[state=checked]:bg-[HighlightText]"
      />
    </SwitchPrimitive.Root>
  )

  const labelEl = hasLabel ? (
    // 2px down: the first line of the label (20px) is centred on the 24px track.
    // `min-w-0`: a long label wraps here instead of pushing out of the container.
    <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
      <Label htmlFor={ids.controlId} required={required} disabled={disabled} id={ids.labelId}>
        {label}
      </Label>
      {hasDescription ? (
        <p id={ids.descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  ) : null

  return (
    <div
      data-slot="switch-field"
      data-disabled={disabled ? "" : undefined}
      // Disabled dims the whole field once, here: track, label and messages.
      className={cn("flex flex-col gap-1.5", disabled && "opacity-50")}
    >
      <div className="flex items-start gap-2">
        {switchEl}
        {labelEl}
      </div>
      {hasError ? (
        <p id={ids.errorId} role="alert" className="text-xs text-destructive-text">
          {error}
        </p>
      ) : null}
    </div>
  )
}

Switch.displayName = "Switch"

export { Switch }
