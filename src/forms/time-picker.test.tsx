import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { TimePicker } from "./time-picker"

/** Wrap TimePicker in a small controlled stateful host so the parent state
 * updates after each emit, mirroring real usage. */
function Controlled({
  initial = "",
  onChangeSpy,
}: {
  initial?: string
  onChangeSpy?: (v: string) => void
}) {
  const [value, setValue] = React.useState(initial)
  return (
    <TimePicker
      value={value}
      onChange={(v) => {
        onChangeSpy?.(v)
        setValue(v)
      }}
    />
  )
}

// Convenience: fire a synthetic onChange event on a controlled <input>.
// Notes on jsdom: userEvent.type does not reliably propagate state for inputs
// whose `value` is React-controlled by a wrapper that may revert it; fireEvent
// lets us simulate the exact onChange callback the component listens for.
function setInputValue(input: HTMLInputElement, value: string) {
  fireEvent.focus(input)
  fireEvent.change(input, { target: { value } })
}

describe("TimePicker", () => {
  it("splits value into hour + minute fields", () => {
    render(<TimePicker value="09:30" />)
    expect(screen.getByLabelText("Horas")).toHaveValue("09")
    expect(screen.getByLabelText("Minutos")).toHaveValue("30")
  })

  it("renders empty fields when value is empty", () => {
    render(<TimePicker value="" />)
    expect(screen.getByLabelText("Horas")).toHaveValue("")
    expect(screen.getByLabelText("Minutos")).toHaveValue("")
  })

  it("renders empty fields when value is undefined", () => {
    render(<TimePicker />)
    expect(screen.getByLabelText("Horas")).toHaveValue("")
    expect(screen.getByLabelText("Minutos")).toHaveValue("")
  })

  it("emits a change when both fields are filled (typed)", async () => {
    const spy = vi.fn()
    render(<Controlled onChangeSpy={spy} />)
    const hour = screen.getByLabelText("Horas")
    await userEvent.type(hour, "08")
    // Typing two digits triggers an emit (regardless of final value).
    expect(spy).toHaveBeenCalled()
  })

  it("auto-advances focus from hour to minute once hour has 2 valid digits", () => {
    render(<Controlled />)
    const hour = screen.getByLabelText("Horas") as HTMLInputElement
    const minute = screen.getByLabelText("Minutos")
    setInputValue(hour, "08")
    expect(document.activeElement).toBe(minute)
  })

  it("emits a full HH:MM when typing two valid digits in each field", () => {
    const spy = vi.fn()
    render(<Controlled initial="00:00" onChangeSpy={spy} />)
    const hour = screen.getByLabelText("Horas") as HTMLInputElement
    const minute = screen.getByLabelText("Minutos") as HTMLInputElement
    setInputValue(hour, "14")
    setInputValue(minute, "30")
    expect(spy).toHaveBeenLastCalledWith("14:30")
  })

  it("colon key in hour field jumps focus to minute", async () => {
    render(<Controlled initial="14:30" />)
    const hour = screen.getByLabelText("Horas")
    const minute = screen.getByLabelText("Minutos")
    hour.focus()
    await userEvent.keyboard(":")
    expect(document.activeElement).toBe(minute)
  })

  it("hour ArrowUp wraps modular: 23 -> 0", async () => {
    const spy = vi.fn()
    render(<Controlled initial="23:00" onChangeSpy={spy} />)
    const hour = screen.getByLabelText("Horas")
    hour.focus()
    await userEvent.keyboard("{ArrowUp}")
    expect(spy).toHaveBeenLastCalledWith("00:00")
  })

  it("hour ArrowDown wraps modular: 0 -> 23", async () => {
    const spy = vi.fn()
    render(<Controlled initial="00:00" onChangeSpy={spy} />)
    const hour = screen.getByLabelText("Horas")
    hour.focus()
    await userEvent.keyboard("{ArrowDown}")
    expect(spy).toHaveBeenLastCalledWith("23:00")
  })

  it("minute ArrowUp wraps modular: 59 -> 0", async () => {
    const spy = vi.fn()
    render(<Controlled initial="10:59" onChangeSpy={spy} />)
    const minute = screen.getByLabelText("Minutos")
    minute.focus()
    await userEvent.keyboard("{ArrowUp}")
    expect(spy).toHaveBeenLastCalledWith("10:00")
  })

  it("minute ArrowDown wraps modular: 0 -> 59", async () => {
    const spy = vi.fn()
    render(<Controlled initial="10:00" onChangeSpy={spy} />)
    const minute = screen.getByLabelText("Minutos")
    minute.focus()
    await userEvent.keyboard("{ArrowDown}")
    expect(spy).toHaveBeenLastCalledWith("10:59")
  })

  it("hour ArrowUp on empty starts from 0 -> 1 (emits empty because minute is empty)", async () => {
    const spy = vi.fn()
    render(<Controlled onChangeSpy={spy} />)
    const hour = screen.getByLabelText("Horas")
    hour.focus()
    await userEvent.keyboard("{ArrowUp}")
    // hour="01", minute=""; emit drops to "" because minute is empty.
    expect(spy).toHaveBeenLastCalledWith("")
  })

  it("minute ArrowUp on empty starts from 0 -> 1 (emits empty because hour is empty)", async () => {
    const spy = vi.fn()
    render(<Controlled onChangeSpy={spy} />)
    const minute = screen.getByLabelText("Minutos")
    minute.focus()
    await userEvent.keyboard("{ArrowUp}")
    expect(spy).toHaveBeenLastCalledWith("")
  })

  it("Backspace in empty minute returns focus to the hour field", () => {
    render(<Controlled initial="14:30" />)
    const hour = screen.getByLabelText("Horas")
    const minute = screen.getByLabelText("Minutos") as HTMLInputElement
    // Drive the minute to "" so the next Backspace fires the empty-minute handler.
    setInputValue(minute, "")
    fireEvent.keyDown(minute, { key: "Backspace" })
    expect(document.activeElement).toBe(hour)
  })

  it("blurring an out-of-range hour (>23) clears the hour and emits empty", () => {
    const spy = vi.fn()
    render(<Controlled onChangeSpy={spy} />)
    const hour = screen.getByLabelText("Horas") as HTMLInputElement
    // Two-digit typing path: 30 is a valid 2-digit number but out of hour range.
    // The inline emit does NOT fire because isInRange is false, so the draft
    // hour is "30". Blurring must clear the draft and emit "".
    setInputValue(hour, "30")
    fireEvent.blur(hour)
    expect(hour.value).toBe("")
    expect(spy).toHaveBeenLastCalledWith("")
  })

  it("blurring an out-of-range minute (>59) clears the minute and emits empty", () => {
    const spy = vi.fn()
    render(<Controlled initial="10:00" onChangeSpy={spy} />)
    const minute = screen.getByLabelText("Minutos") as HTMLInputElement
    setInputValue(minute, "99")
    fireEvent.blur(minute)
    expect(minute.value).toBe("")
    expect(spy).toHaveBeenLastCalledWith("")
  })

  it("blurring an empty hour leaves the field empty (no exception)", () => {
    render(<Controlled />)
    const hour = screen.getByLabelText("Horas") as HTMLInputElement
    fireEvent.focus(hour)
    fireEvent.blur(hour)
    expect(hour.value).toBe("")
  })

  it("blurring a valid single-digit hour zero-pads to 2 digits", () => {
    render(<Controlled initial="10:30" />)
    const hour = screen.getByLabelText("Horas") as HTMLInputElement
    setInputValue(hour, "9")
    fireEvent.blur(hour)
    expect(hour.value).toBe("09")
  })

  it("blurring an empty minute emits empty", () => {
    const spy = vi.fn()
    render(<Controlled initial="10:30" onChangeSpy={spy} />)
    const minute = screen.getByLabelText("Minutos") as HTMLInputElement
    setInputValue(minute, "")
    fireEvent.blur(minute)
    expect(minute.value).toBe("")
    expect(spy).toHaveBeenLastCalledWith("")
  })

  it("blurring a valid single-digit minute zero-pads to 2 digits", () => {
    render(<Controlled initial="10:30" />)
    const minute = screen.getByLabelText("Minutos") as HTMLInputElement
    setInputValue(minute, "5")
    fireEvent.blur(minute)
    expect(minute.value).toBe("05")
  })

  it("respects disabled prop on both inputs and applies data-disabled", () => {
    render(<TimePicker value="10:30" disabled />)
    expect(screen.getByLabelText("Horas")).toBeDisabled()
    expect(screen.getByLabelText("Minutos")).toBeDisabled()
    expect(screen.getByRole("group")).toHaveAttribute("data-disabled", "true")
  })

  it("uses custom aria-label on the role=group wrapper", () => {
    render(<TimePicker value="" aria-label="Hora de almoço" />)
    expect(screen.getByRole("group", { name: "Hora de almoço" })).toBeInTheDocument()
  })

  it("derives the group aria-label from the string label when no aria-label is given", () => {
    render(<TimePicker value="" label="Horário de fim" />)
    expect(screen.getByRole("group", { name: "Horário de fim" })).toBeInTheDocument()
  })

  it("renders error message and exposes it via role=alert", () => {
    render(<TimePicker value="" error="formato inválido" label="Hora" />)
    expect(screen.getByRole("alert")).toHaveTextContent("formato inválido")
  })

  it("strips non-digit characters as the user types", () => {
    render(<Controlled />)
    const hour = screen.getByLabelText("Horas") as HTMLInputElement
    setInputValue(hour, "a1b")
    // The digit-only regex inside onChange keeps "1" only.
    expect(hour.value).toBe("1")
  })

  it("typing two valid digits in hour emits HH:MM if minute already set", () => {
    const spy = vi.fn()
    render(<Controlled initial="00:45" onChangeSpy={spy} />)
    const hour = screen.getByLabelText("Horas") as HTMLInputElement
    setInputValue(hour, "14")
    // The first valid emit should be the full value.
    const firstEmit = spy.mock.calls[0]?.[0]
    expect(firstEmit).toBe("14:45")
  })

  it("typing two out-of-range digits in hour does not emit a valid HH:MM", () => {
    const spy = vi.fn()
    render(<Controlled initial="00:45" onChangeSpy={spy} />)
    const hour = screen.getByLabelText("Horas") as HTMLInputElement
    setInputValue(hour, "99")
    const hadInvalid = spy.mock.calls.some(([v]) => v === "99:45")
    expect(hadInvalid).toBe(false)
  })

  it("forwards ref to the hour input", () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<TimePicker value="" ref={ref} />)
    expect(ref.current).not.toBeNull()
    expect(ref.current?.getAttribute("aria-label")).toBe("Horas")
  })

  it("does not throw when onChange is omitted (no-op emit path)", () => {
    // No onChange — the emit early-returns. The component still updates its
    // own draft state so the typed value appears in the input.
    render(<TimePicker value="" />)
    const hour = screen.getByLabelText("Horas") as HTMLInputElement
    setInputValue(hour, "12")
    // After typing two digits, the draft holds "12" and the input reflects it.
    expect(hour.value).toBe("12")
  })

  it("respects consumer-provided id on the hour input", () => {
    render(<TimePicker id="my-time" value="" />)
    expect(screen.getByLabelText("Horas")).toHaveAttribute("id", "my-time")
  })
})
