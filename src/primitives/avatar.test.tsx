import { render, screen, waitFor } from "@testing-library/react"
import { UserIcon } from "lucide-react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { Avatar } from "./avatar"

describe("Avatar", () => {
  it("renders fallback string when no src is provided", () => {
    render(<Avatar alt="Me" fallback="AM" />)
    expect(screen.getByText("AM")).toBeInTheDocument()
  })

  it("renders a ReactNode fallback (e.g. icon)", () => {
    render(<Avatar alt="Anônimo" fallback={<UserIcon data-testid="icon" />} />)
    expect(screen.getByTestId("icon")).toBeInTheDocument()
  })

  it("emits data-slot on root and fallback", () => {
    const { container } = render(<Avatar alt="Me" fallback="AM" />)
    expect(container.querySelector('[data-slot="avatar"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="avatar-fallback"]')).toBeInTheDocument()
  })

  it("applies className override (rounded-none wins over rounded-full base)", () => {
    const { container } = render(<Avatar alt="X" fallback="X" className="rounded-none" />)
    const root = container.querySelector('[data-slot="avatar"]')
    expect(root).toHaveClass("rounded-none")
    expect(root).not.toHaveClass("rounded-full")
  })

  it("forwards ref to the root", () => {
    let captured: HTMLSpanElement | null = null
    render(
      <Avatar
        alt="X"
        fallback="X"
        ref={(el) => {
          captured = el
        }}
      />,
    )
    expect(captured).toBeInstanceOf(HTMLSpanElement)
  })

  describe("with mocked Image", () => {
    const originalImage = globalThis.Image

    beforeEach(() => {
      class MockImage {
        public complete = false
        public naturalWidth = 0
        private _src = ""
        private listeners: Record<string, Array<() => void>> = {}
        get src() {
          return this._src
        }
        set src(value: string) {
          this._src = value
          this.complete = true
          this.naturalWidth = 1
          queueMicrotask(() => {
            for (const cb of this.listeners.load ?? []) cb()
          })
        }
        addEventListener(name: string, cb: () => void) {
          if (!this.listeners[name]) this.listeners[name] = []
          this.listeners[name]?.push(cb)
        }
        removeEventListener(name: string, cb: () => void) {
          this.listeners[name] = (this.listeners[name] ?? []).filter((x) => x !== cb)
        }
      }
      ;(globalThis as unknown as { Image: typeof Image }).Image =
        MockImage as unknown as typeof Image
    })

    afterEach(() => {
      ;(globalThis as unknown as { Image: typeof Image }).Image = originalImage
    })

    it("renders <img> with alt + src once loaded", async () => {
      const { container } = render(
        <Avatar src="https://example.com/avatar.png" alt="User avatar" fallback="UA" />,
      )
      await waitFor(() => {
        const img = container.querySelector('[data-slot="avatar-image"]')
        expect(img).toBeInTheDocument()
      })
      const img = container.querySelector('[data-slot="avatar-image"]')
      expect(img).toHaveAttribute("alt", "User avatar")
      expect(img).toHaveAttribute("src", "https://example.com/avatar.png")
    })
  })
})
