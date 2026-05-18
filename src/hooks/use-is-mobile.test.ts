import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useIsMobile } from "./use-is-mobile"

type Listener = (event: MediaQueryListEvent) => void

interface FakeMediaQueryList {
  matches: boolean
  media: string
  onchange: null
  addListener: (l: Listener) => void
  removeListener: (l: Listener) => void
  addEventListener: (event: string, l: Listener) => void
  removeEventListener: (event: string, l: Listener) => void
  dispatchEvent: () => boolean
  __fire: (matches: boolean) => void
}

function createMatchMediaStub(initial: boolean): FakeMediaQueryList {
  const listeners = new Set<Listener>()
  const mql: FakeMediaQueryList = {
    matches: initial,
    media: "(max-width: 767px)",
    onchange: null,
    addListener: (l) => {
      listeners.add(l)
    },
    removeListener: (l) => {
      listeners.delete(l)
    },
    addEventListener: (_event, l) => {
      listeners.add(l)
    },
    removeEventListener: (_event, l) => {
      listeners.delete(l)
    },
    dispatchEvent: () => false,
    __fire: (matches) => {
      mql.matches = matches
      for (const l of listeners) {
        l({ matches } as MediaQueryListEvent)
      }
    },
  }
  return mql
}

describe("useIsMobile", () => {
  let mql: FakeMediaQueryList

  beforeEach(() => {
    mql = createMatchMediaStub(false)
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: (_query: string) => mql as unknown as MediaQueryList,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns false on desktop viewports", () => {
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it("returns true on mobile viewports", () => {
    mql.matches = true
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it("reacts to media-query changes", () => {
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
    act(() => {
      mql.__fire(true)
    })
    expect(result.current).toBe(true)
  })
})
