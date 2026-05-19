import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

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

  it("triggerSide=left applies flex-row-reverse on the default trigger", () => {
    render(
      <Collapsible defaultOpen title="Toggle" triggerSide="left">
        <p>body</p>
      </Collapsible>,
    )
    expect(screen.getByRole("button", { name: "Toggle" })).toHaveClass("flex-row-reverse")
  })

  it("renders a sr-only triggerLabel and aria-label when title is omitted", () => {
    render(
      <Collapsible defaultOpen triggerLabel="Abrir seção">
        <p>body</p>
      </Collapsible>,
    )
    const trigger = screen.getByRole("button", { name: "Abrir seção" })
    expect(trigger).toHaveAttribute("aria-label", "Abrir seção")
    const srOnly = trigger.querySelector(".sr-only")
    expect(srOnly).not.toBeNull()
    expect(srOnly?.textContent).toBe("Abrir seção")
  })

  it("uses the default triggerLabel when no title is provided", () => {
    render(
      <Collapsible defaultOpen>
        <p>body</p>
      </Collapsible>,
    )
    // Default triggerLabel is "Alternar seção" (pt-BR copy in source).
    expect(screen.getByRole("button", { name: "Alternar seção" })).toBeInTheDocument()
  })

  it("does NOT set aria-label when title is provided (uses visible label)", () => {
    render(
      <Collapsible defaultOpen title="Visible">
        <p>body</p>
      </Collapsible>,
    )
    const trigger = screen.getByRole("button", { name: "Visible" })
    expect(trigger).not.toHaveAttribute("aria-label")
    expect(trigger.querySelector(".sr-only")).toBeNull()
  })

  it("supports controlled open/onOpenChange", async () => {
    const onOpenChange = vi.fn()
    render(
      <Collapsible open={false} onOpenChange={onOpenChange} title="Toggle">
        <p>body</p>
      </Collapsible>,
    )
    expect(screen.queryByText("body")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Toggle" }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it("applies className on the root", () => {
    const { container } = render(
      <Collapsible defaultOpen title="X" className="my-collapsible">
        <p>body</p>
      </Collapsible>,
    )
    expect(container.querySelector('[data-slot="collapsible"]')).toHaveClass("my-collapsible")
  })
})
