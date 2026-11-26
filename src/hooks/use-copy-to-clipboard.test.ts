import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../overlays/sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { toast } from "../overlays/sonner"
import { useCopyToClipboard } from "./use-copy-to-clipboard"

describe("useCopyToClipboard", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn() },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it("copies text, shows the success toast and reports true", async () => {
    vi.mocked(navigator.clipboard.writeText).mockResolvedValueOnce(undefined)
    const { result } = renderHook(() => useCopyToClipboard())
    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.copy("hello")
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello")
    expect(toast.success).toHaveBeenCalledWith("Copiado!")
    expect(ok).toBe(true)
  })

  it("uses the library's toast, whose errors stay until closed", async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error("denied"))
    const { result } = renderHook(() => useCopyToClipboard())
    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.copy("hello")
    })
    expect(toast.error).toHaveBeenCalledWith("Erro ao copiar")
    expect(ok).toBe(false)
    expect(result.current.copied).toBe(false)
  })

  it("turns copied on after a copy and off again after resetAfter", async () => {
    vi.useFakeTimers()
    vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined)
    const { result } = renderHook(() => useCopyToClipboard({ resetAfter: 1500 }))
    expect(result.current.copied).toBe(false)
    await act(async () => {
      await result.current.copy("CPF 529.982.247-25")
    })
    expect(result.current.copied).toBe(true)
    await act(async () => {
      vi.advanceTimersByTime(1499)
    })
    expect(result.current.copied).toBe(true)
    await act(async () => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.copied).toBe(false)
  })

  it("takes the messages as options, and false silences a toast", async () => {
    vi.mocked(navigator.clipboard.writeText).mockResolvedValueOnce(undefined)
    const { result, rerender } = renderHook((props) => useCopyToClipboard(props), {
      initialProps: { successMessage: "Link copiado" as string | false },
    })
    await act(async () => {
      await result.current.copy("https://exemplo.com")
    })
    expect(toast.success).toHaveBeenCalledWith("Link copiado")

    vi.mocked(navigator.clipboard.writeText).mockResolvedValueOnce(undefined)
    rerender({ successMessage: false })
    await act(async () => {
      await result.current.copy("https://exemplo.com")
    })
    expect(toast.success).toHaveBeenCalledTimes(1)
  })

  it("falls back to the copy command where the Clipboard API is missing", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined })
    const execCommand = vi.fn(() => true)
    Object.defineProperty(document, "execCommand", { configurable: true, value: execCommand })
    const { result } = renderHook(() => useCopyToClipboard())
    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.copy("texto")
    })
    expect(execCommand).toHaveBeenCalledWith("copy")
    expect(ok).toBe(true)
    expect(document.querySelector("textarea")).toBeNull()
  })

  it("returns a stable copy function reference", () => {
    const { result, rerender } = renderHook(() => useCopyToClipboard())
    const first = result.current.copy
    rerender()
    expect(result.current.copy).toBe(first)
  })
})
