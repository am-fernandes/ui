import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useControllableState } from "./use-controllable-state"

describe("useControllableState", () => {
  it("uncontrolled: keeps the value and reports each change once", () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState<string>(undefined, "a", onChange))
    act(() => result.current[1]("b"))
    expect(result.current[0]).toBe("b")
    act(() => result.current[1]("b"))
    expect(onChange.mock.calls).toEqual([["b"]])
  })

  // A form reset reaches Radix Switch/RadioGroup (which reset themselves in
  // their newer versions) and the component's own reset listener in the same
  // event: the parent heard "false" twice.
  it("controlled: two calls with the same value in one event report once", () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState<boolean>(true, false, onChange))
    act(() => {
      result.current[1](false)
      result.current[1](false)
    })
    expect(onChange.mock.calls).toEqual([[false]])
  })

  it("controlled: a parent that keeps its value hears the next attempt again", () => {
    const onChange = vi.fn()
    const { result, rerender } = renderHook(
      ({ value }) => useControllableState(value, "", onChange),
      {
        initialProps: { value: "a" },
      },
    )
    act(() => result.current[1]("b"))
    // The parent refused: it renders with "a" again.
    rerender({ value: "a" })
    act(() => result.current[1]("b"))
    expect(onChange.mock.calls).toEqual([["b"], ["b"]])
    expect(result.current[0]).toBe("a")
  })
})
