import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ScrollArea } from "./scroll-area"

describe("ScrollArea", () => {
  it("renders children inside the viewport", () => {
    render(
      <ScrollArea>
        <div>Some scrollable content</div>
      </ScrollArea>,
    )
    expect(screen.getByText("Some scrollable content")).toBeInTheDocument()
  })

  // Radix's ScrollAreaScrollbar only appears in the DOM when overflow is detected.
  // jsdom does not implement layout, so we can't observe the scrollbar element directly.
  // Instead we verify the root mounts with the right data-slot and forwards content; the
  // orientation switching logic is exercised in Storybook visual tests.
  it("mounts the root and viewport for each orientation variant", () => {
    for (const orientation of ["vertical", "horizontal", "both"] as const) {
      const { container, unmount } = render(
        <ScrollArea orientation={orientation}>
          <div>content-{orientation}</div>
        </ScrollArea>,
      )
      expect(container.querySelector('[data-slot="scroll-area"]')).toBeTruthy()
      expect(container.querySelector('[data-slot="scroll-area-viewport"]')).toBeTruthy()
      unmount()
    }
  })
})
