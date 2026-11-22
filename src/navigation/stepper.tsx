"use client"

import { Check, ChevronLeft, ChevronRight, CircleAlert, TriangleAlert } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { IconButton } from "../primitives/icon-button"

export interface StepperStep {
  label: string
  description?: React.ReactNode
  /** Appends "Opcional" after the label. */
  optional?: boolean
  disabled?: boolean
  /** Overrides the progress colours: an error or a warning on this step. */
  status?: "error" | "warning"
  /** Vertical only: content shown under the active step (e.g. its form fields). */
  content?: React.ReactNode
}

export interface StepperLabels {
  /** Accessible name of the list of steps. */
  label: string
  optional: string
  completed: string
  current: string
  error: string
  warning: string
  stepOf: (step: number, total: number) => string
  previousStep: string
  nextStep: string
}

export const defaultStepperLabels: StepperLabels = {
  label: "Progresso",
  optional: "Opcional",
  completed: "concluída",
  current: "etapa atual",
  error: "com erro",
  warning: "com alerta",
  stepOf: (step, total) => `Etapa ${step} de ${total}`,
  previousStep: "Etapa anterior",
  nextStep: "Próxima etapa",
}

export interface StepperProps {
  steps: StepperStep[]
  /**
   * Zero-based index of the current step. Steps before it are completed;
   * `steps.length` marks every step as completed.
   */
  activeStep: number
  /** Enables non-linear navigation: every enabled step becomes a button. */
  onStepClick?: (index: number) => void
  /** @default "horizontal" */
  orientation?: "horizontal" | "vertical"
  labels?: Partial<StepperLabels>
  className?: string
}

type StepState = "completed" | "current" | "upcoming"

function stateOf(index: number, activeStep: number): StepState {
  if (index < activeStep) return "completed"
  if (index === activeStep) return "current"
  return "upcoming"
}

// The horizontal list needs ~8rem per step; below that the container shows the
// compact summary instead. Static class strings so Tailwind can see them.
const COLLAPSE_AT: Record<number, { list: string; compact: string }> = {
  2: { list: "@xs:flex", compact: "@xs:hidden" },
  3: { list: "@sm:flex", compact: "@sm:hidden" },
  4: { list: "@lg:flex", compact: "@lg:hidden" },
  5: { list: "@2xl:flex", compact: "@2xl:hidden" },
  6: { list: "@3xl:flex", compact: "@3xl:hidden" },
}
const COLLAPSE_AT_MANY = { list: "@4xl:flex", compact: "@4xl:hidden" }

function collapseClasses(count: number) {
  if (count <= 1) return { list: "flex", compact: "hidden" }
  return COLLAPSE_AT[count] ?? COLLAPSE_AT_MANY
}

function Indicator({
  step,
  state,
  number,
}: { step: StepperStep; state: StepState; number: number }) {
  let content: React.ReactNode = number
  if (step.status === "error") content = <CircleAlert className="size-4" />
  else if (step.status === "warning") content = <TriangleAlert className="size-4" />
  else if (state === "completed") content = <Check className="size-4" />

  return (
    <span
      aria-hidden="true"
      data-slot="stepper-indicator"
      data-state={step.status ?? state}
      className={cn(
        "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium tabular-nums transition-colors",
        step.status === "error" && "border-destructive bg-destructive text-destructive-foreground",
        step.status === "warning" && "border-warning bg-warning text-warning-foreground",
        !step.status &&
          state === "completed" &&
          "border-primary bg-primary text-primary-foreground",
        !step.status && state === "current" && "border-2 border-primary bg-card text-foreground",
        !step.status && state === "upcoming" && "border-input bg-card text-muted-foreground",
      )}
    >
      {content}
    </span>
  )
}

function StatusText({
  step,
  state,
  labels,
}: { step: StepperStep; state: StepState; labels: StepperLabels }) {
  const parts: string[] = []
  if (state === "completed") parts.push(labels.completed)
  if (state === "current") parts.push(labels.current)
  if (step.status === "error") parts.push(labels.error)
  if (step.status === "warning") parts.push(labels.warning)
  if (parts.length === 0) return null
  return <span className="sr-only">{`, ${parts.join(", ")}`}</span>
}

/**
 * Numbered sequence of steps for multi-step flows (cadastro, proposta,
 * checkout). Shows where the user is, what is done and what is left.
 *
 * Data-driven: describe the steps in `steps` and set `activeStep`. With
 * `onStepClick`, steps become buttons (non-linear navigation). Horizontal
 * steppers collapse to a compact "Etapa 2 de 5 · Endereço" summary when the
 * container is too narrow.
 */
