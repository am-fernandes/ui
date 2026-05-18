import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Video } from "./video"

describe("Video", () => {
  it("renders a video element with the given aria-label", () => {
    const { container } = render(<Video src="/clip.mp4" aria-label="Demo" />)
    const video = container.querySelector("video")
    expect(video).toBeTruthy()
    expect(video?.getAttribute("aria-label")).toBe("Demo")
  })
})
