import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Textarea } from "./textarea"

describe("Textarea", () => {
  it("renders a <textarea> element with placeholder", () => {
    render(<Textarea placeholder="Mensagem" />)
    const el = screen.getByPlaceholderText("Mensagem")
    expect(el).toBeInTheDocument()
    expect(el.tagName).toBe("TEXTAREA")
  })
})
