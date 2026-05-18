import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { InputOTP, InputOTPGroup, InputOTPSlot } from "./input-otp"

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
})
