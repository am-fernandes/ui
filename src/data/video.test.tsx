import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

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
})
