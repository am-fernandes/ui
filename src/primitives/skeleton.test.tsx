import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Skeleton } from "./skeleton"

describe("Skeleton", () => {
  it("renders a div with animate-pulse class", () => {
    const { container } = render(<Skeleton data-testid="skeleton" />)
    const el = container.firstChild as HTMLElement
    expect(el).toBeInTheDocument()
    expect(el.tagName).toBe("DIV")
    expect(el).toHaveClass("animate-pulse")
  })

  it("emits default a11y attributes (role=status, aria-live=polite, aria-busy=true)", () => {
    render(<Skeleton data-testid="sk" />)
    const el = screen.getByTestId("sk")
    expect(el).toHaveAttribute("role", "status")
    expect(el).toHaveAttribute("aria-live", "polite")
    expect(el).toHaveAttribute("aria-busy", "true")
    expect(el).toHaveAttribute("data-slot", "skeleton")
  })

  it("allows consumer to override a11y defaults", () => {
    render(<Skeleton role="presentation" aria-live="off" aria-busy={false} data-testid="sk" />)
    const el = screen.getByTestId("sk")
    expect(el).toHaveAttribute("role", "presentation")
    expect(el).toHaveAttribute("aria-live", "off")
    expect(el).toHaveAttribute("aria-busy", "false")
  })

  it("merges consumer className (override wins for conflicting tw classes)", () => {
    render(<Skeleton className="rounded-none" data-testid="sk" />)
    const el = screen.getByTestId("sk")
    expect(el).toHaveClass("rounded-none")
    expect(el).not.toHaveClass("rounded-md")
    expect(el).toHaveClass("animate-pulse")
  })
})
