import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

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

  it("emits data-slot=input", () => {
    render(<Input placeholder="x" />)
    expect(screen.getByPlaceholderText("x")).toHaveAttribute("data-slot", "input")
  })

  it("disabled blocks typing", async () => {
    render(<Input disabled placeholder="x" />)
    const input = screen.getByPlaceholderText("x") as HTMLInputElement
    await userEvent.type(input, "abc")
    expect(input.value).toBe("")
  })

  it("readOnly blocks typing", async () => {
    render(<Input readOnly defaultValue="seed" placeholder="x" />)
    const input = screen.getByPlaceholderText("x") as HTMLInputElement
    await userEvent.type(input, "abc")
    expect(input.value).toBe("seed")
  })

  it("supports controlled value + onChange", async () => {
    function Controlled() {
      const [value, setValue] = useState("")
      return (
        <Input
          placeholder="ctrl"
          value={value}
          onChange={(e) => setValue(e.currentTarget.value.toUpperCase())}
        />
      )
    }
    render(<Controlled />)
    const input = screen.getByPlaceholderText("ctrl") as HTMLInputElement
    await userEvent.type(input, "abc")
    expect(input.value).toBe("ABC")
  })

  it("calls onChange handler with event", async () => {
    const onChange = vi.fn()
    render(<Input placeholder="x" onChange={onChange} />)
    await userEvent.type(screen.getByPlaceholderText("x"), "a")
    expect(onChange).toHaveBeenCalled()
  })

  it("applies aria-invalid styling utility class", () => {
    render(<Input placeholder="x" aria-invalid={true} />)
    const input = screen.getByPlaceholderText("x")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input.className).toMatch(/aria-invalid:border-destructive/)
  })

  it("forwards ref to underlying input", () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Input ref={ref} placeholder="x" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
