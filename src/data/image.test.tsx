import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Image } from "./image"

describe("Image", () => {
  it("renders an img with the given src + alt", () => {
    render(<Image src="/foo.png" alt="Foo" />)
    const img = screen.getByAltText("Foo") as HTMLImageElement
    expect(img).toBeInTheDocument()
    expect(img.src).toContain("/foo.png")
  })

  it("renders the skeleton placeholder before load", () => {
    const { container } = render(<Image src="/foo.png" alt="Foo" placeholder="skeleton" />)
    expect(container.querySelector('[data-slot="image"]')).toBeTruthy()
    expect(container.querySelector(".animate-pulse")).toBeTruthy()
  })

  it("hides placeholder when explicitly set to none", () => {
    const { container } = render(<Image src="/foo.png" alt="Foo" placeholder="none" />)
    expect(container.querySelector(".animate-pulse")).toBeNull()
  })

  it("invokes onLoad", () => {
    const onLoad = vi.fn()
    render(<Image src="/foo.png" alt="Foo" onLoad={onLoad} />)
    fireEvent.load(screen.getByAltText("Foo"))
    expect(onLoad).toHaveBeenCalled()
  })

  it("invokes onError and shows the error fallback", () => {
    const onError = vi.fn()
    render(<Image src="/broken.png" alt="Foo" onError={onError} />)
    fireEvent.error(screen.getByAltText("Foo"))
    expect(onError).toHaveBeenCalled()
    expect(screen.getByText(/Falha ao carregar imagem/i)).toBeInTheDocument()
  })

  it("forwards aspectRatio as an inline style", () => {
    const { container } = render(<Image src="/foo.png" alt="Foo" aspectRatio={16 / 9} />)
    const wrapper = container.querySelector('[data-slot="image"]') as HTMLElement
    expect(wrapper.style.aspectRatio).toBe(String(16 / 9))
  })

  it("rejects javascript: protocol and renders the error fallback", () => {
    // biome-ignore lint/suspicious/noExplicitAny: testing a forbidden input value
    render(<Image src={"javascript:alert(1)" as any} alt="Foo" />)
    expect(screen.getByText(/Falha ao carregar imagem/i)).toBeInTheDocument()
    // The <img> tag should not have been rendered.
    expect(screen.queryByAltText("Foo")).toBeNull()
  })

  it("rejects data: URLs unless explicitly allowed", () => {
    render(<Image src="data:image/png;base64,AAAA" alt="Foo" />)
    expect(screen.getByText(/Falha ao carregar imagem/i)).toBeInTheDocument()
  })

  it("accepts data: URLs when allowedProtocols includes it", () => {
    render(<Image src="data:image/png;base64,AAAA" alt="Foo" allowedProtocols={["data:"]} />)
    expect(screen.getByAltText("Foo")).toBeInTheDocument()
  })

  it("resets state when src changes", () => {
    const { rerender } = render(<Image src="/foo.png" alt="Foo" />)
    // Mark first image as loaded.
    fireEvent.load(screen.getByAltText("Foo"))
    // The placeholder should be gone.
    rerender(<Image src="/bar.png" alt="Foo" />)
    // After src change, the skeleton placeholder should be visible again.
    const wrapper = document.querySelector('[data-slot="image"]') as HTMLElement
    expect(wrapper?.querySelector(".animate-pulse")).toBeTruthy()
  })

  it("renders forwarded srcSet/sizes", () => {
    render(
      <Image
        src="/foo.png"
        alt="Foo"
        srcSet="/foo.png 1x, /foo@2x.png 2x"
        sizes="(min-width: 640px) 50vw, 100vw"
      />,
    )
    const img = screen.getByAltText("Foo") as HTMLImageElement
    expect(img.getAttribute("srcset")).toBe("/foo.png 1x, /foo@2x.png 2x")
    expect(img.getAttribute("sizes")).toBe("(min-width: 640px) 50vw, 100vw")
  })

  it("treats decorative images as presentational", () => {
    render(<Image src="/foo.png" alt="Foo" decorative />)
    const img = document.querySelector("img") as HTMLImageElement
    expect(img.getAttribute("alt")).toBe("")
    expect(img.getAttribute("role")).toBe("presentation")
  })
})
