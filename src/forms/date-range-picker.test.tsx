import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { MOBILE_QUERY } from "../hooks/use-is-mobile"
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
      <DateRangePicker label="X" value={{ from: "", to: "" }} onValueChange={() => {}} disabled />,
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

  it("opens on the month of the saved range, not on the current month", async () => {
    render(<Controlled initial={{ from: "2025-01-01", to: "2025-01-31" }} />)
    const trigger = screen.getByText(/01\/01\/2025/).closest("button")
    if (!trigger) throw new Error("trigger not found")
    await userEvent.click(trigger)
    expect(await screen.findByRole("grid", { name: /janeiro 2025/i })).toBeInTheDocument()
  })

  it("shows one month below the md breakpoint", async () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: query === MOBILE_QUERY,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia
    try {
      render(<Controlled />)
      const trigger = screen.getByText("Selecione um período").closest("button")
      if (!trigger) throw new Error("trigger not found")
      await userEvent.click(trigger)
      expect(await screen.findAllByRole("grid")).toHaveLength(1)
    } finally {
      window.matchMedia = original
    }
  })

  it("the action texts come from labels", async () => {
    render(
      <DateRangePicker
        label="Período"
        value={{ from: "", to: "" }}
        onValueChange={() => {}}
        labels={{ clear: "Apagar", confirm: "Aplicar" }}
      />,
    )
    const trigger = screen.getByText("Selecione um período").closest("button")
    if (!trigger) throw new Error("trigger not found")
    await userEvent.click(trigger)
    expect(await screen.findByRole("button", { name: "Apagar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Aplicar" })).toBeInTheDocument()
  })

  it("the trigger's name is the label plus the period, not the label alone", () => {
    render(
      <DateRangePicker
        label={
          <span>
            Período <em>de vigência</em>
          </span>
        }
        required
        value={{ from: "2025-01-01", to: "2025-01-31" }}
        onValueChange={() => {}}
      />,
    )
    const trigger = screen.getByRole("button", { name: /01\/01\/2025.*31\/01\/2025/ })
    expect(trigger).toHaveAccessibleName(/Período de vigência.*obrigatório.*01\/01\/2025/)
    expect(trigger).not.toHaveAttribute("aria-label")
  })

  it("without a period, the name is the label and leaves the placeholder out", () => {
    render(
      <DateRangePicker label="Período" value={{ from: "", to: "" }} onValueChange={() => {}} />,
    )
    expect(screen.getByRole("button")).toHaveAccessibleName("Período")
  })

  it("a consumer aria-label or the fallback names the trigger, with the period", () => {
    const { rerender } = render(
      <DateRangePicker
        aria-label="Vigência"
        value={{ from: "2025-01-01", to: "2025-01-31" }}
        onValueChange={() => {}}
      />,
    )
    expect(screen.getByRole("button")).toHaveAccessibleName(/^Vigência 01\/01\/2025/)
    rerender(<DateRangePicker value={{ from: "", to: "" }} onValueChange={() => {}} />)
    expect(screen.getByRole("button")).toHaveAccessibleName("Período")
    rerender(
      <DateRangePicker
        label="Outro rótulo"
        aria-label="Vigência"
        value={{ from: "", to: "" }}
        onValueChange={() => {}}
      />,
    )
    expect(screen.getByRole("button")).toHaveAccessibleName("Vigência")
  })

  it("min, max and disabledDays turn days off in the calendar", async () => {
    render(
      <DateRangePicker
        label="Período"
        numberOfMonths={1}
        value={{ from: "2025-03-10", to: "2025-03-12" }}
        onValueChange={() => {}}
        min="2025-03-05"
        max="2025-03-25"
        disabledDays="weekends"
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: /Período/ }))
    await screen.findByRole("grid")
    const day = (iso: string) => document.querySelector(`button[data-day="${iso}"]`)
    expect(day("2025-03-04")).toBeDisabled()
    expect(day("2025-03-26")).toBeDisabled()
    // 08/03/2025 is a Saturday.
    expect(day("2025-03-08")).toBeDisabled()
    expect(day("2025-03-07")).not.toBeDisabled()
    expect(screen.getByRole("button", { name: "Ir para o mês anterior" })).toHaveAttribute(
      "aria-disabled",
      "true",
    )
  })

  it("without value, it keeps its own period, starting from defaultValue", async () => {
    const onValueChange = vi.fn()
    render(
      <DateRangePicker
        label="Período"
        numberOfMonths={1}
        defaultValue={{ from: "2025-03-10", to: "2025-03-12" }}
        onValueChange={onValueChange}
      />,
    )
    const trigger = screen.getByRole("button", { name: /Período/ })
    expect(trigger).toHaveTextContent("10/03/2025 — 12/03/2025")
    await userEvent.click(trigger)
    await screen.findByRole("grid")
    const day = (iso: string) => document.querySelector(`button[data-day="${iso}"]`) as HTMLElement
    await userEvent.click(day("2025-03-20"))
    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
    expect(onValueChange).toHaveBeenLastCalledWith({ from: "2025-03-10", to: "2025-03-20" })
    expect(trigger).toHaveTextContent("10/03/2025 — 20/03/2025")
  })

  it("an uncontrolled picker goes back to defaultValue when its form is reset", async () => {
    const { container } = render(
      <form>
        <DateRangePicker label="Período" defaultValue={{ from: "2025-03-10", to: "2025-03-12" }} />
      </form>,
    )
    const trigger = screen.getByRole("button", { name: /Período/ })
    await userEvent.click(trigger)
    await userEvent.click(await screen.findByRole("button", { name: "Limpar" }))
    expect(trigger).toHaveTextContent("Selecione um período")
    ;(container.querySelector("form") as HTMLFormElement).reset()
    await waitFor(() => expect(trigger).toHaveTextContent("10/03/2025 — 12/03/2025"))
  })

  it("name: a native form receives <name>-from and <name>-to", () => {
    const { container, rerender } = render(
      <form>
        <DateRangePicker
          label="Período"
          name="vigencia"
          value={{ from: "2025-03-10", to: "2025-03-12" }}
        />
      </form>,
    )
    const data = () => new FormData(container.querySelector("form") as HTMLFormElement)
    expect(data().get("vigencia-from")).toBe("2025-03-10")
    expect(data().get("vigencia-to")).toBe("2025-03-12")
    rerender(
      <form>
        <DateRangePicker
          label="Período"
          name="vigencia"
          value={{ from: "2025-03-10", to: "2025-03-12" }}
          disabled
        />
      </form>,
    )
    expect(data().has("vigencia-from")).toBe(false)
  })

  it("readOnly: readable and focusable, opens nothing, and is submitted", async () => {
    const { container } = render(
      <form>
        <DateRangePicker
          label="Período"
          name="vigencia"
          value={{ from: "2025-03-10", to: "2025-03-12" }}
          readOnly
        />
      </form>,
    )
    const trigger = screen.getByRole("button", { name: /Período/ })
    expect(trigger).not.toBeDisabled()
    expect(trigger).not.toHaveAttribute("aria-haspopup")
    await userEvent.click(trigger)
    expect(trigger).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    expect(screen.queryByRole("grid")).toBeNull()
    expect(
      new FormData(container.querySelector("form") as HTMLFormElement).get("vigencia-to"),
    ).toBe("2025-03-12")
  })

  it("size sets the trigger's height from the control sizes (md by default)", () => {
    const props = { label: "Período", value: { from: "", to: "" } }
    const { rerender } = render(<DateRangePicker {...props} />)
    expect(screen.getByRole("button").className).toContain("h-control-md")
    rerender(<DateRangePicker {...props} size="sm" />)
    expect(screen.getByRole("button").className).toContain("h-control-sm")
    rerender(<DateRangePicker {...props} size="lg" />)
    expect(screen.getByRole("button").className).toContain("h-control-lg")
  })

  it("onBlur: when the focus leaves the field, not when it goes into the calendar", async () => {
    const onBlur = vi.fn()
    render(
      <>
        <DateRangePicker label="Período" onBlur={onBlur} numberOfMonths={1} />
        <button type="button">Fora</button>
      </>,
    )
    const trigger = screen.getByRole("button", { name: /Período/ })
    await userEvent.click(trigger)
    await screen.findByRole("grid")
    // Into the calendar and its buttons.
    await userEvent.click(screen.getByRole("button", { name: "Ir para o próximo mês" }))
    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
    await waitFor(() => expect(trigger).toHaveFocus())
    expect(onBlur).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole("button", { name: "Fora" }))
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it("does not open the popover when disabled", async () => {
    render(
      <DateRangePicker label="X" value={{ from: "", to: "" }} onValueChange={() => {}} disabled />,
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

  it("keeps the popover open on pointer-down inside an outside element with role=grid", async () => {
    // Exercises the onPointerDownOutside handler: when the event target lives
    // inside an element matching '[role="grid"], .rdp, .rdp-root', the handler
    // calls preventDefault() so Radix does not auto-dismiss the popover.
    render(
      <div>
        {/* biome-ignore lint/a11y/useSemanticElements: mock grid container for testing */}
        <div role="grid" data-testid="outside-grid">
          <button type="button" data-testid="outside-grid-cell">
            cell
          </button>
        </div>
        <Controlled />
      </div>,
    )
    const trigger = screen.getByText("Selecione um período").closest("button")
    if (!trigger) throw new Error("trigger not found")
    await userEvent.click(trigger)
    // Wait for the popover content to be in the DOM.
    const openedGrids = await screen.findAllByRole("grid")
    expect(openedGrids.length).toBeGreaterThan(0)

    // Dispatch a pointerdown on an element OUTSIDE the popover whose ancestor
    // matches the grid selector. Radix will fire onPointerDownOutside, our
    // handler will detect the grid ancestor and call preventDefault, leaving
    // the popover open.
    const outsideCell = screen.getByTestId("outside-grid-cell")
    fireEvent.pointerDown(outsideCell, { button: 0, ctrlKey: false })

    // The popover content (Calendar grid) must still be in the document.
    await new Promise((r) => setTimeout(r, 20))
    expect(screen.queryAllByRole("grid").length).toBeGreaterThan(1)
  })

  it("keeps the popover open when focus moves outside (onFocusOutside preventDefault)", async () => {
    // Exercises onFocusOutside: the handler unconditionally calls
    // preventDefault, so when focus escapes the popover Radix should NOT
    // auto-dismiss it.
    render(
      <div>
        <input data-testid="outside-input" />
        <Controlled />
      </div>,
    )
    const trigger = screen.getByText("Selecione um período").closest("button")
    if (!trigger) throw new Error("trigger not found")
    await userEvent.click(trigger)
    await screen.findAllByRole("grid")

    // Move focus to an element OUTSIDE the popover. Radix's DismissableLayer
    // listens for focusin on the document and dispatches a focusOutside event;
    // the picker's handler preventDefaults it.
    const outsideInput = screen.getByTestId("outside-input") as HTMLInputElement
    outsideInput.focus()
    // Some Radix builds rely on a focusin event bubbling to document; ensure it fires.
    fireEvent.focusIn(outsideInput)

    await new Promise((r) => setTimeout(r, 20))
    // Popover content (calendar grid) must still be present.
    expect(screen.queryAllByRole("grid").length).toBeGreaterThan(0)
  })

  it("selects a single day and emits the range only after confirm", async () => {
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
    // Wait for the grid then click a specific day.
    await screen.findByRole("grid")
    const dayButtons = screen
      .getAllByRole("gridcell")
      .map((cell) => cell.querySelector("button"))
      .filter((b): b is HTMLButtonElement => Boolean(b))
    // pick a day that isn't disabled if possible
    const target = dayButtons.find((b) => !b.disabled)
    if (target) {
      await userEvent.click(target)
      // onChange should NOT be called yet — the range is only committed on confirm
      expect(onChange).not.toHaveBeenCalled()
      // Click "Confirmar" to commit
      const confirmBtn = screen.getByText("Confirmar")
      await userEvent.click(confirmBtn)
      expect(onChange).toHaveBeenCalledOnce()
      const lastValue = onChange.mock.calls.at(-1)?.[0] as DateRangeValue
      // After confirm the from (and to, same day) must be set
      expect(lastValue.from).toBeTruthy()
    }
  })
})
