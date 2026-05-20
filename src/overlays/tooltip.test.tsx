import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Tooltip } from "./tooltip"

describe("Tooltip", () => {
  it("renders the trigger child", () => {
    render(
      <Tooltip content="ajuda">
        <button type="button">Hover</button>
      </Tooltip>,
    )
    expect(screen.getByRole("button", { name: "Hover" })).toBeInTheDocument()
  })

  it("fires onOpenChange on focus and Escape closes", () => {
    const onOpenChange = vi.fn()
    render(
      <Tooltip content="ajuda" onOpenChange={onOpenChange} delayDuration={0}>
        <button type="button">Hover</button>
      </Tooltip>,
    )
    fireEvent.focus(screen.getByRole("button", { name: "Hover" }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    fireEvent.keyDown(document.body, { key: "Escape" })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("accepts ReactNode as content", () => {
    render(
      <Tooltip content={<strong>rich</strong>} open>
        <button type="button">X</button>
      </Tooltip>,
    )
    const rich = screen.getAllByText("rich")
    expect(rich.length).toBeGreaterThan(0)
  })

  it("opens on keyboard focus when delayDuration=0", async () => {
    render(
      <Tooltip content="tip-focus" delayDuration={0}>
        <button type="button">F</button>
      </Tooltip>,
    )
    fireEvent.focus(screen.getByRole("button", { name: "F" }))
    await waitFor(() => {
      // Radix renders the tooltip content into a portal at the document body.
      const matches = screen.getAllByText("tip-focus")
      expect(matches.length).toBeGreaterThan(0)
    })
  })

  it("hides on blur (closes after focus leaves the trigger)", async () => {
    const onOpenChange = vi.fn()
    render(
      <Tooltip content="tip-blur" delayDuration={0} onOpenChange={onOpenChange}>
        <button type="button">B</button>
      </Tooltip>,
    )
    const trigger = screen.getByRole("button", { name: "B" })
    fireEvent.focus(trigger)
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    fireEvent.blur(trigger)
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenLastCalledWith(false)
    })
  })

  it("delays hover-open by delayDuration milliseconds (does not open instantly)", async () => {
    vi.useFakeTimers()
    try {
      const onOpenChange = vi.fn()
      render(
        <Tooltip content="tip-delay" delayDuration={500} onOpenChange={onOpenChange}>
          <button type="button">D</button>
        </Tooltip>,
      )
      // Radix listens to pointerMove (not pointerEnter) for hover detection.
      // The trigger sets pointerType==='touch' as a no-op, so we explicitly
      // pass pointerType: 'mouse'.
      act(() => {
        fireEvent.pointerMove(screen.getByRole("button", { name: "D" }), { pointerType: "mouse" })
      })
      // Before the delay elapses, no open should have fired.
      expect(onOpenChange).not.toHaveBeenCalledWith(true)
      // Advance past the delay — wrap in act so React processes the resulting
      // state update inside the assertion.
      act(() => {
        vi.advanceTimersByTime(600)
      })
      expect(onOpenChange).toHaveBeenCalledWith(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it("propagates side prop to data-side on the content", () => {
    render(
      <Tooltip content="tip-side" open side="right">
        <button type="button">S</button>
      </Tooltip>,
    )
    const content = document.querySelector('[data-slot="tooltip-content"]')
    expect(content).toHaveAttribute("data-side", "right")
  })

  it("respects controlled open=true (renders content without interaction)", () => {
    render(
      <Tooltip content="tip-controlled" open>
        <button type="button">C</button>
      </Tooltip>,
    )
    expect(
      document.querySelector('[data-slot="tooltip-content"]'),
    ).toBeInTheDocument()
  })

  it("respects controlled open=false (does not render content even on focus)", () => {
    render(
      <Tooltip content="tip-locked" open={false} delayDuration={0}>
        <button type="button">L</button>
      </Tooltip>,
    )
    fireEvent.focus(screen.getByRole("button", { name: "L" }))
    // When open is externally pinned to false, Radix never mounts the content.
    expect(document.querySelector('[data-slot="tooltip-content"]')).toBeNull()
  })

  it("wires aria-describedby on the trigger when open and exposes the tooltip content", () => {
    render(
      <Tooltip content="tip-aria" open>
        <button type="button">A</button>
      </Tooltip>,
    )
    const trigger = screen.getByRole("button", { name: "A" })
    const describedBy = trigger.getAttribute("aria-describedby")
    expect(describedBy).toBeTruthy()
    // Radix appends an extra a11y description node; ensure at least one referenced
    // node carries the tooltip text.
    const ids = describedBy?.split(/\s+/) ?? []
    const referenced = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null)
    expect(referenced.length).toBeGreaterThan(0)
    expect(referenced.some((el) => el.textContent?.includes("tip-aria"))).toBe(true)
  })

  it("stamps data-state='delayed-open' or 'instant-open' on the content when open", () => {
    render(
      <Tooltip content="tip-state" open>
        <button type="button">St</button>
      </Tooltip>,
    )
    const content = document.querySelector('[data-slot="tooltip-content"]')
    const state = content?.getAttribute("data-state")
    expect(state).toMatch(/^(delayed-open|instant-open)$/)
  })

  it("closes on Escape via real keyboard input (user-event)", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Tooltip content="tip-esc" delayDuration={0} onOpenChange={onOpenChange}>
        <button type="button">E</button>
      </Tooltip>,
    )
    fireEvent.focus(screen.getByRole("button", { name: "E" }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it("applies a custom className to the content", () => {
    render(
      <Tooltip content="tip-cls" open className="custom-tooltip">
        <button type="button">Cls</button>
      </Tooltip>,
    )
    const content = document.querySelector('[data-slot="tooltip-content"]')
    expect(content).toHaveClass("custom-tooltip")
  })
})
