import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
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

// Closing unmounted the content: an uncontrolled field in a collapsed section
// of a long form came back empty ("Maria da Silva" was lost).
describe("Collapsible keepMounted", () => {
  it("keeps what was typed in a closed section", async () => {
    render(
      <Collapsible title="Dados do comprador" keepMounted>
        <input aria-label="Nome" />
      </Collapsible>,
    )
    const trigger = screen.getByRole("button", { name: "Dados do comprador" })
    await userEvent.click(trigger)
    await userEvent.type(screen.getByLabelText("Nome"), "Maria da Silva")
    await userEvent.click(trigger)

    // Closed: still in the DOM, but hidden and out of the tab order.
    const field = screen.getByLabelText("Nome", { selector: "input" }) as HTMLInputElement
    expect(field).not.toBeVisible()
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(
      document.getElementById(trigger.getAttribute("aria-controls") as string),
    ).toContainElement(field)

    await userEvent.click(trigger)
    expect(screen.getByLabelText("Nome")).toBeVisible()
    expect(screen.getByLabelText("Nome")).toHaveValue("Maria da Silva")
  })

  it("works controlled too", async () => {
    function Controlled() {
      const [open, setOpen] = React.useState(true)
      return (
        <Collapsible title="Seção" keepMounted open={open} onOpenChange={setOpen}>
          <input aria-label="Campo" defaultValue="x" />
        </Collapsible>
      )
    }
    render(<Controlled />)
    await userEvent.click(screen.getByRole("button", { name: "Seção" }))
    expect(screen.getByLabelText("Campo")).not.toBeVisible()
    await userEvent.click(screen.getByRole("button", { name: "Seção" }))
    expect(screen.getByLabelText("Campo")).toBeVisible()
  })

  it("without it, a closed section still unmounts its content (default)", async () => {
    render(
      <Collapsible title="Seção" defaultOpen>
        <input aria-label="Campo" />
      </Collapsible>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Seção" }))
    expect(screen.queryByLabelText("Campo")).not.toBeInTheDocument()
  })
})
