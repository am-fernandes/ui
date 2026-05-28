"use client"

import * as AvatarPrimitive from "@radix-ui/react-avatar"
import * as React from "react"

import { DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, isAllowedUrl } from "@/lib/url"
import { cn } from "@/lib/utils"

export interface AvatarProps
  extends Omit<React.ComponentProps<typeof AvatarPrimitive.Root>, "children"> {
  src?: string
  alt: string
  fallback: React.ReactNode
  /**
   * Allowed URL protocols for `src`. Defaults to `["http:", "https:"]`.
   * Pass `["data:"]` to opt in to base64 thumbnails. `javascript:` is
   * always blocked, regardless of allowlist.
   */
  allowedProtocols?: string[]
  ref?: React.Ref<HTMLSpanElement>
}

function Avatar({
  src,
  alt,
  fallback,
  className,
  allowedProtocols,
  ref,
  ...props
}: AvatarProps) {
  const allowed = allowedProtocols ?? DEFAULT_ALLOWED_RESOURCE_PROTOCOLS
  const srcIsValid = src != null && src !== "" && isAllowedUrl(src, allowed)

  React.useEffect(() => {
    if (process.env.NODE_ENV === "production") return
    if (src != null && src !== "" && !srcIsValid) {
      console.warn(
        `[Avatar] src "${src}" was blocked because its protocol is not on the allowlist. Falling back to the avatar's fallback content.`,
      )
    }
  }, [src, srcIsValid])

  return (
    <AvatarPrimitive.Root
      ref={ref}
      data-slot="avatar"
      className={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    >
      {srcIsValid ? (
        <AvatarPrimitive.Image
          data-slot="avatar-image"
          src={src}
          alt={alt}
          className="aspect-square h-full w-full"
        />
      ) : null}
      <AvatarPrimitive.Fallback
        data-slot="avatar-fallback"
        className="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm"
      >
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

Avatar.displayName = "Avatar"

export { Avatar }
