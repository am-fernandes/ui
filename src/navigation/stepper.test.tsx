import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Stepper, type StepperProps, type StepperStep, defaultStepperLabels } from "./stepper"

const steps: StepperStep[] = [
  { label: "Dados pessoais" },
  { label: "Endereço", description: "Onde o cliente mora" },
  { label: "Documentos", optional: true },
  { label: "Revisão" },
]

function renderStepper(props: Partial<StepperProps> = {}) {
  return render(<Stepper steps={steps} activeStep={1} {...props} />)
}

const list = () => screen.getByRole("list", { name: "Progresso" })
const items = () => within(list()).getAllByRole("listitem")
const indicator = (li: HTMLElement) =>
  li.querySelector('[data-slot="stepper-indicator"]') as HTMLElement

describe("Stepper", () => {
  describe("structure", () => {
    it("renders an ordered list labelled Progresso, one item per step", () => {
      renderStepper()
      expect(list().tagName).toBe("OL")
      expect(items()).toHaveLength(4)
    })

    it("derives each step state from activeStep", () => {
      renderStepper()
      expect(items().map((li) => li.dataset.state)).toEqual([
        "completed",
        "current",
        "upcoming",
        "upcoming",
      ])
      expect(items()[1]).toHaveAttribute("aria-current", "step")
      expect(items()[0]).not.toHaveAttribute("aria-current")
    })

    it("tells screen readers what is done and what is current", () => {
      renderStepper()
      expect(items()[0]).toHaveTextContent("Dados pessoais, concluída")
      expect(items()[1]).toHaveTextContent("Endereço, etapa atual")
      expect(items()[2]).not.toHaveTextContent("concluída")
    })

    it("shows a check on completed steps and numbers on the others", () => {
      renderStepper()
      const [done, current, next] = items()
      expect(indicator(done!).querySelector("svg.lucide-check")).not.toBeNull()
      expect(indicator(done!)).toHaveClass("bg-primary", "text-primary-foreground")
      expect(indicator(current!)).toHaveTextContent("2")
      expect(indicator(current!)).toHaveClass("border-2", "border-primary")
      expect(indicator(next!)).toHaveTextContent("3")
      expect(indicator(next!)).toHaveClass("text-muted-foreground")
      expect(indicator(current!)).toHaveAttribute("aria-hidden", "true")
    })

    it("renders description and the optional mark", () => {
      renderStepper()
      expect(within(items()[1]!).getByText("Onde o cliente mora")).toBeInTheDocument()
      expect(within(items()[2]!).getByText("Opcional")).toBeInTheDocument()
    })

    it("marks error and warning steps", () => {
      renderStepper({
        steps: [{ label: "A", status: "error" }, { label: "B", status: "warning" }, { label: "C" }],
        activeStep: 1,
      })
      const [error, warning] = items()
      expect(error).toHaveTextContent("A, concluída, com erro")
      expect(warning).toHaveTextContent("B, etapa atual, com alerta")
      expect(indicator(error!).querySelector("svg.lucide-circle-alert")).not.toBeNull()
      expect(indicator(error!)).toHaveClass("bg-destructive", "text-destructive-foreground")
      expect(indicator(error!)).toHaveAttribute("data-state", "error")
      expect(indicator(warning!).querySelector("svg.lucide-triangle-alert")).not.toBeNull()
      expect(indicator(warning!)).toHaveClass("bg-warning", "text-warning-foreground")
    })

    it("marks every step completed when activeStep equals the number of steps", () => {
      renderStepper({ activeStep: 4 })
      expect(items().every((li) => li.dataset.state === "completed")).toBe(true)
      // Visible "·" is hidden from screen readers, which get ": " instead.
      expect(screen.getByRole("group", { name: "Progresso" })).toHaveTextContent(
        /^Etapa 4 de 4 · : Revisão, concluída$/,
      )
    })

    it("dims disabled steps", () => {
      renderStepper({ steps: [{ label: "A" }, { label: "B", disabled: true }] })
      expect(within(items()[1]!).getByText("B").closest("div")).toHaveClass("opacity-50")
      expect(within(items()[0]!).getByText("A").closest("div")).not.toHaveClass("opacity-50")
    })

    it("merges className", () => {
      const { container } = renderStepper({ className: "mt-8" })
      expect(container.querySelector('[data-slot="stepper"]')).toHaveClass("mt-8", "@container")
    })
  })

  describe("horizontal", () => {
    it("draws a connector into every step after the first, filled once reached", () => {
      renderStepper({ activeStep: 2 })
      const connectors = items().map((li) => li.querySelector('[data-slot="stepper-connector"]'))
      expect(connectors[0]).toBeNull()
      expect(connectors[1]).toHaveClass("bg-primary")
      expect(connectors[2]).toHaveClass("bg-primary")
      expect(connectors[3]).toHaveClass("bg-border")
    })

    it("collapses to a compact summary on narrow containers", () => {
      const { container } = renderStepper()
      expect(list()).toHaveClass("hidden", "@lg:flex")
      const compact = container.querySelector('[data-slot="stepper-compact"]') as HTMLElement
      expect(compact).toHaveClass("@lg:hidden")
      expect(compact).toHaveTextContent(
        /^Etapa 2 de 4 · : Endereço, etapa atualOnde o cliente mora$/,
      )
      // The description stays visible under the summary.
      expect(within(compact).getByText("Onde o cliente mora")).not.toHaveClass("sr-only")
      const separator = within(compact).getByText("·")
      expect(separator).toHaveAttribute("aria-hidden", "true")
      const segments = compact.querySelectorAll('[data-slot="stepper-track-segment"]')
      expect([...segments].map((s) => s.classList.contains("bg-primary"))).toEqual([
        true,
        true,
        false,
        false,
      ])
    })

    it.each([
      [1, "flex", "hidden"],
      [2, "@xs:flex", "@xs:hidden"],
      [3, "@sm:flex", "@sm:hidden"],
      [5, "@2xl:flex", "@2xl:hidden"],
      [6, "@3xl:flex", "@3xl:hidden"],
      [7, "@4xl:flex", "@4xl:hidden"],
      [8, "@5xl:flex", "@5xl:hidden"],
      [9, "@6xl:flex", "@6xl:hidden"],
      [10, "@7xl:flex", "@7xl:hidden"],
      [12, "@min-[96rem]:flex", "@min-[96rem]:hidden"],
      [20, "@min-[96rem]:flex", "@min-[96rem]:hidden"],
    ])("collapse threshold grows with %i steps (~8rem each)", (count, listClass, compactClass) => {
      const many = Array.from({ length: count }, (_, i) => ({ label: `Etapa ${i + 1}` }))
      const { container } = render(<Stepper steps={many} activeStep={0} />)
      expect(list()).toHaveClass(listClass)
      expect(container.querySelector('[data-slot="stepper-compact"]')).toHaveClass(compactClass)
    })

    it("shows the current step's status with an icon and text, not colour alone", () => {
      const { container } = renderStepper({
        activeStep: 1,
        steps: [
          { label: "Dados" },
          { label: "Endereço", status: "error", description: "CEP inválido" },
          { label: "Documentos", status: "warning", description: "RG vencido" },
        ],
      })
      const compact = container.querySelector('[data-slot="stepper-compact"]') as HTMLElement
      const status = compact.querySelector('[data-slot="stepper-compact-status"]') as HTMLElement
      expect(status).toHaveAttribute("data-status", "error")
      expect(status.querySelector("svg")).not.toBeNull()
      // Visible text, not only for screen readers.
      expect(within(status).getByText("com erro")).not.toHaveClass("sr-only")
      expect(within(status).getByText("CEP inválido")).toBeInTheDocument()
      // Said once: not repeated in the hidden status of the summary line.
      expect(compact).toHaveTextContent(
        /^Etapa 2 de 3 · : Endereço, etapa atualcom erro: CEP inválido$/,
      )
    })

    it("shows a warning the same way", () => {
      const { container } = renderStepper({
        activeStep: 0,
        steps: [
          { label: "Documentos", status: "warning", description: "RG vencido" },
          { label: "B" },
        ],
      })
      const status = container.querySelector('[data-slot="stepper-compact-status"]') as HTMLElement
      expect(status).toHaveAttribute("data-status", "warning")
      expect(within(status).getByText("com alerta")).toBeInTheDocument()
      expect(within(status).getByText("RG vencido")).toBeInTheDocument()
    })

    it("gives a cut label its full text as a title, only when it is cut", () => {
      renderStepper()
      const label = within(items()[1]!).getByText("Endereço", { exact: false })
      // jsdom does no layout: say the text overflows its box.
      Object.defineProperty(label, "scrollWidth", { configurable: true, value: 200 })
      Object.defineProperty(label, "clientWidth", { configurable: true, value: 120 })
      fireEvent.pointerEnter(label)
      expect(label).toHaveAttribute("title", "Endereço")
      Object.defineProperty(label, "scrollWidth", { configurable: true, value: 120 })
      fireEvent.pointerEnter(label)
      expect(label).not.toHaveAttribute("title")
    })

    it("colours error and warning segments in the compact track", () => {
      const { container } = renderStepper({
        steps: [{ label: "A", status: "error" }, { label: "B", status: "warning" }, { label: "C" }],
        activeStep: 0,
      })
      const segments = container.querySelectorAll('[data-slot="stepper-track-segment"]')
      expect(segments[0]).toHaveClass("bg-destructive")
      expect(segments[1]).toHaveClass("bg-warning")
      expect(segments[2]).toHaveClass("bg-muted")
    })

    it("renders only the list when there are no steps", () => {
      const { container } = render(<Stepper steps={[]} activeStep={0} />)
      expect(container.querySelector('[data-slot="stepper-compact"]')).toBeNull()
      expect(list()).toBeEmptyDOMElement()
    })
  })

  describe("vertical", () => {
    it("stacks the steps, links them and shows the current step's content", () => {
      const { container } = renderStepper({
        orientation: "vertical",
        activeStep: 1,
        steps: [
          { label: "A", content: <p>Conteúdo A</p> },
          { label: "B", content: <p>Conteúdo B</p> },
          { label: "C" },
        ],
      })
      expect(container.querySelector('[data-slot="stepper"]')).toHaveAttribute(
        "data-orientation",
        "vertical",
      )
      expect(screen.getByText("Conteúdo B")).toBeInTheDocument()
      expect(screen.queryByText("Conteúdo A")).not.toBeInTheDocument()
      const connectors = items().map((li) => li.querySelector('[data-slot="stepper-connector"]'))
      expect(connectors[0]).toHaveClass("bg-primary")
      expect(connectors[1]).toHaveClass("bg-border")
      expect(connectors[2]).toBeNull()
      expect(container.querySelector('[data-slot="stepper-compact"]')).toBeNull()
    })

    it("keeps the earlier steps' content with keepMounted", async () => {
      const wizard = (activeStep: number) => (
        <Stepper
          orientation="vertical"
          keepMounted
          activeStep={activeStep}
          steps={[
            { label: "Dados", content: <input aria-label="Nome" /> },
            { label: "Endereço", content: <input aria-label="CEP" /> },
          ]}
        />
      )
      const { rerender } = render(wizard(0))
      await userEvent.type(screen.getByRole("textbox", { name: "Nome" }), "Maria")
      rerender(wizard(1))
      expect(screen.getByLabelText("Nome")).not.toBeVisible()
      expect(screen.getByRole("textbox", { name: "CEP" })).toBeVisible()
      rerender(wizard(0))
      expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue("Maria")
    })

    it("follows each step by its id when steps are added", async () => {
      const wizard = (withExtra: boolean) => (
        <Stepper
          orientation="vertical"
          activeStep={withExtra ? 1 : 0}
          steps={[
            ...(withExtra ? [{ id: "conjuge", label: "Cônjuge" }] : []),
            { id: "dados", label: "Dados", content: <input aria-label="Nome" /> },
          ]}
        />
      )
      const { rerender } = render(wizard(false))
      await userEvent.type(screen.getByRole("textbox", { name: "Nome" }), "Maria")
      // A step is inserted before it: the same step, the same field.
      rerender(wizard(true))
      expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue("Maria")
    })

    it("has no content block when the current step has none", () => {
      const { container } = renderStepper({ orientation: "vertical", activeStep: 0 })
      expect(container.querySelector('[data-slot="stepper-content"]')).toBeNull()
    })
  })

  describe("clickable steps", () => {
    it("turns steps into buttons that report their index", async () => {
      const onStepClick = vi.fn()
      renderStepper({ onStepClick })
      const buttons = within(list()).getAllByRole("button")
      expect(buttons).toHaveLength(4)
      await userEvent.click(buttons[3]!)
      expect(onStepClick).toHaveBeenCalledWith(3)
      expect(buttons[1]).toHaveAttribute("aria-current", "step")
      expect(items()[1]).not.toHaveAttribute("aria-current")
    })

    it("works from the keyboard", async () => {
      const onStepClick = vi.fn()
      renderStepper({ onStepClick })
      within(list()).getAllByRole("button")[0]!.focus()
      await userEvent.keyboard("{Enter}")
      expect(onStepClick).toHaveBeenCalledWith(0)
      await userEvent.tab()
      await userEvent.keyboard(" ")
      expect(onStepClick).toHaveBeenLastCalledWith(1)
    })

    it("disables disabled steps", async () => {
      const onStepClick = vi.fn()
      renderStepper({
        onStepClick,
        steps: [{ label: "A" }, { label: "B", disabled: true }],
        activeStep: 0,
      })
      const disabled = within(list()).getByRole("button", { name: /B/ })
      expect(disabled).toBeDisabled()
      await userEvent.click(disabled)
      expect(onStepClick).not.toHaveBeenCalled()
    })

    it("works in vertical orientation", async () => {
      const onStepClick = vi.fn()
      renderStepper({ onStepClick, orientation: "vertical" })
      await userEvent.click(within(list()).getByRole("button", { name: /Revisão/ }))
      expect(onStepClick).toHaveBeenCalledWith(3)
    })

    it("adds previous/next controls to the compact summary, skipping disabled steps", async () => {
      const onStepClick = vi.fn()
      renderStepper({
        onStepClick,
        activeStep: 1,
        steps: [{ label: "A" }, { label: "B" }, { label: "C", disabled: true }, { label: "D" }],
      })
      const compact = screen.getByRole("group", { name: "Progresso" })
      await userEvent.click(within(compact).getByRole("button", { name: "Etapa anterior" }))
      expect(onStepClick).toHaveBeenLastCalledWith(0)
      await userEvent.click(within(compact).getByRole("button", { name: "Próxima etapa" }))
      expect(onStepClick).toHaveBeenLastCalledWith(3)
    })

    it("disables the compact controls at the ends", () => {
      const { rerender } = render(<Stepper steps={steps} activeStep={0} onStepClick={() => {}} />)
      const compact = () => screen.getByRole("group", { name: "Progresso" })
      expect(within(compact()).getByRole("button", { name: "Etapa anterior" })).toHaveAttribute(
        "aria-disabled",
        "true",
      )
      rerender(<Stepper steps={steps} activeStep={3} onStepClick={() => {}} />)
      expect(within(compact()).getByRole("button", { name: "Próxima etapa" })).toHaveAttribute(
        "aria-disabled",
        "true",
      )
    })

    describe("isStepClickable", () => {
      // The usual wizard: go back to a finished step, never skip ahead.
      const backOnly = (activeStep: number) => (index: number) => index < activeStep

      it("makes only the chosen steps buttons, without dimming the others", async () => {
        const onStepClick = vi.fn()
        renderStepper({ onStepClick, activeStep: 2, isStepClickable: backOnly(2) })
        const buttons = within(list()).getAllByRole("button")
        expect(buttons.map((b) => b.textContent)).toEqual([
          expect.stringContaining("Dados pessoais"),
          expect.stringContaining("Endereço"),
        ])
        await userEvent.click(buttons[0]!)
        expect(onStepClick).toHaveBeenCalledWith(0)
        // The current and future steps are plain, at full opacity.
        for (const li of items().slice(2)) {
          expect(li.querySelector("button")).toBeNull()
          expect(li.querySelector(".opacity-50")).toBeNull()
        }
        expect(items()[2]).toHaveAttribute("aria-current", "step")
      })

      it("lets the compact arrows go back but not ahead", async () => {
        const onStepClick = vi.fn()
        renderStepper({ onStepClick, activeStep: 2, isStepClickable: backOnly(2) })
        const compact = screen.getByRole("group", { name: "Progresso" })
        expect(within(compact).getByRole("button", { name: "Próxima etapa" })).toHaveAttribute(
          "aria-disabled",
          "true",
        )
        await userEvent.click(within(compact).getByRole("button", { name: "Etapa anterior" }))
        expect(onStepClick).toHaveBeenCalledWith(1)
      })
    })

    it("has no compact controls without onStepClick", () => {
      renderStepper()
      expect(
        within(screen.getByRole("group", { name: "Progresso" })).queryByRole("button"),
      ).not.toBeInTheDocument()
    })
  })

  describe("labels", () => {
    it("ships pt-BR defaults", () => {
      expect(defaultStepperLabels.label).toBe("Progresso")
      expect(defaultStepperLabels.stepOf(2, 5)).toBe("Etapa 2 de 5")
      expect(defaultStepperLabels.optional).toBe("Opcional")
    })

    it("overrides any label", () => {
      renderStepper({
        labels: {
          label: "Cadastro",
          completed: "feito",
          current: "agora",
          stepOf: (n, t) => `${n}/${t}`,
        },
      })
      const ol = screen.getByRole("list", { name: "Cadastro" })
      expect(within(ol).getAllByRole("listitem")[0]).toHaveTextContent("Dados pessoais, feito")
      expect(screen.getByRole("group", { name: "Cadastro" })).toHaveTextContent(
        /^2\/4 · : Endereço, agoraOnde o cliente mora$/,
      )
    })
  })
})
