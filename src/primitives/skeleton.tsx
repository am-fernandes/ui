"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>
}

/**
 * A pulsing block in the shape of content that is still loading. It is only
 * a picture (`aria-hidden`): a table of skeletons is not sixteen things to
 * read. Put the blocks of one loading area in a `SkeletonGroup`, which tells
 * screen readers, once, that it is loading.
 */
function Skeleton({ className, ref, ...props }: SkeletonProps) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-slot="skeleton"
      {...props}
      className={cn("animate-pulse rounded-inner bg-primary/10", className)}
    />
  )
}

Skeleton.displayName = "Skeleton"

export interface SkeletonLabels {
  /** Read once when the group appears. */
  loading: string
}

export const defaultSkeletonLabels: SkeletonLabels = {
  loading: "Carregando…",
}

export interface SkeletonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Text for screen readers. Defaults in `defaultSkeletonLabels`. */
  labels?: Partial<SkeletonLabels>
  ref?: React.Ref<HTMLDivElement>
}

/**
 * The one status of a loading area (`role="status"`): its `Skeleton` blocks
 * are hidden, and it says "Carregando…" in their place. Lay the blocks out
 * inside it as the content will be.
 */
function SkeletonGroup({ labels, className, children, ref, ...props }: SkeletonGroupProps) {
  const message = labels?.loading ?? defaultSkeletonLabels.loading
  // A live region reads changes, not what it had when it appeared: the words
  // go in right after the region is on the page.
  const [spoken, setSpoken] = React.useState("")
  React.useEffect(() => {
    const timer = window.setTimeout(() => setSpoken(message), 100)
    return () => window.clearTimeout(timer)
  }, [message])

  return (
    // biome-ignore lint/a11y/useSemanticElements: <output> is for the result of a calculation; this is a loading status.
    <div ref={ref} role="status" data-slot="skeleton-group" className={className} {...props}>
      <span className="sr-only">{spoken}</span>
      {children}
    </div>
  )
}

SkeletonGroup.displayName = "SkeletonGroup"

export { Skeleton, SkeletonGroup }
