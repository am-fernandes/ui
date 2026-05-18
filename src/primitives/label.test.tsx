import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Label } from "./label"

describe("Label", () => {
  it("renders text and htmlFor attribute", () => {
    render(<Label htmlFor="email">Email</Label>)
    const label = screen.getByText("Email")
    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute("for", "email")
  })
})
