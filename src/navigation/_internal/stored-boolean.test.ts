import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { readStoredBoolean, useStoredBoolean, writeStoredBoolean } from "./stored-boolean"

// The memory is the module's: each test uses its own key.
let n = 0
const key = () => `stored-boolean-test-${++n}`

const full = () =>
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("The quota has been exceeded.", "QuotaExceededError")
  })

afterEach(() => {
  vi.restoreAllMocks()
  window.localStorage.clear()
})

describe("stored boolean", () => {
  it("saves in localStorage and reads it back", () => {
    const k = key()
    writeStoredBoolean(k, false)
    expect(window.localStorage.getItem(k)).toBe("false")
    expect(readStoredBoolean(k)).toBe(false)
  })

  // A full storage (or old Safari in private mode) throws on setItem only:
  // getItem still answers, with nothing or with an older choice.
  it("storage full, nothing saved before: the choice is kept in memory", () => {
    const k = key()
    full()
    writeStoredBoolean(k, false)
    expect(readStoredBoolean(k)).toBe(false)
  })

  it("storage full, an older choice saved: the new one wins", () => {
    const k = key()
    window.localStorage.setItem(k, "true")
    full()
    writeStoredBoolean(k, false)
    expect(readStoredBoolean(k)).toBe(false)
  })

  it("storage blocked for reading too: the choice is kept in memory", () => {
    const k = key()
    full()
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError")
    })
    expect(readStoredBoolean(k)).toBeNull()
    writeStoredBoolean(k, true)
    expect(readStoredBoolean(k)).toBe(true)
  })

  it("saving works again: storage holds the choice, not the memory", () => {
    const k = key()
    const setItem = full()
    writeStoredBoolean(k, false)
    setItem.mockRestore()
    writeStoredBoolean(k, true)
    expect(window.localStorage.getItem(k)).toBe("true")
    window.localStorage.setItem(k, "false")
    expect(readStoredBoolean(k)).toBe(false)
  })

  it("another tab's choice replaces the one kept in memory", () => {
    const k = key()
    full()
    const { result } = renderHook(() => useStoredBoolean(k))
    act(() => writeStoredBoolean(k, false))
    expect(result.current).toBe(false)
    vi.restoreAllMocks()
    window.localStorage.setItem(k, "true")
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: k }))
    })
    expect(result.current).toBe(true)
  })

  it("the hook follows a write that could not be saved", () => {
    const k = key()
    full()
    const { result } = renderHook(() => useStoredBoolean(k))
    expect(result.current).toBeNull()
    act(() => writeStoredBoolean(k, true))
    expect(result.current).toBe(true)
    act(() => writeStoredBoolean(k, false))
    expect(result.current).toBe(false)
  })
})
