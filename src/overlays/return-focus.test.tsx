import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { AlertDialog } from "./alert-dialog"
import { Dialog } from "./dialog"
import { DropdownMenu } from "./dropdown-menu"
import { Popover } from "./popover"
import { Sheet } from "./sheet"

// Radix gives focus back to the `trigger` element only. A modal opened by
// state has none: focus used to end on <body>.

type ModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCloseAutoFocus?: (event: Event) => void
  trigger?: React.ReactNode
}

const modals = [
  {
    name: "Dialog",
    Modal: (props: ModalProps) => (
      <Dialog title="Editar proposta" {...props}>
        <input aria-label="Nome" />
      </Dialog>
    ),
  },
  {
    name: "AlertDialog",
    Modal: (props: ModalProps) => (
      <AlertDialog
        title="Excluir proposta?"
        description="Não pode ser desfeito."
        onConfirm={() => {}}
        {...props}
      />
    ),
  },
  {
    name: "Sheet",
    Modal: (props: ModalProps) => (
      <Sheet title="Filtros" {...props}>
        <input aria-label="Nome" />
      </Sheet>
    ),
  },
] as const

const modal = () => screen.queryByRole("dialog") ?? screen.queryByRole("alertdialog")

describe.each(modals)("$name without a trigger: focus on close", ({ Modal }) => {
  function Page({
    onCloseAutoFocus,
    removeOpener = false,
  }: {
    onCloseAutoFocus?: (event: Event) => void
    removeOpener?: boolean
  }) {
    const [open, setOpen] = React.useState(false)
    const [opener, setOpener] = React.useState(true)
    return (
      <div>
        <button type="button">Outro</button>
        {opener ? (
          <button
            type="button"
            onClick={() => {
              setOpen(true)
              if (removeOpener) setOpener(false)
            }}
          >
            Abrir
          </button>
        ) : null}
        <Modal open={open} onOpenChange={setOpen} onCloseAutoFocus={onCloseAutoFocus} />
      </div>
    )
  }

  it("goes back to the element that had it when the modal opened", async () => {
    render(<Page />)
    const opener = screen.getByRole("button", { name: "Abrir" })
    await userEvent.click(opener)
    expect(modal()).toBeInTheDocument()
    expect(opener).not.toHaveFocus()

    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(modal()).not.toBeInTheDocument())
    await waitFor(() => expect(opener).toHaveFocus())
  })

  it("does the same every time it opens", async () => {
    render(<Page />)
    const opener = screen.getByRole("button", { name: "Abrir" })
    for (let round = 0; round < 2; round++) {
      await userEvent.click(opener)
      await userEvent.keyboard("{Escape}")
      await waitFor(() => expect(opener).toHaveFocus())
      screen.getByRole("button", { name: "Outro" }).focus()
    }
  })

  it("does not look for an element that is gone", async () => {
    render(<Page removeOpener />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(modal()).not.toBeInTheDocument())
    expect(screen.queryByRole("button", { name: "Abrir" })).not.toBeInTheDocument()
  })

  it("calls onCloseAutoFocus, which can send focus somewhere else", async () => {
    const onCloseAutoFocus = vi.fn((event: Event) => {
      event.preventDefault()
      screen.getByRole("button", { name: "Outro" }).focus()
    })
    render(<Page onCloseAutoFocus={onCloseAutoFocus} />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(onCloseAutoFocus).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.getByRole("button", { name: "Outro" })).toHaveFocus())
  })
})

describe.each(modals)("$name with a trigger: focus on close", ({ Modal }) => {
  it("goes back to the trigger, as before", async () => {
    function Page() {
      const [open, setOpen] = React.useState(false)
      return (
        <Modal
          open={open}
          onOpenChange={setOpen}
          trigger={<button type="button">Gatilho</button>}
        />
      )
    }
    render(<Page />)
    const trigger = screen.getByRole("button", { name: "Gatilho" })
    await userEvent.click(trigger)
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(trigger).toHaveFocus())
  })
})

