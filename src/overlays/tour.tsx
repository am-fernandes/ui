"use client"

import * as PopoverPrimitive from "@radix-ui/react-popover"
import { X } from "lucide-react"
import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"
import { Button } from "../primitives/button"
import { IconButton } from "../primitives/icon-button"
import { motionPopover } from "./_internal/animations"

export type TourTarget = React.RefObject<HTMLElement | null> | string | (() => HTMLElement | null)

export interface TourStep {
  /** Element to point at: a ref, a CSS selector, or a function returning the element. */
  target: TourTarget
  title: React.ReactNode
  content?: React.ReactNode
  /** Side of the target the callout sits on. @default "bottom" */
  side?: "top" | "right" | "bottom" | "left"
  /** Alignment of the callout along that side. @default "start" */
  align?: "start" | "center" | "end"
}

/** `"completed"`: "Concluir" on the last step. `"dismissed"`: the X button or Escape. */
export type TourCloseReason = "completed" | "dismissed"

export interface TourLabels {
  previous: string
  next: string
  finish: string
  close: string
  progress: (current: number, total: number) => string
}

export const defaultTourLabels: TourLabels = {
  previous: "Voltar",
  next: "Próximo",
  finish: "Concluir",
  close: "Fechar tour",
  progress: (current, total) => `${current} de ${total}`,
}

export interface TourProps {
  steps: TourStep[]
  /** Whether the tour is running. Start it when it makes sense for the user. */
  open: boolean
  /**
   * Called when the tour ends. Persist completion here (e.g. localStorage) so
   * the user doesn't see the same tour on every visit.
   */
  onClose?: (reason: TourCloseReason) => void
  /** Controlled step index (0-based). */
  step?: number
  /** Step shown when the tour opens, uncontrolled. @default 0 */
  defaultStep?: number
  onStepChange?: (index: number) => void
  /** Dim the page around the target. @default true */
  spotlight?: boolean
  /** Show "2 de 5" in each step. @default true */
  showProgress?: boolean
  labels?: Partial<TourLabels>
}

const SPOTLIGHT_PADDING = 4

function resolveTarget(target: TourTarget | undefined): HTMLElement | null {
  if (target == null) return null
  if (typeof target === "string") {
    try {
      return document.querySelector<HTMLElement>(target)
    } catch {
      return null
    }
  }
  if (typeof target === "function") return target()
  return target.current
}

function fallbackRect(): DOMRect {
  // No target on the page: show the callout near the top-centre of the viewport.
  return new DOMRect(window.innerWidth / 2, window.innerHeight / 3, 0, 0)
}

interface Box {
  top: number
  left: number
  width: number
  height: number
}

function sameBox(a: Box | null, b: Box) {
  return (
    a !== null &&
    a.top === b.top &&
    a.left === b.left &&
    a.width === b.width &&
    a.height === b.height
  )
}

/** Tracks the target's viewport rect while the tour is open. */
function useTargetBox(element: HTMLElement | null, active: boolean): Box | null {
  const [box, setBox] = React.useState<Box | null>(null)

  React.useLayoutEffect(() => {
    if (!active || !element) {
      setBox(null)
      return
    }
    const update = () => {
      const r = element.getBoundingClientRect()
      const next = { top: r.top, left: r.left, width: r.width, height: r.height }
      setBox((current) => (sameBox(current, next) ? current : next))
    }
    update()
    window.addEventListener("scroll", update, true)
    window.addEventListener("resize", update)
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update)
    observer?.observe(element)
    return () => {
      window.removeEventListener("scroll", update, true)
      window.removeEventListener("resize", update)
      observer?.disconnect()
    }
  }, [element, active])

  return box
}

/**
 * Guided product tour (onboarding). Points a callout at one element of the
 * page per step, with "Voltar" / "Próximo" / "Concluir", an optional
 * spotlight around the target and "2 de 5" progress.
 *
 * Non-modal: the page stays usable, clicks outside don't end the tour,
 * Escape and the X dismiss it. Focus moves into the callout on each step and
 * goes back to where it was when the tour ends.
 *
 * Keep tours short and never put must-know information only in a tour.
 */
