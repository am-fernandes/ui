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

  describe("no image and refused addresses", () => {
    it("shows the fallback, not an error, when there is no src", () => {
      const { container } = render(<Image src={null} alt="Fachada do imóvel" />)
      expect(screen.getByRole("img", { name: "Fachada do imóvel" })).toHaveAttribute(
        "data-slot",
        "image-fallback",
      )
      expect(screen.getByText("Sem imagem")).toBeInTheDocument()
      expect(screen.queryByText(/Falha/)).toBeNull()
      expect(container.querySelector('[data-slot="image"]')).toHaveAttribute("data-state", "empty")
    })

    it("keeps the alt with the screen reader when the address is refused", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      render(<Image src="javascript:alert(1)" alt="Planta baixa" />)
      expect(screen.getByRole("img", { name: "Planta baixa" })).toBeInTheDocument()
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("refused"))
      warn.mockRestore()
    })

    it("names the fallback with the alt after a load error", () => {
      render(<Image src="/quebrada.png" alt="Sala de estar" />)
      fireEvent.error(screen.getByAltText("Sala de estar"))
      expect(screen.getByRole("img", { name: "Sala de estar" })).toHaveAttribute(
        "data-slot",
        "image-fallback",
      )
      expect(screen.getByText("Falha ao carregar imagem")).toBeInTheDocument()
    })

    it("hides the fallback from the screen reader when the image is decorative", () => {
      const { container } = render(<Image src="" alt="ignorado" decorative />)
      expect(screen.queryByRole("img")).toBeNull()
      expect(container.querySelector('[data-slot="image-fallback"]')).toHaveAttribute(
        "aria-hidden",
        "true",
      )
    })

    it("renders the fallback given, and the texts from labels", () => {
      const { rerender } = render(<Image src={undefined} alt="Lead" fallback={<span>AS</span>} />)
      expect(screen.getByRole("img", { name: "Lead" })).toHaveTextContent("AS")
      rerender(<Image src="" alt="Lead" labels={{ empty: "Sin imagen" }} />)
      expect(screen.getByText("Sin imagen")).toBeInTheDocument()
    })

    it("keeps the box size given by className and width/height", () => {
      render(<Image src="" alt="Foto" className="h-40 w-64" width={256} height={160} />)
      const box = screen.getByRole("img", { name: "Foto" })
      expect(box).toHaveClass("h-40", "w-64")
      expect(box.style.width).toBe("256px")
      expect(box.style.height).toBe("160px")
    })
  })

  describe("blur placeholder", () => {
    const tiny = "data:image/png;base64,iVBORw0KGgo="

    it("shows blurDataURL blurred while the image loads, and drops it after", () => {
      const { container } = render(
        <Image src="/foto.jpg" alt="Foto" placeholder="blur" blurDataURL={tiny} />,
      )
      const preview = container.querySelector('[data-slot="image-blur"] img') as HTMLImageElement
      expect(preview).toHaveAttribute("src", tiny)
      expect(preview).toHaveAttribute("alt", "")
      expect(preview).toHaveClass("blur-xl")
      fireEvent.load(screen.getByAltText("Foto"))
      expect(container.querySelector('[data-slot="image-blur"]')).toBeNull()
    })

    it("refuses a blurDataURL that is neither an image data URI nor an allowed address", () => {
      const { container } = render(
        <Image src="/foto.jpg" alt="Foto" placeholder="blur" blurDataURL="javascript:alert(1)" />,
      )
      expect(container.querySelector('[data-slot="image-blur"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="image-blur"] img')).toBeNull()
    })
  })

  describe("state", () => {
    it("shows an image that was already complete when React mounted it", () => {
      const complete = vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true)
      const natural = vi
        .spyOn(HTMLImageElement.prototype, "naturalWidth", "get")
        .mockReturnValue(800)
      render(<Image src="/em-cache.jpg" alt="Em cache" />)
      expect(screen.getByAltText("Em cache")).toHaveClass("opacity-100")
      complete.mockRestore()
      natural.mockRestore()
    })

    it("loads again when src changes, with no frame of the old state", () => {
      const { rerender, container } = render(<Image src="/a.png" alt="Foto" />)
      fireEvent.load(screen.getByAltText("Foto"))
      expect(screen.getByAltText("Foto")).toHaveClass("opacity-100")
      rerender(<Image src="/b.png" alt="Foto" />)
      // Same render as the change: already loading, never "loaded" for /b.png.
      expect(screen.getByAltText("Foto")).toHaveClass("opacity-0")
      expect(container.querySelector('[data-slot="image"]')).toHaveAttribute(
        "data-state",
        "loading",
      )
    })

    it("fades in with the motion tokens, and not at all with reduced motion", () => {
      render(<Image src="/a.png" alt="Foto" />)
      expect(screen.getByAltText("Foto")).toHaveClass(
        "duration-(--duration-medium)",
        "ease-(--ease-standard)",
        "motion-reduce:transition-none",
      )
    })
  })
})
