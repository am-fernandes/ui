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

  it("renders children above the buttons when provided", () => {
    render(
      <AlertDialog open title="X" onConfirm={() => {}}>
        <p data-testid="extra">Extra context</p>
      </AlertDialog>,
    )
    expect(screen.getByTestId("extra")).toBeInTheDocument()
  })

  it("applies confirmVariant", () => {
    render(<AlertDialog open title="X" onConfirm={() => {}} confirmVariant="destructive" />)
    expect(screen.getByRole("button", { name: "Confirmar" })).toHaveClass("bg-destructive")
  })
})
