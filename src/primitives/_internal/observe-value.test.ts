import { describe, expect, it, vi } from "vitest"

import { observeValue } from "./observe-value"

describe("observeValue", () => {
  it("reports every assignment to `value` and keeps the value readable", () => {
    const textarea = document.createElement("textarea")
    const onAssign = vi.fn()
    observeValue(textarea, onAssign)

    textarea.value = "abc"
    expect(textarea.value).toBe("abc")
    expect(onAssign).toHaveBeenCalledTimes(1)

    textarea.value = "abcd"
    expect(onAssign).toHaveBeenCalledTimes(2)
  })

  it("works on inputs too", () => {
    const input = document.createElement("input")
    const onAssign = vi.fn()
    observeValue(input, onAssign)
    input.value = "x"
    expect(input.value).toBe("x")
    expect(onAssign).toHaveBeenCalledTimes(1)
  })

  it("stops reporting and restores the element once released", () => {
    const textarea = document.createElement("textarea")
    const onAssign = vi.fn()
    const release = observeValue(textarea, onAssign)
    expect(Object.getOwnPropertyDescriptor(textarea, "value")).toBeDefined()

    release()
    textarea.value = "abc"
    expect(textarea.value).toBe("abc")
    expect(onAssign).not.toHaveBeenCalled()
    expect(Object.getOwnPropertyDescriptor(textarea, "value")).toBeUndefined()
  })

  it("calls through an accessor that was already on the element (React's own)", () => {
    const textarea = document.createElement("textarea")
    const proto = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")
    const seen: string[] = []
    const previous: PropertyDescriptor = {
      configurable: true,
      get() {
        return proto?.get?.call(this)
      },
      set(next: string) {
        seen.push(next)
        proto?.set?.call(this, next)
      },
    }
    Object.defineProperty(textarea, "value", previous)

    const onAssign = vi.fn()
    const release = observeValue(textarea, onAssign)
    textarea.value = "abc"
    expect(seen).toEqual(["abc"])
    expect(onAssign).toHaveBeenCalledTimes(1)

    release()
    expect(Object.getOwnPropertyDescriptor(textarea, "value")?.set).toBe(previous.set)
  })

  it("leaves a later wrapper in place when released out of order", () => {
    const textarea = document.createElement("textarea")
    const first = vi.fn()
    const second = vi.fn()
    const releaseFirst = observeValue(textarea, first)
    observeValue(textarea, second)

    releaseFirst()
    textarea.value = "abc"
    expect(textarea.value).toBe("abc")
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it("does nothing when the accessor cannot be replaced", () => {
    const textarea = document.createElement("textarea")
    const proto = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")
    Object.defineProperty(textarea, "value", {
      configurable: false,
      get() {
        return proto?.get?.call(this)
      },
      set(next: string) {
        proto?.set?.call(this, next)
      },
    })
    const onAssign = vi.fn()
    const release = observeValue(textarea, onAssign)
    textarea.value = "abc"
    expect(onAssign).not.toHaveBeenCalled()
    expect(() => release()).not.toThrow()
  })
})
