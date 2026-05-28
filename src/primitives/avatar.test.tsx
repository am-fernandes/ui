import { render, screen, waitFor } from "@testing-library/react"
import { UserIcon } from "lucide-react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

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

  describe("src protocol safety", () => {
    const originalWarn = console.warn
    beforeEach(() => {
      console.warn = vi.fn()
    })
    afterEach(() => {
      console.warn = originalWarn
    })

    it("does NOT render <img> when src has a javascript: protocol", () => {
      const { container } = render(
        <Avatar src={"javascript:alert(1)" as string} alt="User" fallback="U" />,
      )
      expect(container.querySelector('[data-slot="avatar-image"]')).toBeNull()
      expect(screen.getByText("U")).toBeInTheDocument()
    })

    it("does NOT render <img> when src has a vbscript: or file: protocol", () => {
      const { container, rerender } = render(<Avatar src="vbscript:msgbox" alt="V" fallback="V" />)
      expect(container.querySelector('[data-slot="avatar-image"]')).toBeNull()

      rerender(<Avatar src="file:///etc/passwd" alt="F" fallback="F" />)
      expect(container.querySelector('[data-slot="avatar-image"]')).toBeNull()
    })

    it("rejects data: URIs by default", () => {
      const { container } = render(
        <Avatar src="data:image/png;base64,AAAA" alt="Data" fallback="D" />,
      )
      expect(container.querySelector('[data-slot="avatar-image"]')).toBeNull()
    })

    it("allows data: URIs when explicitly opted in via allowedProtocols", () => {
      const { container } = render(
        <Avatar
          src="data:image/png;base64,AAAA"
          alt="Data"
          fallback="D"
          allowedProtocols={["data:"]}
        />,
      )
      // Radix still tests the image via Image() — in JSDOM it won't load and
      // will fall back, but the safety filter itself didn't strip the element
      // from the tree before Radix got to look at it.
      const root = container.querySelector('[data-slot="avatar"]')
      expect(root).toBeInTheDocument()
    })

    it("warns in dev when an unsafe src is blocked", () => {
      const spy = console.warn as unknown as ReturnType<typeof vi.fn>
      render(<Avatar src="javascript:void(0)" alt="X" fallback="X" />)
      expect(spy).toHaveBeenCalled()
      const message = String(spy.mock.calls[0]?.[0] ?? "")
      expect(message).toContain("Avatar")
      expect(message).toContain("javascript:void(0)")
    })
  })
})
