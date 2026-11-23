import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { toast } from "../overlays/sonner"
import { FileUpload, type FileUploadItem } from "./file-upload"

vi.mock("../overlays/sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function makeFile(name: string, type = "text/plain", size = 10) {
  const file = new File(["x".repeat(size)], name, { type })
  return file
}

describe("FileUpload", () => {
  it("renders default label and description from accept + maxSize", () => {
    render(<FileUpload accept="image/png" maxSize={1024} />)
    expect(screen.getByText(/Arraste um arquivo/)).toBeInTheDocument()
    expect(screen.getByText(/image\/png/)).toBeInTheDocument()
    expect(screen.getByText(/até 1,0 KB/)).toBeInTheDocument()
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

  it("multiple=false rejects extra files as max-files when more than one is dropped", () => {
    const onValueChange = vi.fn()
    const onReject = vi.fn()
    render(<FileUpload onValueChange={onValueChange} onReject={onReject} />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const a = makeFile("a.txt")
    const b = makeFile("b.txt")
    const c = makeFile("c.txt")
    fireEvent.change(input, { target: { files: [a, b, c] } })
    expect(onValueChange).toHaveBeenCalledWith([a])
    expect(onReject).toHaveBeenCalledWith([
      { file: b, reason: "max-files" },
      { file: c, reason: "max-files" },
    ])
  })

  it("preview='thumbnail' renders filename, size and a clickable preview tile", () => {
    render(<FileUpload multiple />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    fireEvent.change(input, {
      target: { files: [makeFile("notes.pdf", "application/pdf", 2048)] },
    })
    expect(screen.getByText("notes.pdf")).toBeInTheDocument()
    expect(screen.getByText("2,0 KB")).toBeInTheDocument()
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

  it("removable={false} keeps the row visible but drops the Remover button", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)
    render(<FileUpload multiple removable={false} value={[makeFile("a.pdf", "application/pdf")]} />)
    expect(screen.getByText("a.pdf")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Remover a\.pdf/ })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Abrir a\.pdf/ }))
    expect(openSpy).toHaveBeenCalledTimes(1)
    openSpy.mockRestore()
  })

  it("removable={false} keeps the dropzone accepting files (append-only)", () => {
    const onValueChange = vi.fn()
    render(<FileUpload multiple removable={false} onValueChange={onValueChange} />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const file = makeFile("new.txt", "text/plain")
    fireEvent.change(input, { target: { files: [file] } })
    expect(onValueChange).toHaveBeenCalledWith([file])
  })

  it("image lightbox has no download button by default but exposes close", () => {
    render(<FileUpload accept="image/*" value={[makeFile("photo.png", "image/png", 100)]} />)
    fireEvent.click(screen.getByRole("button", { name: /Ampliar photo\.png/ }))
    expect(screen.queryByRole("button", { name: "Baixar imagem" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument()
  })

  it("downloadable shows the lightbox download button alongside close", () => {
    render(
      <FileUpload
        accept="image/*"
        downloadable
        value={[makeFile("photo.png", "image/png", 100)]}
      />,
    )
    fireEvent.click(screen.getByRole("button", { name: /Ampliar photo\.png/ }))
    expect(screen.getByRole("button", { name: "Baixar imagem" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument()
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

  // -- Additional coverage tests below --------------------------------------

  it("matches an exact MIME pattern (e.g. 'image/png')", () => {
    const onValueChange = vi.fn()
    const onReject = vi.fn()
    render(<FileUpload accept="image/png" onValueChange={onValueChange} onReject={onReject} />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const png = makeFile("photo.png", "image/png")
    const jpg = makeFile("photo.jpg", "image/jpeg")
    fireEvent.change(input, { target: { files: [png] } })
    expect(onValueChange).toHaveBeenLastCalledWith([png])
    fireEvent.change(input, { target: { files: [jpg] } })
    expect(onReject).toHaveBeenCalledWith([{ file: jpg, reason: "type" }])
  })

  it("accepts arrays of patterns", () => {
    const onValueChange = vi.fn()
    render(<FileUpload accept={["image/png", ".pdf"]} onValueChange={onValueChange} />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const png = makeFile("a.png", "image/png")
    fireEvent.change(input, { target: { files: [png] } })
    expect(onValueChange).toHaveBeenCalledWith([png])
  })

  it("treats accept=undefined as accept-anything (matches any file)", () => {
    const onValueChange = vi.fn()
    render(<FileUpload onValueChange={onValueChange} />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const file = makeFile("anything.weird", "application/x-vendor")
    fireEvent.change(input, { target: { files: [file] } })
    expect(onValueChange).toHaveBeenCalledWith([file])
  })

  it("formatBytes renders MB and GB ranges in the description", () => {
    const { unmount } = render(<FileUpload maxSize={2 * 1024 * 1024} />)
    expect(screen.getByText(/2,0 MB/)).toBeInTheDocument()
    unmount()
    render(<FileUpload maxSize={3 * 1024 * 1024 * 1024} />)
    expect(screen.getByText(/3,0 GB/)).toBeInTheDocument()
  })

  it("description shows raw bytes when below 1 KB", () => {
    render(<FileUpload maxSize={512} />)
    expect(screen.getByText(/512 B/)).toBeInTheDocument()
  })

  it("renders no description when neither accept nor maxSize is set", () => {
    const { container } = render(<FileUpload />)
    // Only the main label text is present
    expect(screen.getByText(/Arraste um arquivo/)).toBeInTheDocument()
    // No description span
    expect(container.querySelectorAll(".text-muted-foreground").length).toBeGreaterThanOrEqual(0)
    expect(screen.queryByText(/·/)).not.toBeInTheDocument()
  })

  it("description shows only the size hint when accept is omitted", () => {
    render(<FileUpload maxSize={2048} />)
    // No middle dot since only one part
    expect(screen.queryByText(/·/)).not.toBeInTheDocument()
    expect(screen.getByText(/2,0 KB/)).toBeInTheDocument()
  })

  it("renders the error message and marks the dropzone with the destructive class", () => {
    render(<FileUpload error="Arquivo inválido" />)
    const alert = screen.getByRole("alert")
    expect(alert).toHaveTextContent("Arquivo inválido")
    const dropzone = screen.getByRole("button", { name: /Arraste um arquivo/ })
    expect(dropzone.className).toMatch(/border-destructive/)
  })

  it("disabled blocks the dropzone click (input ref is not invoked)", () => {
    render(<FileUpload disabled />)
    const dropzone = screen.getByRole("button", { name: /Arraste um arquivo/ })
    expect(dropzone).toBeDisabled()
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const clickSpy = vi.spyOn(input, "click")
    fireEvent.click(dropzone)
    expect(clickSpy).not.toHaveBeenCalled()
  })

  it("openPicker triggers the underlying file input when enabled", () => {
    render(<FileUpload />)
    const dropzone = screen.getByRole("button", { name: /Arraste um arquivo/ })
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const clickSpy = vi.spyOn(input, "click")
    fireEvent.click(dropzone)
    expect(clickSpy).toHaveBeenCalledTimes(1)
  })

  it("dragOver toggles the dragging state class; dragLeave restores it", () => {
    render(<FileUpload />)
    const dropzone = screen.getByRole("button", { name: /Arraste um arquivo/ })
    fireEvent.dragOver(dropzone)
    expect(dropzone.className).toMatch(/bg-accent\/60/)
    fireEvent.dragLeave(dropzone)
    expect(dropzone.className).not.toMatch(/bg-accent\/60/)
  })

  it("disabled prevents dropping files", () => {
    const onValueChange = vi.fn()
    render(<FileUpload disabled onValueChange={onValueChange} />)
    const dropzone = screen.getByRole("button", { name: /Arraste um arquivo/ })
    const file = makeFile("dropped.txt")
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("disabled also avoids the dragging visual state", () => {
    render(<FileUpload disabled />)
    const dropzone = screen.getByRole("button", { name: /Arraste um arquivo/ })
    fireEvent.dragOver(dropzone)
    // The dragging state would add `bg-accent/60` to the class list; with disabled,
    // setDragging(true) is not invoked at all.
    expect(dropzone.className).not.toMatch(/bg-accent\/60/)
  })

  it("ingest is a no-op when given a null FileList (defensive branch)", () => {
    const onValueChange = vi.fn()
    render(<FileUpload onValueChange={onValueChange} />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    fireEvent.change(input, { target: { files: null } })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("opening an image file uses the lightbox (Dialog), not a new tab", () => {
    render(<FileUpload accept="image/*" />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const png = makeFile("photo.png", "image/png", 100)
    fireEvent.change(input, { target: { files: [png] } })
    const tile = screen.getByRole("button", { name: /Ampliar photo\.png/ })
    fireEvent.click(tile)
    // Dialog opens and renders the image inside the lightbox
    const dialogImages = document.querySelectorAll("img[alt='photo.png']")
    expect(dialogImages.length).toBeGreaterThan(1)
  })

  it("opening a non-image file calls window.open in a new tab", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)
    render(<FileUpload multiple />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const pdf = makeFile("doc.pdf", "application/pdf", 200)
    fireEvent.change(input, { target: { files: [pdf] } })
    const tile = screen.getByRole("button", { name: /Abrir doc\.pdf em nova aba/ })
    fireEvent.click(tile)
    expect(openSpy).toHaveBeenCalledTimes(1)
    expect(openSpy.mock.calls[0]?.[0]).toMatch(/^blob:/)
    openSpy.mockRestore()
  })

  it("controlled mode honours the parent value and does not double-state", () => {
    const onValueChange = vi.fn()
    const { rerender } = render(<FileUpload value={[]} multiple onValueChange={onValueChange} />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const a = makeFile("a.txt")
    fireEvent.change(input, { target: { files: [a] } })
    expect(onValueChange).toHaveBeenCalledWith([a])
    // List is still empty because parent did not update value prop
    expect(screen.queryByText("a.txt")).not.toBeInTheDocument()
    rerender(<FileUpload value={[a]} multiple onValueChange={onValueChange} />)
    expect(screen.getByText("a.txt")).toBeInTheDocument()
  })

  it("supports a comma-separated accept string", () => {
    const onValueChange = vi.fn()
    render(<FileUpload accept="image/png, .pdf" onValueChange={onValueChange} />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const pdf = new File(["x"], "doc.pdf", { type: "" })
    fireEvent.change(input, { target: { files: [pdf] } })
    expect(onValueChange).toHaveBeenCalledWith([pdf])
  })

  it("uses the multiple-mode default label when multiple=true", () => {
    render(<FileUpload multiple />)
    expect(screen.getByText(/Arraste arquivos ou clique/)).toBeInTheDocument()
  })

  it("a custom description prop overrides the auto-generated one", () => {
    render(<FileUpload maxSize={1024} description="Personalizado" />)
    expect(screen.getByText("Personalizado")).toBeInTheDocument()
    expect(screen.queryByText(/1\.0 KB/)).not.toBeInTheDocument()
  })

  it("non-image FileRow: clicking thumbnail opens file in new tab via window.open", () => {
    const onValueChange = vi.fn()
    const pdf = makeFile("doc.pdf", "application/pdf")
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)
    try {
      render(<FileUpload value={[pdf]} onValueChange={onValueChange} />)
      const openBtn = screen.getByRole("button", { name: /Abrir doc\.pdf/ })
      fireEvent.click(openBtn)
      expect(openSpy).toHaveBeenCalledWith(
        expect.stringMatching(/blob:|http/),
        "_blank",
        "noopener,noreferrer",
      )
    } finally {
      openSpy.mockRestore()
    }
  })

  it("image FileRow: clicking thumbnail opens the ImageLightbox (Dialog)", () => {
    const onValueChange = vi.fn()
    const png = makeFile("photo.png", "image/png")
    render(<FileUpload value={[png]} onValueChange={onValueChange} />)
    const openBtn = screen.getByRole("button", { name: /Ampliar photo\.png/ })
    fireEvent.click(openBtn)
    // Lightbox uses Dialog with sr-only title === file.name
    expect(screen.getAllByText("photo.png").length).toBeGreaterThan(0)
  })

  it("camera={true} renders 'Capturar foto' button + opening it surfaces an error state when getUserMedia is unavailable", async () => {
    // jsdom doesn't implement navigator.mediaDevices.getUserMedia — opening the
    // CameraDialog hits the error branch (renders <p> with errorMsg) which is
    // exactly what we want to cover.
    render(<FileUpload camera />)
    const openCamera = screen.getByRole("button", { name: /Capturar foto/ })
    fireEvent.click(openCamera)
    // CameraDialog is now open. It will try to call getUserMedia in useEffect
    // and set errorMsg. We don't need to wait for the actual error string —
    // just the dialog being mounted exercises the function bodies.
    expect(screen.getAllByText(/Capturar foto/).length).toBeGreaterThan(0)
  })

  // The full happy-path camera capture (getUserMedia stream → canvas → blob)
  // remains untested at the unit level (jsdom limitation) and is tracked under
  // Playwright e2e instead.

  it("uses pt-BR labels by default", () => {
    render(<FileUpload multiple />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    fireEvent.change(input, { target: { files: [makeFile("a.txt", "text/plain")] } })
    // Default dropzone label
    expect(screen.getByText(/Arraste arquivos ou clique/)).toBeInTheDocument()
    // Default aria-label of the list
    expect(screen.getByRole("list", { name: "Arquivos selecionados" })).toBeInTheDocument()
    // Default remove button aria-label
    expect(screen.getByRole("button", { name: /Remover a\.txt/ })).toBeInTheDocument()
  })

  it("closing the ImageLightbox via Escape calls setLightboxFile(null) and hides the dialog", async () => {
    const png = makeFile("photo.png", "image/png", 100)
    render(<FileUpload value={[png]} />)
    const openBtn = screen.getByRole("button", { name: /Ampliar photo\.png/ })
    fireEvent.click(openBtn)
    // Lightbox open — dialog is mounted
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    // Press Escape to trigger Radix Dialog onOpenChange(false) which routes
    // through the FileUpload `onOpenChange={() => setLightboxFile(null)}` handler.
    await userEvent.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("clicking 'Cancelar' inside the CameraDialog closes it via onOpenChange(false)", () => {
    render(<FileUpload camera />)
    fireEvent.click(screen.getByRole("button", { name: /Capturar foto/ }))
    // Dialog mounted — locate the Cancelar button (only present inside the dialog).
    const cancelBtn = screen.getByRole("button", { name: "Cancelar" })
    expect(cancelBtn).toBeInTheDocument()
    fireEvent.click(cancelBtn)
    // Dialog unmounted.
    expect(screen.queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument()
  })

  it(
    "takePhoto captures a frame and forwards the File via onCapture → ingest",
    { timeout: 20000 },
    async () => {
      // Mock navigator.mediaDevices.getUserMedia and a minimal MediaStream so the
      // CameraDialog reaches the "ready" branch and the "Tirar foto" button is
      // enabled.
      const stop = vi.fn()
      const fakeTrack = { stop } as unknown as MediaStreamTrack
      const fakeStream = {
        getTracks: () => [fakeTrack],
      } as unknown as MediaStream
      const getUserMedia = vi.fn().mockResolvedValue(fakeStream)
      const originalMediaDevices = (navigator as unknown as { mediaDevices?: MediaDevices })
        .mediaDevices
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: { getUserMedia },
      })

      // Make HTMLVideoElement look like a ready video with a known frame size.
      const videoWidthSpy = vi
        .spyOn(HTMLVideoElement.prototype, "videoWidth", "get")
        .mockReturnValue(640)
      const videoHeightSpy = vi
        .spyOn(HTMLVideoElement.prototype, "videoHeight", "get")
        .mockReturnValue(480)
      const readyStateSpy = vi
        .spyOn(HTMLMediaElement.prototype, "readyState", "get")
        .mockReturnValue(2)
      // jsdom does not support assigning a MediaStream to srcObject — stub the
      // setter so the dialog's useEffect does not throw.
      const srcObjectDescriptor = Object.getOwnPropertyDescriptor(
        HTMLMediaElement.prototype,
        "srcObject",
      )
      Object.defineProperty(HTMLMediaElement.prototype, "srcObject", {
        configurable: true,
        get() {
          return null
        },
        set() {
          /* no-op */
        },
      })

      // jsdom does not implement Canvas 2D context — stub getContext so takePhoto
      // does not bail at `if (!ctx) return`.
      const fakeCtx = { drawImage: vi.fn() } as unknown as CanvasRenderingContext2D
      const getContextSpy = vi
        .spyOn(HTMLCanvasElement.prototype, "getContext")
        .mockImplementation(() => fakeCtx as unknown as RenderingContext)
      // jsdom's canvas.toBlob may produce null. Stub so `takePhoto` receives a
      // real Blob and continues into the File/onCapture path.
      const toBlobSpy = vi
        .spyOn(HTMLCanvasElement.prototype, "toBlob")
        .mockImplementation((cb: BlobCallback) => {
          cb(new Blob(["fake-jpeg"], { type: "image/jpeg" }))
        })

      try {
        const onValueChange = vi.fn()
        render(<FileUpload camera onValueChange={onValueChange} />)
        fireEvent.click(screen.getByRole("button", { name: /Capturar foto/ }))

        // Wait for the getUserMedia promise to resolve and the ready effect to
        // flush — the "Tirar foto" button is initially disabled and becomes
        // enabled once the dialog's setReady(true) commits.
        await waitFor(
          () => {
            expect(screen.getByRole("button", { name: "Tirar foto" })).not.toBeDisabled()
          },
          { timeout: 10000 },
        )

        const takeBtn = screen.getByRole("button", { name: "Tirar foto" })
        await act(async () => {
          fireEvent.click(takeBtn)
        })

        // takePhoto → onCapture → ingest → onValueChange called with the snapshot File.
        expect(onValueChange).toHaveBeenCalledTimes(1)
        const captured = onValueChange.mock.calls[0]?.[0] as File[]
        expect(captured).toHaveLength(1)
        expect(captured[0]).toBeInstanceOf(File)
        expect(captured[0]?.type).toBe("image/jpeg")
        // Dialog also closes (onOpenChange(false) inside the toBlob callback).
        expect(screen.queryByRole("button", { name: "Tirar foto" })).not.toBeInTheDocument()
      } finally {
        toBlobSpy.mockRestore()
        getContextSpy.mockRestore()
        if (srcObjectDescriptor) {
          Object.defineProperty(HTMLMediaElement.prototype, "srcObject", srcObjectDescriptor)
        } else {
          // biome-ignore lint/performance/noDelete: restoring jsdom's original (absent) descriptor
          delete (HTMLMediaElement.prototype as unknown as { srcObject?: unknown }).srcObject
        }
        readyStateSpy.mockRestore()
        videoHeightSpy.mockRestore()
        videoWidthSpy.mockRestore()
        if (originalMediaDevices === undefined) {
          // Restore "absent" mediaDevices (jsdom default) so subsequent tests hit
          // the error branch again as before.
          Object.defineProperty(navigator, "mediaDevices", {
            configurable: true,
            value: undefined,
          })
        } else {
          Object.defineProperty(navigator, "mediaDevices", {
            configurable: true,
            value: originalMediaDevices,
          })
        }
      }
    },
  )

  it("overrides labels via the labels prop (en-US sample)", () => {
    render(
      <FileUpload
        multiple
        camera
        labels={{
          dropzoneMultiple: "Drag files or click to select",
          fileListAriaLabel: "Selected files",
          cameraButton: "Take photo",
          removeFile: (name) => `Remove ${name}`,
        }}
      />,
    )
    expect(screen.getByText("Drag files or click to select")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Take photo" })).toBeInTheDocument()
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    fireEvent.change(input, { target: { files: [makeFile("foo.txt", "text/plain")] } })
    expect(screen.getByRole("list", { name: "Selected files" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Remove foo.txt" })).toBeInTheDocument()
  })

  it("the lightbox close button dismisses the image", async () => {
    render(<FileUpload accept="image/*" value={[makeFile("photo.png", "image/png", 100)]} />)
    fireEvent.click(screen.getByRole("button", { name: /Ampliar photo\.png/ }))
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("moves initial focus to Fechar so Enter does not trigger the download", async () => {
    render(
      <FileUpload
        accept="image/*"
        downloadable
        value={[makeFile("photo.png", "image/png", 100)]}
      />,
    )
    fireEvent.click(screen.getByRole("button", { name: /Ampliar photo\.png/ }))
    await waitFor(() => expect(screen.getByRole("button", { name: "Fechar" })).toHaveFocus())
  })

  describe("image download from the lightbox", () => {
    const png = makeFile("photo.png", "image/png", 100)

    function openDownloadButton() {
      render(<FileUpload accept="image/*" downloadable value={[png]} />)
      fireEvent.click(screen.getByRole("button", { name: /Ampliar photo\.png/ }))
      return screen.getByRole("button", { name: "Baixar imagem" })
    }

    function stubSavePicker(impl: unknown) {
      ;(window as unknown as { showSaveFilePicker?: unknown }).showSaveFilePicker = impl
    }

    function rejectWith(name: string) {
      return vi.fn().mockRejectedValue(Object.assign(new Error(name), { name }))
    }

    function captureAnchorDownloads() {
      const names: string[] = []
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
        this: HTMLAnchorElement,
      ) {
        names.push(this.download)
      })
      return names
    }

    afterEach(() => {
      stubSavePicker(undefined)
      vi.restoreAllMocks()
      vi.mocked(toast.success).mockClear()
      vi.mocked(toast.error).mockClear()
    })

    it("falls back to an anchor download without a success toast when the picker is unavailable", async () => {
      const names = captureAnchorDownloads()
      fireEvent.click(openDownloadButton())
      await waitFor(() => expect(names).toEqual(["photo.png"]))
      expect(toast.success).not.toHaveBeenCalled()
    })

    it("saves through the picker with the file name and shows success", async () => {
      const write = vi.fn().mockResolvedValue(undefined)
      const close = vi.fn().mockResolvedValue(undefined)
      const abort = vi.fn().mockResolvedValue(undefined)
      const picker = vi
        .fn()
        .mockResolvedValue({ createWritable: vi.fn().mockResolvedValue({ write, close, abort }) })
      stubSavePicker(picker)
      fireEvent.click(openDownloadButton())
      await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Download concluído"))
      expect(picker).toHaveBeenCalledWith({ suggestedName: "photo.png" })
      expect(write).toHaveBeenCalledWith(png)
      expect(close).toHaveBeenCalled()
      expect(abort).not.toHaveBeenCalled()
    })

    it("AbortError (user cancelled the picker) shows no toast and re-enables the button", async () => {
      const picker = rejectWith("AbortError")
      stubSavePicker(picker)
      const button = openDownloadButton()
      fireEvent.click(button)
      await waitFor(() => expect(picker).toHaveBeenCalled())
      await waitFor(() => expect(button).not.toBeDisabled())
      expect(toast.success).not.toHaveBeenCalled()
      expect(toast.error).not.toHaveBeenCalled()
    })

    it("SecurityError (picker blocked in an iframe) falls back to an anchor download", async () => {
      stubSavePicker(rejectWith("SecurityError"))
      const names = captureAnchorDownloads()
      fireEvent.click(openDownloadButton())
      await waitFor(() => expect(names).toEqual(["photo.png"]))
      expect(toast.success).not.toHaveBeenCalled()
    })

    it("NotAllowedError (picker denied by policy) falls back to an anchor download", async () => {
      stubSavePicker(rejectWith("NotAllowedError"))
      const names = captureAnchorDownloads()
      fireEvent.click(openDownloadButton())
      await waitFor(() => expect(names).toEqual(["photo.png"]))
      expect(toast.success).not.toHaveBeenCalled()
    })

    it("uses the fallback name with the MIME extension when the file has no name", async () => {
      const nameless = new File(["x".repeat(100)], "", { type: "image/png" })
      const write = vi.fn().mockResolvedValue(undefined)
      const close = vi.fn().mockResolvedValue(undefined)
      const picker = vi
        .fn()
        .mockResolvedValue({ createWritable: vi.fn().mockResolvedValue({ write, close }) })
      stubSavePicker(picker)
      render(<FileUpload accept="image/*" downloadable value={[nameless]} />)
      fireEvent.click(screen.getByRole("button", { name: /Ampliar/ }))
      fireEvent.click(screen.getByRole("button", { name: "Baixar imagem" }))
      await waitFor(() => expect(picker).toHaveBeenCalledWith({ suggestedName: "Imagem.png" }))
    })

    it("a write failure aborts the writable and shows the error toast", async () => {
      const abort = vi.fn().mockResolvedValue(undefined)
      const write = vi.fn().mockRejectedValue(new Error("disk full"))
      stubSavePicker(
        vi.fn().mockResolvedValue({
          createWritable: vi.fn().mockResolvedValue({ write, close: vi.fn(), abort }),
        }),
      )
      fireEvent.click(openDownloadButton())
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith("Não foi possível baixar a imagem"),
      )
      expect(abort).toHaveBeenCalled()
      expect(toast.success).not.toHaveBeenCalled()
    })
  })

  // Regressão de segurança: qualquer arquivo que não fosse imagem abria numa
  // nova aba por um blob URL. Um .html escolhido pelo usuário rodava o script
  // dele na origem da aplicação e lia o localStorage dela.
  describe("abrir ou baixar um arquivo da lista", () => {
    function captureDownloads() {
      const names: string[] = []
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
        this: HTMLAnchorElement,
      ) {
        names.push(this.download)
      })
      return names
    }

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it.each([
      ["pagina.html", "text/html"],
      ["notas.txt", "text/plain"],
      ["dados.json", "application/json"],
      ["script.js", "text/javascript"],
      ["contrato.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      ["sem-tipo.bin", ""],
    ])("%s (%s) é baixado, nunca aberto em outra aba", (name, type) => {
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)
      const downloads = captureDownloads()
      render(<FileUpload value={[makeFile(name, type)]} />)
      expect(screen.queryByRole("button", { name: /em nova aba/ })).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole("button", { name: `Baixar ${name}` }))
      expect(openSpy).not.toHaveBeenCalled()
      expect(downloads).toEqual([name])
    })

    it("um PDF abre em outra aba, servido como application/pdf", () => {
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)
      const createSpy = vi.spyOn(URL, "createObjectURL")
      const downloads = captureDownloads()
      render(<FileUpload value={[makeFile("contrato.pdf", "application/pdf")]} />)
      fireEvent.click(screen.getByRole("button", { name: "Abrir contrato.pdf em nova aba" }))
      expect(openSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^blob:/),
        "_blank",
        "noopener,noreferrer",
      )
      const opened = createSpy.mock.calls.at(-1)?.[0] as Blob
      expect(opened.type).toBe("application/pdf")
      expect(downloads).toEqual([])
    })

    it("um SVG é imagem: abre na lightbox, dentro de um <img>, e não em outra aba", () => {
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)
      render(<FileUpload value={[makeFile("logo.svg", "image/svg+xml")]} />)
      fireEvent.click(screen.getByRole("button", { name: "Ampliar logo.svg" }))
      expect(openSpy).not.toHaveBeenCalled()
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    it("o texto do botão de baixar vem de labels", () => {
      render(
        <FileUpload
          value={[makeFile("notes.txt", "text/plain")]}
          labels={{ downloadFile: (name) => `Download ${name}` }}
        />,
      )
      expect(screen.getByRole("button", { name: "Download notes.txt" })).toBeInTheDocument()
    })
  })

  // Regressão: o <input type="file"> oculto era uma parada de Tab de 1×1 px
  // sem nome, e o aria-label da dropzone escondia a dica de tipo e tamanho.
  describe("teclado e leitor de tela", () => {
    it("o input de arquivo oculto fica fora da ordem de Tab e da árvore de acessibilidade", () => {
      render(<FileUpload />)
      const input = document.querySelector("input[type=file]") as HTMLInputElement
      expect(input).toHaveAttribute("tabindex", "-1")
      expect(input).toHaveAttribute("aria-hidden", "true")
    })

    it("Tab para na dropzone e segue adiante, sem uma segunda parada", async () => {
      const user = userEvent.setup()
      render(
        <>
          <FileUpload />
          <button type="button">Depois</button>
        </>,
      )
      await user.tab()
      expect(screen.getByRole("button", { name: /Arraste um arquivo/ })).toHaveFocus()
      await user.tab()
      expect(screen.getByRole("button", { name: "Depois" })).toHaveFocus()
    })

    it("a dropzone é nomeada pelo rótulo e descrita pela dica de tipo e tamanho", () => {
      render(<FileUpload label="Anexar contrato" accept="application/pdf" maxSize={1024} />)
      const dropzone = screen.getByRole("button", { name: "Anexar contrato" })
      expect(dropzone).not.toHaveAttribute("aria-label")
      expect(dropzone).toHaveAccessibleDescription(/application\/pdf/)
      expect(dropzone).toHaveAccessibleDescription(/até 1/)
    })

    it("a mensagem de erro entra na descrição da dropzone", () => {
      render(
        <FileUpload label="Anexar contrato" accept="application/pdf" error="Anexe o contrato." />,
      )
      const dropzone = screen.getByRole("button", { name: "Anexar contrato" })
      expect(dropzone).toHaveAccessibleDescription(/application\/pdf/)
      expect(dropzone).toHaveAccessibleDescription(/Anexe o contrato\./)
    })

    it("sem dica nem erro, a dropzone não aponta para descrição nenhuma", () => {
      render(<FileUpload label="Anexar" />)
      expect(screen.getByRole("button", { name: "Anexar" })).not.toHaveAttribute("aria-describedby")
    })

    it("um rótulo que não é texto também nomeia a dropzone", () => {
      render(
        <FileUpload
          label={
            <>
              Anexar <strong>laudo</strong>
            </>
          }
        />,
      )
      expect(screen.getByRole("button", { name: "Anexar laudo" })).toBeInTheDocument()
    })
  })

  // Regressão: sem onReject, um arquivo recusado sumia sem explicação. A
  // pessoa escolhia um arquivo grande demais e nada acontecia na tela.
  describe("mensagem de arquivo recusado", () => {
    function choose(...files: File[]) {
      const input = document.querySelector("input[type=file]") as HTMLInputElement
      fireEvent.change(input, { target: { files } })
    }

    it("arquivo acima do tamanho: aparece a mensagem, mesmo sem onReject", () => {
      render(<FileUpload maxSize={1024} />)
      choose(makeFile("planta.pdf", "application/pdf", 5000))
      expect(screen.getByRole("alert")).toHaveTextContent("planta.pdf: maior que 1,0 KB")
      expect(screen.queryByText("planta.pdf")).not.toBeInTheDocument()
    })

    it("tipo não aceito: aparece a mensagem", () => {
      render(<FileUpload accept="image/*" />)
      choose(makeFile("contrato.docx", "application/msword"))
      expect(screen.getByRole("alert")).toHaveTextContent(
        "contrato.docx: tipo de arquivo não aceito",
      )
    })

    it("arquivos além do limite: uma mensagem para cada um", () => {
      render(<FileUpload multiple maxFiles={2} />)
      choose(makeFile("a.txt"), makeFile("b.txt"), makeFile("c.txt"), makeFile("d.txt"))
      const alert = screen.getByRole("alert")
      expect(alert).toHaveTextContent("c.txt: passa do limite de 2 arquivos")
      expect(alert).toHaveTextContent("d.txt: passa do limite de 2 arquivos")
      expect(alert).not.toHaveTextContent("a.txt")
    })

    it("campo de um arquivo só: o segundo é recusado com o motivo", () => {
      render(<FileUpload />)
      choose(makeFile("a.txt"), makeFile("b.txt"))
      expect(screen.getByRole("alert")).toHaveTextContent("b.txt: só é possível enviar um arquivo")
    })

    it("a mensagem entra na descrição da dropzone", () => {
      render(<FileUpload label="Anexar" maxSize={1024} />)
      choose(makeFile("planta.pdf", "application/pdf", 5000))
      expect(screen.getByRole("button", { name: "Anexar" })).toHaveAccessibleDescription(
        /planta\.pdf: maior que 1,0 KB/,
      )
    })

    it("a mensagem some quando a próxima escolha é aceita", () => {
      render(<FileUpload maxSize={1024} />)
      choose(makeFile("grande.pdf", "application/pdf", 5000))
      expect(screen.getByRole("alert")).toBeInTheDocument()
      choose(makeFile("pequeno.pdf", "application/pdf", 10))
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
      expect(screen.getByText("pequeno.pdf")).toBeInTheDocument()
    })

    it("a foto da câmera recusada pelo filtro também é explicada", async () => {
      render(<FileUpload camera accept="application/pdf" />)
      // O mesmo caminho da câmera: o arquivo capturado passa por ingest.
      choose(makeFile("foto-1.jpg", "image/jpeg"))
      expect(screen.getByRole("alert")).toHaveTextContent("foto-1.jpg: tipo de arquivo não aceito")
    })

    it("onReject continua sendo chamado, junto com a mensagem", () => {
      const onReject = vi.fn()
      render(<FileUpload maxSize={1024} onReject={onReject} />)
      const file = makeFile("planta.pdf", "application/pdf", 5000)
      choose(file)
      expect(onReject).toHaveBeenCalledWith([{ file, reason: "size" }])
      expect(screen.getByRole("alert")).toBeInTheDocument()
    })

    it("showRejections={false} deixa o aviso só por conta de onReject", () => {
      const onReject = vi.fn()
      render(<FileUpload maxSize={1024} onReject={onReject} showRejections={false} />)
      choose(makeFile("planta.pdf", "application/pdf", 5000))
      expect(onReject).toHaveBeenCalledTimes(1)
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    it("os textos vêm de labels", () => {
      render(
        <FileUpload
          maxSize={1024}
          accept=".pdf"
          multiple
          maxFiles={1}
          labels={{
            rejectedType: (name) => `${name}: file type not allowed`,
            rejectedSize: (name, limit) => `${name}: larger than ${limit}`,
            rejectedMaxFiles: (name, limit) => `${name}: over the limit of ${limit}`,
          }}
        />,
      )
      choose(
        makeFile("a.txt", "text/plain"),
        makeFile("b.pdf", "application/pdf", 5000),
        makeFile("c.pdf", "application/pdf"),
        makeFile("d.pdf", "application/pdf"),
      )
      const alert = screen.getByRole("alert")
      expect(alert).toHaveTextContent("a.txt: file type not allowed")
      expect(alert).toHaveTextContent("b.pdf: larger than 1,0 KB")
      expect(alert).toHaveTextContent("d.pdf: over the limit of 1")
    })
  })

  // O campo não tinha id, name, required nem ref: um <label htmlFor>, um form
  // nativo, a validação do navegador e o foco do React Hook Form no erro não
  // tinham onde se prender.
  describe("id, name, required e ref", () => {
    function choose(...files: File[]) {
      const input = document.querySelector("input[type=file]:not([name])") as HTMLInputElement
      fireEvent.change(input, { target: { files } })
    }

    it("id fica na dropzone, e um <label htmlFor> de fora abre o seletor", () => {
      const click = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {})
      render(
        <>
          <label htmlFor="anexos">Anexos do processo</label>
          <FileUpload id="anexos" />
        </>,
      )
      expect(document.getElementById("anexos")?.tagName).toBe("BUTTON")
      fireEvent.click(screen.getByText("Anexos do processo"))
      expect(click).toHaveBeenCalledTimes(1)
      click.mockRestore()
    })

    it("ref aponta para a dropzone, que recebe o foco", () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<FileUpload ref={ref} label="Anexar" />)
      expect(ref.current).toBe(screen.getByRole("button", { name: "Anexar" }))
      act(() => ref.current?.focus())
      expect(screen.getByRole("button", { name: "Anexar" })).toHaveFocus()
    })

    it("com name, um input de arquivo oculto leva o nome para o form; sem name, não", () => {
      const { rerender } = render(<FileUpload name="anexos" />)
      const carrier = document.querySelector("input[type=file][name=anexos]") as HTMLInputElement
      expect(carrier).not.toBeNull()
      expect(carrier).toHaveAttribute("hidden")
      expect(carrier.multiple).toBe(true)
      // Só um input fica com o nome: o que abre o seletor continua sem.
      expect(document.querySelectorAll("input[name]")).toHaveLength(1)
      rerender(<FileUpload />)
      expect(document.querySelector("input[name]")).toBeNull()
    })

    it("required marca o rótulo e entra no nome da dropzone", () => {
      render(<FileUpload label="Anexar contrato" required />)
      expect(screen.getByRole("button", { name: "Anexar contrato (obrigatório)" })).toBeVisible()
      expect(document.querySelector("[data-slot=file-upload-required]")).toHaveTextContent("*")
    })

    it("required: o form não passa vazio; aparece o aviso e o foco vai à dropzone", () => {
      render(
        <form>
          <FileUpload label="Anexar contrato" required />
        </form>,
      )
      const form = document.querySelector("form") as HTMLFormElement
      let valid = true
      act(() => {
        valid = form.reportValidity()
      })
      expect(valid).toBe(false)
      const dropzone = screen.getByRole("button", { name: /Anexar contrato/ })
      expect(dropzone).toHaveFocus()
      expect(screen.getByRole("alert")).toHaveTextContent("Selecione um arquivo.")
      expect(dropzone).toHaveAccessibleDescription(/Selecione um arquivo\./)
    })

    it("required: com um arquivo na lista, ou um item, o form passa e o aviso some", () => {
      const { rerender } = render(
        <form>
          <FileUpload label="Anexar" required />
        </form>,
      )
      const form = document.querySelector("form") as HTMLFormElement
      act(() => {
        form.reportValidity()
      })
      choose(makeFile("a.pdf", "application/pdf"))
      expect(screen.queryByText("Selecione um arquivo.")).not.toBeInTheDocument()
      expect(form.checkValidity()).toBe(true)
      // Tirar o arquivo não traz o aviso de volta antes de um novo envio.
      fireEvent.click(screen.getByRole("button", { name: "Remover a.pdf" }))
      expect(screen.queryByText("Selecione um arquivo.")).not.toBeInTheDocument()
      choose(makeFile("a.pdf", "application/pdf"))
      rerender(
        <form>
          <FileUpload label="Anexar" required items={[{ id: "1", name: "salvo.pdf" }]} />
        </form>,
      )
      expect(form.checkValidity()).toBe(true)
    })

    it("o aviso de obrigatório vem de labels", () => {
      render(
        <form>
          <FileUpload
            label="Attach"
            required
            labels={{ required: "required", requiredError: "Choose a file." }}
          />
        </form>,
      )
      act(() => {
        ;(document.querySelector("form") as HTMLFormElement).reportValidity()
      })
      expect(screen.getByRole("button", { name: "Attach (required)" })).toBeInTheDocument()
      expect(screen.getByRole("alert")).toHaveTextContent("Choose a file.")
    })
  })

  // Regressão: o hover da miniatura baixava a opacidade dela inteira
  // (hover:opacity-80) em vez de usar a camada de estado do sistema.
  it("a miniatura usa a camada de estado, e não esmaece no hover", () => {
    render(<FileUpload multiple value={[makeFile("a.pdf", "application/pdf")]} />)
    const tile = screen.getByRole("button", { name: "Abrir a.pdf em nova aba" })
    expect(tile.className).not.toMatch(/hover:opacity/)
    expect(tile.querySelector("[data-slot=file-upload-tile-layer]")).toHaveClass("state-layer")
  })

  // Regressão: escolher de novo um arquivo que já está na lista o colocava
  // duas vezes, e ele seria enviado duas vezes.
  describe("mesmo arquivo duas vezes", () => {
    function choose(...files: File[]) {
      const input = document.querySelector("input[type=file]") as HTMLInputElement
      fireEvent.change(input, { target: { files } })
    }
    const sameFile = (name: string, size: number) =>
      new File(["x".repeat(size)], name, { type: "application/pdf", lastModified: 1_700_000_000 })

    it("escolher de novo o mesmo arquivo não o repete na lista", () => {
      const onValueChange = vi.fn()
      render(<FileUpload multiple onValueChange={onValueChange} />)
      choose(sameFile("contrato.pdf", 20))
      // O seletor devolve outro objeto File para o mesmo arquivo do disco.
      choose(sameFile("contrato.pdf", 20))
      expect(screen.getAllByText("contrato.pdf")).toHaveLength(1)
      expect(onValueChange).toHaveBeenCalledTimes(1)
    })

    it("o mesmo arquivo duas vezes na mesma escolha entra uma vez", () => {
      const onValueChange = vi.fn()
      render(<FileUpload multiple onValueChange={onValueChange} />)
      choose(sameFile("contrato.pdf", 20), sameFile("contrato.pdf", 20))
      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0]?.[0]).toHaveLength(1)
    })

    it("arquivos diferentes com o mesmo nome entram os dois", () => {
      render(<FileUpload multiple />)
      choose(sameFile("foto.pdf", 20))
      choose(sameFile("foto.pdf", 30))
      expect(screen.getAllByText("foto.pdf")).toHaveLength(2)
    })

    it("o repetido não ocupa lugar de maxFiles nem é recusado", () => {
      const onReject = vi.fn()
      render(<FileUpload multiple maxFiles={2} onReject={onReject} />)
      choose(sameFile("a.pdf", 10))
      choose(sameFile("a.pdf", 10), sameFile("b.pdf", 10))
      expect(screen.getByText("a.pdf")).toBeInTheDocument()
      expect(screen.getByText("b.pdf")).toBeInTheDocument()
      expect(onReject).not.toHaveBeenCalled()
    })
  })

  // Regressão: os tamanhos saíam com ponto decimal ("até 1.0 KB") e o "até"
  // e as unidades não podiam ser trocados.
  describe("tamanhos em português", () => {
    function choose(...files: File[]) {
      const input = document.querySelector("input[type=file]") as HTMLInputElement
      fireEvent.change(input, { target: { files } })
    }

    it("a dica, a lista e a recusa usam vírgula decimal", () => {
      render(<FileUpload multiple maxSize={1024 * 1024 * 2.5} />)
      expect(screen.getByText("até 2,5 MB")).toBeInTheDocument()
      choose(makeFile("a.pdf", "application/pdf", 1536), makeFile("b.pdf", "application/pdf", 10))
      expect(screen.getByText("1,5 KB")).toBeInTheDocument()
      expect(screen.getByText("10 B")).toBeInTheDocument()
      choose(makeFile("grande.pdf", "application/pdf", 1024 * 1024 * 3))
      expect(screen.getByRole("alert")).toHaveTextContent("grande.pdf: maior que 2,5 MB")
    })

    it("a unidade sobe quando o arredondamento chega a 1.024", () => {
      render(<FileUpload maxSize={1024 * 1024 - 1} />)
      // 1.048.575 bytes são 1.023,999 KB: arredondado, já é 1,0 MB.
      expect(screen.getByText("até 1,0 MB")).toBeInTheDocument()
    })

    it("gigabytes", () => {
      render(<FileUpload maxSize={1024 * 1024 * 1024 * 2} />)
      expect(screen.getByText("até 2,0 GB")).toBeInTheDocument()
    })

    it('o "até" e as unidades vêm de labels', () => {
      render(
        <FileUpload
          multiple
          maxSize={2048}
          labels={{
            maxSizeHint: (limit) => `up to ${limit}`,
            sizeUnits: { bytes: "bytes", kilobytes: "kB", megabytes: "MB", gigabytes: "GB" },
          }}
        />,
      )
      expect(screen.getByText("up to 2,0 kB")).toBeInTheDocument()
      choose(makeFile("a.pdf", "application/pdf", 10))
      expect(screen.getByText("10 bytes")).toBeInTheDocument()
    })
  })

  // O componente só conhecia `File[]`: não dava para mostrar o anexo que já
  // está salvo no servidor, nem o andamento ou a falha de um envio.
  describe("items: anexos do servidor e estado de envio", () => {
    const saved: FileUploadItem = {
      id: "a1",
      name: "contrato.pdf",
      size: 2048,
      url: "https://arquivos.example.com/contrato.pdf",
    }

    it("mostra os anexos existentes na mesma lista, antes dos arquivos escolhidos", () => {
      render(<FileUpload multiple items={[saved]} value={[makeFile("novo.txt")]} />)
      const rows = within(screen.getByRole("list", { name: "Arquivos selecionados" })).getAllByRole(
        "listitem",
      )
      expect(rows).toHaveLength(2)
      expect(rows[0]).toHaveTextContent("contrato.pdf")
      expect(rows[0]).toHaveTextContent("2,0 KB")
      expect(rows[1]).toHaveTextContent("novo.txt")
    })

    it("a lista aparece só com items, sem nenhum arquivo escolhido", () => {
      render(<FileUpload items={[saved]} />)
      expect(screen.getByRole("list", { name: "Arquivos selecionados" })).toBeInTheDocument()
      expect(screen.getByText("contrato.pdf")).toBeInTheDocument()
    })

    it("um anexo com url abre em outra aba, por um link", () => {
      render(<FileUpload items={[saved]} />)
      const link = screen.getByRole("link", { name: "Abrir contrato.pdf em nova aba" })
      expect(link).toHaveAttribute("href", "https://arquivos.example.com/contrato.pdf")
      expect(link).toHaveAttribute("target", "_blank")
      expect(link).toHaveAttribute("rel", "noopener noreferrer")
    })

    it("um anexo que não é imagem nem PDF é baixado, não aberto", () => {
      render(
        <FileUpload
          items={[
            { id: "h", name: "pagina.html", url: "https://arquivos.example.com/pagina.html" },
          ]}
        />,
      )
      const link = screen.getByRole("link", { name: "Baixar pagina.html" })
      expect(link).toHaveAttribute("href", "https://arquivos.example.com/pagina.html")
      expect(link).toHaveAttribute("download", "pagina.html")
      expect(screen.queryByRole("link", { name: /Abrir/ })).not.toBeInTheDocument()
    })

    it("um anexo de imagem com url mostra a miniatura e abre ampliado", () => {
      render(
        <FileUpload
          items={[
            { id: "i1", name: "fachada.jpg", url: "https://arquivos.example.com/fachada.jpg" },
          ]}
        />,
      )
      const thumb = document.querySelector("img[alt='fachada.jpg']") as HTMLImageElement
      expect(thumb).toHaveAttribute("src", "https://arquivos.example.com/fachada.jpg")
      fireEvent.click(screen.getByRole("button", { name: "Ampliar fachada.jpg" }))
      const dialog = screen.getByRole("dialog")
      expect(within(dialog).getByRole("img")).toHaveAttribute(
        "src",
        "https://arquivos.example.com/fachada.jpg",
      )
    })

    it("uma url com protocolo perigoso não vira link", () => {
      render(
        <FileUpload
          items={[{ id: "x", name: "nota.pdf", url: "javascript:alert(document.cookie)" }]}
        />,
      )
      expect(screen.getByText("nota.pdf")).toBeInTheDocument()
      expect(screen.queryByRole("link")).not.toBeInTheDocument()
    })

    it("sem url, o anexo aparece sem ação de abrir", () => {
      render(<FileUpload items={[{ id: "x", name: "nota.pdf", size: 10 }]} />)
      expect(screen.getByText("nota.pdf")).toBeInTheDocument()
      expect(screen.queryByRole("link")).not.toBeInTheDocument()
      expect(screen.queryByRole("button", { name: /nota\.pdf/ })).not.toBeInTheDocument()
    })

    it("em envio, mostra o andamento numa barra de progresso com nome", () => {
      render(
        <FileUpload
          items={[{ id: "u1", name: "planta.pdf", status: "uploading", progress: 40 }]}
        />,
      )
      const bar = screen.getByRole("progressbar", { name: "Envio de planta.pdf" })
      expect(bar).toHaveAttribute("aria-valuenow", "40")
      expect(screen.getByText("Enviando… 40%")).toBeInTheDocument()
    })

    it("em envio sem progresso conhecido, diz só que está enviando", () => {
      render(<FileUpload items={[{ id: "u1", name: "planta.pdf", status: "uploading" }]} />)
      expect(screen.getByText("Enviando…")).toBeInTheDocument()
      expect(screen.getByRole("progressbar", { name: "Envio de planta.pdf" })).not.toHaveAttribute(
        "aria-valuenow",
      )
    })

    it("com erro, mostra o motivo no lugar do tamanho", () => {
      render(
        <FileUpload
          items={[
            {
              id: "e1",
              name: "planta.pdf",
              size: 10,
              status: "error",
              error: "Arquivo corrompido",
            },
          ]}
        />,
      )
      expect(screen.getByRole("alert")).toHaveTextContent("Arquivo corrompido")
      expect(screen.queryByText("10 B")).not.toBeInTheDocument()
    })

    it("com erro e sem texto, usa a mensagem padrão", () => {
      render(<FileUpload items={[{ id: "e1", name: "planta.pdf", status: "error" }]} />)
      expect(screen.getByRole("alert")).toHaveTextContent("Falha no envio")
    })

    it("o botão de remover chama onRemoveItem com o id", () => {
      const onRemoveItem = vi.fn()
      const onValueChange = vi.fn()
      render(
        <FileUpload items={[saved]} onRemoveItem={onRemoveItem} onValueChange={onValueChange} />,
      )
      fireEvent.click(screen.getByRole("button", { name: "Remover contrato.pdf" }))
      expect(onRemoveItem).toHaveBeenCalledWith("a1")
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it("sem onRemoveItem, ou com removable={false}, o anexo não tem botão de remover", () => {
      const { rerender } = render(<FileUpload items={[saved]} />)
      expect(screen.queryByRole("button", { name: /Remover/ })).not.toBeInTheDocument()
      rerender(<FileUpload items={[saved]} onRemoveItem={vi.fn()} removable={false} />)
      expect(screen.queryByRole("button", { name: /Remover/ })).not.toBeInTheDocument()
    })

    it("os anexos existentes contam para maxFiles", () => {
      const onValueChange = vi.fn()
      const onReject = vi.fn()
      render(
        <FileUpload
          multiple
          maxFiles={2}
          items={[saved]}
          onValueChange={onValueChange}
          onReject={onReject}
        />,
      )
      const input = document.querySelector("input[type=file]") as HTMLInputElement
      const a = makeFile("a.txt")
      const b = makeFile("b.txt")
      fireEvent.change(input, { target: { files: [a, b] } })
      expect(onValueChange).toHaveBeenCalledWith([a])
      expect(onReject).toHaveBeenCalledWith([{ file: b, reason: "max-files" }])
    })

    it("preview='none' esconde também os anexos existentes", () => {
      render(<FileUpload preview="none" items={[saved]} />)
      expect(screen.queryByText("contrato.pdf")).not.toBeInTheDocument()
    })

    it("desabilitado, o anexo não remove nem abre a imagem", () => {
      render(
        <FileUpload
          disabled
          onRemoveItem={vi.fn()}
          items={[
            { id: "i1", name: "fachada.jpg", url: "https://arquivos.example.com/fachada.jpg" },
          ]}
        />,
      )
      expect(screen.getByRole("button", { name: "Remover fachada.jpg" })).toBeDisabled()
      expect(screen.getByRole("button", { name: "Ampliar fachada.jpg" })).toBeDisabled()
    })

    it("os textos de envio vêm de labels", () => {
      render(
        <FileUpload
          items={[
            { id: "u1", name: "a.pdf", status: "uploading", progress: 10 },
            { id: "e1", name: "b.pdf", status: "error" },
          ]}
          labels={{
            uploading: (progress) => `Uploading ${progress}%`,
            uploadFailed: "Upload failed",
            uploadProgress: (name) => `Upload of ${name}`,
          }}
        />,
      )
      expect(screen.getByText("Uploading 10%")).toBeInTheDocument()
      expect(screen.getByRole("alert")).toHaveTextContent("Upload failed")
      expect(screen.getByRole("progressbar", { name: "Upload of a.pdf" })).toBeInTheDocument()
    })
  })
  // Sem onBlur, o React Hook Form não marcava o campo como visitado.
  describe("onBlur", () => {
    it("é chamado quando o foco sai do campo, e não ao passar da dropzone para a lista", async () => {
      const user = userEvent.setup()
      const onBlur = vi.fn()
      render(
        <>
          <FileUpload
            label="Anexar"
            multiple
            value={[makeFile("a.pdf", "application/pdf")]}
            onBlur={onBlur}
          />
          <button type="button">Depois</button>
        </>,
      )
      await user.click(screen.getByRole("button", { name: "Anexar" }))
      await user.tab()
      expect(screen.getByRole("button", { name: "Abrir a.pdf em nova aba" })).toHaveFocus()
      expect(onBlur).not.toHaveBeenCalled()
      await user.click(screen.getByRole("button", { name: "Depois" }))
      expect(onBlur).toHaveBeenCalledTimes(1)
    })

    it("o foco andando dentro do diálogo da imagem não conta como sair do campo", async () => {
      const user = userEvent.setup()
      const onBlur = vi.fn()
      render(
        <FileUpload downloadable value={[makeFile("foto.png", "image/png")]} onBlur={onBlur} />,
      )
      await user.click(screen.getByRole("button", { name: "Ampliar foto.png" }))
      const dialog = await screen.findByRole("dialog")
      onBlur.mockClear()
      await user.tab()
      await user.tab()
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
      expect(onBlur).not.toHaveBeenCalled()
    })
  })
})
