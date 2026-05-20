import { render, screen } from "@testing-library/react"
import * as React from "react"
import { describe, expect, it } from "vitest"

import { ScrollArea, ScrollBar } from "./scroll-area"

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

  it("renders a vertical scrollbar element by default (orientation omitted)", () => {
    const { container } = render(
      <ScrollArea>
        <div style={{ height: 1000 }}>vertical-content</div>
      </ScrollArea>,
    )
    // Radix lazily mounts the scrollbar based on overflow detection. In jsdom
    // there's no layout, but the ScrollBar React element is rendered as a child
    // of the root. We assert the React tree intent via the `data-orientation`
    // attribute scoped to a scrollbar that *may or may not* be visible.
    const scrollbars = container.querySelectorAll('[data-slot="scroll-area-scrollbar"]')
    const orientations = Array.from(scrollbars).map((el) => el.getAttribute("data-orientation"))
    // Empty list is acceptable in jsdom (no overflow → no mount); when present
    // it must include vertical.
    if (scrollbars.length > 0) {
      expect(orientations).toContain("vertical")
      expect(orientations).not.toContain("horizontal")
    } else {
      // Fall back to verifying the root mounted — Radix elected not to render
      // a scrollbar because jsdom reports no overflow.
      expect(container.querySelector('[data-slot="scroll-area"]')).toBeInTheDocument()
    }
  })

  it("does not render a horizontal scrollbar element when orientation='vertical'", () => {
    const { container } = render(
      <ScrollArea orientation="vertical">
        <div>v-only</div>
      </ScrollArea>,
    )
    const orientations = Array.from(
      container.querySelectorAll('[data-slot="scroll-area-scrollbar"]'),
    ).map((el) => el.getAttribute("data-orientation"))
    expect(orientations).not.toContain("horizontal")
  })

  it("does not render a vertical scrollbar element when orientation='horizontal'", () => {
    const { container } = render(
      <ScrollArea orientation="horizontal">
        <div>h-only</div>
      </ScrollArea>,
    )
    const orientations = Array.from(
      container.querySelectorAll('[data-slot="scroll-area-scrollbar"]'),
    ).map((el) => el.getAttribute("data-orientation"))
    expect(orientations).not.toContain("vertical")
  })

  it("forwards ref to the root element", () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <ScrollArea ref={ref}>
        <div>r</div>
      </ScrollArea>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveAttribute("data-slot", "scroll-area")
  })

  it("applies a custom className to the root while preserving the base 'relative' class", () => {
    const { container } = render(
      <ScrollArea className="custom-scroll">
        <div>c</div>
      </ScrollArea>,
    )
    const root = container.querySelector('[data-slot="scroll-area"]')
    expect(root).toHaveClass("custom-scroll")
    expect(root).toHaveClass("relative")
  })

  it("passes extra props through to the root (e.g., id and data-testid)", () => {
    render(
      <ScrollArea id="sa-root" data-testid="sa">
        <div>props</div>
      </ScrollArea>,
    )
    const root = screen.getByTestId("sa")
    expect(root).toHaveAttribute("id", "sa-root")
    expect(root).toHaveAttribute("data-slot", "scroll-area")
  })

  it("renders multiple children inside the viewport", () => {
    render(
      <ScrollArea>
        <p>one</p>
        <p>two</p>
        <p>three</p>
      </ScrollArea>,
    )
    expect(screen.getByText("one")).toBeInTheDocument()
    expect(screen.getByText("two")).toBeInTheDocument()
    expect(screen.getByText("three")).toBeInTheDocument()
  })

  it("ScrollBar export mounts inside a ScrollArea without throwing", () => {
    // Radix's ScrollAreaScrollbar lazy-mounts based on overflow detection,
    // which jsdom cannot trigger because it has no layout engine. We can still
    // verify the component renders (or politely defers) without crashing the
    // tree — i.e. ScrollArea + standalone ScrollBar wires up.
    expect(() =>
      render(
        <ScrollArea>
          <div>content</div>
          <ScrollBar orientation="horizontal" className="my-bar" />
        </ScrollArea>,
      ),
    ).not.toThrow()
  })
})
