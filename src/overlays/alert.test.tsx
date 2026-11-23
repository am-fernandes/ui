import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Alert } from "./alert"

describe("Alert", () => {
  it("renders title and description", () => {
    render(<Alert title="Aviso" description="Conteúdo" />)
    expect(screen.getByText("Aviso")).toBeInTheDocument()
    expect(screen.getByText("Conteúdo")).toBeInTheDocument()
  })

  it("renders action slot", () => {
    render(
      <Alert
        title="X"
        description="Y"
        action={
          <button type="button" data-testid="cta">
            cta
          </button>
        }
      />,
    )
    expect(screen.getByTestId("cta")).toBeInTheDocument()
  })

  it("applies variant data-attribute", () => {
    const { container } = render(<Alert variant="success" title="X" />)
    expect(container.querySelector('[data-slot="alert"]')).toHaveAttribute(
      "data-variant",
      "success",
    )
  })

  it("accepts children as alternative body", () => {
    render(
      <Alert variant="info" title="X">
        <p data-testid="body">complex body</p>
      </Alert>,
    )
    expect(screen.getByTestId("body")).toBeInTheDocument()
  })

  it("defaults to variant=default when omitted", () => {
    const { container } = render(<Alert title="X" />)
    expect(container.querySelector('[data-slot="alert"]')).toHaveAttribute(
      "data-variant",
      "default",
    )
  })

  it.each([
    ["default", "bg-card"],
    ["info", "bg-info"],
    ["success", "bg-success"],
    ["warning", "bg-warning"],
    ["destructive", "bg-destructive"],
  ] as const)("variant=%s applies %s class", (variant, klass) => {
    const { container } = render(<Alert variant={variant} title="X" />)
    expect(container.querySelector('[data-slot="alert"]')).toHaveClass(klass)
  })

  it("is announced to screen readers (role=status by default)", () => {
    render(<Alert title="X" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("renders custom icon when provided", () => {
    render(<Alert title="X" icon={<svg data-testid="custom-icon" aria-label="custom" />} />)
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument()
  })

  it("renders a default icon when icon prop omitted", () => {
    const { container } = render(<Alert title="X" variant="success" />)
    expect(container.querySelector("svg")).toBeInTheDocument()
  })

  it("renders the action slot wrapper with data-slot=alert-action", () => {
    const { container } = render(<Alert title="X" action={<span>act</span>} />)
    expect(container.querySelector('[data-slot="alert-action"]')).toBeInTheDocument()
  })

  it("does not render description when omitted", () => {
    const { container } = render(<Alert title="Only title" />)
    const descNodes = container.querySelectorAll(".text-sm.opacity-90")
    expect(descNodes.length).toBe(0)
  })

  it("forwards arbitrary HTML props", () => {
    render(<Alert title="X" data-testid="al" aria-label="aviso" />)
    const el = screen.getByTestId("al")
    expect(el).toHaveAttribute("aria-label", "aviso")
  })

  it("forwards className", () => {
    const { container } = render(<Alert title="X" className="custom-cls" />)
    expect(container.querySelector('[data-slot="alert"]')).toHaveClass("custom-cls")
  })

  it("forwards ref to the root div", () => {
    let captured: HTMLDivElement | null = null
    render(
      <Alert
        title="X"
        ref={(el) => {
          captured = el
        }}
      />,
    )
    expect(captured).not.toBeNull()
    expect((captured as unknown as HTMLDivElement).getAttribute("data-slot")).toBe("alert")
  })
})

// Every variant was role="alert": an info or success message inserted on the
// page interrupted the screen reader as an error would.
describe("Alert role", () => {
  it.each(["destructive", "warning"] as const)("%s interrupts: role=alert", (variant) => {
    render(<Alert variant={variant} title="Atenção" />)
    expect(screen.getByRole("alert")).toHaveAttribute("data-variant", variant)
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it.each(["default", "info", "success"] as const)("%s waits its turn: role=status", (variant) => {
    render(<Alert variant={variant} title="Pronto" />)
    expect(screen.getByRole("status")).toHaveAttribute("data-variant", variant)
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("the consumer can still choose", () => {
    render(<Alert variant="info" role="alert" title="Sessão expira em 1 minuto" />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
})
