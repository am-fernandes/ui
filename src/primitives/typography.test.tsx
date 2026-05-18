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
})
