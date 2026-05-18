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
})
