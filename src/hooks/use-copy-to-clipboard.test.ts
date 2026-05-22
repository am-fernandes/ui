import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useCopyToClipboard } from "./use-copy-to-clipboard"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { toast } from "sonner"

describe("useCopyToClipboard", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn() },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("copies text and shows success toast", async () => {
    vi.mocked(navigator.clipboard.writeText).mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current.copy("hello")
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello")
    expect(toast.success).toHaveBeenCalledWith("Copiado!")
  })

  it("shows error toast when clipboard fails", async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error("denied"))

    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current.copy("hello")
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao copiar")
  })

  it("returns a stable copy function reference", () => {
    const { result, rerender } = renderHook(() => useCopyToClipboard())
    const first = result.current.copy
    rerender()
    expect(result.current.copy).toBe(first)
  })
})
