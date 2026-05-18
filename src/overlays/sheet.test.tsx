import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Sheet } from "./sheet"

describe("Sheet", () => {
  it("opens via trigger and renders title/description/children", async () => {
    render(
      <Sheet trigger={<button type="button">Abrir</button>} title="Config" description="...">
        <p>body</p>
      </Sheet>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("Config")).toBeInTheDocument()
    expect(screen.getByText("body")).toBeInTheDocument()
  })

  it("renders footer slot", async () => {
    render(
      <Sheet
        trigger={<button type="button">Abrir</button>}
        title="X"
        footer={
          <button type="button" data-testid="ok">
            OK
          </button>
        }
      >
        body
      </Sheet>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect(screen.getByTestId("ok")).toBeInTheDocument()
  })

  it("marks footer wrapper with data-slot=sheet-footer", async () => {
    render(
      <Sheet trigger={<button type="button">Abrir</button>} title="X" footer={<span>foot</span>}>
        body
      </Sheet>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect(document.querySelector('[data-slot="sheet-footer"]')).toBeInTheDocument()
  })

  it("marks body wrapper with data-slot=sheet-body when children provided", async () => {
    render(
      <Sheet trigger={<button type="button">Abrir</button>} title="X">
        <p>some body</p>
      </Sheet>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect(document.querySelector('[data-slot="sheet-body"]')).toBeInTheDocument()
  })

  it.each(["top", "right", "bottom", "left"] as const)(
    "renders data-side=%s when side=%s",
    (side) => {
      render(
        <Sheet open side={side} title="X">
          body
        </Sheet>,
      )
      expect(document.querySelector('[data-slot="sheet-content"]')).toHaveAttribute(
        "data-side",
        side,
      )
    },
  )

  it("defaults to side=right", () => {
    render(
      <Sheet open title="X">
        body
      </Sheet>,
    )
    expect(document.querySelector('[data-slot="sheet-content"]')).toHaveAttribute(
      "data-side",
      "right",
    )
  })

  it("hides close button when hideCloseButton is set", () => {
    render(
      <Sheet open title="X" hideCloseButton>
        body
      </Sheet>,
    )
    expect(screen.queryByRole("button", { name: /Close/i })).not.toBeInTheDocument()
  })

  it("uses custom closeLabel", () => {
    render(
      <Sheet open title="X" closeLabel="Fechar">
        body
      </Sheet>,
    )
    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument()
  })

  it("closes on Escape", async () => {
    const onOpenChange = vi.fn()
    render(
      <Sheet open onOpenChange={onOpenChange} title="X">
        body
      </Sheet>,
    )
    await userEvent.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("respects defaultOpen", () => {
    render(
      <Sheet defaultOpen title="Auto-aberto">
        body
      </Sheet>,
    )
    expect(screen.getByText("Auto-aberto")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    render(
      <Sheet open title="X" className="custom-sheet">
        body
      </Sheet>,
    )
    expect(document.querySelector('[data-slot="sheet-content"]')).toHaveClass("custom-sheet")
  })

  it("applies side-specific animation classes", () => {
    render(
      <Sheet open side="left" title="X">
        body
      </Sheet>,
    )
    const content = document.querySelector('[data-slot="sheet-content"]')
    expect(content).toHaveClass("data-[state=open]:slide-in-from-left")
  })

  it("renders without children body wrapper when children is omitted", () => {
    render(<Sheet open title="só título" />)
    expect(document.querySelector('[data-slot="sheet-body"]')).toBeNull()
  })

  it("renders description when provided", () => {
    render(
      <Sheet open title="X" description="Descrição visível">
        body
      </Sheet>,
    )
    expect(screen.getByText("Descrição visível")).toBeInTheDocument()
  })
})
