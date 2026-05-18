import { render } from "@testing-library/react"
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
})
