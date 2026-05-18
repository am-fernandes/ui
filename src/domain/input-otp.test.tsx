import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
} from "./input-otp"

afterEach(() => {
  // input-otp queues a deferred setSelectionRange via setTimeout; ensure timers
  // and DOM are torn down before the next file runs, to avoid the
  // "window is not defined" unhandled exception after env teardown.
  cleanup()
})

function SixDigitOTP({
  onComplete,
  onChange,
  pattern,
}: {
  onComplete?: (code: string) => void
  onChange?: (next: string) => void
  pattern?: string
}) {
  const [value, setValue] = React.useState("")
  return (
    <InputOTP
      maxLength={6}
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange?.(next)
      }}
      onComplete={onComplete}
      pattern={pattern}
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}

describe("InputOTP", () => {
  it("renders the requested number of slots", () => {
    const { container } = render(
      <InputOTP maxLength={4}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>,
    )
    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]')
    expect(slots).toHaveLength(4)
  })

  it("exposes the underlying input", () => {
    const { container } = render(
      <InputOTP maxLength={4}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
        </InputOTPGroup>
      </InputOTP>,
    )
    expect(container.querySelector("input")).toBeTruthy()
    // input-otp library renders an invisible input that takes the maxLength
    expect(screen.getByRole("textbox").getAttribute("maxlength")).toBe("4")
  })

  it("re-exports REGEXP_ONLY_DIGITS from input-otp", () => {
    expect(REGEXP_ONLY_DIGITS).toBe("^\\d+$")
  })

  it("InputOTPSeparator renders", () => {
    const { container } = render(<InputOTPSeparator />)
    expect(container.querySelector('[data-slot="input-otp-separator"]')).toBeTruthy()
  })

  it("defaults pattern to REGEXP_ONLY_DIGITS — a non-digit string is rejected on change", () => {
    const onChange = vi.fn()
    render(<SixDigitOTP onChange={onChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "abc" } })
    // input-otp filters out values that don't match `pattern`, so onChange
    // should never see the alphabetic value.
    expect(onChange).not.toHaveBeenCalledWith("abc")
  })

  it("entering a 6-digit code fires onComplete with the full value", () => {
    const onComplete = vi.fn()
    render(<SixDigitOTP onComplete={onComplete} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "123456" } })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith("123456")
  })

  it("a partial 3-digit value populates the first 3 slots but does not complete", () => {
    const onComplete = vi.fn()
    const onChange = vi.fn()
    const { container } = render(<SixDigitOTP onComplete={onComplete} onChange={onChange} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "123" } })
    expect(onComplete).not.toHaveBeenCalled()
    expect(onChange).toHaveBeenLastCalledWith("123")
    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]')
    expect(slots[0]?.textContent).toContain("1")
    expect(slots[1]?.textContent).toContain("2")
    expect(slots[2]?.textContent).toContain("3")
  })

  it("data-active is omitted (rather than 'false') when slot is inactive", () => {
    const { container } = render(
      <InputOTP maxLength={2}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    )
    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]')
    for (const s of slots) {
      // attribute should be missing entirely, never the literal string "false"
      expect(s.getAttribute("data-active")).not.toBe("false")
    }
  })

  it("can override the default digits-only pattern", () => {
    const onChange = vi.fn()
    render(<SixDigitOTP onChange={onChange} pattern="^[a-zA-Z0-9]+$" />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "abc" } })
    expect(onChange).toHaveBeenLastCalledWith("abc")
  })
})
