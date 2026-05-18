"use client"

import * as React from "react"
import {
  Controller,
  type ControllerRenderProps,
  type DefaultValues,
  type FieldPath,
  type FieldValues,
  FormProvider,
  type Resolver,
  type SubmitHandler,
  useForm,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form"

import { Checkbox } from "../primitives/checkbox"
import { Input } from "../primitives/input"
import { Switch } from "../primitives/switch"
import { Textarea } from "../primitives/textarea"

export interface FormProps<T extends FieldValues> {
  onSubmit: SubmitHandler<T>
  defaultValues?: DefaultValues<T>
  resolver?: Resolver<T>
  mode?: UseFormProps<T>["mode"]
  className?: string
  children: React.ReactNode
  onReady?: (methods: UseFormReturn<T>) => void
}

function Form<T extends FieldValues>({
  onSubmit,
  defaultValues,
  resolver,
  mode = "onSubmit",
  className,
  children,
  onReady,
}: FormProps<T>) {
  const methods = useForm<T>({ defaultValues, resolver, mode })
  React.useEffect(() => {
    onReady?.(methods)
  }, [methods, onReady])
  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={methods.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  )
}

Form.displayName = "Form"

type FormFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search"
  | "date"
  | "time"
  | "checkbox"
  | "switch"
  | "textarea"

export interface FormFieldProps<T extends FieldValues, N extends FieldPath<T>> {
  name: N
  label?: React.ReactNode
  description?: React.ReactNode
  type?: FormFieldType
  placeholder?: string
  children?: (field: ControllerRenderProps<T, N>) => React.ReactNode
}

function FormField<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>>({
  name,
  label,
  description,
  type = "text",
  placeholder,
  children,
}: FormFieldProps<T, N>) {
  return (
    <Controller<T, N>
      name={name}
      render={({ field, fieldState }) => {
        const error = fieldState.error?.message
        if (children) {
          return (
            <div className="flex w-full flex-col gap-1.5">
              {children(field)}
              {description ? (
                <p className="text-xs text-muted-foreground">{description}</p>
              ) : null}
              {error ? (
                <p role="alert" className="text-xs text-destructive">
                  {error}
                </p>
              ) : null}
            </div>
          )
        }
        switch (type) {
          case "textarea":
            return (
              <Textarea
                {...field}
                label={label}
                description={description}
                error={error}
                placeholder={placeholder}
              />
            )
          case "checkbox":
            return (
              <Checkbox
                checked={!!field.value}
                onCheckedChange={(v) => field.onChange(v === true)}
                onBlur={field.onBlur}
                label={label}
                description={description}
                error={error}
              />
            )
          case "switch":
            return (
              <Switch
                checked={!!field.value}
                onCheckedChange={(v) => field.onChange(v)}
                onBlur={field.onBlur}
                label={label}
                description={description}
                error={error}
              />
            )
          default:
            return (
              <Input
                {...field}
                type={type}
                label={label}
                description={description}
                error={error}
                placeholder={placeholder}
              />
            )
        }
      }}
    />
  )
}

FormField.displayName = "FormField"

export { Form, FormField, useForm }
