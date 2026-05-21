import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { InputOTP, REGEXP_ONLY_DIGITS } from "./input-otp"

afterEach(() => {
  cleanup()
})

describe("InputOTP", () => {
  it("renders the requested number of slots", () => {
    const { container } = render(<InputOTP length={4} value="" onValueChange={() => {}} />)
    expect(container.querySelectorAll('[data-slot="input-otp-slot"]')).toHaveLength(4)
  })

  it("renders the label and error", () => {
    render(
      <InputOTP length={4} value="" onValueChange={() => {}} label="Código" error="inválido" />,
    )
    expect(screen.getByText("Código")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("inválido")
  })

  it("re-exports REGEXP_ONLY_DIGITS", () => {
    expect(REGEXP_ONLY_DIGITS).toBe("^\\d+$")
  })

  it("fires onComplete when length reached", () => {
    const onComplete = vi.fn()
    function Wrapper() {
      const [v, setV] = React.useState("")
      return <InputOTP length={6} value={v} onValueChange={setV} onComplete={onComplete} />
    }
    render(<Wrapper />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "123456" } })
    expect(onComplete).toHaveBeenCalledWith("123456")
  })

  it("can override the default digits-only pattern", () => {
    function WithAlpha() {
      const [v, setV] = React.useState("")
      return <InputOTP length={6} value={v} onValueChange={setV} pattern="^[a-zA-Z0-9]+$" />
    }
    render(<WithAlpha />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "abc" } })
    expect(input.value).toBe("abc")
  })

  // -- Additional coverage tests below --------------------------------------

  it("does NOT fire onComplete for a partial value (length < required)", () => {
    const onComplete = vi.fn()
    function Wrapper() {
      const [v, setV] = React.useState("")
      return <InputOTP length={6} value={v} onValueChange={setV} onComplete={onComplete} />
    }
    render(<Wrapper />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "123" } })
    expect(onComplete).not.toHaveBeenCalled()
  })

  it("disabled flag is forwarded to the underlying OTPInput input element", () => {
    render(<InputOTP length={4} value="" onValueChange={() => {}} disabled />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toBeDisabled()
  })

  it("error renders the alert message via FieldShell", () => {
    render(<InputOTP length={4} value="" onValueChange={() => {}} error="bad" />)
    expect(screen.getByRole("alert")).toHaveTextContent("bad")
  })

  it("supports labelPosition='left'", () => {
    const { container } = render(
      <InputOTP length={4} value="" onValueChange={() => {}} label="Código" labelPosition="left" />,
    )
    const shell = container.querySelector("[data-slot='field-shell']")
    expect(shell).toHaveAttribute("data-label-position", "left")
  })

  it("supports labelPosition='hidden' (label is sr-only)", () => {
    render(
      <InputOTP
        length={4}
        value=""
        onValueChange={() => {}}
        label="Código"
        labelPosition="hidden"
      />,
    )
    const label = screen.getByText("Código")
    expect(label.className).toMatch(/sr-only/)
  })

  it("renders the description below the field", () => {
    render(<InputOTP length={4} value="" onValueChange={() => {}} description="Digite o código" />)
    expect(screen.getByText("Digite o código")).toBeInTheDocument()
  })

  it("custom non-digits pattern keeps onComplete behaviour", () => {
    const onComplete = vi.fn()
    function Wrapper() {
      const [v, setV] = React.useState("")
      return (
        <InputOTP
          length={3}
          value={v}
          onValueChange={setV}
          pattern="^[a-zA-Z]+$"
          onComplete={onComplete}
        />
      )
    }
    render(<Wrapper />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "abc" } })
    expect(onComplete).toHaveBeenCalledWith("abc")
  })

  it("renders consistent slot count with the requested length", () => {
    const { container } = render(<InputOTP length={5} value="ab" onValueChange={() => {}} />)
    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]')
    expect(slots).toHaveLength(5)
  })

  it("displays each typed character in its corresponding slot", () => {
    function Wrapper() {
      const [v, setV] = React.useState("")
      return <InputOTP length={4} value={v} onValueChange={setV} />
    }
    const { container } = render(<Wrapper />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "12" } })
    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]')
    expect(slots[0]?.textContent).toContain("1")
    expect(slots[1]?.textContent).toContain("2")
    expect(slots[2]?.textContent ?? "").not.toContain("1")
    expect(slots[2]?.textContent ?? "").not.toContain("2")
  })
})
