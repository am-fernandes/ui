import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Image } from "./image"

describe("Image", () => {
  it("renders an img with the given src + alt", () => {
    render(<Image src="/foo.png" alt="Foo" />)
    const img = screen.getByAltText("Foo") as HTMLImageElement
    expect(img).toBeInTheDocument()
    // jsdom canonicalises src; assert it ends with the requested path
    expect(img.src).toContain("/foo.png")
  })

  it("renders the skeleton placeholder before load", () => {
    const { container } = render(<Image src="/foo.png" alt="Foo" placeholder="skeleton" />)
    expect(container.querySelector('[data-slot="image"]')).toBeTruthy()
    // Skeleton is an animate-pulse div rendered before the img loads.
    expect(container.querySelector(".animate-pulse")).toBeTruthy()
  })

  it("hides placeholder when explicitly set to none", () => {
    const { container } = render(<Image src="/foo.png" alt="Foo" placeholder="none" />)
    expect(container.querySelector(".animate-pulse")).toBeNull()
  })
})
