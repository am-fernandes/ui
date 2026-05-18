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

  it("preview='list' renders filename and size", () => {
    render(<FileUpload preview="list" multiple />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    fireEvent.change(input, { target: { files: [makeFile("alpha.txt", "text/plain", 2048)] } })
    expect(screen.getByText("alpha.txt")).toBeInTheDocument()
    expect(screen.getByText("2.0 KB")).toBeInTheDocument()
  })
})
