import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Collapsible } from "./collapsible"

describe("Collapsible", () => {
  it("shows content when defaultOpen", () => {
    render(
      <Collapsible defaultOpen title="Toggle">
        <p>Hidden content</p>
      </Collapsible>,
    )
    expect(screen.getByText("Hidden content")).toBeInTheDocument()
  })

  it("toggles via default chevron trigger", async () => {
    render(
      <Collapsible defaultOpen={false} title="Toggle">
        <p>Hidden content</p>
      </Collapsible>,
    )
    await userEvent.click(screen.getByRole("button"))
    expect(screen.getByText("Hidden content")).toBeInTheDocument()
  })

  it("supports a custom trigger element", async () => {
    render(
      <Collapsible defaultOpen={false} trigger={<button type="button">CustomTrig</button>}>
        <p>body</p>
      </Collapsible>,
    )
    await userEvent.click(screen.getByRole("button", { name: "CustomTrig" }))
    expect(screen.getByText("body")).toBeInTheDocument()
  })

  it("applies triggerSide data attribute", () => {
    const { container } = render(
      <Collapsible defaultOpen title="X" triggerSide="left">
        <p>body</p>
      </Collapsible>,
    )
    expect(container.querySelector('[data-slot="collapsible"]')).toHaveAttribute(
      "data-trigger-side",
      "left",
    )
  })
})
