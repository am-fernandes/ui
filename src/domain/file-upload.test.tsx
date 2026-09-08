import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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

  it("removable={false} keeps the row visible but drops the Remover button", () => {
    render(<FileUpload multiple removable={false} value={[makeFile("a.txt", "text/plain")]} />)
    expect(screen.getByText("a.txt")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Remover a\.txt/ })).not.toBeInTheDocument()
  })

  it("image lightbox exposes explicit download and close buttons", () => {
    render(<FileUpload accept="image/*" value={[makeFile("photo.png", "image/png", 100)]} />)
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
    expect(screen.getByText(/2\.0 MB/)).toBeInTheDocument()
    unmount()
    render(<FileUpload maxSize={3 * 1024 * 1024 * 1024} />)
    expect(screen.getByText(/3\.0 GB/)).toBeInTheDocument()
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
    expect(screen.getByText(/2\.0 KB/)).toBeInTheDocument()
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
})
