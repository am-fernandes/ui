import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { AlertDialog } from "./alert-dialog"
import { Dialog } from "./dialog"
import { DropdownMenu } from "./dropdown-menu"
import { Popover } from "./popover"
import { Sheet } from "./sheet"
import { Tooltip } from "./tooltip"

// A modal locks the page behind it: wheel and touch scrolling only work inside
// its content element. So the floating layers opened from a modal have to live
// inside that element, not in <body>.

const modals = [
  {
    name: "Dialog",
    slot: "dialog-content",
    render: (children: React.ReactNode) => (
      <Dialog open title="Modal">
        {children}
      </Dialog>
    ),
  },
  {
    name: "AlertDialog",
    slot: "alert-dialog-content",
    render: (children: React.ReactNode) => (
      <AlertDialog open title="Modal" description="Descrição" onConfirm={() => {}}>
        {children}
      </AlertDialog>
    ),
  },
  {
    name: "Sheet",
    slot: "sheet-content",
    render: (children: React.ReactNode) => (
      <Sheet open title="Modal">
        {children}
      </Sheet>
    ),
  },
] as const

const modalContent = (slot: string) =>
  document.querySelector(`[data-slot="${slot}"]`) as HTMLElement

describe("floating layers inside a modal", () => {
  describe.each(modals)("$name", ({ slot, render: renderModal }) => {
    it("renders a Popover inside the modal content", async () => {
      render(
        renderModal(
          <Popover trigger={<button type="button">Filtros</button>} aria-label="Filtros">
            <p>lista de opções</p>
          </Popover>,
        ),
      )
      await userEvent.click(screen.getByRole("button", { name: "Filtros" }))
      const popover = document.querySelector('[data-slot="popover-content"]') as HTMLElement
      expect(popover).toHaveTextContent("lista de opções")
      expect(modalContent(slot)).toContainElement(popover)
    })

    it("renders a DropdownMenu, and its submenu, inside the modal content", async () => {
      render(
        renderModal(
          <DropdownMenu
            trigger={<button type="button">Ações</button>}
            items={[
              { label: "Editar" },
              { type: "submenu", label: "Mover para", items: [{ label: "Pendentes" }] },
            ]}
          />,
        ),
      )
      await userEvent.click(screen.getByRole("button", { name: "Ações" }))
      const menu = document.querySelector('[data-slot="dropdown-menu-content"]') as HTMLElement
      expect(modalContent(slot)).toContainElement(menu)

      screen.getByRole("menuitem", { name: "Mover para" }).focus()
      await userEvent.keyboard("{ArrowRight}")
      const submenu = document.querySelector(
        '[data-slot="dropdown-menu-sub-content"]',
      ) as HTMLElement
      expect(submenu).toHaveTextContent("Pendentes")
      expect(modalContent(slot)).toContainElement(submenu)
    })

    it("renders a Tooltip inside the modal content", () => {
      render(
        renderModal(
          <Tooltip content="Ajuda sobre o campo" open>
            <button type="button">?</button>
          </Tooltip>,
        ),
      )
      const tooltip = document.querySelector('[data-slot="tooltip-content"]') as HTMLElement
      expect(tooltip).toHaveTextContent("Ajuda sobre o campo")
      expect(modalContent(slot)).toContainElement(tooltip)
    })
  })

  it("a popover that is open when the modal opens mounts once, already inside it", () => {
    const mounts = vi.fn()
    function Probe() {
      const ref = React.useRef<HTMLParagraphElement>(null)
      React.useEffect(() => {
        mounts(document.querySelector('[data-slot="dialog-content"]')?.contains(ref.current))
      }, [])
      return <p ref={ref}>aberto desde o início</p>
    }
    render(
      <Dialog open title="Modal">
        <Popover defaultOpen trigger={<button type="button">Filtros</button>} aria-label="Filtros">
          <Probe />
        </Popover>
      </Dialog>,
    )
    expect(screen.getByText("aberto desde o início")).toBeInTheDocument()
    // Not mounted in <body> first and then moved: that would remount the
    // content, losing its focus and its state.
    expect(mounts).toHaveBeenCalledTimes(1)
    expect(mounts).toHaveBeenCalledWith(true)
  })

  // The modal's content is the containing block of the fixed layers inside it.
  // If the consumer made it clip (`overflow-y-auto` on the whole modal, the old
  // way to get a scroll), a calendar or a list leaving its box would be cut.
  describe.each(modals)("$name with a content that clips", ({ slot }) => {
    it("keeps the floating layers in <body>", async () => {
      const style = document.createElement("style")
      style.textContent = ".scrolls-whole-modal { overflow-y: auto }"
      document.head.append(style)
      const popover = (
        <Popover trigger={<button type="button">Filtros</button>} aria-label="Filtros">
          <p>lista</p>
        </Popover>
      )
      try {
        if (slot === "dialog-content") {
          render(
            <Dialog open title="Modal" className="scrolls-whole-modal">
              {popover}
            </Dialog>,
          )
        } else if (slot === "alert-dialog-content") {
          render(
            <AlertDialog
              open
              title="Modal"
              description="Descrição"
              onConfirm={() => {}}
              className="scrolls-whole-modal"
            >
              {popover}
            </AlertDialog>,
          )
        } else {
          render(
            <Sheet open title="Modal" className="scrolls-whole-modal">
              {popover}
            </Sheet>,
          )
        }
        await userEvent.click(screen.getByRole("button", { name: "Filtros" }))
        const content = document.querySelector('[data-slot="popover-content"]') as HTMLElement
        expect(content).toHaveTextContent("lista")
        expect(modalContent(slot)).not.toContainElement(content)
        expect(content.closest("[data-radix-popper-content-wrapper]")?.parentElement).toBe(
          document.body,
        )
      } finally {
        style.remove()
      }
    })
  })

  it("a second modal opened from the first one goes to <body>, with its own popovers", async () => {
    render(
      <Dialog open title="Editar proposta">
        <AlertDialog
          trigger={<button type="button">Descartar</button>}
          title="Descartar alterações?"
          description="O que foi digitado se perde."
          onConfirm={() => {}}
        >
          <Popover trigger={<button type="button">Motivo</button>} aria-label="Motivo">
            <p>opções de motivo</p>
          </Popover>
        </AlertDialog>
      </Dialog>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Descartar" }))
    const dialog = modalContent("dialog-content")
    const alert = modalContent("alert-dialog-content")
    // A modal covers the screen: it cannot live inside another modal's box.
    expect(alert.parentElement).toBe(document.body)
    expect(dialog).not.toContainElement(alert)

    await userEvent.click(screen.getByRole("button", { name: "Motivo" }))
    const popover = document.querySelector('[data-slot="popover-content"]') as HTMLElement
    expect(alert).toContainElement(popover)
  })
})

describe("floating layers outside a modal", () => {
  it("portal into <body>, as before", async () => {
    render(
      <div data-testid="page">
        <Popover trigger={<button type="button">Filtros</button>} aria-label="Filtros">
          <p>lista</p>
        </Popover>
        <DropdownMenu
          trigger={<button type="button">Ações</button>}
          items={[{ label: "Editar" }]}
        />
        <Tooltip content="Ajuda" open>
          <button type="button">?</button>
        </Tooltip>
      </div>,
    )
    const page = screen.getByTestId("page")
    const wrapperOf = (slot: string) =>
      document
        .querySelector(`[data-slot="${slot}"]`)
        ?.closest("[data-radix-popper-content-wrapper]")

    expect(wrapperOf("tooltip-content")?.parentElement).toBe(document.body)

    await userEvent.click(screen.getByRole("button", { name: "Filtros" }))
    expect(wrapperOf("popover-content")?.parentElement).toBe(document.body)
    expect(page).not.toContainElement(document.querySelector('[data-slot="popover-content"]'))
    await userEvent.keyboard("{Escape}")

    await userEvent.click(screen.getByRole("button", { name: "Ações" }))
    expect(wrapperOf("dropdown-menu-content")?.parentElement).toBe(document.body)
  })
})