function Stepper({
  steps,
  activeStep,
  onStepClick,
  orientation = "horizontal",
  labels,
  className,
}: StepperProps) {
  const l: StepperLabels = { ...defaultStepperLabels, ...labels }
  const total = steps.length
  const vertical = orientation === "vertical"

  const renderStepBody = (step: StepperStep, index: number, state: StepState) => {
    const textAlign = vertical ? "items-start text-left" : "items-center text-center"
    const text = (
      <span
        className={cn(
          "flex min-w-0 flex-col gap-0.5",
          textAlign,
          vertical ? "pt-1" : "w-full px-1",
        )}
      >
        <span
          data-slot="stepper-label"
          className={cn(
            "max-w-full truncate text-sm font-medium",
            state === "upcoming" && !step.status ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {step.label}
          <StatusText step={step} state={state} labels={l} />
        </span>
        {step.optional ? <span className="text-xs text-muted-foreground">{l.optional}</span> : null}
        {step.description ? (
          <span className="text-xs text-muted-foreground">{step.description}</span>
        ) : null}
      </span>
    )
    const layout = vertical ? "flex items-start gap-3" : "flex flex-col items-center gap-2"
    const inner = (
      <>
        <Indicator step={step} state={state} number={index + 1} />
        {text}
      </>
    )

    if (!onStepClick) {
      return <div className={cn(layout, "min-w-0", step.disabled && "opacity-50")}>{inner}</div>
    }
    return (
      <button
        type="button"
        data-slot="stepper-step-button"
        disabled={step.disabled}
        aria-current={state === "current" ? "step" : undefined}
        onClick={() => onStepClick(index)}
        className={cn(
          layout,
          "min-w-0 cursor-pointer rounded-element p-1 transition-colors state-layer",
          "focus-visible:focus-outline",
          "disabled:cursor-default disabled:opacity-50",
          vertical ? "-m-1 w-[calc(100%+0.5rem)]" : "w-full",
        )}
      >
        {inner}
      </button>
    )
  }

  const items = steps.map((step, index) => {
    const state = stateOf(index, activeStep)
    // The segment leading into a step is "done" once that step is reached.
    const reached = index <= activeStep
    return (
      <li
        // biome-ignore lint/suspicious/noArrayIndexKey: steps are positional by nature
        key={index}
        data-slot="stepper-step"
        data-state={state}
        aria-current={!onStepClick && state === "current" ? "step" : undefined}
        className={cn("relative min-w-0", vertical ? "flex flex-col pb-6 last:pb-0" : "flex-1")}
      >
        {index > 0 && !vertical ? (
          <span
            aria-hidden="true"
            data-slot="stepper-connector"
            className={cn(
              "absolute top-4 right-[calc(50%+1.25rem)] left-[calc(-50%+1.25rem)] h-px",
              reached ? "bg-primary" : "bg-border",
              onStepClick && "top-5",
            )}
          />
        ) : null}
        {vertical && index < total - 1 ? (
          <span
            aria-hidden="true"
            data-slot="stepper-connector"
            className={cn(
              "absolute top-10 bottom-1 left-4 w-px -translate-x-1/2",
              index < activeStep ? "bg-primary" : "bg-border",
              onStepClick && "left-4",
            )}
          />
        ) : null}
        {renderStepBody(step, index, state)}
        {vertical && state === "current" && step.content ? (
          <div data-slot="stepper-content" className="mt-3 pl-11">
            {step.content}
          </div>
        ) : null}
      </li>
    )
  })

  if (vertical) {
    return (
      <ol
        aria-label={l.label}
        data-slot="stepper"
        data-orientation="vertical"
        className={cn("flex flex-col", className)}
      >
        {items}
      </ol>
    )
  }

  const collapse = collapseClasses(total)
  const currentIndex = Math.min(Math.max(activeStep, 0), Math.max(total - 1, 0))
  const currentStep = steps[currentIndex]
  const currentState = stateOf(currentIndex, activeStep)

  const nearestEnabled = (from: number, direction: 1 | -1) => {
    for (let i = from + direction; i >= 0 && i < total; i += direction) {
      if (!steps[i]?.disabled) return i
    }
    return null
  }
  const previous = nearestEnabled(currentIndex, -1)
  const next = nearestEnabled(currentIndex, 1)

  return (
    <div
      data-slot="stepper"
      data-orientation="horizontal"
      className={cn("@container w-full", className)}
    >
      <ol aria-label={l.label} className={cn("hidden w-full items-start", collapse.list)}>
        {items}
      </ol>
      {currentStep ? (
        // biome-ignore lint/a11y/useSemanticElements: a <fieldset> needs a <legend> and form semantics; this is a labelled summary, not a form group.
        <div
          role="group"
          aria-label={l.label}
          data-slot="stepper-compact"
          className={cn("flex flex-col gap-2", collapse.compact)}
        >
          <div className="flex items-center gap-2">
            {onStepClick ? (
              <IconButton
                icon={<ChevronLeft />}
                label={l.previousStep}
                size="sm"
                variant="outline"
                disabled={previous === null}
                onClick={() => previous !== null && onStepClick(previous)}
              />
            ) : null}
            <p className="min-w-0 flex-1 truncate text-sm">
              <span className="text-muted-foreground">{l.stepOf(currentIndex + 1, total)}</span>
              <span aria-hidden="true" className="text-muted-foreground">
                {" · "}
              </span>
              <span className="sr-only">: </span>
              <span className="font-medium text-foreground">{currentStep.label}</span>
              <StatusText step={currentStep} state={currentState} labels={l} />
            </p>
            {onStepClick ? (
              <IconButton
                icon={<ChevronRight />}
                label={l.nextStep}
                size="sm"
                variant="outline"
                disabled={next === null}
                onClick={() => next !== null && onStepClick(next)}
              />
            ) : null}
          </div>
          <div aria-hidden="true" className="flex gap-1">
            {steps.map((step, index) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: steps are positional by nature
                key={index}
                data-slot="stepper-track-segment"
                className={cn(
                  "h-1 flex-1 rounded-inner",
                  step.status === "error"
                    ? "bg-destructive"
                    : step.status === "warning"
                      ? "bg-warning"
                      : index <= activeStep
                        ? "bg-primary"
                        : "bg-muted",
                )}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

Stepper.displayName = "Stepper"

export { Stepper }
