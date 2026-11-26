import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { NumberInput } from "./number-input"

function paste(input: HTMLElement, text: string) {
  fireEvent.paste(input, { clipboardData: { getData: () => text } })
}

describe("NumberInput", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders with its label as a spinbutton", () => {
    render(<NumberInput label="Andares" min={1} max={40} defaultValue={12} />)
    const input = screen.getByRole("spinbutton", { name: "Andares" })
    expect(input).toHaveAttribute("aria-valuenow", "12")
    expect(input).toHaveAttribute("aria-valuemin", "1")
    expect(input).toHaveAttribute("aria-valuemax", "40")
    expect(input).toHaveValue("12")
  })

  it("is empty as null, never 0", async () => {
    const onValueChange = vi.fn()
    render(<NumberInput label="Vagas" defaultValue={3} onValueChange={onValueChange} />)
    const input = screen.getByRole("spinbutton", { name: "Vagas" })
    await userEvent.clear(input)
    expect(onValueChange).toHaveBeenLastCalledWith(null)
    expect(input).not.toHaveAttribute("aria-valuenow")
    await userEvent.tab()
    expect(input).toHaveValue("")
  })

  it("shows the thousands dot when not focused, and plain digits while editing", async () => {
    render(<NumberInput label="Área" decimals={2} defaultValue={1250.5} />)
    const input = screen.getByRole("spinbutton", { name: "Área" })
    expect(input).toHaveValue("1.250,5")
    await userEvent.click(input)
    expect(input).toHaveValue("1250,5")
    await userEvent.tab()
    expect(input).toHaveValue("1.250,5")
  })

  it("keeps digits and one comma with up to `decimals` places while typing", async () => {
    const onValueChange = vi.fn()
    render(<NumberInput label="Área" decimals={2} onValueChange={onValueChange} />)
    const input = screen.getByRole("spinbutton", { name: "Área" })
    await userEvent.type(input, "7a2,,5x09")
    expect(input).toHaveValue("72,50")
    expect(onValueChange).toHaveBeenLastCalledWith(72.5)
  })

  it("takes a keypad dot as the decimal comma", async () => {
    render(<NumberInput label="Área" decimals={1} />)
    const input = screen.getByRole("spinbutton", { name: "Área" })
    await userEvent.type(input, "12.5")
    expect(input).toHaveValue("12,5")
  })

  it("whole numbers by default: no comma", async () => {
    render(<NumberInput label="Quartos" />)
    const input = screen.getByRole("spinbutton", { name: "Quartos" })
    await userEvent.type(input, "3,5")
    expect(input).toHaveValue("35")
  })

  it("takes a minus sign only when min is negative", async () => {
    const { rerender } = render(<NumberInput label="Saldo" />)
    await userEvent.type(screen.getByRole("spinbutton"), "-5")
    expect(screen.getByRole("spinbutton")).toHaveValue("5")
    rerender(<NumberInput label="Saldo" min={-100} value={null} />)
    const input = screen.getByRole("spinbutton")
    await userEvent.clear(input)
    await userEvent.type(input, "-5")
    expect(input).toHaveValue("-5")
  })

  it("pastes with the library's rule: comma is decimal, a dot with 1–2 digits is decimal", () => {
    const onValueChange = vi.fn()
    render(<NumberInput label="Área" decimals={2} onValueChange={onValueChange} />)
    const input = screen.getByRole("spinbutton", { name: "Área" })
    input.focus()
    paste(input, "1.234,5")
    expect(onValueChange).toHaveBeenLastCalledWith(1234.5)
    paste(input, "2350.9")
    expect(onValueChange).toHaveBeenLastCalledWith(2350.9)
    paste(input, "350.000")
    expect(onValueChange).toHaveBeenLastCalledWith(350000)
    paste(input, "área: 72 m²")
    expect(onValueChange).toHaveBeenLastCalledWith(72)
    expect(input).toHaveValue("72")
  })

  it("steps with the arrows, ten steps with PageUp/PageDown, and Home/End go to min/max", async () => {
    render(<NumberInput label="Andar" min={0} max={30} defaultValue={5} />)
    const input = screen.getByRole("spinbutton", { name: "Andar" })
    input.focus()
    await userEvent.keyboard("{ArrowUp}{ArrowUp}")
    expect(input).toHaveValue("7")
    await userEvent.keyboard("{ArrowDown}")
    expect(input).toHaveValue("6")
    await userEvent.keyboard("{PageUp}")
    expect(input).toHaveValue("16")
    await userEvent.keyboard("{PageUp}{PageUp}")
    expect(input).toHaveValue("30")
    await userEvent.keyboard("{Home}")
    expect(input).toHaveValue("0")
    await userEvent.keyboard("{End}")
    expect(input).toHaveValue("30")
    expect(input).toHaveAttribute("aria-valuenow", "30")
  })

  it("steps by a decimal step without float noise", async () => {
    render(<NumberInput label="Taxa" step={0.1} defaultValue={0.2} />)
    const input = screen.getByRole("spinbutton", { name: "Taxa" })
    input.focus()
    await userEvent.keyboard("{ArrowUp}")
    expect(input).toHaveValue("0,3")
    expect(input).toHaveAttribute("aria-valuenow", "0.3")
  })

  it("keeps an out-of-range value and shows the limit when the field is left", async () => {
    const onValueChange = vi.fn()
    render(<NumberInput label="Andar" min={1} max={30} onValueChange={onValueChange} />)
    const input = screen.getByRole("spinbutton", { name: "Andar" }) as HTMLInputElement
    await userEvent.type(input, "45")
    expect(screen.queryByRole("alert")).toBeNull()
    await userEvent.tab()
    expect(input).toHaveValue("45")
    expect(onValueChange).toHaveBeenLastCalledWith(45)
    expect(screen.getByRole("alert")).toHaveTextContent("O valor máximo é 30.")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input.validity.valid).toBe(false)
  })

  it("writes the limit with its unit, takes the text from labels and clears it in range", async () => {
    render(
      <NumberInput
        label="Área"
        suffix="m²"
        min={10}
        labels={{ belowMin: (min) => `Pelo menos ${min}` }}
      />,
    )
    const input = screen.getByRole("spinbutton", { name: "Área" })
    await userEvent.type(input, "5")
    await userEvent.tab()
    expect(screen.getByRole("alert")).toHaveTextContent("Pelo menos 10 m²")
    await userEvent.type(input, "0")
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("shows prefix and suffix inside the field and reads them in the value text", () => {
    render(<NumberInput label="Área" suffix="m²" decimals={2} defaultValue={72.5} />)
    const input = screen.getByRole("spinbutton", { name: "Área" })
    expect(screen.getByText("m²")).toHaveAttribute("data-slot", "number-input-suffix")
    expect(input).toHaveAttribute("aria-valuetext", "72,5 m²")
  })

  it("steppers step without taking focus and stop at the edges", async () => {
    render(<NumberInput label="Vagas" min={0} max={2} defaultValue={1} steppers />)
    const input = screen.getByRole("spinbutton", { name: "Vagas" })
    input.focus()
    const plus = screen.getByRole("button", { name: "Aumentar" })
    expect(plus).toHaveAttribute("tabindex", "-1")
    expect(plus).toHaveAttribute("aria-controls", input.id)
    fireEvent.pointerDown(plus, { button: 0 })
    fireEvent.pointerUp(plus)
    expect(input).toHaveFocus()
    expect(input).toHaveValue("2")
    expect(plus).toBeDisabled()
    fireEvent.pointerDown(screen.getByRole("button", { name: "Diminuir" }), { button: 0 })
    fireEvent.pointerUp(screen.getByRole("button", { name: "Diminuir" }))
    expect(input).toHaveValue("1")
  })

  it("a held stepper repeats until released", () => {
    vi.useFakeTimers()
    render(<NumberInput label="Vagas" defaultValue={0} steppers />)
    const plus = screen.getByRole("button", { name: "Aumentar" })
    fireEvent.pointerDown(plus, { button: 0 })
    act(() => {
      vi.advanceTimersByTime(400 + 80 * 5)
    })
    fireEvent.pointerUp(plus)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByRole("spinbutton")).toHaveAttribute("aria-valuenow", "6")
    vi.useRealTimers()
  })

  it("steppers are named buttons a click (keyboard or screen reader) also steps", () => {
    render(
      <NumberInput label="Vagas" defaultValue={1} steppers labels={{ increment: "Mais uma" }} />,
    )
    fireEvent.click(screen.getByRole("button", { name: "Mais uma" }), { detail: 0 })
    expect(screen.getByRole("spinbutton")).toHaveAttribute("aria-valuenow", "2")
  })

  it("the wheel never changes the value", () => {
    render(<NumberInput label="Andar" defaultValue={5} />)
    const input = screen.getByRole("spinbutton", { name: "Andar" })
    input.focus()
    fireEvent.wheel(input, { deltaY: -100 })
    expect(input).toHaveValue("5")
  })

  it("sends the raw number with a dot under name", () => {
    const { container } = render(
      <form>
        <NumberInput label="Área" name="area" decimals={2} defaultValue={1250.5} />
      </form>,
    )
    const form = container.querySelector("form") as HTMLFormElement
    expect(new FormData(form).get("area")).toBe("1250.5")
    expect(screen.getByRole("spinbutton")).not.toHaveAttribute("name")
  })

  it("readOnly and disabled: no stepping", async () => {
    const { rerender } = render(<NumberInput label="Andar" defaultValue={5} readOnly steppers />)
    const input = screen.getByRole("spinbutton", { name: "Andar" })
    input.focus()
    await userEvent.keyboard("{ArrowUp}")
    expect(input).toHaveValue("5")
    expect(screen.getByRole("button", { name: "Aumentar" })).toBeDisabled()
    rerender(<NumberInput label="Andar" defaultValue={5} disabled />)
    expect(screen.getByRole("spinbutton")).toBeDisabled()
  })

  it("description and error are wired, and required is native", () => {
    render(
      <NumberInput
        label="Andar"
        description="Do térreo à cobertura."
        error="Informe o andar."
        required
      />,
    )
    const input = screen.getByRole("spinbutton", { name: /Andar/ })
    expect(input).toHaveAccessibleDescription("Do térreo à cobertura. Informe o andar.")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toBeRequired()
  })

  it("uses the numeric keyboard, decimal with places, text when negatives are allowed", () => {
    const { rerender } = render(<NumberInput label="N" />)
    expect(screen.getByRole("spinbutton")).toHaveAttribute("inputmode", "numeric")
    rerender(<NumberInput label="N" decimals={2} />)
    expect(screen.getByRole("spinbutton")).toHaveAttribute("inputmode", "decimal")
    rerender(<NumberInput label="N" min={-10} />)
    expect(screen.getByRole("spinbutton")).toHaveAttribute("inputmode", "text")
  })

  it("follows a controlled value, also while focused", async () => {
    function Controlled() {
      const [value, setValue] = React.useState<number | null>(10)
      return (
        <>
          <NumberInput label="Andar" value={value} onValueChange={setValue} />
          <button type="button" onClick={() => setValue(null)}>
            Limpar
          </button>
        </>
      )
    }
    render(<Controlled />)
    const input = screen.getByRole("spinbutton", { name: "Andar" })
    await userEvent.type(input, "5")
    expect(input).toHaveValue("105")
    fireEvent.click(screen.getByRole("button", { name: "Limpar" }))
    expect(input).toHaveValue("")
  })

  it("forwards the ref to the input", () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<NumberInput label="Andar" ref={ref} />)
    expect(ref.current).toBe(screen.getByRole("spinbutton"))
  })

  it.each([
    ["max", "500", "O valor máximo é 50."],
    ["min", "1", "O valor mínimo é 5."],
  ])("does not submit a value past %s when Enter is pressed", async (_, typed, message) => {
    const sent = vi.fn()
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault()
          sent(new FormData(event.currentTarget).get("andares"))
        }}
      >
        <NumberInput label="Andares" name="andares" min={5} max={50} />
        <button type="submit">Enviar</button>
      </form>,
    )
    const input = screen.getByRole("spinbutton")
    await userEvent.type(input, `${typed}{Enter}`)
    expect(sent).not.toHaveBeenCalled()
    expect(input).toHaveValue(typed)
    expect(screen.getByRole("alert")).toHaveTextContent(message)
    await userEvent.clear(input)
    await userEvent.type(input, "20{Enter}")
    expect(sent).toHaveBeenCalledWith("20")
  })
})
