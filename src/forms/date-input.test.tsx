import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { DateInput } from "./date-input"

vi.setConfig({ testTimeout: 20000 })

function Controlled({
  initial = "",
  onChangeSpy,
  ...props
}: Omit<React.ComponentProps<typeof DateInput>, "value" | "onValueChange"> & {
  initial?: string
  onChangeSpy?: (value: string) => void
}) {
  const [value, setValue] = React.useState(initial)
  return (
    <>
      <DateInput
        label="Data de nascimento"
        {...props}
        value={value}
        onValueChange={(next) => {
          onChangeSpy?.(next)
          setValue(next)
        }}
      />
      <output data-testid="iso">{value}</output>
      <button type="button">Fora</button>
    </>
  )
}

const input = () => screen.getByRole("textbox")

describe("DateInput", () => {
  it("is a text field named by its label, with the dd/mm/aaaa placeholder", () => {
    render(<DateInput label="Data de entrega" value="" />)
    const field = screen.getByRole("textbox", { name: "Data de entrega" })
    expect(field).toHaveAttribute("placeholder", "dd/mm/aaaa")
    expect(field).toHaveAttribute("inputmode", "numeric")
  })

  it("accepts a custom placeholder", () => {
    render(<DateInput value="" placeholder="Escolha a data" />)
    expect(input()).toHaveAttribute("placeholder", "Escolha a data")
  })

  it("shows an ISO value as dd/mm/aaaa in the field", () => {
    render(<DateInput label="Data" value="2025-03-14" />)
    expect(input()).toHaveValue("14/03/2025")
  })

  it("shows an empty field for a value that is not a date", () => {
    render(<DateInput label="Data" value="not-a-date" />)
    expect(input()).toHaveValue("")
  })

  it("typing 15031990 shows 15/03/1990 and reports the ISO date once complete", async () => {
    const spy = vi.fn()
    render(<Controlled onChangeSpy={spy} />)
    await userEvent.type(input(), "1503199")
    expect(input()).toHaveValue("15/03/199")
    // Nothing is reported while the date is incomplete.
    expect(spy).not.toHaveBeenCalled()
    await userEvent.type(input(), "0")
    expect(input()).toHaveValue("15/03/1990")
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith("1990-03-15")
  })

  it("the accessible name comes from the label and the value is read from the field", () => {
    render(
      <DateInput
        label={
          <span>
            Data <em>de nascimento</em>
          </span>
        }
        required
        value="1990-03-15"
      />,
    )
    const field = screen.getByRole("textbox", { name: /Data de nascimento/ })
    expect(field).not.toHaveAttribute("aria-label")
    expect(field).toHaveValue("15/03/1990")
  })

  it("a consumer aria-label names the field", () => {
    render(<DateInput value="" aria-label="Data da visita" />)
    expect(screen.getByRole("textbox", { name: "Data da visita" })).toBeInTheDocument()
  })

  it("without label or aria-label the field is still named", () => {
    render(<DateInput value="" />)
    expect(screen.getByRole("textbox", { name: "Data" })).toBeInTheDocument()
  })

  it("leaving an incomplete date marks the field invalid and reports an empty value", async () => {
    const spy = vi.fn()
    render(<Controlled initial="2025-03-14" onChangeSpy={spy} />)
    await userEvent.clear(input())
    spy.mockClear()
    await userEvent.type(input(), "1503")
    await userEvent.click(screen.getByRole("button", { name: "Fora" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Data inválida")
    expect(input()).toHaveAttribute("aria-invalid", "true")
    // The typed text stays, to be fixed.
    expect(input()).toHaveValue("15/03")
    expect(screen.getByTestId("iso")).toHaveTextContent("")
  })

  it("an impossible date (31/02/2026) is invalid on blur", async () => {
    const spy = vi.fn()
    render(<Controlled onChangeSpy={spy} />)
    await userEvent.type(input(), "31022026")
    expect(spy).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole("button", { name: "Fora" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Data inválida")
    expect(spy).not.toHaveBeenCalledWith(expect.stringMatching(/\d/))
  })

  it("fixing the date clears the error", async () => {
    render(<Controlled />)
    await userEvent.type(input(), "3102")
    await userEvent.click(screen.getByRole("button", { name: "Fora" }))
    expect(screen.getByRole("alert")).toBeInTheDocument()
    await userEvent.clear(input())
    await userEvent.type(input(), "28022026")
    expect(screen.queryByRole("alert")).toBeNull()
    expect(screen.getByTestId("iso")).toHaveTextContent("2026-02-28")
  })

  it("the consumer's error wins over the field's own message", async () => {
    render(<Controlled error="Informe a data" />)
    await userEvent.type(input(), "15")
    await userEvent.click(screen.getByRole("button", { name: "Fora" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Informe a data")
  })

  it("the invalid-date message can be changed through labels", async () => {
    render(<Controlled labels={{ invalidDate: "Confira a data" }} />)
    await userEvent.type(input(), "15")
    await userEvent.click(screen.getByRole("button", { name: "Fora" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Confira a data")
  })

  it("moving from the field to the calendar button does not validate", async () => {
    render(<Controlled />)
    await userEvent.type(input(), "15")
    await userEvent.tab()
    expect(screen.getByRole("button", { name: "Abrir calendário" })).toHaveFocus()
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("pasting a date in any common format fills the field", () => {
    const spy = vi.fn()
    render(<Controlled onChangeSpy={spy} />)
    const field = input()
    field.focus()
    fireEvent.paste(field, { clipboardData: { getData: () => "Nascimento: 1990-03-15" } })
    expect(field).toHaveValue("15/03/1990")
    expect(spy).toHaveBeenLastCalledWith("1990-03-15")
    fireEvent.paste(field, { clipboardData: { getData: () => "14/02/2001" } })
    expect(field).toHaveValue("14/02/2001")
    expect(spy).toHaveBeenLastCalledWith("2001-02-14")
  })

  it("the calendar button opens a dialog named after the label", async () => {
    render(<DateInput label="Data de entrega" value="" />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir calendário" }))
    expect(await screen.findByRole("dialog", { name: "Data de entrega" })).toBeInTheDocument()
    expect(screen.getByRole("grid")).toBeInTheDocument()
  })

  it("picking a day reports its ISO date, fills the field and closes the calendar", async () => {
    const spy = vi.fn()
    render(<Controlled initial="2025-03-14" onChangeSpy={spy} />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir calendário" }))
    await screen.findByRole("grid")
    const day = document.querySelector<HTMLButtonElement>('button[data-day="2025-03-20"]')
    if (!day) throw new Error("day not found")
    await userEvent.click(day)
    expect(spy).toHaveBeenLastCalledWith("2025-03-20")
    expect(input()).toHaveValue("20/03/2025")
    await waitFor(() => expect(screen.queryByRole("grid")).toBeNull())
  })

  it("the calendar opens with the chosen day focused, and Enter on it keeps the date", async () => {
    const spy = vi.fn()
    render(<Controlled initial="2025-03-14" onChangeSpy={spy} />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir calendário" }))
    await screen.findByRole("grid")
    const chosen = document.querySelector<HTMLButtonElement>('button[data-day="2025-03-14"]')
    await waitFor(() => expect(chosen).toHaveFocus())
    await userEvent.keyboard("{Enter}")
    expect(spy).not.toHaveBeenCalledWith("")
    expect(screen.getByTestId("iso")).toHaveTextContent("2025-03-14")
  })

  it("renders the error and wires aria-invalid and aria-describedby on the field", () => {
    render(
      <DateInput value="" label="Data" error="obrigatório" description="Escolha um dia útil" />,
    )
    const field = input()
    expect(field).toHaveAttribute("aria-invalid", "true")
    const ids = (field.getAttribute("aria-describedby") ?? "").split(" ")
    expect(ids).toHaveLength(2)
    expect(screen.getByRole("alert")).toHaveTextContent("obrigatório")
  })

  it("disabled: the field and the calendar button are disabled", async () => {
    render(<DateInput value="2025-03-14" disabled />)
    expect(input()).toBeDisabled()
    const button = screen.getByRole("button", { name: "Abrir calendário" })
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(screen.queryByRole("grid")).toBeNull()
  })

  it("reports through onValueChange, and still through the deprecated onChange", async () => {
    const onValueChange = vi.fn()
    const onChange = vi.fn()
    render(<DateInput label="Data" value="" onValueChange={onValueChange} onChange={onChange} />)
    await userEvent.type(input(), "01022024")
    expect(onValueChange).toHaveBeenCalledWith("2024-02-01")
    expect(onChange).toHaveBeenCalledWith("2024-02-01")
  })

  it("forwards the ref to the text field", () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<DateInput value="" ref={ref} />)
    expect(ref.current).toBe(input())
  })

  it("puts the consumer's id on the text field", () => {
    render(<DateInput id="my-date" value="" />)
    expect(input()).toHaveAttribute("id", "my-date")
  })
})
