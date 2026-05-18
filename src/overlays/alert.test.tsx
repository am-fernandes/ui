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
})
