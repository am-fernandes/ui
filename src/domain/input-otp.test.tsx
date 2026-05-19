import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { OTPInputContext } from "input-otp"
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

  it("renders consistent slot count with the requested length (Slot fallback path)", () => {
    // The component renders with `render={() => ...}`, which means input-otp does
    // not provide an OTPInputContext value — the Slot component falls back to its
    // default `{ char: undefined, hasFakeCaret: false, isActive: false }` shape.
    // This test exercises that fallback branch by relying on the public surface.
    const { container } = render(<InputOTP length={5} value="ab" onValueChange={() => {}} />)
    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]')
    expect(slots).toHaveLength(5)
    // Caret/active state is not rendered (fallback hasFakeCaret=false / isActive=false).
    expect(container.querySelectorAll(".animate-caret-blink")).toHaveLength(0)
    for (const slot of slots) {
      expect(slot.getAttribute("data-active")).toBeNull()
    }
  })

  it("renders the fake caret and active state when the OTPInputContext provides slot info", () => {
    // The wrapper sets `render={() => ...}` so the input-otp library does NOT
    // create its own Provider. That means an externally-provided context value
    // is what Slot will read — covering the slot.char / slot.isActive /
    // slot.hasFakeCaret branches that would otherwise be unreachable.
    const ctx = {
      slots: [
        { char: "9", placeholderChar: null, isActive: true, hasFakeCaret: true },
        { char: null, placeholderChar: null, isActive: false, hasFakeCaret: false },
      ],
      isFocused: true,
      isHovering: false,
    }
    const { container } = render(
      <OTPInputContext.Provider value={ctx}>
        <InputOTP length={2} value="9" onValueChange={() => {}} />
      </OTPInputContext.Provider>,
    )
    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]')
    expect(slots[0]?.textContent).toContain("9")
    expect(slots[0]?.getAttribute("data-active")).toBe("true")
    expect(container.querySelectorAll(".animate-caret-blink").length).toBeGreaterThan(0)
  })
})
