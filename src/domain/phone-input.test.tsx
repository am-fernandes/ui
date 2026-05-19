import { fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { PhoneInput } from "./phone-input"

function ControlledPhoneInput({ initial = "" }: { initial?: string }) {
  const [value, setValue] = React.useState(initial)
  return <PhoneInput value={value} onValueChange={setValue} />
}

describe("PhoneInput", () => {
  it("renders an 11-digit value as a mobile mask", () => {
    render(<PhoneInput value="11987654321" onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("(11) 98765-4321")).toBeInTheDocument()
  })

  it("renders a 10-digit value as a landline mask", () => {
    render(<PhoneInput value="1133334444" onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("(11) 3333-4444")).toBeInTheDocument()
  })

  it("renders empty value as empty string", () => {
    render(<PhoneInput value="" onValueChange={vi.fn()} />)
    expect(screen.getByRole("textbox")).toHaveValue("")
  })

  it("emits only cleaned digits when user types a fully masked mobile value", () => {
    const onValueChange = vi.fn()
    render(<PhoneInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "(11) 98765-4321" } })
    expect(onValueChange).toHaveBeenLastCalledWith("11987654321")
  })

  it("emits cleaned digits when user types raw digits", () => {
    const onValueChange = vi.fn()
    render(<PhoneInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "11987654321" } })
    expect(onValueChange).toHaveBeenLastCalledWith("11987654321")
  })

  it("strips non-digit characters from pasted input", () => {
    const onValueChange = vi.fn()
    render(<PhoneInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "+55 (11) 98765-4321" } })
    // Cleaned digits are capped at 11; "+55..." prepends 5 digits before the DDD.
    // Spec: max 11 digits after stripping.
    const last = onValueChange.mock.calls.at(-1)?.[0]
    expect(last).toHaveLength(11)
  })

  it("reformats a pasted masked landline string in a controlled wrapper", () => {
    render(<ControlledPhoneInput />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "(11) 3333-4444" } })
    expect(screen.getByDisplayValue("(11) 3333-4444")).toBeInTheDocument()
  })

  it("reformats a pasted masked mobile string in a controlled wrapper", () => {
    render(<ControlledPhoneInput />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "(11) 98765-4321" } })
    expect(screen.getByDisplayValue("(11) 98765-4321")).toBeInTheDocument()
  })

  it("caps cleaned digits at 11", () => {
    const onValueChange = vi.fn()
    render(<PhoneInput value="" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "1198765432199" } })
    expect(onValueChange).toHaveBeenLastCalledWith("11987654321")
  })

  it("formats partial input progressively", () => {
    render(<PhoneInput value="119" onValueChange={vi.fn()} />)
    expect(screen.getByDisplayValue("(11) 9")).toBeInTheDocument()
  })

  it("sets aria-invalid and renders error message when error prop is provided", () => {
    render(
      <PhoneInput value="" onValueChange={vi.fn()} label="Telefone" error="Telefone inválido" />,
    )
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("alert")).toHaveTextContent("Telefone inválido")
  })

  it("does not set aria-invalid when error is empty string", () => {
    render(<PhoneInput value="" onValueChange={vi.fn()} label="Telefone" error="" />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).not.toHaveAttribute("aria-invalid")
  })

  it("wires aria-describedby to both description and error ids", () => {
    render(
      <PhoneInput
        value=""
        onValueChange={vi.fn()}
        label="Telefone"
        description="Inclua DDD"
        error="Telefone inválido"
      />,
    )
    const input = screen.getByRole("textbox") as HTMLInputElement
    const describedBy = input.getAttribute("aria-describedby")
    expect(describedBy?.split(" ")).toHaveLength(2)
  })

  it("forwards required and aria-required to the input", () => {
    render(<PhoneInput value="" onValueChange={vi.fn()} label="Telefone" required />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toBeRequired()
    expect(input).toHaveAttribute("aria-required", "true")
  })

  it("applies disabled state to the input", () => {
    render(<PhoneInput value="11987654321" onValueChange={vi.fn()} disabled />)
    const input = screen.getByDisplayValue("(11) 98765-4321") as HTMLInputElement
    expect(input).toBeDisabled()
  })

  it("uses inputMode tel", () => {
    render(<PhoneInput value="" onValueChange={vi.fn()} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toHaveAttribute("inputMode", "tel")
  })
})
