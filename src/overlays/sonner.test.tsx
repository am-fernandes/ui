import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Toaster } from "./sonner"

describe("Toaster", () => {
  it("mounts without crashing", () => {
    const { container } = render(<Toaster />)
    expect(container).toBeTruthy()
  })

  it("forwards props (position)", () => {
    const { container } = render(<Toaster position="top-right" />)
    expect(container).toBeTruthy()
  })
})