describe("modal opened from a popup that closes", () => {
  it("opened from a menu item: focus returns to the menu's trigger", async () => {
    // The "…" of a table row: the item that opened the dialog is gone when the
    // dialog closes, with the menu.
    function Row() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <DropdownMenu
            trigger={<button type="button">Ações da proposta</button>}
            items={[{ label: "Editar", onSelect: () => setOpen(true) }]}
          />
          <Dialog open={open} onOpenChange={setOpen} title="Editar proposta">
            <input aria-label="Nome" />
          </Dialog>
        </>
      )
    }
    render(<Row />)
    const trigger = screen.getByRole("button", { name: "Ações da proposta" })
    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole("menuitem", { name: "Editar" }))
    expect(screen.getByRole("dialog", { name: "Editar proposta" })).toBeInTheDocument()

    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("opened from an item of a submenu: focus returns to the root trigger", async () => {
    function Row() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <DropdownMenu
            trigger={<button type="button">Ações</button>}
            items={[
              {
                type: "submenu",
                label: "Mais",
                items: [{ label: "Excluir", onSelect: () => setOpen(true) }],
              },
            ]}
          />
          <AlertDialog
            open={open}
            onOpenChange={setOpen}
            title="Excluir?"
            description="Não pode ser desfeito."
            onConfirm={() => {}}
          />
        </>
      )
    }
    render(<Row />)
    const trigger = screen.getByRole("button", { name: "Ações" })
    await userEvent.click(trigger)
    screen.getByRole("menuitem", { name: "Mais" }).focus()
    await userEvent.keyboard("{ArrowRight}")
    await userEvent.click(await screen.findByRole("menuitem", { name: "Excluir" }))
    expect(screen.getByRole("alertdialog")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("opened from a button in a popover: focus returns to the popover's trigger", async () => {
    function Filters() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <Popover trigger={<button type="button">Filtros</button>} aria-label="Filtros">
            <button type="button" onClick={() => setOpen(true)}>
              Filtro avançado
            </button>
          </Popover>
          <Sheet open={open} onOpenChange={setOpen} title="Filtro avançado">
            <input aria-label="Cidade" />
          </Sheet>
        </>
      )
    }
    render(<Filters />)
    const trigger = screen.getByRole("button", { name: "Filtros" })
    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole("button", { name: "Filtro avançado" }))
    expect(screen.getByRole("dialog", { name: "Filtro avançado" })).toBeInTheDocument()

    await userEvent.keyboard("{Escape}")
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Filtro avançado" })).not.toBeInTheDocument(),
    )
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("a confirmation over a dialog: back to the button that asked, or past it if both close", async () => {
    function Editor({ closeBoth }: { closeBoth: boolean }) {
      const [editing, setEditing] = React.useState(false)
      const [confirming, setConfirming] = React.useState(false)
      return (
        <>
          <button type="button" onClick={() => setEditing(true)}>
            Editar
          </button>
          <Dialog
            open={editing}
            onOpenChange={setEditing}
            title="Editar proposta"
            footer={
              <button type="button" onClick={() => setConfirming(true)}>
                Descartar
              </button>
            }
          >
            <input aria-label="Nome" />
          </Dialog>
          <AlertDialog
            open={confirming}
            onOpenChange={setConfirming}
            title="Descartar alterações?"
            description="O que foi digitado se perde."
            onConfirm={() => {
              if (closeBoth) setEditing(false)
            }}
          />
        </>
      )
    }

    const { unmount } = render(<Editor closeBoth={false} />)
    await userEvent.click(screen.getByRole("button", { name: "Editar" }))
    await userEvent.click(screen.getByRole("button", { name: "Descartar" }))
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
    await waitFor(() => expect(screen.getByRole("button", { name: "Descartar" })).toHaveFocus())
    unmount()

    render(<Editor closeBoth />)
    const edit = screen.getByRole("button", { name: "Editar" })
    await userEvent.click(edit)
    await userEvent.click(screen.getByRole("button", { name: "Descartar" }))
    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    await waitFor(() => expect(edit).toHaveFocus())
  })
})
