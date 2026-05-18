"use client"

import * as SheetPrimitive from "@radix-ui/react-dialog"
import { type VariantProps, cva } from "class-variance-authority"
import { X } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { overlayBase } from "./_internal/animations"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

type SheetOverlayProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay> & {
  ref?: React.Ref<React.ComponentRef<typeof SheetPrimitive.Overlay>>
}

function SheetOverlay({ className, ref, ...props }: SheetOverlayProps) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(overlayBase, className)}
      {...props}
      ref={ref}
    />
  )
}

const sheetBase =
  "fixed z-50 gap-4 bg-background p-6 transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out"

const sheetVariants = cva(sheetBase, {
  variants: {
    side: {
      top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
      bottom:
        "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
      left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
      right:
        "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
    },
  },
  defaultVariants: {
    side: "right",
  },
})

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  ref?: React.Ref<React.ComponentRef<typeof SheetPrimitive.Content>>
  /** Accessible label/sr-only text for the close button. Defaults to `"Close"`. */
  closeLabel?: string
}

function SheetContent({
  side = "right",
  className,
  children,
  ref,
  closeLabel = "Close",
  ...props
}: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        data-slot="sheet-content"
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        <SheetPrimitive.Close
          aria-label={closeLabel}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity cursor-pointer hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">{closeLabel}</span>
        </SheetPrimitive.Close>
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>
}

function SheetHeader({ className, ref, ...props }: SheetHeaderProps) {
  return (
    <div
      ref={ref}
      data-slot="sheet-header"
      className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>
}

function SheetFooter({ className, ref, ...props }: SheetFooterProps) {
  return (
    <div
      ref={ref}
      data-slot="sheet-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

type SheetTitleProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title> & {
  ref?: React.Ref<React.ComponentRef<typeof SheetPrimitive.Title>>
}

function SheetTitle({ className, ref, ...props }: SheetTitleProps) {
  return (
    <SheetPrimitive.Title
      ref={ref}
      data-slot="sheet-title"
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  )
}

type SheetDescriptionProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description> & {
  ref?: React.Ref<React.ComponentRef<typeof SheetPrimitive.Description>>
}

function SheetDescription({ className, ref, ...props }: SheetDescriptionProps) {
  return (
    <SheetPrimitive.Description
      ref={ref}
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
