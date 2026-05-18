import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Checkbox } from "./checkbox"

describe("Checkbox", () => {
  it("renders with role=checkbox", () => {
    render(<Checkbox id="terms" />)
    expect(screen.getByRole("checkbox")).toBeInTheDocument()
  })

  it("toggles aria-checked when clicked", async () => {
    render(<Checkbox id="terms" />)
    const checkbox = screen.getByRole("checkbox")
    expect(checkbox).toHaveAttribute("aria-checked", "false")
    await userEvent.click(checkbox)
    expect(checkbox).toHaveAttribute("aria-checked", "true")
  })

  it("emits data-slot=checkbox", () => {
    render(<Checkbox id="terms" />)
    expect(screen.getByRole("checkbox")).toHaveAttribute("data-slot", "checkbox")
  })

  it("disabled blocks click and onCheckedChange", async () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox disabled onCheckedChange={onCheckedChange} />)
    const checkbox = screen.getByRole("checkbox")
    await userEvent.click(checkbox)
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(checkbox).toBeDisabled()
  })

  it("supports controlled checked + onCheckedChange", async () => {
    function Controlled() {
      const [checked, setChecked] = useState(false)
      return (
        <Checkbox
          aria-label="agree"
          checked={checked}
          onCheckedChange={(v) => setChecked(v === true)}
        />
      )
    }
    render(<Controlled />)
    const checkbox = screen.getByRole("checkbox", { name: "agree" })
    expect(checkbox).toHaveAttribute("aria-checked", "false")
    await userEvent.click(checkbox)
    expect(checkbox).toHaveAttribute("aria-checked", "true")
    await userEvent.click(checkbox)
    expect(checkbox).toHaveAttribute("aria-checked", "false")
  })

  it("renders Minus icon when checked is indeterminate", () => {
    const { container } = render(<Checkbox checked="indeterminate" />)
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed")
    expect(container.querySelector('[data-slot="checkbox-indeterminate-icon"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="checkbox-check-icon"]')).not.toBeInTheDocument()
  })

  it("renders Check icon when checked is true", () => {
    const { container } = render(<Checkbox checked={true} />)
    expect(container.querySelector('[data-slot="checkbox-check-icon"]')).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="checkbox-indeterminate-icon"]'),
    ).not.toBeInTheDocument()
  })
})
