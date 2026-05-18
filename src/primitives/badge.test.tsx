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

  it("renders outline variant", () => {
    render(<Badge variant="outline">Outline</Badge>)
    expect(screen.getByText("Outline")).toHaveClass("border")
  })
})
