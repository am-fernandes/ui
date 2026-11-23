import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CalendarDays, LayoutGrid, List } from "lucide-react"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { SegmentedControl, type SegmentedControlOption } from "./segmented-control"

const options: SegmentedControlOption[] = [
  { value: "dia", label: "Dia" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
]

// Radix selects the radio when focus lands on it *while* an arrow key is
// down (keydown → deferred focus → keyup), the order a real keyboard
// produces. Hold the key so the synthetic events keep that order.
async function pressArrow(key: "ArrowLeft" | "ArrowRight") {
  await userEvent.keyboard(`{${key}>}`)
  await new Promise((resolve) => setTimeout(resolve, 10))
  await userEvent.keyboard(`{/${key}}`)
}

describe("SegmentedControl", () => {
  it("is a labelled radio group with one radio per option", () => {
    render(<SegmentedControl label="Período" options={options} defaultValue="semana" />)
    const group = screen.getByRole("radiogroup", { name: "Período" })
    expect(group).toHaveAttribute("data-slot", "segmented-control")
    const radios = within(group).getAllByRole("radio")
    expect(radios.map((r) => r.textContent)).toEqual(["Dia", "Semana", "Mês"])
    expect(screen.getByRole("radio", { name: "Semana" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("radio", { name: "Dia" })).toHaveAttribute("aria-checked", "false")
  })

  it("selects on click and reports the value (uncontrolled)", async () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedControl
        label="Período"
        options={options}
        defaultValue="dia"
        onValueChange={onValueChange}
      />,
    )
    await userEvent.click(screen.getByRole("radio", { name: "Mês" }))
    expect(onValueChange).toHaveBeenCalledWith("mes")
    expect(screen.getByRole("radio", { name: "Mês" })).toHaveAttribute("data-state", "checked")
  })

  it("follows a controlled value", async () => {
    function Controlled() {
      const [value, setValue] = React.useState("dia")
      return (
        <>
          <SegmentedControl
            label="Período"
            options={options}
            value={value}
            onValueChange={setValue}
          />
          <output>{value}</output>
        </>
      )
    }
    render(<Controlled />)
    await userEvent.click(screen.getByRole("radio", { name: "Semana" }))
    expect(screen.getByRole("status")).toHaveTextContent("semana")
    expect(screen.getByRole("radio", { name: "Semana" })).toHaveAttribute("aria-checked", "true")
  })

  it("does not change when controlled and the parent ignores the change", async () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedControl
        label="Período"
        options={options}
        value="dia"
        onValueChange={onValueChange}
      />,
    )
    await userEvent.click(screen.getByRole("radio", { name: "Mês" }))
    expect(onValueChange).toHaveBeenCalledWith("mes")
    expect(screen.getByRole("radio", { name: "Dia" })).toHaveAttribute("aria-checked", "true")
  })

  it("is one Tab stop; arrows move, select and wrap around", async () => {
    const onValueChange = vi.fn()
    render(
      <>
        <SegmentedControl
          label="Período"
          options={options}
          defaultValue="dia"
          onValueChange={onValueChange}
        />
        <button type="button">depois</button>
      </>,
    )
    await userEvent.tab()
    expect(screen.getByRole("radio", { name: "Dia" })).toHaveFocus()
    await pressArrow("ArrowRight")
    expect(screen.getByRole("radio", { name: "Semana" })).toHaveFocus()
    expect(onValueChange).toHaveBeenLastCalledWith("semana")
    await pressArrow("ArrowLeft")
    await pressArrow("ArrowLeft")
    expect(screen.getByRole("radio", { name: "Mês" })).toHaveFocus()
    expect(onValueChange).toHaveBeenLastCalledWith("mes")
    await userEvent.tab()
    expect(screen.getByRole("button", { name: "depois" })).toHaveFocus()
  })

  // Controlled, the value only changes when the parent re-renders, so a second
  // selection of the same segment in the same tick is reported again: a
  // doubled fetch, analytics event or router.push.
  it("reports one change per arrow press when controlled, key held or tapped", async () => {
    const onValueChange = vi.fn()
    function Controlled() {
      const [value, setValue] = React.useState("dia")
      return (
        <SegmentedControl
          label="Período"
          options={options}
          value={value}
          onValueChange={(next) => {
            onValueChange(next)
            setValue(next)
          }}
        />
      )
    }
    render(<Controlled />)
    await userEvent.tab()

    await pressArrow("ArrowRight")
    expect(screen.getByRole("radio", { name: "Semana" })).toHaveAttribute("aria-checked", "true")
    expect(onValueChange.mock.calls).toEqual([["semana"]])

    // keydown and keyup in the same tick.
    await userEvent.keyboard("{ArrowRight}")
    expect(screen.getByRole("radio", { name: "Mês" })).toHaveAttribute("aria-checked", "true")
    expect(onValueChange.mock.calls).toEqual([["semana"], ["mes"]])
  })

  it("reports one change per arrow press even when the parent ignores it", async () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedControl
        label="Período"
        options={options}
        value="dia"
        onValueChange={onValueChange}
      />,
    )
    await userEvent.tab()
    await pressArrow("ArrowRight")
    expect(onValueChange.mock.calls).toEqual([["semana"]])
  })

  // The radio group pattern uses the four arrows: Right and Down go to the
  // next option, Left and Up to the previous one.
  it("moves and selects with the vertical arrows too", async () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedControl
        label="Período"
        options={options}
        defaultValue="dia"
        onValueChange={onValueChange}
      />,
    )
    await userEvent.tab()
    await userEvent.keyboard("{ArrowDown}")
    expect(screen.getByRole("radio", { name: "Semana" })).toHaveFocus()
    expect(screen.getByRole("radio", { name: "Semana" })).toHaveAttribute("aria-checked", "true")
    await userEvent.keyboard("{ArrowUp}")
    expect(screen.getByRole("radio", { name: "Dia" })).toHaveFocus()
    expect(onValueChange.mock.calls).toEqual([["semana"], ["dia"]])
  })

  it("selects even when the arrow key is released before focus moves", async () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedControl
        label="Período"
        options={options}
        defaultValue="dia"
        onValueChange={onValueChange}
      />,
    )
    await userEvent.tab()
    // keydown + keyup in the same tick: faster than any person, as on a busy page.
    await userEvent.keyboard("{ArrowRight}")
    expect(screen.getByRole("radio", { name: "Semana" })).toHaveFocus()
    expect(onValueChange).toHaveBeenCalledWith("semana")
    expect(screen.getByRole("radio", { name: "Semana" })).toHaveAttribute("aria-checked", "true")
  })

  it("does not select on focus that isn't arrow navigation", () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedControl
        label="Período"
        options={options}
        defaultValue="dia"
        onValueChange={onValueChange}
      />,
    )
    act(() => screen.getByRole("radio", { name: "Mês" }).focus())
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole("radio", { name: "Mês" })).toHaveAttribute("aria-checked", "false")
  })

  it("ignores non-arrow keys for selection", async () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedControl
        label="Período"
        options={options}
        defaultValue="dia"
        onValueChange={onValueChange}
      />,
    )
    await userEvent.tab()
    await userEvent.keyboard("{Home}")
    act(() => screen.getByRole("radio", { name: "Mês" }).focus())
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("skips and blocks disabled options", async () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedControl
        label="Período"
        options={[options[0]!, { ...options[1]!, disabled: true }, options[2]!]}
        defaultValue="dia"
        onValueChange={onValueChange}
      />,
    )
    const semana = screen.getByRole("radio", { name: "Semana" })
    expect(semana).toBeDisabled()
    await userEvent.click(semana)
    expect(onValueChange).not.toHaveBeenCalled()
    screen.getByRole("radio", { name: "Dia" }).focus()
    await pressArrow("ArrowRight")
    expect(screen.getByRole("radio", { name: "Mês" })).toHaveFocus()
  })

  it("disables the whole control", async () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedControl
        label="Período"
        options={options}
        defaultValue="dia"
        onValueChange={onValueChange}
        disabled
      />,
    )
    const group = screen.getByRole("radiogroup")
    // Dimmed once, on the track (the effective 50% is measured in the browser
    // by tests/e2e/primitives.spec.ts).
    expect(group).toHaveClass("opacity-50")
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeDisabled()
      expect(radio.className).not.toMatch(/opacity-50/)
    }
    await userEvent.click(screen.getByRole("radio", { name: "Mês" }))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("dims only the option that is disabled", () => {
    render(
      <SegmentedControl
        label="Período"
        options={[options[0]!, { ...options[1]!, disabled: true }, options[2]!]}
      />,
    )
    expect(screen.getByRole("radiogroup")).not.toHaveClass("opacity-50")
    expect(screen.getByRole("radio", { name: "Semana" })).toHaveClass("opacity-50")
    expect(screen.getByRole("radio", { name: "Dia" })).not.toHaveClass("opacity-50")
  })

  it("hugs its content by default and stretches with fill", () => {
    const { rerender } = render(<SegmentedControl label="P" options={options} />)
    expect(screen.getByRole("radiogroup")).toHaveClass("inline-flex")
    expect(screen.getByRole("radio", { name: "Dia" })).not.toHaveClass("flex-1")

    rerender(<SegmentedControl label="P" options={options} fill />)
    expect(screen.getByRole("radiogroup")).toHaveClass("flex", "w-full")
    for (const radio of screen.getAllByRole("radio")) expect(radio).toHaveClass("flex-1")
  })

  // The measured heights (32, 40 and 44px for the whole track) are asserted in
  // a real browser by tests/e2e/control-size.spec.ts.
  it("has the three shared control sizes, md by default", () => {
    const { rerender } = render(<SegmentedControl label="P" options={options} />)
    const group = () => screen.getByRole("radiogroup")
    const segment = () => screen.getByRole("radio", { name: "Dia" })
    expect(group()).toHaveClass("h-control-md")
    expect(segment()).toHaveClass("px-3", "text-sm")
    // The track gives the height; a segment has no vertical padding of its own.
    expect(segment().className).not.toMatch(/(^|\s)py-/)

    rerender(<SegmentedControl label="P" options={options} size="sm" />)
    expect(group()).toHaveClass("h-control-sm")
    expect(segment()).toHaveClass("px-2.5", "text-xs")

    rerender(<SegmentedControl label="P" options={options} size="lg" />)
    expect(group()).toHaveClass("h-control-lg")
    expect(segment()).toHaveClass("px-4", "text-sm")
  })

  it("renders icons next to labels", () => {
    const { container } = render(
      <SegmentedControl
        label="Visualização"
        options={[
          { value: "lista", label: "Lista", icon: List },
          { value: "grade", label: "Grade", icon: LayoutGrid },
        ]}
      />,
    )
    expect(container.querySelector("svg.lucide-list")).not.toBeNull()
    expect(screen.getByRole("radio", { name: "Lista" })).toHaveTextContent("Lista")
  })

  it("shows only icons with iconOnly, keeping names and tooltips", async () => {
    const { container } = render(
      <SegmentedControl
        label="Visualização"
        iconOnly
        size="sm"
        options={[
          { value: "lista", label: "Lista", icon: List },
          { value: "agenda", label: "Agenda", icon: CalendarDays },
        ]}
        defaultValue="lista"
      />,
    )
    const lista = screen.getByRole("radio", { name: "Lista" })
    expect(lista).toHaveTextContent("")
    expect(lista).toHaveClass("px-1.5")
    expect(container.querySelector("svg.lucide-calendar-days")).not.toBeNull()
    await userEvent.tab()
    expect(lista).toHaveFocus()
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Lista")
  })

  it("uses the md icon-only padding", () => {
    render(
      <SegmentedControl
        label="Visualização"
        iconOnly
        options={[{ value: "lista", label: "Lista", icon: List }]}
      />,
    )
    expect(screen.getByRole("radio", { name: "Lista" })).toHaveClass("px-2")
  })

  it("submits its value with a form through `name`", async () => {
    let submitted: FormData | null = null
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submitted = new FormData(e.currentTarget)
        }}
      >
        <SegmentedControl label="Tipo" name="tipo" options={options} defaultValue="mes" required />
        <button type="submit">Enviar</button>
      </form>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }))
    expect((submitted as FormData | null)?.get("tipo")).toBe("mes")
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-required", "true")
  })

  it("forwards the ref and merges className", () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<SegmentedControl ref={ref} label="P" options={options} className="mt-4" />)
    expect(ref.current).toBe(screen.getByRole("radiogroup"))
    expect(ref.current).toHaveClass("mt-4", "bg-muted")
  })

  describe("form reset", () => {
    it("goes back to defaultValue, on screen and in the FormData", async () => {
      const user = userEvent.setup()
      render(
        <form data-testid="form">
          <SegmentedControl label="Período" name="periodo" options={options} defaultValue="dia" />
        </form>,
      )
      const form = screen.getByTestId("form") as HTMLFormElement
      await user.click(screen.getByRole("radio", { name: "Semana" }))
      expect(new FormData(form).get("periodo")).toBe("semana")

      act(() => form.reset())
      await waitFor(() => expect(screen.getByRole("radio", { name: "Dia" })).toBeChecked())
      expect(new FormData(form).get("periodo")).toBe("dia")
    })
  })

  // The API was closed: no id, aria-*, onBlur or data-*; the label was never
  // drawn and there was no description or error, so a form drew its own label
  // by hand with aria-hidden.
  describe("as a form field", () => {
    it("passes id, data-*, aria-* and handlers to the group", async () => {
      const user = userEvent.setup()
      const onBlur = vi.fn()
      render(
        <>
          <SegmentedControl
            label="Período"
            options={options}
            defaultValue="dia"
            id="periodo"
            data-testid="periodo"
            aria-describedby="dica"
            onBlur={onBlur}
          />
          <p id="dica">Afeta o gráfico.</p>
          <button type="button">depois</button>
        </>,
      )
      const group = screen.getByRole("radiogroup", { name: "Período" })
      expect(group).toHaveAttribute("id", "periodo")
      expect(group).toHaveAttribute("data-testid", "periodo")
      expect(group).toHaveAccessibleDescription("Afeta o gráfico.")
      await user.click(screen.getByRole("radio", { name: "Semana" }))
      await user.click(screen.getByRole("button", { name: "depois" }))
      expect(onBlur).toHaveBeenCalled()
    })

    it("keeps the label for screen readers only by default", () => {
      render(<SegmentedControl label="Visualização" options={options} />)
      expect(screen.getByRole("radiogroup", { name: "Visualização" })).toBeInTheDocument()
      expect(screen.queryByText("Visualização")).not.toBeInTheDocument()
    })

    it("draws the label with labelPosition='up' and is named by it", () => {
      render(<SegmentedControl label="Tipo de cliente" labelPosition="up" options={options} />)
      const label = screen.getByText("Tipo de cliente")
      const group = screen.getByRole("radiogroup", { name: "Tipo de cliente" })
      expect(group).toHaveAttribute("aria-labelledby", label.id)
      expect(group).not.toHaveAttribute("aria-label")
    })

    it("draws a description and an error, both describing the group", () => {
      render(
        <SegmentedControl
          label="Período"
          options={options}
          description="Afeta o gráfico."
          error="Escolha um período."
          aria-describedby="extra"
        />,
      )
      const group = screen.getByRole("radiogroup", { name: "Período" })
      expect(group).toHaveAccessibleDescription(/Afeta o gráfico\. Escolha um período\./)
      expect(group.getAttribute("aria-describedby")?.split(" ")).toContain("extra")
      expect(group).toHaveAttribute("aria-invalid", "true")
      expect(screen.getByRole("alert")).toHaveTextContent("Escolha um período.")
    })
  })
})
