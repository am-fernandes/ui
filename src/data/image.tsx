"use client"

import { ImageOff } from "lucide-react"
import * as React from "react"

import { DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, isAllowedUrl } from "@/lib/url"
import { cn } from "@/lib/utils"
import { useComposedRefs } from "../primitives/_internal/compose-refs"
import { Skeleton } from "../primitives/skeleton"

const objectFitMap = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
  none: "object-none",
  "scale-down": "object-scale-down",
} as const

// sm/md/lg are the three radius levels (inner, element, container); full is
// the circle, for avatar-like images.
const roundedMap = {
  none: "rounded-none",
  sm: "rounded-inner",
  md: "rounded-element",
  lg: "rounded-container",
  full: "rounded-full",
} as const

export interface ImageLabels {
  /** Shown when there is no `src` (a property without a photo). */
  empty: string
  /** Shown when the image fails to load or its address is refused. */
  error: string
}

export const defaultImageLabels: ImageLabels = {
  empty: "Sem imagem",
  error: "Falha ao carregar imagem",
}

export interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "loading" | "decoding" | "src"> {
  /**
   * Address of the image. Empty, `null` or `undefined` means "no image": the
   * `fallback` shows, as a normal state and not as an error.
   */
  src?: string | null
  /**
   * Text alternative. It stays with the screen reader when the image fails,
   * is refused or is missing: the fallback takes it as its name.
   */
  alt: string
  aspectRatio?: number
  /**
   * What shows while the image loads. `"blur"` shows `blurDataURL` blurred;
   * without it, a plain muted block.
   * @default "skeleton"
   */
  placeholder?: "blur" | "skeleton" | "none"
  /**
   * A tiny version of the image (a `data:image/…` URI, or an address with an
   * allowed protocol) shown blurred while the real one loads, with
   * `placeholder="blur"`.
   */
  blurDataURL?: string
  /**
   * Shown in place of the image when there is no `src`, when the address is
   * refused and when it fails to load. Defaults to an icon with the text
   * from `labels` (the text hides when the box is narrower than 8rem).
   */
  fallback?: React.ReactNode
  labels?: Partial<ImageLabels>
  objectFit?: keyof typeof objectFitMap
  rounded?: keyof typeof roundedMap
  /** Override native lazy loading. Defaults to "lazy". */
  loading?: "lazy" | "eager"
  /**
   * Protocols the address may use. It **replaces** the default list
   * (`http:`, `https:`), it does not add to it: `["data:"]` accepts only data
   * URIs. To add one, spread the default:
   * `[...DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, "data:"]`.
   */
  allowedProtocols?: string[]
  /** Mirror the native attribute; forwarded directly to `<img>`. */
  srcSet?: string
  /** Mirror the native attribute; forwarded directly to `<img>`. */
  sizes?: string
  /** When true, the image is purely decorative — alt is forced to "" and role="presentation". */
  decorative?: boolean
  /** The `<img>`; `null` while the fallback shows. */
  ref?: React.Ref<HTMLImageElement>
}

type Status = "loading" | "loaded" | "error"

const BLUR_DATA = /^data:image\//i

