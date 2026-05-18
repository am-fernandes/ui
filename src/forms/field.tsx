"use client"

import { type VariantProps, cva } from "class-variance-authority"
import type * as React from "react"
import { useMemo } from "react"

import { cn } from "@/lib/utils"
import { Label } from "../primitives/label"
import { Separator } from "../primitives/separator"

type FieldSetProps = React.ComponentProps<"fieldset"> & {
  ref?: React.Ref<HTMLFieldSetElement>
}

function FieldSet({ className, ref, ...props }: FieldSetProps) {
  return (
    <fieldset
      ref={ref}
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-6",
        "has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className,
      )}
      {...props}
    />
  )
}

type FieldLegendProps = React.ComponentProps<"legend"> & {
  variant?: "legend" | "label"
  ref?: React.Ref<HTMLLegendElement>
}

function FieldLegend({ className, variant = "legend", ref, ...props }: FieldLegendProps) {
  return (
    <legend
      ref={ref}
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-3 font-medium",
        "data-[variant=legend]:text-base",
        "data-[variant=label]:text-sm",
        className,
      )}
      {...props}
    />
  )
}

type FieldGroupProps = React.ComponentProps<"div"> & {
  ref?: React.Ref<HTMLDivElement>
}

function FieldGroup({ className, ref, ...props }: FieldGroupProps) {
  return (
    <div
      ref={ref}
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4",
        className,
      )}
      {...props}
    />
  )
}

const fieldVariants = cva("group/field data-[invalid=true]:text-destructive flex w-full gap-3", {
  variants: {
    orientation: {
      vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
      horizontal: [
        "flex-row items-center",
        "[&>[data-slot=field-label]]:flex-auto",
        "has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px has-[>[data-slot=field-content]]:items-start",
      ],
      responsive: [
        "@md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto flex-col [&>*]:w-full [&>.sr-only]:w-auto",
        "@md/field-group:[&>[data-slot=field-label]]:flex-auto",
        "@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      ],
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

type FieldProps = React.ComponentProps<"div"> &
  VariantProps<typeof fieldVariants> & {
    ref?: React.Ref<HTMLDivElement>
  }

function Field({ className, orientation = "vertical", ref, ...props }: FieldProps) {
  return (
    <div
      ref={ref}
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

type FieldContentProps = React.ComponentProps<"div"> & {
  ref?: React.Ref<HTMLDivElement>
}

function FieldContent({ className, ref, ...props }: FieldContentProps) {
  return (
    <div
      ref={ref}
      data-slot="field-content"
      className={cn("group/field-content flex flex-1 flex-col gap-1.5 leading-snug", className)}
      {...props}
    />
  )
}

type FieldLabelProps = React.ComponentProps<typeof Label> & {
  ref?: React.Ref<React.ComponentRef<typeof Label>>
}

function FieldLabel({ className, ref, ...props }: FieldLabelProps) {
  return (
    <Label
      ref={ref}
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>[data-slot=field]]:p-4",
        "has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary",
        className,
      )}
      {...props}
    />
  )
}

type FieldTitleProps = React.ComponentProps<"div"> & {
  ref?: React.Ref<HTMLDivElement>
}

function FieldTitle({ className, ref, ...props }: FieldTitleProps) {
  return (
    <div
      ref={ref}
      data-slot="field-title"
      className={cn(
        "flex w-fit items-center gap-2 text-sm font-medium leading-snug group-data-[disabled=true]/field:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

type FieldDescriptionProps = React.ComponentProps<"p"> & {
  ref?: React.Ref<HTMLParagraphElement>
}

function FieldDescription({ className, ref, ...props }: FieldDescriptionProps) {
  return (
    <p
      ref={ref}
      data-slot="field-description"
      className={cn(
        "text-muted-foreground text-sm font-normal leading-normal group-has-[[data-orientation=horizontal]]/field:text-balance",
        "nth-last-2:-mt-1 last:mt-0 [[data-variant=legend]+&]:-mt-1.5",
        "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        className,
      )}
      {...props}
    />
  )
}

type FieldSeparatorProps = React.ComponentProps<"div"> & {
  children?: React.ReactNode
  ref?: React.Ref<HTMLDivElement>
}

function FieldSeparator({ children, className, ref, ...props }: FieldSeparatorProps) {
  return (
    <div
      ref={ref}
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className,
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="bg-background text-muted-foreground relative mx-auto block w-fit px-2"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

type FieldErrorProps = React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
  /** Single error object (e.g. react-hook-form `FieldError`). */
  error?: { message?: string } | null
  ref?: React.Ref<HTMLDivElement>
}

function FieldError({ className, children, errors, error, ref, ...props }: FieldErrorProps) {
  const normalizedErrors = useMemo(() => {
    if (errors && errors.length > 0) return errors
    if (error) return [error]
    return undefined
  }, [errors, error])

  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!normalizedErrors) {
      return null
    }

    if (normalizedErrors.length === 1 && normalizedErrors[0]?.message) {
      return normalizedErrors[0].message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {normalizedErrors.map((err, index) =>
          err?.message ? <li key={err.message ?? `err-${index}`}>{err.message}</li> : null,
        )}
      </ul>
    )
  }, [children, normalizedErrors])

  if (!content) {
    return null
  }

  return (
    <div
      ref={ref}
      role="alert"
      data-slot="field-error"
      className={cn("text-destructive text-sm font-normal", className)}
      {...props}
    >
      {content}
    </div>
  )
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
}
