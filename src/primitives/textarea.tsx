"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useAnnounceWhen } from "./_internal/announce"
import { useComposedRefs } from "./_internal/compose-refs"
import { type ControlSize, controlMinHeight, controlPaddingX } from "./_internal/control-size"
import { FieldShell, type LabelPosition, fieldReadOnlyClass } from "./_internal/field-shell"
import { observeValue } from "./_internal/observe-value"
import { useFieldIds } from "./_internal/use-field-ids"

// A textarea grows with its content, so the size is a minimum height. The
// vertical padding makes one row (a 20px line) exactly the control height,
// border included: its text sits on the same line as an Input beside it.
const textareaSize: Record<ControlSize, string> = {
  sm: `${controlMinHeight.sm} ${controlPaddingX.sm} py-[5px]`,
  md: `${controlMinHeight.md} ${controlPaddingX.md} py-[9px]`,
  lg: `${controlMinHeight.lg} ${controlPaddingX.lg} py-[11px]`,
}

export interface TextareaLabels {
  /** How a screen reader reads the counter, shown on screen as "27/500". */
  characterCount: (count: number, max: number) => string
  /** Announced once, when what is typed reaches `maxLength`. */
  limitReached: (max: number) => string
}

export const defaultTextareaLabels: TextareaLabels = {
  characterCount: (count, max) => `${count} de ${max} caracteres`,
  limitReached: (max) => `Limite de ${max} caracteres atingido`,
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode
  labelPosition?: LabelPosition
  description?: React.ReactNode
  error?: string
  required?: boolean
  autoResize?: boolean
  /**
   * Besides limiting what can be typed, shows a counter ("27/500"). The
   * counter is part of the field's description, read when the field gets
   * focus; it is not announced at every key. Reaching the limit is announced
   * once.
   */
  maxLength?: number
  /** Text for screen readers. Defaults in `defaultTextareaLabels`. */
  labels?: Partial<TextareaLabels>
  /**
   * Minimum height and padding: with `rows={1}` the box is 32px (`sm`), 40px
   * (`md`) or 44px (`lg`), the height of an `Input` of that size. More rows
   * and `autoResize` grow from there.
   * @default "md"
   */
  size?: ControlSize
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
  size = "md",
  maxLength,
  labels,
  className,
  disabled,
  readOnly,
  "aria-describedby": describedBy,
  ref,
  value,
  defaultValue,
  onChange,
  ...props
}: TextareaProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const l: TextareaLabels = { ...defaultTextareaLabels, ...labels }

  const isControlled = value !== undefined
  // The counter of an uncontrolled textarea follows the DOM, not `onChange`:
  // a form library may write the value through the ref without any event.
  const [domLength, setDomLength] = React.useState(() =>
    defaultValue == null ? 0 : String(defaultValue).length,
  )
  const length = isControlled ? String(value ?? "").length : domLength

  const hasCounter = Boolean(maxLength)
  const counterId = `${ids.controlId}-counter`
  // The browser just stops accepting keys at the limit; say why, once.
  useAnnounceWhen(hasCounter && length >= (maxLength ?? 0), l.limitReached(maxLength ?? 0))

  const localRef = React.useRef<HTMLTextAreaElement | null>(null)
  const mergedRef = useComposedRefs(localRef, ref)

  // What the last measurement saw: the height is only measured again when the
  // text or the width of the box changed.
  const measured = React.useRef<{ value: string; width: number } | null>(null)
  const syncFromDom = React.useCallback(
    (force = false) => {
      const el = localRef.current
      if (!el) return
      if (!isControlled) setDomLength(el.value.length)
      if (!autoResize) return
      const width = el.clientWidth
      const last = measured.current
      if (!force && last && last.value === el.value && last.width === width) return
      el.style.height = "auto"
      // scrollHeight leaves the border out, and the box is border-box.
      el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`
      measured.current = { value: el.value, width }
    },
    [autoResize, isControlled],
  )

  // After every commit: picks up what React, or a ref callback such as
  // react-hook-form's `register`, has just written to the DOM.
  React.useLayoutEffect(() => {
    syncFromDom()
  })

  // Turning `autoResize` off hands the height back to `rows` and the classes.
  React.useLayoutEffect(() => {
    if (!autoResize) return
    const el = localRef.current
    return () => {
      measured.current = null
      if (el) el.style.height = ""
    }
  }, [autoResize])

  React.useEffect(() => {
    const el = localRef.current
    if (!el) return

    // `textarea.value = …` from code (setValue and reset of react-hook-form).
    let queued = false
    const stopObserving = observeValue(el, () => {
      if (queued) return
      queued = true
      queueMicrotask(() => {
        queued = false
        syncFromDom()
      })
    })

    // A native reset: the event fires before the fields go back.
    const form = el.form
    let resetTimer: number | undefined
    const onReset = () => {
      window.clearTimeout(resetTimer)
      resetTimer = window.setTimeout(() => syncFromDom())
    }
    form?.addEventListener("reset", onReset)

    return () => {
      stopObserving()
      window.clearTimeout(resetTimer)
      form?.removeEventListener("reset", onReset)
    }
  }, [syncFromDom])

  // A narrower box wraps the same text into more lines; a font that finishes
  // loading changes how much fits in each one.
  React.useEffect(() => {
    const el = localRef.current
    if (!autoResize || !el) return
    let frame = 0
    // Next frame: resizing inside the observer's own callback makes the
    // browser report a ResizeObserver loop.
    const schedule = (force: boolean) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => syncFromDom(force))
    }
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => schedule(false))
    observer?.observe(el)
    const fonts = document.fonts
    const onFontsLoaded = () => schedule(true)
    fonts?.addEventListener?.("loadingdone", onFontsLoaded)
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      fonts?.removeEventListener?.("loadingdone", onFontsLoaded)
    }
  }, [autoResize, syncFromDom])

  const textareaEl = (
    <textarea
      ref={mergedRef}
      id={ids.controlId}
      data-slot="textarea"
      aria-invalid={hasError ? true : undefined}
      aria-describedby={ids.describedBy(
        { description: hasDescription, error: hasError },
        hasCounter && counterId,
        describedBy,
      )}
      disabled={disabled}
      readOnly={readOnly}
      // Disabled wins: a disabled field is dimmed, not filled.
      data-readonly={readOnly && !disabled ? "" : undefined}
      required={required}
      maxLength={maxLength}
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => {
        syncFromDom()
        onChange?.(e)
      }}
      className={cn(
        "w-full rounded-element border border-input bg-card text-sm field-states",
        fieldReadOnlyClass,
        textareaSize[size],
        "placeholder:text-placeholder",
        "disabled:cursor-default",
        hasError && "border-destructive-text field-error",
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
      nativeRequired
      disabled={disabled}
    >
      {textareaEl}
      {maxLength ? (
        // Not a live region: it would be read at every key. It describes the
        // field instead, in words, and is read when the field gets focus.
        <p
          id={counterId}
          data-slot="textarea-counter"
          className="text-right text-xs tabular-nums text-muted-foreground"
        >
          <span aria-hidden="true">
            {length}/{maxLength}
          </span>
          <span className="sr-only">{l.characterCount(length, maxLength)}</span>
        </p>
      ) : null}
    </FieldShell>
  )
}

Textarea.displayName = "Textarea"

export { Textarea }
