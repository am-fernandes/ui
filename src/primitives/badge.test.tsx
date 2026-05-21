import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

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
})