function Image({
  src,
  alt,
  className,
  aspectRatio,
  placeholder = "skeleton",
  blurDataURL,
  fallback,
  labels: labelsProp,
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
  width,
  height,
  ref,
  ...props
}: ImageProps) {
  const labels = { ...defaultImageLabels, ...labelsProp }
  const source = src?.trim() ? src : ""
  const allowed = allowedProtocols ?? DEFAULT_ALLOWED_RESOURCE_PROTOCOLS
  const refused = source !== "" && !isAllowedUrl(source, allowed)

  if (process.env.NODE_ENV !== "production" && refused) {
    console.warn(
      `[Image] src "${source.slice(0, 80)}" was refused because its protocol is not in allowedProtocols. Showing the fallback.`,
    )
  }

  // The status belongs to one address: a new `src` starts loading again,
  // without an effect (which would paint the old status for a frame).
  const [state, setState] = React.useState<{ src: string; status: Status }>({
    src: source,
    status: "loading",
  })
  const status: Status = state.src === source ? state.status : "loading"

  const imgRef = React.useRef<HTMLImageElement>(null)
  const composedRef = useComposedRefs(imgRef, ref)

  // An image that finished before React listened (server-rendered and
  // cached) fires no load event: read its state from the element.
  React.useLayoutEffect(() => {
    const img = imgRef.current
    if (!img || source === "" || !img.complete) return
    let cancelled = false
    const settle = (next: Status) => {
      if (!cancelled) setState({ src: source, status: next })
    }
    if (img.naturalWidth > 0) settle("loaded")
    else if (typeof img.decode === "function") {
      img.decode().then(
        () => settle("loaded"),
        () => settle("error"),
      )
    }
    return () => {
      cancelled = true
    }
  }, [source])

  function handleLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    setState({ src: source, status: "loaded" })
    onLoad?.(e)
  }
  function handleError(e: React.SyntheticEvent<HTMLImageElement>) {
    setState({ src: source, status: "error" })
    onError?.(e)
  }

  const kind = source === "" ? "empty" : refused || status === "error" ? "error" : null
  const named = !decorative && alt.trim() !== ""

  const wrapperClasses = cn(
    "relative overflow-hidden",
    roundedMap[rounded],
    aspectRatio ? "" : "inline-block",
  )
  const wrapperStyle = aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined

  if (kind) {
    return (
      <div className={wrapperClasses} data-slot="image" data-state={kind} style={wrapperStyle}>
        <div
          data-slot="image-fallback"
          // The fallback stands for the image: it takes its name, or hides
          // with it when the image is decorative.
          role={named ? "img" : undefined}
          aria-label={named ? alt : undefined}
          aria-hidden={named ? undefined : true}
          className={cn(
            "@container flex h-full w-full items-center justify-center overflow-hidden",
            fallback == null && "bg-muted text-muted-foreground",
            roundedMap[rounded],
            className,
          )}
          style={{ width, height, ...style }}
        >
          {fallback ?? (
            <span className="flex flex-col items-center gap-1.5 p-2 text-center">
              <ImageOff aria-hidden="true" className="size-5 shrink-0" />
              <span className="hidden text-xs @[8rem]:block">
                {kind === "empty" ? labels.empty : labels.error}
              </span>
            </span>
          )}
        </div>
      </div>
    )
  }

  const blurSource =
    placeholder === "blur" &&
    blurDataURL &&
    (BLUR_DATA.test(blurDataURL) || isAllowedUrl(blurDataURL, allowed))
      ? blurDataURL
      : null
  const loaded = status === "loaded"

  return (
    <div className={wrapperClasses} data-slot="image" data-state={status} style={wrapperStyle}>
      {!loaded && placeholder === "skeleton" ? (
        <Skeleton aria-hidden="true" className={cn("absolute inset-0", roundedMap[rounded])} />
      ) : null}
      {!loaded && placeholder === "blur" ? (
        <div
          aria-hidden="true"
          data-slot="image-blur"
          className={cn("absolute inset-0 overflow-hidden bg-muted", roundedMap[rounded])}
        >
          {blurSource ? (
            <img
              src={blurSource}
              alt=""
              className="size-full scale-110 object-cover blur-xl motion-reduce:blur-lg"
            />
          ) : null}
        </div>
      ) : null}
      {/* biome-ignore lint/a11y/useAltText: `alt` is required, or "" when `decorative`. */}
      <img
        ref={composedRef}
        src={source}
        srcSet={srcSet}
        sizes={sizes}
        alt={decorative ? "" : alt}
        role={decorative ? "presentation" : undefined}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "relative h-full w-full",
          objectFitMap[objectFit],
          roundedMap[rounded],
          "transition-opacity duration-(--duration-medium) ease-(--ease-standard) motion-reduce:transition-none",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        style={style}
        {...props}
      />
    </div>
  )
}

Image.displayName = "Image"

export { Image }
