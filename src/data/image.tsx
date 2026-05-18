"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "../primitives/skeleton"

const objectFitMap = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
  none: "object-none",
  "scale-down": "object-scale-down",
} as const

const roundedMap = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
} as const

export interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "loading" | "decoding"> {
  src: string
  alt: string
  aspectRatio?: number
  placeholder?: "blur" | "skeleton" | "none"
  objectFit?: keyof typeof objectFitMap
  rounded?: keyof typeof roundedMap
  /** Override native lazy loading. Defaults to "lazy". */
  loading?: "lazy" | "eager"
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      className,
      aspectRatio,
      placeholder = "skeleton",
      objectFit = "cover",
      rounded = "none",
      loading = "lazy",
      onLoad,
      onError,
      style,
      ...props
    },
    ref,
  ) => {
    const [isLoaded, setIsLoaded] = React.useState(false)
    const [hasError, setHasError] = React.useState(false)

    function handleLoad(e: React.SyntheticEvent<HTMLImageElement>) {
      setIsLoaded(true)
      onLoad?.(e)
    }
    function handleError(e: React.SyntheticEvent<HTMLImageElement>) {
      setHasError(true)
      onError?.(e)
    }

    const img = (
      // biome-ignore lint/a11y/useAltText: alt is a required prop and passed through.
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "h-full w-full",
          objectFitMap[objectFit],
          roundedMap[rounded],
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className,
        )}
        style={style}
        {...props}
      />
    )

    const wrapperClasses = cn(
      "relative overflow-hidden",
      roundedMap[rounded],
      aspectRatio ? "" : "inline-block",
    )

    return (
      <div
        className={wrapperClasses}
        data-slot="image"
        style={aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined}
      >
        {!isLoaded && !hasError && placeholder === "skeleton" ? (
          <Skeleton className={cn("absolute inset-0", roundedMap[rounded])} />
        ) : null}
        {!isLoaded && !hasError && placeholder === "blur" ? (
          <div className={cn("absolute inset-0 bg-muted backdrop-blur-md", roundedMap[rounded])} />
        ) : null}
        {hasError ? (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-muted text-xs text-muted-foreground",
              roundedMap[rounded],
            )}
          >
            Falha ao carregar imagem
          </div>
        ) : null}
        {img}
      </div>
    )
  },
)
Image.displayName = "Image"

export { Image }