function Tour({
  steps,
  open,
  onClose,
  step,
  defaultStep = 0,
  onStepChange,
  spotlight = true,
  showProgress = true,
  labels,
}: TourProps) {
  const l: TourLabels = { ...defaultTourLabels, ...labels }
  const [internalStep, setInternalStep] = React.useState(defaultStep)
  const total = steps.length
  const rawIndex = step ?? internalStep
  const index = Math.min(Math.max(rawIndex, 0), Math.max(total - 1, 0))
  const current = steps[index]
  const isLast = index === total - 1

  const titleId = React.useId()
  const descriptionId = React.useId()
  const primaryRef = React.useRef<HTMLButtonElement>(null)
  const returnFocusRef = React.useRef<HTMLElement | null>(null)
  const titleRef = React.useRef<HTMLHeadingElement>(null)
  const descriptionRef = React.useRef<HTMLDivElement>(null)
  const [announcement, setAnnouncement] = React.useState("")

  // An uncontrolled tour restarts from `defaultStep` every time it opens
  // (adjusted during render, so the old step never flashes).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setInternalStep(defaultStep)
  }

  // Remember where focus was, to give it back when the tour ends. Layout
  // effects run before the callout's own (passive) auto-focus.
  React.useLayoutEffect(() => {
    if (open) returnFocusRef.current = document.activeElement as HTMLElement | null
  }, [open])

  // Resolve the target and bring it into view when a step activates — not on
  // every render (steps are usually an inline array).
  const stepsRef = React.useRef(steps)
  stepsRef.current = steps
  const [target, setTarget] = React.useState<HTMLElement | null>(null)
  React.useLayoutEffect(() => {
    const element = open ? resolveTarget(stepsRef.current[index]?.target) : null
    setTarget(element)
    element?.scrollIntoView?.({ block: "nearest", inline: "nearest" })
  }, [open, index])

  const box = useTargetBox(target, open && spotlight)

  // Radix positions the callout against this "virtual" anchor, read live on
  // every frame, so it follows the target through scroll and layout changes.
  const targetRef = React.useRef(target)
  targetRef.current = target
  const virtualRef = React.useRef({
    getBoundingClientRect: () => targetRef.current?.getBoundingClientRect() ?? fallbackRect(),
  })

  // Focus the primary action on every step change (the first one is handled
  // by onOpenAutoFocus) and announce the new step.
  const previousIndex = React.useRef<number | null>(null)
  React.useEffect(() => {
    if (!open) {
      previousIndex.current = null
      setAnnouncement("")
      return
    }
    if (previousIndex.current !== null && previousIndex.current !== index) {
      primaryRef.current?.focus()
      // The callout is mounted whenever the tour is open, so the title is
      // there. The content goes too: the focus stays on "Próximo", so
      // nothing else would read the new step's description.
      const title = titleRef.current!.textContent?.trim() ?? ""
      const content = descriptionRef.current?.textContent?.trim()
      const text = content ? `${title}${/[.!?:]$/.test(title) ? "" : "."} ${content}` : title
      setAnnouncement(`${l.progress(index + 1, total)}: ${text}`)
    }
    previousIndex.current = index
  }, [open, index, total, l.progress])

  const goTo = (next: number) => {
    if (step === undefined) setInternalStep(next)
    onStepChange?.(next)
  }

  const close = (reason: TourCloseReason) => onClose?.(reason)

  if (!current) return null

  const side = target ? (current.side ?? "bottom") : "bottom"
  const align = target ? (current.align ?? "start") : "center"

  return (
    <>
      {open && spotlight && box
        ? createPortal(
            <div
              aria-hidden="true"
              data-slot="tour-spotlight"
              // The page is dimmed by a huge translucent outline. Forced
              // colours would make it opaque and hide the page: there it is
              // a ring of the system highlight around the target instead.
              className="pointer-events-none fixed z-(--z-overlay) rounded-element outline-[9999px] outline-solid outline-black/50 forced-colors:outline-2 forced-colors:outline-[Highlight]"
              style={{
                top: box.top - SPOTLIGHT_PADDING,
                left: box.left - SPOTLIGHT_PADDING,
                width: box.width + SPOTLIGHT_PADDING * 2,
                height: box.height + SPOTLIGHT_PADDING * 2,
              }}
            />,
            document.body,
          )
        : null}
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={(next) => {
          if (!next) close("dismissed")
        }}
      >
        <PopoverPrimitive.Anchor virtualRef={virtualRef} />
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            data-slot="tour-step"
            data-step={index}
            aria-labelledby={titleId}
            aria-describedby={current.content ? descriptionId : undefined}
            side={side}
            align={align}
            sideOffset={SPOTLIGHT_PADDING + 8}
            collisionPadding={8}
            updatePositionStrategy="always"
            // A tour ends on purpose (X, Escape, Concluir) — not because the
            // user clicked the very element the step points at.
            onInteractOutside={(event) => event.preventDefault()}
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              primaryRef.current?.focus()
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault()
              const previous = returnFocusRef.current
              returnFocusRef.current = null
              if (previous?.isConnected) previous.focus()
            }}
            className={cn(
              "z-(--z-popover) w-80 max-w-[calc(100vw-16px)] rounded-container border border-border-strong bg-popover p-4 text-popover-foreground outline-none",
              motionPopover,
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "origin-(--radix-popover-content-transform-origin)",
            )}
          >
            <div className="flex items-start gap-2">
              <h2
                ref={titleRef}
                id={titleId}
                className="min-w-0 flex-1 pt-1 text-sm font-semibold text-foreground"
              >
                {current.title}
              </h2>
              <IconButton
                icon={<X />}
                label={l.close}
                size="sm"
                tooltip={false}
                className="-mr-2 -mt-2"
                onClick={() => close("dismissed")}
              />
            </div>
            {current.content ? (
              <div
                ref={descriptionRef}
                id={descriptionId}
                className="mt-1 text-sm text-muted-foreground"
              >
                {current.content}
              </div>
            ) : null}
            <div className="mt-4 flex items-center gap-2">
              {showProgress ? (
                <span
                  data-slot="tour-progress"
                  className="text-xs tabular-nums text-muted-foreground"
                >
                  {l.progress(index + 1, total)}
                </span>
              ) : null}
              <div className="ml-auto flex items-center gap-2">
                {index > 0 ? (
                  <Button variant="outline" onClick={() => goTo(index - 1)}>
                    {l.previous}
                  </Button>
                ) : null}
                <Button
                  ref={primaryRef}
                  onClick={() => (isLast ? close("completed") : goTo(index + 1))}
                >
                  {isLast ? l.finish : l.next}
                </Button>
              </div>
            </div>
            <output className="sr-only" data-slot="tour-announcer">
              {announcement}
            </output>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </>
  )
}

Tour.displayName = "Tour"

export { Tour }
