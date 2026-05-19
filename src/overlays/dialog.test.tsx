import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Dialog } from "./dialog"

// Radix DismissableLayer registers its document pointerdown listener inside a
// setTimeout(..., 0) — let timers drain so outside-click handling is wired up.
async function flushDismissableLayerSetup() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0))
  })
}

describe("Dialog", () => {
  it("opens via trigger and renders title/description/children", async () => {
    render(
      <Dialog trigger={<button type="button">Abrir</button>} title="Editar" description="Atualize">
        <p>Body content</p>
      </Dialog>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("Editar")).toBeInTheDocument()
    expect(screen.getByText("Atualize")).toBeInTheDocument()
    expect(screen.getByText("Body content")).toBeInTheDocument()
  })

  it("renders the footer slot when provided", async () => {
    render(
      <Dialog
        trigger={<button type="button">Abrir</button>}
        title="X"
        footer={
          <button type="button" data-testid="save">
            Salvar
          </button>
        }
      >
        <p>body</p>
      </Dialog>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect(screen.getByTestId("save")).toBeInTheDocument()
  })

  it("controlled open via props renders content", () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange} title="X">
        body
      </Dialog>,
    )
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("closes on Escape", async () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange} title="X">
        body
      </Dialog>,
    )
    await userEvent.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("hides the close button when hideCloseButton is set", () => {
    render(
      <Dialog open title="X" hideCloseButton>
        body
      </Dialog>,
    )
    expect(screen.queryByRole("button", { name: /Close/ })).not.toBeInTheDocument()
  })

  it("uses custom closeLabel", () => {
    render(
      <Dialog open title="X" closeLabel="Fechar">
        body
      </Dialog>,
    )
    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument()
  })

  it("dismissible=false: Escape does NOT close", async () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange} dismissible={false} title="X">
        body
      </Dialog>,
    )
    await userEvent.keyboard("{Escape}")
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it("dismissible=false: pointer-down on overlay does NOT close", async () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange} dismissible={false} title="X" description="d">
        body
      </Dialog>,
    )
    await flushDismissableLayerSetup()
    const overlay = document.querySelector('[data-slot="dialog-overlay"]')
    expect(overlay).not.toBeNull()
    if (overlay) fireEvent.pointerDown(overlay)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it("dismissible=false: hides the close button automatically", () => {
    render(
      <Dialog open title="X" dismissible={false}>
        body
      </Dialog>,
    )
    expect(screen.queryByRole("button", { name: /Close/ })).not.toBeInTheDocument()
  })

  it("dismissible=true (default): pointer-down outside closes", async () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange} title="X" description="d">
        body
      </Dialog>,
    )
    await flushDismissableLayerSetup()
    const overlay = document.querySelector('[data-slot="dialog-overlay"]')
    expect(overlay).not.toBeNull()
    if (overlay) fireEvent.pointerDown(overlay)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it.each([
    ["sm", "max-w-sm"],
    ["md", "max-w-lg"],
    ["lg", "max-w-2xl"],
    ["xl", "max-w-4xl"],
  ] as const)("size=%s applies %s on the content", (size, cls) => {
    render(
      <Dialog open title="X" size={size}>
        body
      </Dialog>,
    )
    expect(document.querySelector('[data-slot="dialog-content"]')).toHaveClass(cls)
  })

  it("applies custom className on the content", () => {
    render(
      <Dialog open title="X" className="my-dialog-cls">
        body
      </Dialog>,
    )
    expect(document.querySelector('[data-slot="dialog-content"]')).toHaveClass("my-dialog-cls")
  })

  it("renders without children body wrapper when children is omitted", () => {
    render(<Dialog open title="só título" />)
    expect(document.querySelector('[data-slot="dialog-body"]')).toBeNull()
  })

  it("respects defaultOpen", () => {
    render(
      <Dialog defaultOpen title="Auto-aberto">
        body
      </Dialog>,
    )
    expect(screen.getByText("Auto-aberto")).toBeInTheDocument()
  })
})
