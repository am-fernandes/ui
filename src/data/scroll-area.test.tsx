import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ScrollArea } from "./scroll-area"

describe("ScrollArea", () => {
  it("renders children inside the viewport", () => {
    render(
      <ScrollArea>
        <div>Some scrollable content</div>
      </ScrollArea>,
    )
    expect(screen.getByText("Some scrollable content")).toBeInTheDocument()
  })
})
