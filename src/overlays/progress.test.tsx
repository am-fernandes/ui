import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Progress } from "./progress"

describe("Progress", () => {
  it("renders with progressbar role", () => {
    render(<Progress value={60} />)
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })

  it("accepts value=0", () => {
    render(<Progress value={0} />)
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })

  it("accepts value=100", () => {
    render(<Progress value={100} />)
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })
})
