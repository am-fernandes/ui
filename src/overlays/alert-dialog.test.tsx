import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mockExitAnimation } from "./_internal/testing"
import { AlertDialog } from "./alert-dialog"

const CONTENT = '[data-slot="alert-dialog-content"]'

describe("AlertDialog", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("double activation", () => {
    // In a browser the dialog stays mounted, with its buttons under the pointer,
    // for the 175ms of the exit animation.
    it("confirms once when the button is clicked again while the dialog closes", async () => {
      const exit = mockExitAnimation(CONTENT)
      const onConfirm = vi.fn()
      render(<AlertDialog defaultOpen title="Aprovar a proposta?" onConfirm={onConfirm} />)
      const confirm = screen.getByRole("button", { name: "Confirmar" })

      await userEvent.click(confirm)
      expect(document.querySelector(CONTENT)).toHaveAttribute("data-state", "closed")
      await userEvent.click(confirm)
      fireEvent.click(confirm)
      fireEvent.keyDown(confirm, { key: "Enter" })
      expect(onConfirm).toHaveBeenCalledTimes(1)

      exit.finish()
      expect(document.querySelector(CONTENT)).toBeNull()
      exit.restore()
    })

    it("cancels once too", async () => {
      const exit = mockExitAnimation(CONTENT)
      const onCancel = vi.fn()
      const onOpenChange = vi.fn()
      render(
        <AlertDialog
          defaultOpen
          title="X"
          onConfirm={() => {}}
          onCancel={onCancel}
          onOpenChange={onOpenChange}
        />,
      )
      const cancel = screen.getByRole("button", { name: "Cancelar" })
      await userEvent.click(cancel)
      await userEvent.click(cancel)
      expect(onCancel).toHaveBeenCalledTimes(1)
      expect(onOpenChange).toHaveBeenCalledTimes(1)
      exit.restore()
    })

    it("a click on Cancelar while it closes after a confirm does not cancel", async () => {
      const exit = mockExitAnimation(CONTENT)
      const onCancel = vi.fn()
      render(<AlertDialog defaultOpen title="X" onConfirm={() => {}} onCancel={onCancel} />)
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
      expect(onCancel).not.toHaveBeenCalled()
      exit.restore()
    })

    it("confirms again when it is opened again", async () => {
      const exit = mockExitAnimation(CONTENT)
      const onConfirm = vi.fn()
      render(
        <AlertDialog
          trigger={<button type="button">Abrir</button>}
          title="X"
          onConfirm={onConfirm}
        />,
      )
      const trigger = screen.getByRole("button", { name: "Abrir" })
      await userEvent.click(trigger)
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      // Opened again before the exit animation ended: same mounted content.
      fireEvent.click(trigger)
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      expect(onConfirm).toHaveBeenCalledTimes(2)
      exit.restore()
    })

    it("a controlled dialog the consumer keeps open still takes every click", async () => {
      // The consumer validates in onConfirm and decides not to close.
      const onConfirm = vi.fn()
      function Kept() {
        const [open] = React.useState(true)
        return <AlertDialog open={open} title="X" onConfirm={onConfirm} />
      }
      render(<Kept />)
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
      expect(onConfirm).toHaveBeenCalledTimes(2)
    })
  })

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

  // Escape is the keyboard's "Cancelar": it closed the dialog without telling
  // the consumer, who was left with a half-done flow (a draft not discarded,
  // a selection not cleared).
  it("Escape cancels: onCancel is called once, as with the Cancelar button", async () => {
    const onCancel = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <AlertDialog
        defaultOpen
        title="Descartar alterações?"
        onConfirm={() => {}}
        onCancel={onCancel}
        onOpenChange={onOpenChange}
      />,
    )
    await userEvent.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })

  it("a second Escape while it closes does not cancel again", async () => {
    const exit = mockExitAnimation(CONTENT)
    const onCancel = vi.fn()
    render(<AlertDialog defaultOpen title="X" onConfirm={() => {}} onCancel={onCancel} />)
    await userEvent.keyboard("{Escape}")
    await userEvent.keyboard("{Escape}")
    expect(onCancel).toHaveBeenCalledTimes(1)
    exit.restore()
  })

  it("renders children above the buttons when provided", () => {
    render(
      <AlertDialog open title="X" onConfirm={() => {}}>
        <p data-testid="extra">Extra context</p>
      </AlertDialog>,
    )
    expect(screen.getByTestId("extra")).toBeInTheDocument()
  })

  it("scrolls the children only: title, description and buttons stay outside the body", () => {
    render(
      <AlertDialog open title="Arquivar?" description="Sai da fila." onConfirm={() => {}}>
        <p>lista longa</p>
      </AlertDialog>,
    )
    const content = document.querySelector('[data-slot="alert-dialog-content"]') as HTMLElement
    const body = document.querySelector('[data-slot="alert-dialog-body"]') as HTMLElement
    expect(content).toHaveClass("flex", "flex-col", "max-h-[calc(100dvh-2rem)]")
    expect(body).toHaveClass("min-h-0", "overflow-y-auto")
    expect(body).toHaveTextContent("lista longa")
    expect(body).not.toContainElement(screen.getByText("Arquivar?"))
    expect(body).not.toContainElement(screen.getByText("Sai da fila."))
    expect(body).not.toContainElement(screen.getByRole("button", { name: "Confirmar" }))
    expect(body).not.toContainElement(screen.getByRole("button", { name: "Cancelar" }))
  })

  it("renders no body wrapper without children", () => {
    render(<AlertDialog open title="X" onConfirm={() => {}} />)
    expect(document.querySelector('[data-slot="alert-dialog-body"]')).toBeNull()
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
