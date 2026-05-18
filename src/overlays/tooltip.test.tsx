import { fireEvent, render, screen } from "@testing-library/react"
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
})
