import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleHeader,
  CollapsibleTrigger,
} from "./collapsible"

describe("Collapsible", () => {
  it("shows content when defaultOpen", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden content</CollapsibleContent>
      </Collapsible>,
    )
    expect(screen.getByText("Hidden content")).toBeInTheDocument()
  })

  it("hides content when closed", () => {
    render(
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden content</CollapsibleContent>
      </Collapsible>,
    )
    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument()
  })

  it("CollapsibleHeader renders trigger on the right by default", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleHeader title="Header" data-testid="header" />
      </Collapsible>,
    )
    const header = screen.getByTestId("header")
    expect(header).toHaveAttribute("data-trigger-side", "right")
    // Last element-child is the trigger button (title is in the middle div).
    expect(header.lastElementChild?.tagName).toBe("BUTTON")
  })

  it("CollapsibleHeader renders trigger on the left when triggerSide=left", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleHeader title="Header" triggerSide="left" data-testid="header" />
      </Collapsible>,
    )
    const header = screen.getByTestId("header")
    expect(header).toHaveAttribute("data-trigger-side", "left")
    expect(header.firstElementChild?.tagName).toBe("BUTTON")
  })
})
