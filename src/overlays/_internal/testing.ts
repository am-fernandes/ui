import { act } from "@testing-library/react"
import { vi } from "vitest"

/**
 * Test helper (vitest + jsdom only; nothing in the library imports it).
 *
 * jsdom runs no CSS animation, so Radix unmounts a closing overlay in the same
 * tick. In a browser the content stays mounted, and under the pointer, while
 * its exit animation runs (`--duration-exit`, 175ms). This makes jsdom report
 * an animation for the elements matched by `selector`, so they stay mounted
 * with `data-state="closed"` until `finish()` ends it.
 */
export function mockExitAnimation(selector: string) {
  const original = window.getComputedStyle.bind(window)
  const spy = vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) => {
    const style = original(element, pseudo)
    if (!element.matches(selector)) return style
    return new Proxy(style, {
      get(target, property) {
        if (property === "animationName") {
          return element.getAttribute("data-state") === "closed" ? "exit" : "enter"
        }
        const value = Reflect.get(target, property)
        return typeof value === "function" ? value.bind(target) : value
      },
    })
  })
  // Radix compares animation names through CSS.escape, which jsdom lacks.
  const hadCss = "CSS" in globalThis
  if (!hadCss) vi.stubGlobal("CSS", { escape: (value: string) => value })

  return {
    /** Ends the exit animation of every closing element, which unmounts it. */
    finish() {
      act(() => {
        for (const element of document.querySelectorAll(selector)) {
          if (element.getAttribute("data-state") !== "closed") continue
          const event = new Event("animationend", { bubbles: true })
          Object.defineProperty(event, "animationName", { value: "exit" })
          element.dispatchEvent(event)
        }
      })
    },
    restore() {
      spy.mockRestore()
      if (!hadCss) vi.unstubAllGlobals()
    },
  }
}
