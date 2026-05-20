import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { DateInput } from "./date-input"

describe("DateInput", () => {
  it("renders placeholder when value is empty", () => {
    render(<DateInput value="" placeholder="Escolha a data" />)
    expect(screen.getByText("Escolha a data")).toBeInTheDocument()
  })

  it("renders default placeholder ('dd/mm/aaaa') when value is empty and no placeholder is set", () => {
    render(<DateInput value="" />)
    expect(screen.getByText("dd/mm/aaaa")).toBeInTheDocument()
  })

  it("formats ISO value as dd/MM/yyyy", () => {
    render(<DateInput value="2025-03-14" />)
    expect(screen.getByText("14/03/2025")).toBeInTheDocument()
  })

  it("renders placeholder when value is an invalid ISO string", () => {
    // parseIsoDate returns undefined for non-ISO strings; formatBrDate returns "".
    render(<DateInput value="not-a-date" placeholder="Selecione" />)
    expect(screen.getByText("Selecione")).toBeInTheDocument()
  })

  it("renders as a disabled button when disabled", () => {
    render(<DateInput value="2025-03-14" disabled />)
    const button = screen.getByRole("button", { name: /14\/03\/2025|Selecionar data/i })
    expect(button).toBeDisabled()
  })

  it("uses 'Selecionar data' as default aria-label when no label/aria-label is provided", () => {
    render(<DateInput value="" />)
    expect(screen.getByRole("button", { name: "Selecionar data" })).toBeInTheDocument()
  })

  it("derives aria-label from string label when no aria-label override", () => {
    render(<DateInput value="" label="Data de nascimento" />)
    expect(screen.getByRole("button", { name: "Data de nascimento" })).toBeInTheDocument()
  })

  it("uses custom aria-label when provided", () => {
    render(<DateInput value="" aria-label="Selecionar minha data" label="Outra label" />)
    expect(screen.getByRole("button", { name: "Selecionar minha data" })).toBeInTheDocument()
  })

  it("renders the error and sets aria-invalid + aria-describedby on the trigger", () => {
    render(
      <DateInput value="" label="Data" error="obrigatório" description="Escolha um dia útil" />,
    )
    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("aria-invalid", "true")
    const describedBy = button.getAttribute("aria-describedby")
    expect(describedBy).toBeTruthy()
    // Wire both description and error ids into aria-describedby.
    const ids = (describedBy ?? "").split(" ")
    expect(ids.length).toBe(2)
    expect(screen.getByRole("alert")).toHaveTextContent("obrigatório")
  })

  it("does not open the popover when disabled", async () => {
    render(<DateInput value="2025-03-14" disabled />)
    const button = screen.getByRole("button")
    await userEvent.click(button)
    // Calendar grid only renders when the popover is open.
    expect(screen.queryByRole("grid")).toBeNull()
  })

  it("opens the popover when the trigger is clicked", async () => {
    render(<DateInput value="" />)
    await userEvent.click(screen.getByRole("button"))
    expect(await screen.findByRole("grid")).toBeInTheDocument()
  })

  it("fires onChange with an ISO yyyy-MM-dd string when a day is selected", async () => {
    const onChange = vi.fn()
    function Wrapper() {
      const [value, setValue] = React.useState("2025-03-14")
      return (
        <DateInput
          value={value}
          onChange={(v) => {
            onChange(v)
            setValue(v)
          }}
        />
      )
    }
    render(<Wrapper />)
    await userEvent.click(screen.getByRole("button"))
    await screen.findByRole("grid")
    // Pick a date in the visible month.
    const day = document.querySelector<HTMLButtonElement>('button[data-day="2025-03-20"]')
    expect(day).not.toBeNull()
    if (day) await userEvent.click(day)
    expect(onChange).toHaveBeenCalledWith("2025-03-20")
  })

  it("closes the popover after a successful selection", async () => {
    function Wrapper() {
      const [value, setValue] = React.useState("2025-03-14")
      return <DateInput value={value} onChange={setValue} />
    }
    render(<Wrapper />)
    await userEvent.click(screen.getByRole("button"))
    await screen.findByRole("grid")
    const day = document.querySelector<HTMLButtonElement>('button[data-day="2025-03-21"]')
    if (day) await userEvent.click(day)
    await waitFor(() => {
      expect(screen.queryByRole("grid")).toBeNull()
    })
  })

  it("forwards the ref to the trigger button", () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<DateInput value="" ref={ref} />)
    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName.toLowerCase()).toBe("button")
  })

  it("respects the consumer-provided id on the trigger", () => {
    render(<DateInput id="my-date" value="" />)
    expect(screen.getByRole("button")).toHaveAttribute("id", "my-date")
  })
})
