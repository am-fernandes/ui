import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Toggle, toggleVariants } from "./toggle"

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

  // A complement only: the fills and the contrast of every pressed variant
  // are measured by tests/e2e/primitives.spec.ts.
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

  // The contrast of that edge (3:1 or more against the surface and against the
  // fill, in both themes) is measured by tests/e2e/primitives.spec.ts.
  it("outlines the pressed default variant in the functional blue", () => {
    render(<Toggle defaultPressed>Favorito</Toggle>)
    const btn = screen.getByRole("button", { name: "Favorito" })
    expect(btn).toHaveClass("data-[state=on]:border-ring", "data-[state=on]:bg-accent")
    expect(btn).not.toHaveClass("data-[state=on]:border-accent")
  })

  // The measured heights (32, 40 and 44px) are asserted in a real browser by
  // tests/e2e/control-size.spec.ts.
  describe("size", () => {
    it("takes the height of the shared control sizes, md by default", () => {
      const { rerender } = render(<Toggle>x</Toggle>)
      const btn = () => screen.getByRole("button")
      expect(btn()).toHaveClass("h-control-md", "px-3")
      expect(btn().className).not.toMatch(/(^|\s)py-/)

      rerender(<Toggle size="sm">x</Toggle>)
      expect(btn()).toHaveClass("h-control-sm", "px-2.5")

      rerender(<Toggle size="lg">x</Toggle>)
      expect(btn()).toHaveClass("h-control-lg", "px-4")
    })

    it('still accepts "default", the old name of md', () => {
      const { rerender } = render(<Toggle size="default">x</Toggle>)
      const legacy = screen.getByRole("button").className
      rerender(<Toggle size="md">x</Toggle>)
      expect(screen.getByRole("button").className).toBe(legacy)
      expect(toggleVariants({ size: "default" })).toBe(toggleVariants({ size: "md" }))
    })
  })
})
