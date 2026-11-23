import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ZapIcon } from "lucide-react"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { RadioGroup } from "./radio-group"

const VALUES = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team", disabled: true },
]

describe("RadioGroup", () => {
  it("renders one radio per value", () => {
    render(<RadioGroup label="Plano" values={VALUES} />)
    expect(screen.getAllByRole("radio")).toHaveLength(3)
  })

  it("names the group after its label", () => {
    render(<RadioGroup label="Plano" values={VALUES} />)
    const group = screen.getByRole("radiogroup", { name: "Plano" })
    expect(group).toHaveAttribute("data-slot", "radio-group")
    // The name of a group is tied by aria-labelledby: a <label for> cannot
    // point at a div, so the text is not a <label> at all.
    const label = screen.getByText("Plano")
    expect(group).toHaveAttribute("aria-labelledby", label.id)
    expect(label.tagName).toBe("SPAN")
    expect(label).not.toHaveAttribute("for")
  })

  it("keeps a rich label as the name of the group", () => {
    render(
      <RadioGroup
        label={
          <>
            Plano <em>anual</em>
          </>
        }
        values={VALUES}
      />,
    )
    expect(screen.getByRole("radiogroup", { name: "Plano anual" })).toBeInTheDocument()
  })

  it("is named by the consumer's aria-label when there is no label", () => {
    render(<RadioGroup aria-label="Plano de assinatura" values={VALUES} />)
    const group = screen.getByRole("radiogroup", { name: "Plano de assinatura" })
    expect(group).not.toHaveAttribute("aria-labelledby")
  })

  it("lets the consumer point aria-labelledby somewhere else", () => {
    render(
      <>
        <h2 id="titulo">Escolha o plano</h2>
        <RadioGroup label="Plano" aria-labelledby="titulo" values={VALUES} />
      </>,
    )
    expect(screen.getByRole("radiogroup", { name: "Escolha o plano" })).toBeInTheDocument()
  })

  describe("required", () => {
    it("says so on the group, not only with the asterisk", () => {
      const { rerender } = render(<RadioGroup label="Plano" values={VALUES} />)
      expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-required", "false")
      rerender(<RadioGroup label="Plano" values={VALUES} required />)
      expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-required", "true")
    })

    it("makes the form invalid until one option is chosen", async () => {
      const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault())
      const { container } = render(
        <form onSubmit={onSubmit}>
          <RadioGroup label="Plano" name="plano" values={VALUES} required />
          <button type="submit">Enviar</button>
        </form>,
      )
      const form = container.querySelector("form") as HTMLFormElement
      expect(form.checkValidity()).toBe(false)

      await userEvent.click(screen.getByRole("button", { name: "Enviar" }))
      expect(onSubmit).not.toHaveBeenCalled()

      await userEvent.click(screen.getByRole("radio", { name: "Pro" }))
      expect(form.checkValidity()).toBe(true)
      await userEvent.click(screen.getByRole("button", { name: "Enviar" }))
      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(new FormData(form).get("plano")).toBe("pro")
    })

    it("does not block the form when it is not required", () => {
      const { container } = render(
        <form>
          <RadioGroup label="Plano" name="plano" values={VALUES} />
        </form>,
      )
      expect((container.querySelector("form") as HTMLFormElement).checkValidity()).toBe(true)
    })
  })

  it("renders the group label and error", () => {
    render(<RadioGroup label="Plano" error="Escolha um" values={VALUES} />)
    expect(screen.getByText("Plano")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("Escolha um")
  })

  it("selects on click and fires onValueChange", async () => {
    const onChange = vi.fn()
    render(<RadioGroup label="Plano" values={VALUES} onValueChange={onChange} />)
    await userEvent.click(screen.getByRole("radio", { name: "Pro" }))
    expect(onChange).toHaveBeenCalledWith("pro")
  })

  it("disables individual items via item.disabled", () => {
    render(<RadioGroup label="Plano" values={VALUES} />)
    expect(screen.getByRole("radio", { name: "Team" })).toBeDisabled()
  })

  it("renders item icon when provided", () => {
    const { container } = render(
      <RadioGroup label="Plano" values={[{ value: "f", label: "Free", icon: ZapIcon }]} />,
    )
    expect(container.querySelector("svg")).toBeInTheDocument()
  })

  it("supports horizontal orientation", () => {
    const { container } = render(<RadioGroup label="X" values={VALUES} orientation="horizontal" />)
    expect(container.querySelector('[data-slot="radio-group"]')).toHaveAttribute(
      "data-orientation",
      "horizontal",
    )
  })

  // Radix RadioGroup does not listen to a form reset: the chosen option
  // stayed chosen, on screen and in the FormData.
  describe("form reset", () => {
    it("goes back to defaultValue, on screen and in the FormData", async () => {
      const user = userEvent.setup()
      render(
        <form data-testid="form">
          <RadioGroup label="Plano" name="plano" values={VALUES} defaultValue="free" />
        </form>,
      )
      const form = screen.getByTestId("form") as HTMLFormElement
      await user.click(screen.getByRole("radio", { name: "Pro" }))
      expect(new FormData(form).get("plano")).toBe("pro")

      act(() => form.reset())
      await waitFor(() => expect(screen.getByRole("radio", { name: "Free" })).toBeChecked())
      expect(screen.getByRole("radio", { name: "Pro" })).not.toBeChecked()
      expect(new FormData(form).get("plano")).toBe("free")
    })

    it("goes back to no choice when there was none", async () => {
      const user = userEvent.setup()
      render(
        <form data-testid="form">
          <RadioGroup label="Plano" name="plano" values={VALUES} />
        </form>,
      )
      const form = screen.getByTestId("form") as HTMLFormElement
      await user.click(screen.getByRole("radio", { name: "Pro" }))
      act(() => form.reset())
      await waitFor(() => expect(screen.getByRole("radio", { name: "Pro" })).not.toBeChecked())
      expect(new FormData(form).get("plano")).toBeNull()
    })
  })

  // `values` here, `options` in SegmentedControl: the same list under two names.
  describe("options", () => {
    it("takes the choices from options", () => {
      render(<RadioGroup label="Plano" options={VALUES} />)
      expect(screen.getAllByRole("radio")).toHaveLength(3)
      expect(screen.getByRole("radio", { name: "Pro" })).toBeInTheDocument()
    })

    it("still takes them from the deprecated values", () => {
      render(<RadioGroup label="Plano" values={VALUES} />)
      expect(screen.getAllByRole("radio")).toHaveLength(3)
    })

    it("prefers options when both are given", () => {
      render(<RadioGroup label="Plano" options={VALUES.slice(0, 1)} values={VALUES} />)
      expect(screen.getAllByRole("radio")).toHaveLength(1)
    })
  })

  // With an error only the text below was red; the radios looked fine. The
  // colour is measured in tests/e2e/primitives.spec.ts.
  it("marks every radio as part of the error", () => {
    render(<RadioGroup label="Plano" options={VALUES} error="Escolha um plano." />)
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toHaveAttribute("data-invalid")
    }
  })

  describe("keyboard and ref", () => {
    it("is one Tab stop, and the arrows move and select", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(
        <>
          <RadioGroup
            label="Plano"
            options={VALUES}
            defaultValue="free"
            onValueChange={onValueChange}
          />
          <button type="button">depois</button>
        </>,
      )
      await user.tab()
      expect(screen.getByRole("radio", { name: "Free" })).toHaveFocus()
      // Held down, as a real key press is while Radix moves the focus.
      await user.keyboard("{ArrowDown>}")
      await waitFor(() => expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked())
      await user.keyboard("{/ArrowDown}")
      expect(screen.getByRole("radio", { name: "Pro" })).toHaveFocus()
      expect(onValueChange).toHaveBeenLastCalledWith("pro")
      // Team is disabled: the arrows skip it and loop back.
      await user.keyboard("{ArrowDown>}")
      await waitFor(() => expect(screen.getByRole("radio", { name: "Free" })).toHaveFocus())
      await user.keyboard("{/ArrowDown}")
      await user.tab()
      expect(screen.getByRole("button", { name: "depois" })).toHaveFocus()
    })

    it("forwards the ref to the group", () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<RadioGroup label="Plano" options={VALUES} ref={ref} />)
      expect(ref.current).toBe(screen.getByRole("radiogroup"))
    })

    it("is described by its description, its error and the consumer's ids", () => {
      render(
        <>
          <RadioGroup
            label="Plano"
            options={VALUES}
            description="Pode mudar depois."
            error="Escolha um plano."
            aria-describedby="extra"
          />
          <p id="extra">Veja os preços.</p>
        </>,
      )
      expect(screen.getByRole("radiogroup")).toHaveAccessibleDescription(
        "Pode mudar depois. Escolha um plano. Veja os preços.",
      )
    })
  })
})
