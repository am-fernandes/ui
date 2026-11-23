import { render, screen } from "@testing-library/react"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { Badge } from "./badge"

describe("Badge", () => {
  it("renders default variant", () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText("Default")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-primary")
  })

  it("renders secondary variant", () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    expect(screen.getByText("Secondary")).toHaveClass("bg-secondary")
  })

  it("renders destructive variant", () => {
    render(<Badge variant="destructive">Destructive</Badge>)
    expect(screen.getByText("Destructive")).toHaveClass("bg-destructive")
  })

  it("renders info variant", () => {
    render(<Badge variant="info">Info</Badge>)
    expect(screen.getByText("Info")).toHaveClass("bg-info")
    expect(screen.getByText("Info")).toHaveClass("text-info-foreground")
  })

  it("renders success variant", () => {
    render(<Badge variant="success">Success</Badge>)
    expect(screen.getByText("Success")).toHaveClass("bg-success")
    expect(screen.getByText("Success")).toHaveClass("text-success-foreground")
  })

  it("renders warning variant", () => {
    render(<Badge variant="warning">Warning</Badge>)
    expect(screen.getByText("Warning")).toHaveClass("bg-warning")
    expect(screen.getByText("Warning")).toHaveClass("text-warning-foreground")
  })

  it("renders outline variant", () => {
    render(<Badge variant="outline">Outline</Badge>)
    expect(screen.getByText("Outline")).toHaveClass("border")
  })

  it("dot: paints only the dot in the variant colour and inherits the text colour", () => {
    render(
      <Badge variant="success" dot>
        Aprovado
      </Badge>,
    )
    const badge = screen.getByText("Aprovado")
    expect(badge).toHaveAttribute("data-dot", "true")
    expect(badge).toHaveClass("before:bg-success", "bg-transparent", "text-inherit")
    expect(badge).not.toHaveClass("bg-success")
    expect(badge).not.toHaveClass("text-success-foreground")
  })

  it("dot: the default variant uses the primary", () => {
    render(<Badge dot>Ativo</Badge>)
    expect(screen.getByText("Ativo")).toHaveClass("before:bg-primary")
  })

  it("renders as child element when asChild is true", () => {
    render(
      <Badge asChild>
        <a href="/tag">Tag</a>
      </Badge>,
    )
    const link = screen.getByRole("link", { name: "Tag" })
    expect(link.tagName).toBe("A")
    expect(link).toHaveAttribute("href", "/tag")
    expect(link).toHaveAttribute("data-slot", "badge")
    expect(link).toHaveClass("bg-primary")
  })

  // A <div> inside a <p> (a badge in a sentence) is invalid HTML: React
  // reports it and the server markup does not hydrate.
  it("is a <span>, so it can sit inside a paragraph", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const ref = React.createRef<HTMLSpanElement>()
    render(
      <p>
        Proposta{" "}
        <Badge ref={ref} variant="success">
          Aprovada
        </Badge>{" "}
        ontem.
      </p>,
    )
    expect(screen.getByText("Aprovada").tagName).toBe("SPAN")
    expect(ref.current).toBe(screen.getByText("Aprovada"))
    expect(error).not.toHaveBeenCalled()
    error.mockRestore()
  })
})
