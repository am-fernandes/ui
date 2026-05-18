import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Switch } from "./switch"

describe("Switch", () => {
  it("renders label associated with switch", () => {
    render(<Switch label="Notificações" />)
    expect(screen.getByRole("switch", { name: "Notificações" })).toBeInTheDocument()
  })

  it("renders description and error", () => {
    render(<Switch label="X" description="ajuda" error="erro" />)
    expect(screen.getByText("ajuda")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("erro")
  })

  it("toggles on label click", async () => {
    const onChange = vi.fn()
    render(<Switch label="Push" onCheckedChange={onChange} />)
    await userEvent.click(screen.getByText("Push"))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it("applies labelPosition='left'", () => {
    const { container } = render(<Switch label="X" labelPosition="left" />)
    expect(container.querySelector('[data-slot="switch-field"]')).toHaveAttribute(
      "data-label-position",
      "left",
    )
  })

  it("respects disabled", () => {
    render(<Switch label="X" disabled />)
    expect(screen.getByRole("switch", { name: "X" })).toBeDisabled()
  })
})
