"use client"

import * as AvatarPrimitive from "@radix-ui/react-avatar"
import * as React from "react"

import { DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, isAllowedUrl } from "@/lib/url"
import { cn } from "@/lib/utils"

export interface AvatarProps
  extends Omit<React.ComponentProps<typeof AvatarPrimitive.Root>, "children"> {
  src?: string
  /**
   * Who or what the avatar is ("Ana Souza"). The accessible name of the whole
   * avatar (`role="img"`), read the same with the photo or with the fallback.
   */
  alt: string
  /** Shown while the photo loads, when it fails or without `src`: initials or an icon. */
  fallback: React.ReactNode
  /**
   * Allowed URL protocols for `src`. Defaults to `["http:", "https:"]`
   * (`DEFAULT_ALLOWED_RESOURCE_PROTOCOLS`). The list replaces the default, so
   * to accept base64 thumbnails as well, add to it:
   * `[...DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, "data:"]` (`["data:"]` alone
   * would block https photos). `javascript:` is always blocked.
   */
  allowedProtocols?: string[]
  ref?: React.Ref<HTMLSpanElement>
}

function Avatar({ src, alt, fallback, className, allowedProtocols, ref, ...props }: AvatarProps) {
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
      // The name lives on the avatar, so it is the same with the photo, with
      // the initials and while the photo loads.
      role="img"
      aria-label={alt}
      className={cn(
        // `@container`: the initials are sized from the avatar's own width.
        "@container relative flex size-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      {srcIsValid ? (
        <AvatarPrimitive.Image
          data-slot="avatar-image"
          src={src}
          alt=""
          // A photo that is not square is cropped to the centre, not squashed.
          className="aspect-square h-full w-full object-cover"
        />
      ) : null}
      <AvatarPrimitive.Fallback
        data-slot="avatar-fallback"
        aria-hidden="true"
        // 35% of the width: 14px in the default 40px, and in step with any
        // `size-*` given to the avatar.
        className="flex h-full w-full items-center justify-center rounded-full bg-muted text-[length:35cqi] leading-none"
      >
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

Avatar.displayName = "Avatar"

export { Avatar }
