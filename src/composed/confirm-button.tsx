"use client"

import { TriangleAlert } from "lucide-react"
import * as React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../overlays/alert-dialog"
import { Button, type ButtonProps } from "../primitives/button"

export interface ConfirmButtonProps extends Omit<ButtonProps, "onClick"> {
  confirmTitle: string
  confirmMessage?: React.ReactNode
  confirmActionLabel?: string
  confirmCancelLabel?: string
  onConfirm: () => void | Promise<void>
  confirmIcon?: React.ReactNode
}

const ConfirmButton = React.forwardRef<HTMLButtonElement, ConfirmButtonProps>(
  (
    {
      confirmTitle,
      confirmMessage,
      confirmActionLabel = "Confirmar",
      confirmCancelLabel = "Cancelar",
      onConfirm,
      confirmIcon,
      variant,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false)
    const [isPending, setIsPending] = React.useState(false)

    const effectiveIcon =
      confirmIcon ??
      (variant === "destructive" ? (
        <TriangleAlert className="size-5 text-destructive" aria-hidden />
      ) : undefined)

    async function handleAction(event: React.MouseEvent<HTMLButtonElement>) {
      event.preventDefault()
      try {
        setIsPending(true)
        await onConfirm()
        setOpen(false)
      } finally {
        setIsPending(false)
      }
    }

    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button ref={ref} variant={variant} {...buttonProps}>
            {children}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            {effectiveIcon ? (
              <div className="flex items-center gap-2">
                {effectiveIcon}
                <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
              </div>
            ) : (
              <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            )}
            {confirmMessage ? (
              <AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{confirmCancelLabel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction} disabled={isPending}>
              {confirmActionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  },
)
ConfirmButton.displayName = "ConfirmButton"

export { ConfirmButton }
