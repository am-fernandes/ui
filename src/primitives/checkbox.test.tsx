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

  it("renders indeterminate state (aria-checked=mixed)", () => {
    render(<Checkbox label="X" checked="indeterminate" />)
    expect(screen.getByRole("checkbox", { name: "X" })).toHaveAttribute("aria-checked", "mixed")
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
})
