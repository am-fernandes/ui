import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useFieldIds } from "./use-field-ids"

describe("useFieldIds", () => {
  it("returns stable ids for control, label, description, error", () => {
    const { result } = renderHook(() => useFieldIds())
    expect(result.current.controlId).toMatch(/.+/)
    expect(result.current.labelId).toMatch(/.+/)
    expect(result.current.descriptionId).toMatch(/.+/)
    expect(result.current.errorId).toMatch(/.+/)
    const ids = [
      result.current.controlId,
      result.current.labelId,
      result.current.descriptionId,
      result.current.errorId,
    ]
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("uses externally provided control id if given", () => {
    const { result } = renderHook(() => useFieldIds("my-id"))
    expect(result.current.controlId).toBe("my-id")
  })

  it("builds aria-describedby based on which slots are present", () => {
    const { result } = renderHook(() => useFieldIds())
    expect(result.current.describedBy({ description: false, error: false })).toBeUndefined()
    expect(result.current.describedBy({ description: true, error: false })).toBe(
      result.current.descriptionId,
    )
    expect(result.current.describedBy({ description: false, error: true })).toBe(
      result.current.errorId,
    )
    expect(result.current.describedBy({ description: true, error: true })).toBe(
      `${result.current.descriptionId} ${result.current.errorId}`,
    )
  })

  it("adds the ids of the consumer after its own instead of being replaced by them", () => {
    const { result } = renderHook(() => useFieldIds())
    const { describedBy, descriptionId, errorId } = result.current
    expect(describedBy({ description: true, error: true }, "hint")).toBe(
      `${descriptionId} ${errorId} hint`,
    )
    expect(describedBy({ description: false, error: false }, "hint")).toBe("hint")
    expect(describedBy({ description: false, error: true }, "counter", "hint")).toBe(
      `${errorId} counter hint`,
    )
  })

  it("accepts several ids in one value, skips empty ones and never repeats an id", () => {
    const { result } = renderHook(() => useFieldIds())
    const { describedBy, descriptionId } = result.current
    expect(describedBy({ description: true, error: false }, "  a   b ", undefined, false, "")).toBe(
      `${descriptionId} a b`,
    )
    expect(describedBy({ description: true, error: false }, `a ${descriptionId}`, "a")).toBe(
      `${descriptionId} a`,
    )
    expect(describedBy({ description: false, error: false }, undefined, "")).toBeUndefined()
  })
})
