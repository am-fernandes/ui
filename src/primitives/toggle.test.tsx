import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Toggle } from "./toggle"

describe("Toggle", () => {
  it("renders children and an unpressed state by default", () => {
    render(<Toggle>Watch</Toggle>)
    const btn = screen.getByRole("button", { name: "Watch" })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute("data-state", "off")
    expect(btn).toHaveAttribute("aria-pressed", "false")
  })

  it("renders pressed state when defaultPressed=true", () => {
    render(<Toggle defaultPressed>Watching</Toggle>)
    const btn = screen.getByRole("button", { name: "Watching" })
    expect(btn).toHaveAttribute("data-state", "on")
    expect(btn).toHaveAttribute("aria-pressed", "true")
  })

  it("flips state on click", async () => {
    render(<Toggle>Star</Toggle>)
    const btn = screen.getByRole("button", { name: "Star" })
    expect(btn).toHaveAttribute("data-state", "off")
    await userEvent.click(btn)
    expect(btn).toHaveAttribute("data-state", "on")
    await userEvent.click(btn)
    expect(btn).toHaveAttribute("data-state", "off")
  })

  it("calls onPressedChange with the new value", async () => {
    const onPressedChange = vi.fn()
    render(<Toggle onPressedChange={onPressedChange}>Pin</Toggle>)
    await userEvent.click(screen.getByRole("button"))
    expect(onPressedChange).toHaveBeenCalledWith(true)
    await userEvent.click(screen.getByRole("button"))
    expect(onPressedChange).toHaveBeenLastCalledWith(false)
  })

  it("supports controlled mode", () => {
    const { rerender } = render(<Toggle pressed={false}>X</Toggle>)
    expect(screen.getByRole("button")).toHaveAttribute("data-state", "off")
    rerender(<Toggle pressed={true}>X</Toggle>)
    expect(screen.getByRole("button")).toHaveAttribute("data-state", "on")
  })

  it("respects disabled state", async () => {
    const onPressedChange = vi.fn()
    render(
      <Toggle disabled onPressedChange={onPressedChange}>
        Disabled
      </Toggle>,
    )
    const btn = screen.getByRole("button")
    expect(btn).toBeDisabled()
    await userEvent.click(btn)
    expect(onPressedChange).not.toHaveBeenCalled()
  })

  it("applies variant=warning classes when pressed", () => {
    render(
      <Toggle variant="warning" defaultPressed>
        Warning
      </Toggle>,
    )
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("data-[state=on]:border-warning")
    expect(btn.className).toContain("data-[state=on]:text-warning")
  })

  it("applies size=sm classes", () => {
    render(<Toggle size="sm">Small</Toggle>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("px-2.5")
    expect(btn.className).toContain("py-1.5")
  })
})
