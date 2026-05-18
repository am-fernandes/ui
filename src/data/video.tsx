"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface VideoCaptionTrack {
  src: string
  srcLang: string
  label: string
  default?: boolean
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
}

const Video = React.forwardRef<HTMLVideoElement, VideoProps>(
  (
    {
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
      ...rest
    },
    forwardedRef,
  ) => {
    const localRef = React.useRef<HTMLVideoElement>(null)
    React.useImperativeHandle(forwardedRef, () => localRef.current as HTMLVideoElement, [])
    const [inView, setInView] = React.useState(false)

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
        { rootMargin: "200px" },
      )
      observer.observe(node)
      return () => observer.disconnect()
    }, [inView])

    const resolvedMuted = autoPlay ? true : muted

    return (
      <div
        className={cn("relative overflow-hidden rounded-md bg-muted", className)}
        style={{ aspectRatio: String(aspectRatio) }}
        data-slot="video"
      >
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
          className="h-full w-full object-cover"
          {...rest}
        >
          {captions?.map((track) => (
            <track
              key={track.src}
              kind="captions"
              src={track.src}
              srcLang={track.srcLang}
              label={track.label}
              default={track.default}
            />
          ))}
        </video>
      </div>
    )
  },
)
Video.displayName = "Video"

export { Video }
