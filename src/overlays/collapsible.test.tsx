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
        <CollapsibleContent data-testid="content">Hidden content</CollapsibleContent>
      </Collapsible>,
    )
    expect(screen.getByText("Hidden content")).toBeInTheDocument()
    expect(screen.getByTestId("content")).toHaveAttribute("data-state", "open")
  })

  it("hides content when closed", () => {
    render(
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">Hidden content</CollapsibleContent>
      </Collapsible>,
    )
    // Assert behavior via Radix's data-state instead of DOM presence — Radix
    // may keep the element in the tree for animation purposes.
    expect(screen.getByTestId("content")).toHaveAttribute("data-state", "closed")
  })

  it("CollapsibleHeader renders trigger on the right by default", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleHeader title="Header" data-testid="header" />
      </Collapsible>,
    )
    const header = screen.getByTestId("header")
    expect(header).toHaveAttribute("data-trigger-side", "right")
    // The trigger button carries a data-position attribute reflecting its side.
    expect(screen.getByRole("button")).toHaveAttribute("data-position", "right")
  })

  it("CollapsibleHeader renders trigger on the left when triggerSide=left", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleHeader title="Header" triggerSide="left" data-testid="header" />
      </Collapsible>,
    )
    const header = screen.getByTestId("header")
    expect(header).toHaveAttribute("data-trigger-side", "left")
    expect(screen.getByRole("button")).toHaveAttribute("data-position", "left")
  })
})
