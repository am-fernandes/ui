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
})
