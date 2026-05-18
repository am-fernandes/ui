import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { Avatar, AvatarFallback, AvatarImage } from "./avatar"

describe("Avatar", () => {
  it("renders fallback text", () => {
    render(
      <Avatar>
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByText("AM")).toBeInTheDocument()
  })

  it("emits data-slot on root and fallback", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>,
    )
    expect(container.querySelector('[data-slot="avatar"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="avatar-fallback"]')).toBeInTheDocument()
  })

  describe("with mocked Image", () => {
    const originalImage = globalThis.Image

    beforeEach(() => {
      // jsdom doesn't load images from URLs; mock window.Image so that setting
      // `.src` immediately triggers the `load` listener Radix has wired up.
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
          // Defer to next microtask so React effects have time to attach the listener
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

    it("forwards alt + data-slot on AvatarImage once loaded", async () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.png" alt="User avatar" />
          <AvatarFallback>AM</AvatarFallback>
        </Avatar>,
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

  it("merges consumer className over base classes (override wins via cn)", () => {
    const { container } = render(
      <Avatar className="rounded-none">
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>,
    )
    const root = container.querySelector('[data-slot="avatar"]')
    expect(root).toHaveClass("rounded-none")
    expect(root).not.toHaveClass("rounded-full")
  })
})
