import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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
})
