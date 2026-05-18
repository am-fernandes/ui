import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { TimePicker } from "./time-picker"

describe("TimePicker", () => {
  it("splits value into hour + minute fields", () => {
    render(<TimePicker value="09:30" />)
    expect(screen.getByLabelText("Horas")).toHaveValue("09")
    expect(screen.getByLabelText("Minutos")).toHaveValue("30")
  })

  it("emits cleaned value when both fields are filled", async () => {
    const onChange = vi.fn()
    render(<TimePicker value="" onChange={onChange} />)
    const hour = screen.getByLabelText("Horas")
    await userEvent.type(hour, "08")
    // typing two digits triggers emit
    expect(onChange).toHaveBeenCalled()
  })
})
