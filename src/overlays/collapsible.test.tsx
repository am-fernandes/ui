import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible"

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
})
