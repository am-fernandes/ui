import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Input } from "./input"

describe("Input", () => {
  it("renders with placeholder", () => {
    render(<Input placeholder="Type here" />)
    expect(screen.getByPlaceholderText("Type here")).toBeInTheDocument()
  })

  it("accepts typed input", async () => {
    render(<Input placeholder="Email" />)
    const input = screen.getByPlaceholderText("Email") as HTMLInputElement
    await userEvent.type(input, "hello@test.com")
    expect(input.value).toBe("hello@test.com")
  })
})
