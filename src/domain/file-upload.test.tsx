import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { FileUpload } from "./file-upload"

function makeFile(name: string, type = "text/plain", size = 10) {
  const file = new File(["x".repeat(size)], name, { type })
  return file
}

describe("FileUpload", () => {
  it("renders default label and description from accept + maxSize", () => {
    render(<FileUpload accept="image/png" maxSize={1024} />)
    expect(screen.getByText(/Arraste um arquivo/)).toBeInTheDocument()
    expect(screen.getByText(/image\/png/)).toBeInTheDocument()
    expect(screen.getByText(/1\.0 KB/)).toBeInTheDocument()
  })

  it("accepts a matching file and emits onValueChange", () => {
    const onValueChange = vi.fn()
    render(<FileUpload accept="text/*" onValueChange={onValueChange} />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const file = makeFile("notes.txt", "text/plain")
    fireEvent.change(input, { target: { files: [file] } })
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange.mock.calls[0]?.[0]).toEqual([file])
  })

  it("rejects files that do not match accept and reports the reason", () => {
    const onValueChange = vi.fn()
    const onReject = vi.fn()
    render(<FileUpload accept="image/*" onValueChange={onValueChange} onReject={onReject} />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const file = makeFile("note.txt", "text/plain")
    fireEvent.change(input, { target: { files: [file] } })
    expect(onValueChange).not.toHaveBeenCalled()
    expect(onReject).toHaveBeenCalledWith([{ file, reason: "type" }])
  })

  it("enforces maxSize", () => {
    const onReject = vi.fn()
    render(<FileUpload maxSize={5} onReject={onReject} />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const file = makeFile("big.txt", "text/plain", 50)
    fireEvent.change(input, { target: { files: [file] } })
    expect(onReject).toHaveBeenCalledWith([{ file, reason: "size" }])
  })

  it("multiple=true accumulates files; maxFiles caps the list", () => {
    const onReject = vi.fn()
    const onValueChange = vi.fn()
    render(<FileUpload multiple maxFiles={2} onValueChange={onValueChange} onReject={onReject} />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const a = makeFile("a.txt")
    const b = makeFile("b.txt")
    const c = makeFile("c.txt")
    fireEvent.change(input, { target: { files: [a, b, c] } })
    expect(onValueChange).toHaveBeenCalledWith([a, b])
    expect(onReject).toHaveBeenCalledWith([{ file: c, reason: "max-files" }])
  })

  it("multiple=false keeps only the first accepted file", () => {
    const onValueChange = vi.fn()
    render(<FileUpload onValueChange={onValueChange} />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const a = makeFile("a.txt")
    const b = makeFile("b.txt")
    fireEvent.change(input, { target: { files: [a, b] } })
    expect(onValueChange).toHaveBeenCalledWith([a])
  })

  it("preview='thumbnail' renders filename, size and a clickable preview tile", () => {
    render(<FileUpload multiple />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    fireEvent.change(input, {
      target: { files: [makeFile("notes.pdf", "application/pdf", 2048)] },
    })
    expect(screen.getByText("notes.pdf")).toBeInTheDocument()
    expect(screen.getByText("2.0 KB")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Abrir notes\.pdf em nova aba/ })).toBeInTheDocument()
  })

  it("preview='none' hides the file list", () => {
    render(<FileUpload preview="none" multiple />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    fireEvent.change(input, {
      target: { files: [makeFile("hidden.txt", "text/plain", 10)] },
    })
    expect(screen.queryByText("hidden.txt")).not.toBeInTheDocument()
  })

  it("camera=true renders the 'Capturar foto' button", () => {
    render(<FileUpload camera />)
    expect(screen.getByRole("button", { name: /Capturar foto/ })).toBeInTheDocument()
  })

  it("camera=false (default) does not render the camera button", () => {
    render(<FileUpload />)
    expect(screen.queryByRole("button", { name: /Capturar foto/ })).not.toBeInTheDocument()
  })

  it("accepts files dropped on the dropzone via a synthesized DataTransfer", () => {
    const onValueChange = vi.fn()
    render(<FileUpload onValueChange={onValueChange} accept="text/*" />)
    const dropzone = screen.getByRole("button", { name: /Arraste um arquivo/ })
    const file = makeFile("dropped.txt", "text/plain")
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] },
    })
    expect(onValueChange).toHaveBeenCalledWith([file])
  })

  it("removing a file via the Remover button updates the value", () => {
    const onValueChange = vi.fn()
    render(<FileUpload multiple onValueChange={onValueChange} />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const a = makeFile("a.txt", "text/plain")
    const b = makeFile("b.txt", "text/plain")
    fireEvent.change(input, { target: { files: [a, b] } })
    onValueChange.mockClear()
    const remove = screen.getByRole("button", { name: /Remover a\.txt/ })
    fireEvent.click(remove)
    expect(onValueChange).toHaveBeenLastCalledWith([b])
  })

  it("renders an image preview thumbnail (img element) for image files", () => {
    render(<FileUpload accept="image/*" />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const png = makeFile("foto.png", "image/png", 100)
    fireEvent.change(input, { target: { files: [png] } })
    const img = document.querySelector("img[alt='foto.png']") as HTMLImageElement | null
    expect(img).not.toBeNull()
    expect(img?.src).toContain("blob:")
  })

  it("does not match an extension that equals the whole filename (e.g. '.pdf' file)", () => {
    const onReject = vi.fn()
    const onValueChange = vi.fn()
    render(<FileUpload accept=".pdf" onValueChange={onValueChange} onReject={onReject} />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const file = new File(["x"], ".pdf", { type: "" })
    fireEvent.change(input, { target: { files: [file] } })
    expect(onValueChange).not.toHaveBeenCalled()
    expect(onReject).toHaveBeenCalledWith([{ file, reason: "type" }])
  })

  it("matches an extension pattern only when a base name is present", () => {
    const onValueChange = vi.fn()
    render(<FileUpload accept=".pdf" onValueChange={onValueChange} />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const file = new File(["x"], "doc.pdf", { type: "" })
    fireEvent.change(input, { target: { files: [file] } })
    expect(onValueChange).toHaveBeenCalledWith([file])
  })
})
