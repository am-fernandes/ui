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

  it("renders as plain container when no header/footer", () => {
    render(<Card>only body</Card>)
    expect(screen.getByText("only body")).toBeInTheDocument()
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
