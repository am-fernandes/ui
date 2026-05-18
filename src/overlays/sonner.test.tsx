import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Toaster, toast } from "./sonner"

describe("Toaster", () => {
  it("mounts without crashing", () => {
    const { container } = render(<Toaster />)
    expect(container).toBeTruthy()
  })

  it("forwards props (position)", () => {
    const { container } = render(<Toaster position="top-right" />)
    expect(container).toBeTruthy()
  })

  it("renders into the DOM after a toast is dispatched", async () => {
    render(<Toaster />)
    // Sonner lazy-mounts its container — fire a toast to force render.
    toast.success("hello")
    expect(await screen.findByText("hello")).toBeInTheDocument()
  })

  it("renders a toast message after toast.success is called", async () => {
    render(<Toaster />)
    toast.success("hello")
    // sonner mounts asynchronously; findByText polls until present.
    expect(await screen.findByText("hello")).toBeInTheDocument()
  })
})
