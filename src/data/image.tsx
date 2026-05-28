"use client"

import * as React from "react"

import { DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, isAllowedUrl } from "@/lib/url"
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
  /** Allowed URL protocols. Defaults to `["http:", "https:"]`. Pass `["data:"]` to opt in to data URIs. */
  allowedProtocols?: string[]
  /** Mirror the native attribute; forwarded directly to `<img>`. */
  srcSet?: string
  /** Mirror the native attribute; forwarded directly to `<img>`. */
  sizes?: string
  /** When true, the image is purely decorative — alt is forced to "" and role="presentation". */
  decorative?: boolean
  ref?: React.Ref<HTMLImageElement>
}

function Image({
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
  allowedProtocols,
  srcSet,
  sizes,
  decorative = false,
  ref,
  ...props
}: ImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)

  const allowed = allowedProtocols ?? DEFAULT_ALLOWED_RESOURCE_PROTOCOLS
  const srcIsValid = isAllowedUrl(src, allowed)

  // Reset loading/error state whenever the source changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: deliberate — only re-run when `src` changes; the setters are stable.
  React.useEffect(() => {
    setIsLoaded(false)
    setHasError(false)
  }, [src])

  function handleLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    setIsLoaded(true)
    onLoad?.(e)
  }
  function handleError(e: React.SyntheticEvent<HTMLImageElement>) {
    setHasError(true)
    onError?.(e)
  }

  const showError = hasError || !srcIsValid
  const effectiveAlt = decorative ? "" : alt
  const role = decorative ? "presentation" : undefined

  const img = !srcIsValid ? null : (
    // biome-ignore lint/a11y/useAltText: `effectiveAlt` is derived from `alt` prop (required) or "" when `decorative`.
    <img
      ref={ref}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={effectiveAlt}
      role={role}
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
      {!isLoaded && !showError && placeholder === "skeleton" ? (
        <Skeleton aria-hidden="true" className={cn("absolute inset-0", roundedMap[rounded])} />
      ) : null}
      {!isLoaded && !showError && placeholder === "blur" ? (
        <div
          aria-hidden="true"
          className={cn("absolute inset-0 bg-muted backdrop-blur-md", roundedMap[rounded])}
        />
      ) : null}
      {showError ? (
        <div
          aria-hidden="true"
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
}

Image.displayName = "Image"

export { Image }
