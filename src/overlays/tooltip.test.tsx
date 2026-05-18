import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

describe("Tooltip", () => {
  it("renders trigger button", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    expect(screen.getByText("Hover me")).toBeInTheDocument()
  })

  it("shows content when forced open", () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    // Radix renders the tooltip content twice — once visible in the portal
    // and once as an sr-only duplicate for screen readers. Asserting exact
    // length keeps us honest about the rendered DOM structure.
    expect(screen.getAllByText("Tooltip text")).toHaveLength(2)
  })

  it("fires onOpenChange when focus enters the trigger and Escape closes", () => {
    const onOpenChange = vi.fn()
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip onOpenChange={onOpenChange}>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    const trigger = screen.getByText("Hover me")
    fireEvent.focus(trigger)
    expect(onOpenChange).toHaveBeenCalledWith(true)

    fireEvent.keyDown(document.body, { key: "Escape" })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
