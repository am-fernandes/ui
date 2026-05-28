"use client"

import * as React from "react"

import { DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, isAllowedUrl } from "@/lib/url"
import { cn } from "@/lib/utils"

const LAZY_LOAD_ROOT_MARGIN = "200px"

export interface VideoCaptionTrack {
  src: string
  srcLang: string
  label: string
  default?: boolean
  /** WebVTT track kind. Default `"captions"`. */
  kind?: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata"
}

export interface VideoProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "src"> {
  src: string
  /** Accessible label (required unless aria-labelledby is set). */
  "aria-label"?: string
  /** Override aria-labelledby instead. */
  "aria-labelledby"?: string
  poster?: string
  captions?: VideoCaptionTrack[]
  aspectRatio?: number
  preload?: "none" | "metadata" | "auto"
  /** Allowed URL protocols. Defaults to `["http:", "https:"]`. */
  allowedProtocols?: string[]
  ref?: React.Ref<HTMLVideoElement>
}

function Video({
  src,
  className,
  poster,
  captions,
  aspectRatio = 16 / 9,
  controls = true,
  autoPlay,
  muted,
  loop,
  playsInline,
  preload = "metadata",
  allowedProtocols,
  crossOrigin,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ref: forwardedRef,
  ...rest
}: VideoProps) {
  const localRef = React.useRef<HTMLVideoElement>(null)
  React.useImperativeHandle(forwardedRef, () => localRef.current as HTMLVideoElement, [])
  const [inView, setInView] = React.useState(false)

  const allowed = allowedProtocols ?? DEFAULT_ALLOWED_RESOURCE_PROTOCOLS
  const srcIsValid = isAllowedUrl(src, allowed)

  React.useEffect(() => {
    const node = localRef.current
    if (!node || inView) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
            return
          }
        }
      },
      { rootMargin: LAZY_LOAD_ROOT_MARGIN },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [inView])

  // Dev-time validation: require an accessible name and at most one default track.
  React.useEffect(() => {
    if (process.env.NODE_ENV === "production") return
    if (!ariaLabel && !ariaLabelledBy) {
      console.warn(
        "[Video] missing accessible name. Pass either `aria-label` or `aria-labelledby`.",
      )
    }
  }, [ariaLabel, ariaLabelledBy])

  React.useEffect(() => {
    if (process.env.NODE_ENV === "production") return
    if (!captions || captions.length === 0) return
    const defaults = captions.filter((c) => c.default === true)
    if (defaults.length > 1) {
      console.warn(
        `[Video] ${defaults.length} caption tracks marked as default; only one is allowed.`,
      )
    }
  }, [captions])

  const resolvedMuted = autoPlay ? true : muted
  // When captions are present, the <track> resources are typically cross-origin
  // — opt the element into CORS so they can be fetched.
  const resolvedCrossOrigin =
    crossOrigin !== undefined
      ? crossOrigin
      : captions && captions.length > 0
        ? "anonymous"
        : undefined

  return (
    <div
      className={cn("relative overflow-hidden rounded-md bg-muted", className)}
      style={{ aspectRatio: String(aspectRatio) }}
      data-slot="video"
    >
      {srcIsValid ? (
        <video
          ref={localRef}
          src={inView ? src : undefined}
          poster={poster}
          controls={controls}
          autoPlay={autoPlay}
          muted={resolvedMuted}
          loop={loop}
          playsInline={playsInline}
          preload={inView ? preload : "none"}
          crossOrigin={resolvedCrossOrigin}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className="h-full w-full object-cover"
          {...rest}
        >
          {captions?.map((track) => (
            <track
              key={track.src}
              kind={track.kind ?? "captions"}
              src={track.src}
              srcLang={track.srcLang}
              label={track.label}
              default={track.default}
            />
          ))}
        </video>
      ) : (
        <div
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground"
        >
          Fonte de vídeo inválida
        </div>
      )}
    </div>
  )
}

Video.displayName = "Video"

export { Video }
