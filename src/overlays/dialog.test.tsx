import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Dialog } from "./dialog"

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
})
