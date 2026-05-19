import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
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

  it("uncontrolled counter updates as user types (defaultValue path)", async () => {
    render(<Textarea label="X" maxLength={50} defaultValue="hi" />)
    expect(screen.getByText("2/50")).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText("X"), "!!")
    expect(screen.getByText("4/50")).toBeInTheDocument()
  })

  it("autoResize sets inline height after value change", () => {
    // Define scrollHeight so jsdom returns a non-zero number — verifies
    // the effect copies scrollHeight into style.height.
    const proto = HTMLTextAreaElement.prototype as unknown as { scrollHeight?: number }
    const originalDescriptor = Object.getOwnPropertyDescriptor(proto, "scrollHeight")
    Object.defineProperty(proto, "scrollHeight", {
      configurable: true,
      get() {
        return 123
      },
    })
    try {
      const { rerender } = render(<Textarea label="X" autoResize value="" onChange={() => {}} />)
      const el = screen.getByLabelText("X") as HTMLTextAreaElement
      expect(el.className).toContain("resize-none")
      expect(el.className).toContain("overflow-hidden")
      // Trigger effect with new value to force height recompute.
      rerender(<Textarea label="X" autoResize value="multi\nline" onChange={() => {}} />)
      expect(el.style.height).toBe("123px")
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(proto, "scrollHeight", originalDescriptor)
      } else {
        Reflect.deleteProperty(proto, "scrollHeight")
      }
    }
  })

  it("does NOT add autoResize classes when autoResize is omitted", () => {
    render(<Textarea label="X" />)
    const el = screen.getByLabelText("X")
    expect(el.className).not.toContain("resize-none")
    expect(el.className).not.toContain("overflow-hidden")
  })

  it("supports labelPosition variants", () => {
    const { rerender } = render(<Textarea label="X" labelPosition="left" />)
    expect(document.querySelector('[data-slot="field-shell"]')).toHaveAttribute(
      "data-label-position",
      "left",
    )
    rerender(<Textarea label="X" labelPosition="hidden" />)
    expect(document.querySelector('[data-slot="field-shell"]')).toHaveAttribute(
      "data-label-position",
      "hidden",
    )
  })

  it("accepts a MutableRefObject (not just a callback) ref", () => {
    const ref = React.createRef<HTMLTextAreaElement>()
    render(<Textarea label="X" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it("controlled value renders correctly with null/undefined fallback", () => {
    // value=undefined is the uncontrolled branch — already covered. Here we
    // exercise the controlled path with empty string to hit the `value ?? ""`
    // branch in the counter.
    render(<Textarea label="X" maxLength={10} value={""} onChange={() => {}} />)
    expect(screen.getByText("0/10")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    render(<Textarea label="X" className="my-ta" />)
    expect(screen.getByLabelText("X")).toHaveClass("my-ta")
  })
})
