import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Dialog } from "./dialog"
import { DropdownMenu } from "./dropdown-menu"
import { Popover } from "./popover"

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

  describe("press outside", () => {
    const pressOverlay = async () => {
      await flushDismissableLayerSetup()
      fireEvent.pointerDown(document.querySelector('[data-slot="dialog-overlay"]') as Element)
    }

    // The dialog used to stay open whenever the document held one of these
    // anywhere, which a page with a table, a date field or a search list does.
    it.each([
      ["a grid (a data table)", <div key="g" role="grid" />],
      ["a calendar", <div key="c" className="rdp rdp-root" />],
      ["a command list", <div key="l" cmdk-root="" cmdk-list="" />],
      ["an open popper", <div key="p" data-radix-popper-content-wrapper="" />],
    ])("closes on a press on the backdrop when the page behind has %s", async (_, behind) => {
      const onOpenChange = vi.fn()
      render(
        <>
          <main>{behind}</main>
          <Dialog open onOpenChange={onOpenChange} title="X" description="d">
            body
          </Dialog>
        </>,
      )
      await pressOverlay()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it("closes on a press on the backdrop when its own content is a command list", async () => {
      // The CommandPalette: a Dialog around a cmdk list, with no X button. On a
      // touch screen the backdrop is the only way out besides choosing an item.
      const onOpenChange = vi.fn()
      render(
        <Dialog open onOpenChange={onOpenChange} title="Comandos" hideCloseButton>
          <div cmdk-root="">
            <div cmdk-list="">Dashboard</div>
          </div>
        </Dialog>,
      )
      await pressOverlay()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it("stays open on a press inside a popover, a calendar or a list that belongs to it", async () => {
      const onOpenChange = vi.fn()
      render(
        <Dialog open onOpenChange={onOpenChange} title="X" description="d">
          <Popover trigger={<button type="button">Data</button>} aria-label="Calendário">
            {/* The shape of the Calendar (react-day-picker). */}
            <div className="rdp-root">
              <table aria-label="Maio">
                <tbody>
                  <tr>
                    <td>
                      <button type="button">15</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Popover>
        </Dialog>,
      )
      await flushDismissableLayerSetup()
      await userEvent.click(screen.getByRole("button", { name: "Data" }))
      const day = screen.getByRole("button", { name: "15" })
      fireEvent.pointerDown(day)
      await userEvent.click(day)
      expect(onOpenChange).not.toHaveBeenCalled()
      expect(screen.getByRole("dialog", { name: "X" })).toBeInTheDocument()
    })

    it("stays open on a press inside a menu that belongs to it", async () => {
      const onOpenChange = vi.fn()
      const onSelect = vi.fn()
      render(
        <Dialog open onOpenChange={onOpenChange} title="X" description="d">
          <DropdownMenu
            trigger={<button type="button">Ações</button>}
            items={[{ label: "Duplicar", onSelect }]}
          />
        </Dialog>,
      )
      await flushDismissableLayerSetup()
      await userEvent.click(screen.getByRole("button", { name: "Ações" }))
      const item = screen.getByRole("menuitem", { name: "Duplicar" })
      fireEvent.pointerDown(item)
      await userEvent.click(item)
      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(onOpenChange).not.toHaveBeenCalled()
    })
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

  describe("tall content", () => {
    it("scrolls the body only: title, description and footer stay outside it", () => {
      render(
        <Dialog
          open
          title="Nova proposta"
          description="Dados do comprador"
          footer={<button type="button">Salvar</button>}
        >
          <p>campos</p>
        </Dialog>,
      )
      const content = document.querySelector('[data-slot="dialog-content"]') as HTMLElement
      const body = document.querySelector('[data-slot="dialog-body"]') as HTMLElement
      // The content is capped at the viewport and lays its parts out in a column…
      expect(content).toHaveClass("flex", "flex-col", "max-h-[calc(100dvh-2rem)]")
      // …where only the body gives way and scrolls.
      expect(body).toHaveClass("min-h-0", "overflow-y-auto")
      expect(body).toHaveTextContent("campos")
      expect(body).not.toContainElement(screen.getByText("Nova proposta"))
      expect(body).not.toContainElement(screen.getByText("Dados do comprador"))
      expect(body).not.toContainElement(screen.getByRole("button", { name: "Salvar" }))
      for (const slot of ["dialog-title", "dialog-description", "dialog-footer"]) {
        expect(document.querySelector(`[data-slot="${slot}"]`)).toHaveClass("shrink-0")
      }
    })

    it("lets the scrollbar reach the edge of the dialog with the default padding", () => {
      render(
        <Dialog open title="X">
          body
        </Dialog>,
      )
      expect(document.querySelector('[data-slot="dialog-body"]')).toHaveClass("-mx-6", "px-6")
    })

    it.each(["p-0", "overflow-hidden p-0", "px-8", "sm:p-8"])(
      "keeps the body inside a dialog with its own padding (className=%s)",
      (className) => {
        render(
          <Dialog open title="X" className={className}>
            body
          </Dialog>,
        )
        const body = document.querySelector('[data-slot="dialog-body"]')
        expect(body).not.toHaveClass("-mx-6")
        expect(body).not.toHaveClass("px-6")
        // Still room for a focus ring (2px, 3px away) on every side.
        expect(body).toHaveClass("-mx-1.5", "px-1.5", "-my-1.5", "py-1.5")
      },
    )

    it.each(["py-2", "max-w-3xl", "gap-0", "placeholder-shown:opacity-50 peer-focus:block"])(
      "does not take className=%s for a padding override",
      (className) => {
        render(
          <Dialog open title="X" className={className}>
            body
          </Dialog>,
        )
        expect(document.querySelector('[data-slot="dialog-body"]')).toHaveClass("-mx-6", "px-6")
      },
    )
  })
})
