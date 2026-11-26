"use client"

import { Loader2, VideoOff } from "lucide-react"
import * as React from "react"

import { DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, isAllowedUrl } from "@/lib/url"
import { cn } from "@/lib/utils"
import { useComposedRefs } from "../primitives/_internal/compose-refs"
import { Button } from "../primitives/button"

const LAZY_LOAD_ROOT_MARGIN = "200px"

const objectFitMap = {
  contain: "object-contain",
  cover: "object-cover",
  fill: "object-fill",
} as const

export interface VideoCaptionTrack {
  src: string
  srcLang: string
  label: string
  default?: boolean
  /** WebVTT track kind. Default `"captions"`. */
  kind?: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata"
}

export interface VideoLabels {
  /** Shown when the media fails to load (network, codec, missing file). */
  error: string
  /** Shown when `src` is refused by `allowedProtocols`. */
  invalid: string
  /** Button that tries the media again after an error. */
  retry: string
}

export const defaultVideoLabels: VideoLabels = {
  error: "Não foi possível carregar o vídeo",
  invalid: "Fonte de vídeo inválida",
  retry: "Tentar de novo",
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
  /**
   * How the video fills the box. `"contain"` shows the whole frame, so a
   * vertical phone video in a 16:9 box is not cropped.
   * @default "contain"
   */
  objectFit?: keyof typeof objectFitMap
  preload?: "none" | "metadata" | "auto"
  /**
   * CORS mode of the media and its caption files. Not set by default: a
   * video on a host without CORS headers still plays. Captions served from
   * another origin need `"anonymous"` (and CORS headers on that server).
   */
  crossOrigin?: React.VideoHTMLAttributes<HTMLVideoElement>["crossOrigin"]
  /**
   * Protocols the address may use. It **replaces** the default list
   * (`http:`, `https:`): for a `blob:` preview pass
   * `[...DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, "blob:"]`.
   */
  allowedProtocols?: string[]
  labels?: Partial<VideoLabels>
  /** The `<video>`; `null` while the address is refused. */
  ref?: React.Ref<HTMLVideoElement>
}

type Status = "idle" | "loading" | "ready" | "error"

function crossOriginTracks(captions: VideoCaptionTrack[] | undefined): boolean {
  if (!captions?.length || typeof window === "undefined") return false
  return captions.some((track) => {
    try {
      return new URL(track.src, window.location.href).origin !== window.location.origin
    } catch {
      return false
    }
  })
}

function Video({
  src,
  className,
  poster,
  captions,
  aspectRatio = 16 / 9,
  objectFit = "contain",
  controls = true,
  autoPlay,
  muted,
  loop,
  playsInline,
  preload = "metadata",
  allowedProtocols,
  crossOrigin,
  labels: labelsProp,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  onLoadStart,
  onLoadedMetadata,
  onSuspend,
  onError,
  ref,
  ...rest
}: VideoProps) {
  const labels = { ...defaultVideoLabels, ...labelsProp }
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const composedRef = useComposedRefs(videoRef, ref)
  const [inView, setInView] = React.useState(false)

  const allowed = allowedProtocols ?? DEFAULT_ALLOWED_RESOURCE_PROTOCOLS
  const srcIsValid = isAllowedUrl(src, allowed)

  // The status belongs to one address: a new `src` starts over.
  const [state, setState] = React.useState<{ src: string; status: Status }>({
    src,
    status: "idle",
  })
  const status: Status = state.src === src ? state.status : "idle"
  const setStatus = (next: Status) => setState({ src, status: next })

  // Observes the wrapper, which is always there: a `src` that starts refused
  // (a `blob:` preview not yet allowed) and becomes valid still lazy-loads.
  React.useEffect(() => {
    const node = wrapperRef.current
    if (!node || inView) return
    if (typeof IntersectionObserver === "undefined") {
      setInView(true)
      return
    }
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

  // Dev-time validation.
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
    if (autoPlay && loop && !controls) {
      console.warn(
        "[Video] autoPlay + loop without controls gives no way to pause the video (WCAG 2.2.2). Keep `controls` or add a pause button.",
      )
    }
  }, [autoPlay, loop, controls])

  React.useEffect(() => {
    if (process.env.NODE_ENV === "production") return
    if (!captions || captions.length === 0) return
    const defaults = captions.filter((c) => c.default === true)
    if (defaults.length > 1) {
      console.warn(
        `[Video] ${defaults.length} caption tracks marked as default; only one is allowed.`,
      )
    }
    if (crossOrigin === undefined && crossOriginTracks(captions)) {
      console.warn(
        '[Video] caption tracks from another origin load only with `crossOrigin="anonymous"` (and CORS headers on that server).',
      )
    }
  }, [captions, crossOrigin])

  const resolvedMuted = autoPlay ? true : muted
  const named = { "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy }

  if (!srcIsValid) {
    return (
      <div
        ref={wrapperRef}
        className={cn("relative overflow-hidden rounded-container bg-muted", className)}
        style={{ aspectRatio: String(aspectRatio) }}
        data-slot="video"
        data-state="invalid"
      >
        <div
          data-slot="video-fallback"
          // A named group that stands for the video; <fieldset> is for form fields.
          // biome-ignore lint/a11y/useSemanticElements: not a form control group.
          role="group"
          {...named}
          className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center text-xs text-muted-foreground"
        >
          <VideoOff aria-hidden="true" className="size-5" />
          {labels.invalid}
        </div>
      </div>
    )
  }

  function retry() {
    setStatus("loading")
    videoRef.current?.load()
  }

  return (
    <div
      ref={wrapperRef}
      className={cn("relative overflow-hidden rounded-container bg-muted", className)}
      style={{ aspectRatio: String(aspectRatio) }}
      data-slot="video"
      data-state={status}
      aria-busy={status === "loading" || undefined}
    >
      <video
        ref={composedRef}
        src={inView ? src : undefined}
        poster={poster}
        controls={controls}
        autoPlay={autoPlay}
        muted={resolvedMuted}
        loop={loop}
        playsInline={playsInline}
        preload={inView ? preload : "none"}
        crossOrigin={crossOrigin}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={cn("h-full w-full", objectFitMap[objectFit], status === "error" && "invisible")}
        onLoadStart={(e) => {
          if (e.currentTarget.getAttribute("src")) setStatus("loading")
          onLoadStart?.(e)
        }}
        onLoadedMetadata={(e) => {
          setStatus("ready")
          onLoadedMetadata?.(e)
        }}
        // The browser stopped fetching on purpose (preload="none", or the
        // metadata is in): nothing left to wait for.
        onSuspend={(e) => {
          if (status === "loading") setStatus(e.currentTarget.readyState > 0 ? "ready" : "idle")
          onSuspend?.(e)
        }}
        onError={(e) => {
          setStatus("error")
          onError?.(e)
        }}
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
      {status === "loading" ? (
        <div
          aria-hidden="true"
          data-slot="video-loading"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <Loader2 className="size-6 animate-spin text-muted-foreground motion-reduce:animate-none" />
        </div>
      ) : null}
      {status === "error" ? (
        <div
          data-slot="video-fallback"
          // A named group that stands for the video; <fieldset> is for form fields.
          // biome-ignore lint/a11y/useSemanticElements: not a form control group.
          role="group"
          {...named}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-xs text-muted-foreground"
        >
          <VideoOff aria-hidden="true" className="size-5" />
          {labels.error}
          <Button type="button" variant="outline" size="sm" onClick={retry}>
            {labels.retry}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

Video.displayName = "Video"

export { Video }
