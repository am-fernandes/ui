import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { Textarea } from "./textarea"

describe("Textarea", () => {
  it("renders a <textarea> element with placeholder", () => {
    render(<Textarea placeholder="Mensagem" />)
    const el = screen.getByPlaceholderText("Mensagem")
    expect(el).toBeInTheDocument()
    expect(el.tagName).toBe("TEXTAREA")
  })

  it("emits data-slot=textarea", () => {
    render(<Textarea placeholder="x" />)
    expect(screen.getByPlaceholderText("x")).toHaveAttribute("data-slot", "textarea")
  })

  it("accepts typed input", async () => {
    render(<Textarea placeholder="x" />)
    const el = screen.getByPlaceholderText("x") as HTMLTextAreaElement
    await userEvent.type(el, "hello\nworld")
    expect(el.value).toBe("hello\nworld")
  })

  it("disabled blocks typing", async () => {
    render(<Textarea disabled placeholder="x" />)
    const el = screen.getByPlaceholderText("x") as HTMLTextAreaElement
    await userEvent.type(el, "abc")
    expect(el.value).toBe("")
  })

  it("readOnly blocks typing", async () => {
    render(<Textarea readOnly defaultValue="seed" placeholder="x" />)
    const el = screen.getByPlaceholderText("x") as HTMLTextAreaElement
    await userEvent.type(el, "abc")
    expect(el.value).toBe("seed")
  })

  it("supports controlled value + onChange", async () => {
    function Controlled() {
      const [value, setValue] = useState("")
      return (
        <Textarea
          placeholder="ctrl"
          value={value}
          onChange={(e) => setValue(e.currentTarget.value.toUpperCase())}
        />
      )
    }
    render(<Controlled />)
    const el = screen.getByPlaceholderText("ctrl") as HTMLTextAreaElement
    await userEvent.type(el, "abc")
    expect(el.value).toBe("ABC")
  })

  it("applies aria-invalid styling utility class", () => {
    render(<Textarea placeholder="x" aria-invalid={true} />)
    const el = screen.getByPlaceholderText("x")
    expect(el).toHaveAttribute("aria-invalid", "true")
    expect(el.className).toMatch(/aria-invalid:border-destructive/)
  })

  it("includes focus-ring base class focus-visible:ring-1", () => {
    render(<Textarea placeholder="x" />)
    const el = screen.getByPlaceholderText("x")
    expect(el).toHaveClass("focus-visible:ring-1")
    expect(el).toHaveClass("focus-visible:ring-ring")
  })

  it("forwards ref to underlying textarea", () => {
    const ref = { current: null as HTMLTextAreaElement | null }
    render(<Textarea ref={ref} placeholder="x" />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })
})
