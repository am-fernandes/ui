import { render, renderHook, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { announce, useAnnounceWhen } from "./announce"

const region = () => document.querySelector('[data-slot="live-announcer"]') as HTMLElement | null

describe("announce", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    region()?.remove()
  })
  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it("creates one polite, visually hidden region at the end of the body", () => {
    announce("Carregando…")
    announce("Carregando…")
    const regions = document.querySelectorAll('[data-slot="live-announcer"]')
    expect(regions).toHaveLength(1)
    const el = regions[0] as HTMLElement
    expect(el.parentElement).toBe(document.body)
    expect(el).toHaveAttribute("aria-live", "polite")
    expect(el).toHaveAttribute("aria-atomic", "true")
    expect(el).not.toHaveAttribute("role")
    expect(el.style.position).toBe("absolute")
    expect(el.style.width).toBe("1px")
  })

  it("fills the region a moment later, so a new region has time to be noticed", () => {
    announce("Carregando…")
    expect(region()).toHaveTextContent("")
    vi.advanceTimersByTime(100)
    expect(region()).toHaveTextContent("Carregando…")
  })

  it("reads the same message again when it is announced twice", () => {
    announce("Carregando…")
    vi.advanceTimersByTime(100)
    announce("Carregando…")
    // Emptied first: without the change, a screen reader would say nothing.
    expect(region()).toHaveTextContent("")
    vi.advanceTimersByTime(100)
    expect(region()).toHaveTextContent("Carregando…")
  })

  it("keeps only the last of several messages sent at once", () => {
    announce("Um")
    announce("Dois")
    vi.advanceTimersByTime(100)
    expect(region()).toHaveTextContent("Dois")
  })

  it("clears the message after it has been read", () => {
    announce("Carregando…")
    vi.advanceTimersByTime(100)
    vi.advanceTimersByTime(7000)
    expect(region()).toHaveTextContent("")
  })

  it("makes a new region if the old one was removed with the page", () => {
    announce("Um")
    region()?.remove()
    announce("Dois")
    vi.advanceTimersByTime(100)
    expect(region()).toHaveTextContent("Dois")
  })

  it("is not found by a query for role=status", () => {
    render(<output>dos outros</output>)
    announce("Carregando…")
    vi.advanceTimersByTime(100)
    expect(screen.getAllByRole("status")).toHaveLength(1)
  })
})

describe("useAnnounceWhen", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    region()?.remove()
  })
  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it("announces when the state turns on, not the state it mounted in", () => {
    const { rerender } = renderHook(({ active }) => useAnnounceWhen(active, "Carregando…"), {
      initialProps: { active: true },
    })
    vi.advanceTimersByTime(100)
    expect(region()?.textContent ?? "").toBe("")

    rerender({ active: false })
    rerender({ active: true })
    vi.advanceTimersByTime(100)
    expect(region()).toHaveTextContent("Carregando…")
  })

  it("stays quiet when only the message changes", () => {
    const { rerender } = renderHook(({ message }) => useAnnounceWhen(true, message), {
      initialProps: { message: "Um" },
    })
    rerender({ message: "Dois" })
    vi.advanceTimersByTime(100)
    expect(region()?.textContent ?? "").toBe("")
  })
})
