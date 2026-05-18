import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Breadcrumb } from "./breadcrumb"

describe("Breadcrumb", () => {
  it("renders via items API", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Contratos", href: "/contratos" },
          { label: "Page" },
        ]}
      />,
    )
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Contratos")).toBeInTheDocument()
    expect(screen.getByText("Page")).toBeInTheDocument()
    expect(screen.getByText("Home").tagName).toBe("A")
  })

  it("marks the last item without href as current page", () => {
    render(<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Current" }]} />)
    const current = screen.getByText("Current")
    expect(current.getAttribute("aria-current")).toBe("page")
  })
})
