import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ZapIcon } from "lucide-react"
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
})
