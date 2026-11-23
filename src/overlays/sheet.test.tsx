import { act, fireEvent, render, screen } from "@testing-library/react"
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

  describe("layout", () => {
    it.each(["top", "right", "bottom", "left"] as const)(
      "side=%s is a column: the body scrolls, title, description and footer keep their size",
      (side) => {
        render(
          <Sheet
            open
            side={side}
            title="Novo lead"
            description="Dados de contato"
            footer={<button type="button">Salvar</button>}
          >
            <p>campos</p>
          </Sheet>,
        )
        const content = document.querySelector('[data-slot="sheet-content"]') as HTMLElement
        const body = document.querySelector('[data-slot="sheet-body"]') as HTMLElement
        // `gap-4` and the footer's `mt-auto` only work in a flex column.
        expect(content).toHaveClass("flex", "flex-col", "gap-4")
        expect(body).toHaveClass("min-h-0", "flex-1", "overflow-y-auto")
        expect(body).toHaveTextContent("campos")
        expect(body).not.toContainElement(screen.getByText("Novo lead"))
        expect(body).not.toContainElement(screen.getByText("Dados de contato"))
        expect(body).not.toContainElement(screen.getByRole("button", { name: "Salvar" }))
        for (const slot of ["sheet-title", "sheet-description", "sheet-footer"]) {
          expect(document.querySelector(`[data-slot="${slot}"]`)).toHaveClass("shrink-0")
        }
        expect(document.querySelector('[data-slot="sheet-footer"]')).toHaveClass("mt-auto")
      },
    )

    it.each(["top", "bottom"] as const)(
      "side=%s grows with its content only up to the height of the screen",
      (side) => {
        render(
          <Sheet open side={side} title="X">
            body
          </Sheet>,
        )
        expect(document.querySelector('[data-slot="sheet-content"]')).toHaveClass(
          "max-h-[calc(100dvh-2rem)]",
        )
      },
    )

    it("keeps the body inside a sheet with its own padding", () => {
      render(
        <Sheet open title="X" className="p-0">
          body
        </Sheet>,
      )
      const body = document.querySelector('[data-slot="sheet-body"]')
      expect(body).not.toHaveClass("-mx-6")
      expect(body).toHaveClass("-mx-1.5", "px-1.5")
    })
  })
})

// An uncontrolled Sheet had no way to close from its footer: no `close`, no
// exported Close part. "Cancelar" was inert in the stories.
describe("Sheet footer as a function", () => {
  it("receives close(), which closes an uncontrolled sheet", async () => {
    const onOpenChange = vi.fn()
    render(
      <Sheet
        trigger={<button type="button">Abrir</button>}
        title="Editar proposta"
        onOpenChange={onOpenChange}
        footer={({ close }) => (
          <button type="button" onClick={close}>
            Cancelar
          </button>
        )}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect(screen.getByRole("dialog", { name: "Editar proposta" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
    expect(screen.queryByRole("dialog", { name: "Editar proposta" })).not.toBeInTheDocument()
    expect(onOpenChange).toHaveBeenCalledWith(false)
    // Focus goes back to the trigger, as with the X.
    expect(screen.getByRole("button", { name: "Abrir" })).toHaveFocus()
  })

  it("closes a controlled one through onOpenChange", async () => {
    const onOpenChange = vi.fn()
    render(
      <Sheet
        open
        onOpenChange={onOpenChange}
        title="X"
        footer={({ close }) => (
          <button type="button" onClick={close}>
            Cancelar
          </button>
        )}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("still takes a plain node", () => {
    render(<Sheet open title="X" footer={<span>rodapé</span>} />)
    expect(screen.getByText("rodapé")).toBeInTheDocument()
  })
})

// The Sheet had none of what the Dialog has: no way to keep it open, no
// control over the first focus, one width (384px) for every content.
describe("Sheet dismissible, onOpenAutoFocus and size", () => {
  async function flushDismissableLayerSetup() {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })
  }

  it("dismissible={false}: Escape and a press outside do not close, and there is no X", async () => {
    const onOpenChange = vi.fn()
    render(<Sheet open onOpenChange={onOpenChange} dismissible={false} title="Importando" />)
    await flushDismissableLayerSetup()
    await userEvent.keyboard("{Escape}")
    const overlay = document.querySelector('[data-slot="sheet-overlay"]') as HTMLElement
    fireEvent.pointerDown(overlay)
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog", { name: "Importando" })).toBeInTheDocument()
    // The panel has no content of its own: the only button would be the X.
    expect(screen.queryAllByRole("button")).toHaveLength(0)
  })

  it("dismissible (default): Escape closes", async () => {
    const onOpenChange = vi.fn()
    render(<Sheet open onOpenChange={onOpenChange} title="X" />)
    await userEvent.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("onOpenAutoFocus can send the first focus elsewhere", async () => {
    function Panel() {
      const ref = { current: null as HTMLInputElement | null }
      return (
        <Sheet
          open
          title="Filtros"
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            ref.current?.focus()
          }}
        >
          <input aria-label="Primeiro" />
          <input
            aria-label="Busca"
            ref={(node) => {
              ref.current = node
            }}
          />
        </Sheet>
      )
    }
    render(<Panel />)
    expect(screen.getByLabelText("Busca")).toHaveFocus()
  })

  it.each([
    ["sm", "sm:max-w-xs"],
    ["md", "sm:max-w-sm"],
    ["lg", "sm:max-w-2xl"],
  ] as const)("size=%s on a side panel", (size, width) => {
    render(<Sheet open side="right" size={size} title="X" />)
    const panel = document.querySelector('[data-slot="sheet-content"]') as HTMLElement
    expect(panel).toHaveClass(width)
    expect(panel).toHaveAttribute("data-size", size)
  })

  it("size defaults to md, today's width", () => {
    render(<Sheet open side="left" title="X" />)
    expect(document.querySelector('[data-slot="sheet-content"]')).toHaveClass("sm:max-w-sm")
  })
})
