import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Textarea } from "./textarea"

describe("Textarea", () => {
  it("renders label associated with textarea", () => {
    render(<Textarea label="Descrição" />)
    const ta = screen.getByLabelText("Descrição")
    expect(ta.tagName).toBe("TEXTAREA")
  })

  it("renders description and error", () => {
    render(<Textarea label="X" description="ajuda" error="erro" />)
    expect(screen.getByText("ajuda")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("erro")
    expect(screen.getByLabelText("X")).toHaveAttribute("aria-invalid", "true")
  })

  it("renders maxLength counter when set", () => {
    render(<Textarea label="X" maxLength={100} value="abc" onChange={() => {}} />)
    expect(screen.getByText("3/100")).toBeInTheDocument()
  })

  it("forwards onChange", () => {
    const onChange = vi.fn()
    render(<Textarea label="X" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText("X"), { target: { value: "abc" } })
    expect(onChange).toHaveBeenCalled()
  })

  it("forwards ref", () => {
    let captured: HTMLTextAreaElement | null = null
    render(
      <Textarea
        label="X"
        ref={(el) => {
          captured = el
        }}
      />,
    )
    expect(captured).toBeInstanceOf(HTMLTextAreaElement)
  })

  it("respects disabled and readOnly", () => {
    const { rerender } = render(<Textarea label="X" disabled />)
    expect(screen.getByLabelText("X")).toBeDisabled()
    rerender(<Textarea label="X" readOnly />)
    expect(screen.getByLabelText("X")).toHaveAttribute("readonly")
  })
})
