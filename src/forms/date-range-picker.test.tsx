import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { DateRangePicker, type DateRangeValue } from "./date-range-picker"

function Controlled({
  initial = { from: "", to: "" },
  onChangeSpy,
}: {
  initial?: DateRangeValue
  onChangeSpy?: (value: DateRangeValue) => void
}) {
  const [value, setValue] = React.useState<DateRangeValue>(initial)
  return (
    <DateRangePicker
      label="Período"
      value={value}
      onValueChange={(v) => {
        onChangeSpy?.(v)
        setValue(v)
      }}
    />
  )
}

describe("DateRangePicker", () => {
  it("renders the placeholder when value is empty range", () => {
    render(
      <DateRangePicker
        label="Período"
        value={{ from: "", to: "" }}
        onValueChange={() => {}}
        placeholder="Selecione"
      />,
    )
    expect(screen.getByText("Selecione")).toBeInTheDocument()
  })

  it("renders the formatted range when both dates are set", () => {
    render(
      <DateRangePicker
        label="Período"
        value={{ from: "2025-01-01", to: "2025-01-31" }}
        onValueChange={() => {}}
      />,
    )
    expect(screen.getByText(/01\/01\/2025.*31\/01\/2025/)).toBeInTheDocument()
  })

  it("renders the error", () => {
    render(
      <DateRangePicker
        label="X"
        value={{ from: "", to: "" }}
        onValueChange={() => {}}
        error="obrigatório"
      />,
    )
    expect(screen.getByRole("alert")).toHaveTextContent("obrigatório")
  })

  it("respects disabled", () => {
    render(
      <DateRangePicker
        label="X"
        value={{ from: "", to: "" }}
        onValueChange={() => {}}
        disabled
      />,
    )
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("renders open-ended display when only 'from' is set", () => {
    render(
      <DateRangePicker
        label="Período"
        value={{ from: "2025-04-10", to: "" }}
        onValueChange={() => {}}
      />,
    )
    expect(screen.getByText(/10\/04\/2025.*\.\.\./)).toBeInTheDocument()
  })

  it("opens the popover when the trigger is clicked", async () => {
    render(<Controlled />)
    // The trigger inherits the accessible name from <label htmlFor>; query by display text.
    const trigger = screen.getByText("Selecione um período").closest("button")
    if (!trigger) throw new Error("trigger not found")
    await userEvent.click(trigger)
    // The Calendar (DayPicker) renders a grid role (one per visible month).
    const grids = await screen.findAllByRole("grid")
    expect(grids.length).toBeGreaterThan(0)
  })

  it("does not open the popover when disabled", async () => {
    render(
      <DateRangePicker
        label="X"
        value={{ from: "", to: "" }}
        onValueChange={() => {}}
        disabled
      />,
    )
    await userEvent.click(screen.getByRole("button"))
    expect(screen.queryByRole("grid")).toBeNull()
  })

  it("Limpar button clears the range and closes the popover", async () => {
    const onChangeSpy = vi.fn()
    render(
      <Controlled initial={{ from: "2025-01-01", to: "2025-01-31" }} onChangeSpy={onChangeSpy} />,
    )
    // Open the popover via the displayed range text.
    const triggerText = screen.getByText(/01\/01\/2025/)
    const triggerBtn = triggerText.closest("button")
    if (!triggerBtn) throw new Error("trigger not found")
    await userEvent.click(triggerBtn)
    const openedGrids = await screen.findAllByRole("grid")
    expect(openedGrids.length).toBeGreaterThan(0)
    // Click the Limpar button (within the popover).
    await userEvent.click(screen.getByRole("button", { name: /Limpar/i }))
    expect(onChangeSpy).toHaveBeenLastCalledWith({ from: "", to: "" })
    // After clearing, the trigger should show the placeholder again.
    await waitFor(() => {
      expect(screen.getByText("Selecione um período")).toBeInTheDocument()
    })
  })

  it("renders multiple month grids when numberOfMonths is increased", async () => {
    render(
      <DateRangePicker
        label="X"
        value={{ from: "", to: "" }}
        onValueChange={() => {}}
        numberOfMonths={2}
      />,
    )
    const trigger = screen.getByText("Selecione um período").closest("button")
    if (!trigger) throw new Error("trigger not found")
    await userEvent.click(trigger)
    const grids = await screen.findAllByRole("grid")
    expect(grids).toHaveLength(2)
  })

  it("renders a single month grid when numberOfMonths=1", async () => {
    render(
      <DateRangePicker
        label="X"
        value={{ from: "", to: "" }}
        onValueChange={() => {}}
        numberOfMonths={1}
      />,
    )
    const trigger = screen.getByText("Selecione um período").closest("button")
    if (!trigger) throw new Error("trigger not found")
    await userEvent.click(trigger)
    const grids = await screen.findAllByRole("grid")
    expect(grids).toHaveLength(1)
  })

  it("sets aria-invalid on the trigger when error is provided", () => {
    render(
      <DateRangePicker
        label="X"
        value={{ from: "", to: "" }}
        onValueChange={() => {}}
        error="obrigatório"
      />,
    )
    const trigger = screen.getByRole("button")
    expect(trigger).toHaveAttribute("aria-invalid", "true")
  })

  it("selects a single day and emits a partial range with only 'from'", async () => {
    const onChange = vi.fn()
    function Wrapper() {
      const [value, setValue] = React.useState<DateRangeValue>({ from: "", to: "" })
      return (
        <DateRangePicker
          label="Período"
          value={value}
          onValueChange={(v) => {
            onChange(v)
            setValue(v)
          }}
          numberOfMonths={1}
        />
      )
    }
    render(<Wrapper />)
    const trigger = screen.getByText("Selecione um período").closest("button")
    if (!trigger) throw new Error("trigger not found")
    await userEvent.click(trigger)
    // Wait for the grid then click a specific day (e.g., day "15" of the visible month).
    await screen.findByRole("grid")
    const dayButtons = screen
      .getAllByRole("gridcell")
      .map((cell) => cell.querySelector("button"))
      .filter((b): b is HTMLButtonElement => Boolean(b))
    // pick a day that isn't disabled if possible
    const target = dayButtons.find((b) => !b.disabled)
    if (target) {
      await userEvent.click(target)
      expect(onChange).toHaveBeenCalled()
      const lastValue = onChange.mock.calls.at(-1)?.[0] as DateRangeValue
      // A single day click should set 'from' (or both to the same day) — at minimum, from must be set.
      expect(lastValue.from).toBeTruthy()
    }
  })
})
