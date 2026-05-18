import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AlertDialog } from "./alert-dialog"

describe("AlertDialog", () => {
  it("renders title and description and confirm/cancel buttons", () => {
    render(
      <AlertDialog
        open
        title="Tem certeza?"
        description="Não pode ser desfeito."
        onConfirm={() => {}}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
      />,
    )
    expect(screen.getByText("Tem certeza?")).toBeInTheDocument()
    expect(screen.getByText("Não pode ser desfeito.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument()
  })

  it("fires onConfirm when confirm clicked", async () => {
    const onConfirm = vi.fn()
    render(<AlertDialog open title="X" onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it("fires onOpenChange(false) on cancel", async () => {
    const onOpenChange = vi.fn()
    render(<AlertDialog open onOpenChange={onOpenChange} title="X" onConfirm={() => {}} />)
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("fires onCancel when cancel clicked", async () => {
    const onCancel = vi.fn()
    render(<AlertDialog open title="X" onCancel={onCancel} onConfirm={() => {}} />)
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
    expect(onCancel).toHaveBeenCalled()
  })

  it("renders children above the buttons when provided", () => {
    render(
      <AlertDialog open title="X" onConfirm={() => {}}>
        <p data-testid="extra">Extra context</p>
      </AlertDialog>,
    )
    expect(screen.getByTestId("extra")).toBeInTheDocument()
  })

  it("applies confirmVariant (destructive)", () => {
    render(<AlertDialog open title="X" onConfirm={() => {}} confirmVariant="destructive" />)
    expect(screen.getByRole("button", { name: "Confirmar" })).toHaveClass("bg-destructive")
  })

  it("uses custom labels", () => {
    render(
      <AlertDialog
        open
        title="X"
        onConfirm={() => {}}
        confirmLabel="Sim, excluir"
        cancelLabel="Voltar"
      />,
    )
    expect(screen.getByRole("button", { name: "Sim, excluir" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Voltar" })).toBeInTheDocument()
  })

  it("falls back to Portuguese defaults when labels omitted", () => {
    render(<AlertDialog open title="X" onConfirm={() => {}} />)
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument()
  })

  it("opens via trigger when uncontrolled", async () => {
    render(
      <AlertDialog
        trigger={<button type="button">Abrir</button>}
        title="Confirma?"
        onConfirm={() => {}}
      />,
    )
    expect(screen.queryByText("Confirma?")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect(screen.getByText("Confirma?")).toBeInTheDocument()
  })

  it("respects defaultOpen", () => {
    render(<AlertDialog defaultOpen title="Auto-aberto" onConfirm={() => {}} />)
    expect(screen.getByText("Auto-aberto")).toBeInTheDocument()
  })

  it("renders without description when omitted", () => {
    render(<AlertDialog open title="Só título" onConfirm={() => {}} />)
    expect(screen.getByText("Só título")).toBeInTheDocument()
  })

  it("applies custom className to content", () => {
    render(<AlertDialog open title="X" onConfirm={() => {}} className="custom-cls" />)
    const content = document.querySelector('[data-slot="alert-dialog-content"]')
    expect(content).toHaveClass("custom-cls")
  })
})
