import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Tour, type TourProps, type TourStep, defaultTourLabels } from "./tour"

function Page({ children }: { children?: React.ReactNode }) {
  return (
    <div>
      <button type="button" id="novo">
        Novo lead
      </button>
      <button type="button" id="filtros">
        Filtros
      </button>
      <button type="button" id="exportar">
        Exportar
      </button>
      {children}
    </div>
  )
}

const steps: TourStep[] = [
  { target: "#novo", title: "Crie leads", content: "Comece por aqui." },
  { target: "#filtros", title: "Filtre a lista" },
  { target: "#exportar", title: "Exporte", content: "Baixe em CSV." },
]

function renderTour(props: Partial<TourProps> = {}) {
  const onClose = props.onClose ?? vi.fn()
  const utils = render(
    <Page>
      <Tour steps={steps} open onClose={onClose} {...props} />
    </Page>,
  )
  return { ...utils, onClose }
}

const dialog = () => screen.getByRole("dialog")

function mockRect(element: Element, rect: { x: number; y: number; width: number; height: number }) {
  return vi
    .spyOn(element, "getBoundingClientRect")
    .mockImplementation(() => new DOMRect(rect.x, rect.y, rect.width, rect.height))
}

describe("Tour", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("rendering", () => {
    it("renders nothing while closed", () => {
      renderTour({ open: false })
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      expect(document.querySelector('[data-slot="tour-spotlight"]')).toBeNull()
    })

    it("renders nothing without steps", () => {
      renderTour({ steps: [] })
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("opens a dialog named by the step title and described by its content", () => {
      renderTour()
      expect(dialog()).toHaveAccessibleName("Crie leads")
      expect(dialog()).toHaveAccessibleDescription("Comece por aqui.")
      expect(dialog()).toHaveAttribute("data-slot", "tour-step")
      expect(dialog()).toHaveAttribute("data-step", "0")
      expect(screen.getByRole("heading", { level: 2, name: "Crie leads" })).toBeInTheDocument()
    })

    it("has no description when the step has no content", () => {
      renderTour({ defaultStep: 1 })
      expect(dialog()).toHaveAccessibleName("Filtre a lista")
      expect(dialog()).not.toHaveAttribute("aria-describedby")
    })

    it("shows progress by default and hides it with showProgress={false}", () => {
      const { unmount } = renderTour()
      expect(screen.getByText("1 de 3")).toHaveAttribute("data-slot", "tour-progress")
      unmount()
      renderTour({ showProgress: false })
      expect(screen.queryByText("1 de 3")).not.toBeInTheDocument()
    })

    it("focuses the primary action on open and has no Voltar on the first step", () => {
      renderTour()
      expect(screen.getByRole("button", { name: "Próximo" })).toHaveFocus()
      expect(screen.queryByRole("button", { name: "Voltar" })).not.toBeInTheDocument()
    })
  })

  describe("navigation", () => {
    it("moves forward and back, focusing the primary action and announcing the step", async () => {
      const onStepChange = vi.fn()
      renderTour({ onStepChange })
      await userEvent.click(screen.getByRole("button", { name: "Próximo" }))
      expect(onStepChange).toHaveBeenLastCalledWith(1)
      expect(dialog()).toHaveAccessibleName("Filtre a lista")
      expect(screen.getByText("2 de 3")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Próximo" })).toHaveFocus()
      expect(document.querySelector('[data-slot="tour-announcer"]')).toHaveTextContent(
        "2 de 3: Filtre a lista",
      )

      await userEvent.click(screen.getByRole("button", { name: "Voltar" }))
      expect(onStepChange).toHaveBeenLastCalledWith(0)
      expect(dialog()).toHaveAccessibleName("Crie leads")
    })

    // From step 2 on, the screen reader heard "2 de 3: título" and nothing
    // of the step's content: the focus stays on "Próximo", so the callout's
    // description is never read again.
    it("announces the content of the step with its title", async () => {
      renderTour()
      await userEvent.click(screen.getByRole("button", { name: "Próximo" }))
      await userEvent.click(screen.getByRole("button", { name: "Próximo" }))
      expect(document.querySelector('[data-slot="tour-announcer"]')).toHaveTextContent(
        "3 de 3: Exporte. Baixe em CSV.",
      )
    })

    it("a step without content is announced by its title alone", async () => {
      renderTour()
      await userEvent.click(screen.getByRole("button", { name: "Próximo" }))
      expect(document.querySelector('[data-slot="tour-announcer"]')?.textContent).toBe(
        "2 de 3: Filtre a lista",
      )
    })

    it("a content made of elements is announced as its text", async () => {
      render(
        <Page>
          <Tour
            open
            steps={[
              { target: "#novo", title: "Um" },
              {
                target: "#filtros",
                title: "Dois",
                content: (
                  <p>
                    Use <strong>Ctrl+K</strong> para buscar.
                  </p>
                ),
              },
            ]}
          />
        </Page>,
      )
      await userEvent.click(screen.getByRole("button", { name: "Próximo" }))
      expect(document.querySelector('[data-slot="tour-announcer"]')).toHaveTextContent(
        "2 de 2: Dois. Use Ctrl+K para buscar.",
      )
    })

    it("finishes on the last step with Concluir", async () => {
      const { onClose } = renderTour({ defaultStep: 2 })
      expect(screen.queryByRole("button", { name: "Próximo" })).not.toBeInTheDocument()
      await userEvent.click(screen.getByRole("button", { name: "Concluir" }))
      expect(onClose).toHaveBeenCalledWith("completed")
    })

    it("can be controlled", async () => {
      const onStepChange = vi.fn()
      const { rerender, onClose } = renderTour({ step: 1, onStepChange })
      expect(dialog()).toHaveAccessibleName("Filtre a lista")
      await userEvent.click(screen.getByRole("button", { name: "Próximo" }))
      expect(onStepChange).toHaveBeenCalledWith(2)
      // The parent did not move it, so it stays.
      expect(dialog()).toHaveAccessibleName("Filtre a lista")
      rerender(
        <Page>
          <Tour steps={steps} open onClose={onClose} step={2} onStepChange={onStepChange} />
        </Page>,
      )
      expect(dialog()).toHaveAccessibleName("Exporte")
    })

    it("clamps an out-of-range step", () => {
      renderTour({ step: 99 })
      expect(dialog()).toHaveAccessibleName("Exporte")
    })

    it("restarts from defaultStep each time it opens", async () => {
      function Harness() {
        const [open, setOpen] = React.useState(true)
        return (
          <Page>
            <button type="button" onClick={() => setOpen(true)}>
              Reabrir
            </button>
            <Tour steps={steps} open={open} onClose={() => setOpen(false)} />
          </Page>
        )
      }
      render(<Harness />)
      await userEvent.click(screen.getByRole("button", { name: "Próximo" }))
      expect(dialog()).toHaveAccessibleName("Filtre a lista")
      await userEvent.keyboard("{Escape}")
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      expect(document.querySelector('[data-slot="tour-announcer"]')).toBeNull()
      await userEvent.click(screen.getByRole("button", { name: "Reabrir" }))
      expect(dialog()).toHaveAccessibleName("Crie leads")
    })
  })

  describe("dismissal", () => {
    it("dismisses from the close button", async () => {
      const { onClose } = renderTour()
      await userEvent.click(screen.getByRole("button", { name: "Fechar tour" }))
      expect(onClose).toHaveBeenCalledWith("dismissed")
    })

    it("dismisses on Escape", async () => {
      const { onClose } = renderTour()
      await userEvent.keyboard("{Escape}")
      expect(onClose).toHaveBeenCalledWith("dismissed")
    })

    it("does not end when the user clicks elsewhere on the page", async () => {
      const { onClose } = renderTour()
      fireEvent.pointerDown(screen.getByRole("button", { name: "Filtros" }))
      await userEvent.click(screen.getByRole("button", { name: "Filtros" }))
      expect(onClose).not.toHaveBeenCalled()
      expect(dialog()).toBeInTheDocument()
    })

    it("works without onClose", async () => {
      render(
        <Page>
          <Tour steps={steps} open />
        </Page>,
      )
      await userEvent.click(screen.getByRole("button", { name: "Fechar tour" }))
      expect(dialog()).toBeInTheDocument()
    })
  })

  describe("focus restore", () => {
    function Harness({ removeOpener = false }: { removeOpener?: boolean }) {
      const [open, setOpen] = React.useState(false)
      const [opener, setOpener] = React.useState(true)
      return (
        <Page>
          {opener ? (
            <button type="button" onClick={() => setOpen(true)}>
              Iniciar tour
            </button>
          ) : null}
          <Tour
            steps={steps}
            open={open}
            onClose={() => {
              if (removeOpener) setOpener(false)
              setOpen(false)
            }}
          />
        </Page>
      )
    }

    it("gives focus back to where it was when the tour ends", async () => {
      render(<Harness />)
      const opener = screen.getByRole("button", { name: "Iniciar tour" })
      await userEvent.click(opener)
      expect(screen.getByRole("button", { name: "Próximo" })).toHaveFocus()
      await userEvent.click(screen.getByRole("button", { name: "Fechar tour" }))
      await waitFor(() => expect(opener).toHaveFocus())
    })

    it("does not try to focus an element that is gone", async () => {
      render(<Harness removeOpener />)
      await userEvent.click(screen.getByRole("button", { name: "Iniciar tour" }))
      await userEvent.click(screen.getByRole("button", { name: "Fechar tour" }))
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
      expect(screen.queryByRole("button", { name: "Iniciar tour" })).not.toBeInTheDocument()
    })
  })

  describe("targets", () => {
    it("accepts refs, selectors and functions, and scrolls the target into view", async () => {
      const scroll = vi.spyOn(Element.prototype, "scrollIntoView")
      function Harness() {
        const ref = React.useRef<HTMLButtonElement>(null)
        const [step, setStep] = React.useState(0)
        return (
          <div>
            <button type="button" ref={ref}>
              Por ref
            </button>
            <button type="button" className="por-seletor">
              Por seletor
            </button>
            <button type="button" id="por-funcao">
              Por função
            </button>
            <Tour
              open
              step={step}
              onStepChange={setStep}
              steps={[
                { target: ref, title: "Ref" },
                { target: ".por-seletor", title: "Seletor" },
                { target: () => document.getElementById("por-funcao"), title: "Função" },
              ]}
            />
          </div>
        )
      }
      render(<Harness />)
      const calledOn = () => scroll.mock.contexts.map((el) => (el as HTMLElement).textContent)
      expect(calledOn()).toEqual(["Por ref"])
      expect(scroll).toHaveBeenLastCalledWith({ block: "nearest", inline: "nearest" })
      await userEvent.click(screen.getByRole("button", { name: "Próximo" }))
      await userEvent.click(screen.getByRole("button", { name: "Próximo" }))
      expect(calledOn()).toEqual(["Por ref", "Por seletor", "Por função"])
    })

    it("uses the step's side and align", () => {
      renderTour({ steps: [{ target: "#novo", title: "A", side: "right", align: "end" }] })
      expect(dialog()).toHaveAttribute("data-align", "end")
      // jsdom has no layout: collision handling may flip to the opposite side,
      // but always on the requested axis.
      expect(["right", "left"]).toContain(dialog().getAttribute("data-side"))
    })

    it("defaults to below the target, aligned to its start", () => {
      renderTour()
      expect(dialog()).toHaveAttribute("data-align", "start")
      expect(["bottom", "top"]).toContain(dialog().getAttribute("data-side"))
    })

    it("falls back to a centred callout when the target is missing or the selector is invalid", () => {
      const { unmount } = renderTour({ steps: [{ target: "#nao-existe", title: "Sumiu" }] })
      expect(dialog()).toHaveAttribute("data-align", "center")
      expect(document.querySelector('[data-slot="tour-spotlight"]')).toBeNull()
      unmount()
      renderTour({ steps: [{ target: "[[invalido", title: "Inválido" }] })
      expect(dialog()).toHaveAccessibleName("Inválido")
      expect(dialog()).toHaveAttribute("data-align", "center")
    })
  })

  describe("spotlight", () => {
    it("outlines the target with padding and follows scroll and resize", () => {
      render(<Page />)
      const target = document.getElementById("novo") as HTMLElement
      const rect = mockRect(target, { x: 100, y: 200, width: 80, height: 30 })
      render(<Tour steps={steps} open />)
      const spot = document.querySelector('[data-slot="tour-spotlight"]') as HTMLElement
      expect(spot).toHaveAttribute("aria-hidden", "true")
      expect(spot).toHaveClass("pointer-events-none", "fixed")
      expect(spot.style.top).toBe("196px")
      expect(spot.style.left).toBe("96px")
      expect(spot.style.width).toBe("88px")
      expect(spot.style.height).toBe("38px")

      rect.mockImplementation(() => new DOMRect(100, 150, 80, 30))
      act(() => {
        window.dispatchEvent(new Event("scroll"))
      })
      expect(spot.style.top).toBe("146px")

      rect.mockImplementation(() => new DOMRect(60, 150, 120, 30))
      act(() => {
        window.dispatchEvent(new Event("resize"))
      })
      expect(spot.style.left).toBe("56px")
      expect(spot.style.width).toBe("128px")

      // Same rect again: no re-render needed, values stay.
      act(() => {
        window.dispatchEvent(new Event("resize"))
      })
      expect(spot.style.width).toBe("128px")
    })

    it("can be turned off", () => {
      renderTour({ spotlight: false })
      expect(document.querySelector('[data-slot="tour-spotlight"]')).toBeNull()
    })

    it("works where ResizeObserver is unavailable", () => {
      vi.stubGlobal("ResizeObserver", undefined)
      try {
        renderTour()
        expect(document.querySelector('[data-slot="tour-spotlight"]')).not.toBeNull()
      } finally {
        vi.unstubAllGlobals()
      }
    })

    it("stops listening when the tour closes", () => {
      const remove = vi.spyOn(window, "removeEventListener")
      const { rerender, onClose } = renderTour()
      rerender(
        <Page>
          <Tour steps={steps} open={false} onClose={onClose} />
        </Page>,
      )
      const removed = remove.mock.calls.map((c) => c[0])
      expect(removed).toContain("scroll")
      expect(removed).toContain("resize")
      expect(document.querySelector('[data-slot="tour-spotlight"]')).toBeNull()
    })
  })

  describe("labels", () => {
    it("ships pt-BR defaults", () => {
      expect(defaultTourLabels.previous).toBe("Voltar")
      expect(defaultTourLabels.next).toBe("Próximo")
      expect(defaultTourLabels.finish).toBe("Concluir")
      expect(defaultTourLabels.close).toBe("Fechar tour")
      expect(defaultTourLabels.progress(2, 5)).toBe("2 de 5")
    })

    it("overrides any label", async () => {
      renderTour({
        labels: {
          next: "Seguir",
          previous: "Antes",
          finish: "Pronto",
          close: "Sair do tour",
          progress: (c, t) => `${c}/${t}`,
        },
      })
      expect(screen.getByText("1/3")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Sair do tour" })).toBeInTheDocument()
      await userEvent.click(screen.getByRole("button", { name: "Seguir" }))
      expect(screen.getByRole("button", { name: "Antes" })).toBeInTheDocument()
      await userEvent.click(screen.getByRole("button", { name: "Seguir" }))
      expect(screen.getByRole("button", { name: "Pronto" })).toBeInTheDocument()
    })
  })
})
