import { act, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Video } from "./video"

describe("Video", () => {
  it("renders a video element with the given aria-label", () => {
    const { container } = render(<Video src="/clip.mp4" aria-label="Demo" />)
    const video = container.querySelector("video")
    expect(video).toBeTruthy()
    expect(video?.getAttribute("aria-label")).toBe("Demo")
  })

  it("accepts aria-labelledby as an alternative accessible name", () => {
    const { container } = render(
      <>
        <span id="vid-title">Demo</span>
        <Video src="/clip.mp4" aria-labelledby="vid-title" />
      </>,
    )
    const video = container.querySelector("video")
    expect(video?.getAttribute("aria-labelledby")).toBe("vid-title")
  })

  it("renders provided caption tracks", () => {
    const { container } = render(
      <Video
        src="/clip.mp4"
        aria-label="Demo"
        captions={[
          { src: "/en.vtt", srcLang: "en", label: "English", default: true },
          { src: "/pt.vtt", srcLang: "pt", label: "Português" },
        ]}
      />,
    )
    const tracks = container.querySelectorAll("track")
    expect(tracks.length).toBe(2)
    expect(tracks[0]?.getAttribute("kind")).toBe("captions")
  })

  it("auto-enables crossOrigin when captions are present", () => {
    const { container } = render(
      <Video
        src="/clip.mp4"
        aria-label="Demo"
        captions={[{ src: "/en.vtt", srcLang: "en", label: "English" }]}
      />,
    )
    const video = container.querySelector("video")
    expect(video?.getAttribute("crossorigin")).toBe("anonymous")
  })

  it("forces muted when autoPlay is set", () => {
    const { container } = render(<Video src="/clip.mp4" aria-label="Demo" autoPlay />)
    const video = container.querySelector("video") as HTMLVideoElement
    // The HTMLVideoElement.muted property reflects the resolved value.
    expect(video.muted).toBe(true)
  })

  it("renders the error fallback when src protocol is rejected", () => {
    // biome-ignore lint/suspicious/noExplicitAny: testing forbidden input
    render(<Video src={"javascript:alert(1)" as any} aria-label="Demo" />)
    expect(screen.getByText(/Fonte de vídeo inválida/i)).toBeInTheDocument()
  })

  it("rejects data: video sources unless explicitly allowed", () => {
    render(<Video src="data:video/mp4;base64,AAAA" aria-label="Demo" />)
    expect(screen.getByText(/Fonte de vídeo inválida/i)).toBeInTheDocument()
  })

  it("defaults each track's kind to 'captions' when caller omits it", () => {
    const { container } = render(
      <Video
        src="/clip.mp4"
        aria-label="Demo"
        captions={[
          { src: "/en.vtt", srcLang: "en", label: "English" },
          { src: "/pt.vtt", srcLang: "pt", label: "Português", kind: "subtitles" },
        ]}
      />,
    )
    const tracks = container.querySelectorAll("track")
    expect(tracks[0]?.getAttribute("kind")).toBe("captions")
    expect(tracks[1]?.getAttribute("kind")).toBe("subtitles")
  })

  it("warns in development when no accessible name is provided", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    // biome-ignore lint/suspicious/noExplicitAny: deliberately omitting the aria-label.
    render(<Video src="/clip.mp4" {...({} as any)} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("[Video] missing accessible name"))
    warn.mockRestore()
  })

  it("warns in development when multiple caption tracks are marked as default", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    render(
      <Video
        src="/clip.mp4"
        aria-label="Demo"
        captions={[
          { src: "/en.vtt", srcLang: "en", label: "English", default: true },
          { src: "/pt.vtt", srcLang: "pt", label: "Português", default: true },
        ]}
      />,
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("caption tracks marked as default"))
    warn.mockRestore()
  })

  it("respects an explicit crossOrigin override even when captions are present", () => {
    const { container } = render(
      <Video
        src="/clip.mp4"
        aria-label="Demo"
        crossOrigin="use-credentials"
        captions={[{ src: "/en.vtt", srcLang: "en", label: "English" }]}
      />,
    )
    const video = container.querySelector("video")
    expect(video?.getAttribute("crossorigin")).toBe("use-credentials")
  })

  it("allows the consumer to widen allowedProtocols (e.g. blob:)", () => {
    const { container } = render(
      <Video src="blob:foo-bar" aria-label="Demo" allowedProtocols={["blob:"]} />,
    )
    // Blob is allowed when explicitly permitted — the <video> element renders.
    expect(container.querySelector("video")).toBeTruthy()
  })

  it("starts loading the underlying src after the IntersectionObserver fires", () => {
    type IOCallback = (entries: IntersectionObserverEntry[], obs: IntersectionObserver) => void
    let lastCb: IOCallback | undefined
    let lastObserver: IntersectionObserver | undefined

    class MockObserver {
      callback: IOCallback
      disconnect = vi.fn()
      unobserve = vi.fn()
      takeRecords = vi.fn(() => [])
      observe = vi.fn()
      constructor(callback: IOCallback) {
        this.callback = callback
        lastCb = callback
        lastObserver = this as unknown as IntersectionObserver
      }
    }

    const prev = (globalThis as { IntersectionObserver: unknown }).IntersectionObserver
    ;(globalThis as { IntersectionObserver: unknown }).IntersectionObserver =
      MockObserver as unknown as typeof IntersectionObserver

    const { container } = render(<Video src="/clip.mp4" aria-label="Demo" />)
    const video = container.querySelector("video") as HTMLVideoElement
    // Before intersection, src is unset (lazy).
    expect(video.getAttribute("src")).toBeNull()
    expect(video.getAttribute("preload")).toBe("none")

    // Trigger the IO callback with intersecting=true. Wrap in `act` so the
    // setInView state update flushes before we assert.
    act(() => {
      lastCb?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        lastObserver as IntersectionObserver,
      )
    })

    // After the state update, the video should have its src and proper preload.
    const updated = container.querySelector("video") as HTMLVideoElement
    expect(updated.getAttribute("src")).toBe("/clip.mp4")
    expect(updated.getAttribute("preload")).toBe("metadata")

    // Restore.
    ;(globalThis as { IntersectionObserver: unknown }).IntersectionObserver = prev
  })

  it("uses the catch-branch fallback when URL constructor throws", () => {
    // Force URL constructor to throw to exercise the fallback regex path.
    const OriginalURL = globalThis.URL
    class ThrowingURL {
      constructor() {
        throw new Error("nope")
      }
    }
    ;(globalThis as unknown as { URL: typeof URL }).URL = ThrowingURL as unknown as typeof URL
    try {
      // A plain string (not a forbidden protocol) should be allowed by the
      // fallback regex check.
      const { container } = render(<Video src="/clip.mp4" aria-label="Demo" />)
      expect(container.querySelector("video")).toBeTruthy()
      // And a forbidden protocol should still be rejected in the fallback.
      render(<Video src="vbscript:alert(1)" aria-label="Demo" />)
      expect(screen.getByText(/Fonte de vídeo inválida/i)).toBeInTheDocument()
    } finally {
      ;(globalThis as unknown as { URL: typeof URL }).URL = OriginalURL
    }
  })
})
