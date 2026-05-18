"use client"

import type * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import * as React from "react"
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "../primitives/label"

const Form = FormProvider
;(Form as React.FC).displayName = "Form"

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: ControllerProps<TFieldValues, TName>,
) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue | null>(null)

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  if (!fieldContext) {
    throw new Error("useFormField must be used within <FormField>")
  }

  if (!itemContext) {
    throw new Error("useFormField must be used within <FormItem>")
  }

  const fieldState = getFieldState(fieldContext.name, formState)

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>
}

function FormItem({ className, ref, ...props }: FormItemProps) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} data-slot="form-item" className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
}
FormItem.displayName = "FormItem"

type FormLabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
  ref?: React.Ref<React.ComponentRef<typeof LabelPrimitive.Root>>
}

function FormLabel({ className, ref, ...props }: FormLabelProps) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      data-slot="form-label"
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}
FormLabel.displayName = "FormLabel"

type FormControlProps = React.ComponentPropsWithoutRef<typeof Slot> & {
  ref?: React.Ref<React.ComponentRef<typeof Slot>>
}

function FormControl({ ref, ...props }: FormControlProps) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      data-slot="form-control"
      id={formItemId}
      // Both ids are referenced. FormDescription/FormMessage render at the
      // same ids when mounted; missing referents are an accepted trade-off here
      // because RHF integration relies on stable id wiring.
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  )
}
FormControl.displayName = "FormControl"

type FormDescriptionProps = React.HTMLAttributes<HTMLParagraphElement> & {
  ref?: React.Ref<HTMLParagraphElement>
}

function FormDescription({ className, ref, ...props }: FormDescriptionProps) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      data-slot="form-description"
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  )
}
FormDescription.displayName = "FormDescription"

type FormMessageProps = React.HTMLAttributes<HTMLParagraphElement> & {
  ref?: React.Ref<HTMLParagraphElement>
}

function FormMessage({ className, children, ref, ...props }: FormMessageProps) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      data-slot="form-message"
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
}
FormMessage.displayName = "FormMessage"

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
}
