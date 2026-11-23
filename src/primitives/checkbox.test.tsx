import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { Checkbox } from "./checkbox"

describe("Checkbox", () => {
  it("renders the label associated with the checkbox", () => {
    render(<Checkbox label="Aceito" />)
    const box = screen.getByRole("checkbox", { name: "Aceito" })
    expect(box).toBeInTheDocument()
  })

  it("renders description", () => {
    render(<Checkbox label="Aceito" description="Você pode revogar." />)
    expect(screen.getByText("Você pode revogar.")).toBeInTheDocument()
  })

  it("renders error with role=alert", () => {
    render(<Checkbox label="X" error="Obrigatório" />)
    expect(screen.getByRole("alert")).toHaveTextContent("Obrigatório")
  })

  it("toggles on label click (implicit Radix label binding)", async () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox label="Aceito" onCheckedChange={onCheckedChange} />)
    await userEvent.click(screen.getByText("Aceito"))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it("respects disabled", () => {
    render(<Checkbox label="X" disabled />)
    expect(screen.getByRole("checkbox", { name: "X" })).toBeDisabled()
  })

  it("supports rich ReactNode label", () => {
    render(
      <Checkbox
        label={
          <>
            Aceito os <a href="/t">termos</a>
          </>
        }
      />,
    )
    expect(screen.getByRole("link", { name: "termos" })).toBeInTheDocument()
  })

  it("exposes the mixed state and shows a dash instead of a check", () => {
    const { container } = render(<Checkbox label="Todas" checked="indeterminate" />)
    const box = screen.getByRole("checkbox", { name: "Todas" })
    expect(box).toHaveAttribute("aria-checked", "mixed")
    expect(box).toHaveAttribute("data-state", "indeterminate")
    // os dois ícones existem; o CSS mostra o traço e esconde o check
    const icons = container.querySelectorAll("[data-slot=checkbox-indicator] svg")
    expect(icons).toHaveLength(2)
    expect(icons[0]).toHaveClass("group-data-[state=indeterminate]/indicator:hidden")
    expect(icons[1]).toHaveClass("group-data-[state=indeterminate]/indicator:block")
  })

  it("accepts the mixed state as the uncontrolled default", () => {
    render(<Checkbox label="Todas" defaultChecked="indeterminate" />)
    expect(screen.getByRole("checkbox", { name: "Todas" })).toHaveAttribute("aria-checked", "mixed")
  })

  it("always reports a boolean: a click on the mixed state checks the box", async () => {
    const onCheckedChange = vi.fn()
    render(
      <Checkbox label="Todas" defaultChecked="indeterminate" onCheckedChange={onCheckedChange} />,
    )
    await userEvent.click(screen.getByRole("checkbox", { name: "Todas" }))
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    await userEvent.click(screen.getByRole("checkbox", { name: "Todas" }))
    expect(onCheckedChange).toHaveBeenLastCalledWith(false)
  })

  // With no label the description was dropped, and aria-describedby pointed at
  // an id that was not in the page.
  it("shows the description and describes the box with it when there is no label", () => {
    render(<Checkbox aria-label="Selecionar linha" description="Proposta 1042" />)
    const box = screen.getByRole("checkbox", { name: "Selecionar linha" })
    expect(screen.getByText("Proposta 1042")).toBeInTheDocument()
    expect(box).toHaveAccessibleDescription("Proposta 1042")
  })

  // The minimum of CONTRIBUTING (step 6) for a control: keyboard, ref,
  // required, aria-describedby and the form.
  describe("as a form control", () => {
    it("toggles with Space from the keyboard", async () => {
      const user = userEvent.setup()
      render(<Checkbox label="Aceito" />)
      await user.tab()
      const box = screen.getByRole("checkbox", { name: "Aceito" })
      expect(box).toHaveFocus()
      await user.keyboard(" ")
      expect(box).toHaveAttribute("aria-checked", "true")
      await user.keyboard(" ")
      expect(box).toHaveAttribute("aria-checked", "false")
    })

    it("forwards the ref to the box", () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Checkbox label="Aceito" ref={ref} />)
      expect(ref.current).toBe(screen.getByRole("checkbox"))
    })

    it("is required on the control and blocks the form until checked", async () => {
      const user = userEvent.setup()
      render(
        <form data-testid="form">
          <Checkbox label="Aceito os termos" name="termos" required />
        </form>,
      )
      const box = screen.getByRole("checkbox", { name: "Aceito os termos" })
      expect(box).toHaveAttribute("aria-required", "true")
      const form = screen.getByTestId("form") as HTMLFormElement
      expect(form.checkValidity()).toBe(false)
      await user.click(box)
      expect(form.checkValidity()).toBe(true)
      expect(new FormData(form).get("termos")).toBe("on")
    })

    it("is described by its description, its error and the consumer's ids", () => {
      render(
        <>
          <Checkbox
            label="Aceito"
            description="Você pode revogar."
            error="Obrigatório"
            aria-describedby="extra"
          />
          <p id="extra">Veja a política.</p>
        </>,
      )
      expect(screen.getByRole("checkbox")).toHaveAccessibleDescription(
        "Você pode revogar. Obrigatório Veja a política.",
      )
      expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true")
    })

    it("goes back to its default on a form reset", async () => {
      const user = userEvent.setup()
      render(
        <form data-testid="form">
          <Checkbox label="Aceito" name="aceito" />
        </form>,
      )
      const box = screen.getByRole("checkbox")
      await user.click(box)
      act(() => (screen.getByTestId("form") as HTMLFormElement).reset())
      await waitFor(() => expect(box).toHaveAttribute("aria-checked", "false"))
    })
  })
})
