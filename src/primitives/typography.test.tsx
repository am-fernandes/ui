import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Typography } from "./typography"

describe("Typography", () => {
  it("renders display as h1 with display class", () => {
    render(<Typography variant="display">Hello</Typography>)
    const el = screen.getByText("Hello")
    expect(el.tagName).toBe("H1")
    expect(el).toHaveClass("text-4xl")
  })

  it("renders title as h2", () => {
    render(<Typography variant="title">Title</Typography>)
    const el = screen.getByText("Title")
    expect(el.tagName).toBe("H2")
    expect(el).toHaveClass("text-2xl")
  })

  it("renders subtitle as h3", () => {
    render(<Typography variant="subtitle">Sub</Typography>)
    const el = screen.getByText("Sub")
    expect(el.tagName).toBe("H3")
    expect(el).toHaveClass("text-lg")
  })

  it("renders body as p by default", () => {
    render(<Typography variant="body">Body</Typography>)
    const el = screen.getByText("Body")
    expect(el.tagName).toBe("P")
    expect(el).toHaveClass("text-sm")
  })

  it("renders caption as span", () => {
    render(<Typography variant="caption">Caption</Typography>)
    const el = screen.getByText("Caption")
    expect(el.tagName).toBe("SPAN")
    expect(el).toHaveClass("text-xs")
  })

  it("falls back to body variant (and <p>) when variant is omitted", () => {
    render(<Typography>Default</Typography>)
    const el = screen.getByText("Default")
    // body → <p> with text-sm leading-6.
    expect(el.tagName).toBe("P")
    expect(el).toHaveClass("text-sm", "leading-6")
  })

  it("respects `as` override", () => {
    render(
      <Typography variant="display" as="h3">
        Custom
      </Typography>,
    )
    const el = screen.getByText("Custom")
    expect(el.tagName).toBe("H3")
    // Variant class still applied
    expect(el).toHaveClass("text-4xl")
  })

  it("respects `as` override on a non-heading element", () => {
    render(
      <Typography variant="body" as="blockquote">
        Quote
      </Typography>,
    )
    const el = screen.getByText("Quote")
    expect(el.tagName).toBe("BLOCKQUOTE")
    expect(el).toHaveClass("text-sm")
  })

  it("respects `as` override to span/small/label/div", () => {
    const { rerender } = render(
      <Typography variant="caption" as="small">
        sm
      </Typography>,
    )
    expect(screen.getByText("sm").tagName).toBe("SMALL")
    rerender(
      <Typography variant="caption" as="label">
        lbl
      </Typography>,
    )
    expect(screen.getByText("lbl").tagName).toBe("LABEL")
    rerender(
      <Typography variant="caption" as="div">
        dv
      </Typography>,
    )
    expect(screen.getByText("dv").tagName).toBe("DIV")
  })

  it("merges custom className with the variant class", () => {
    render(
      <Typography variant="title" className="custom-tw">
        With CN
      </Typography>,
    )
    const el = screen.getByText("With CN")
    expect(el).toHaveClass("text-2xl")
    expect(el).toHaveClass("custom-tw")
  })

  it("forwards arbitrary HTML attributes (id, data-*)", () => {
    render(
      <Typography variant="body" id="my-id" data-testid="t1">
        Attrs
      </Typography>,
    )
    const el = screen.getByTestId("t1")
    expect(el).toHaveAttribute("id", "my-id")
  })
})
