import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Card } from "./card"

describe("Card", () => {
  it("renders title + description + children + footer", () => {
    render(
      <Card title="T" description="D" footer={<button type="button">F</button>}>
        body
      </Card>,
    )
    expect(screen.getByText("T")).toBeInTheDocument()
    expect(screen.getByText("D")).toBeInTheDocument()
    expect(screen.getByText("body")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "F" })).toBeInTheDocument()
  })

  it("renders the title as a heading (h3)", () => {
    render(<Card title="Heading text">body</Card>)
    const heading = screen.getByRole("heading", { level: 3 })
    expect(heading).toHaveTextContent("Heading text")
  })

  it("renders headerAction in the header right slot", () => {
    render(
      <Card
        title="T"
        headerAction={
          <button type="button" data-testid="act">
            act
          </button>
        }
      >
        body
      </Card>,
    )
    expect(screen.getByTestId("act")).toBeInTheDocument()
  })

  it("renders the header even when only headerAction is provided", () => {
    const { container } = render(
      <Card headerAction={<span data-testid="ph">only-action</span>}>body</Card>,
    )
    expect(screen.getByTestId("ph")).toBeInTheDocument()
    expect(container.querySelector('[data-slot="card-header"]')).toBeTruthy()
  })

  it("omits the header entirely when no title/description/headerAction is provided", () => {
    const { container } = render(<Card>only body</Card>)
    expect(container.querySelector('[data-slot="card-header"]')).toBeNull()
  })

  it("renders as plain container when no header/footer", () => {
    render(<Card>only body</Card>)
    expect(screen.getByText("only body")).toBeInTheDocument()
  })

  it("omits the footer slot when no `footer` is provided", () => {
    const { container } = render(<Card title="T">body</Card>)
    expect(container.querySelector('[data-slot="card-footer"]')).toBeNull()
  })

  it("renders the footer slot when `footer` is provided", () => {
    const { container } = render(
      <Card footer={<span data-testid="ft">footer-content</span>}>body</Card>,
    )
    expect(container.querySelector('[data-slot="card-footer"]')).toBeTruthy()
    expect(screen.getByTestId("ft")).toBeInTheDocument()
  })

  it("forwards arbitrary HTMLDivAttributes (id, role, data-*)", () => {
    const { container } = render(
      // biome-ignore lint/a11y/useSemanticElements: testing arbitrary prop forwarding
      <Card id="my-card" role="region" data-foo="bar">
        body
      </Card>,
    )
    const card = container.querySelector('[data-slot="card"]') as HTMLElement
    expect(card.id).toBe("my-card")
    expect(card.getAttribute("role")).toBe("region")
    expect(card.getAttribute("data-foo")).toBe("bar")
  })

  it("merges custom className with the base styles", () => {
    const { container } = render(<Card className="custom-class">x</Card>)
    const card = container.querySelector('[data-slot="card"]') as HTMLElement
    expect(card.className).toContain("custom-class")
    // Default styles still applied.
    expect(card.className).toContain("rounded-lg")
  })

  it("forwards ref", () => {
    let captured: HTMLDivElement | null = null
    render(
      <Card
        ref={(el) => {
          captured = el
        }}
      >
        x
      </Card>,
    )
    expect(captured).toBeInstanceOf(HTMLDivElement)
  })
})
