import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { Toaster, toast } from "./sonner"

// Sonner persists state across renders via a module-level store. Clear every
// active toast after each test so failures don't leak into the next.
afterEach(() => {
  act(() => {
    toast.dismiss()
  })
})

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

  it("renders a success toast with data-type='success'", async () => {
    render(<Toaster />)
    toast.success("success-msg")
    const text = await screen.findByText("success-msg")
    const toastEl = text.closest("[data-sonner-toast]")
    expect(toastEl).toHaveAttribute("data-type", "success")
  })

  it("renders an error toast with data-type='error'", async () => {
    render(<Toaster />)
    toast.error("error-msg")
    const text = await screen.findByText("error-msg")
    const toastEl = text.closest("[data-sonner-toast]")
    expect(toastEl).toHaveAttribute("data-type", "error")
  })

  it("renders a warning toast with data-type='warning'", async () => {
    render(<Toaster />)
    toast.warning("warn-msg")
    const text = await screen.findByText("warn-msg")
    const toastEl = text.closest("[data-sonner-toast]")
    expect(toastEl).toHaveAttribute("data-type", "warning")
  })

  it("renders an info toast with data-type='info'", async () => {
    render(<Toaster />)
    toast.info("info-msg")
    const text = await screen.findByText("info-msg")
    const toastEl = text.closest("[data-sonner-toast]")
    expect(toastEl).toHaveAttribute("data-type", "info")
  })

  it("defaults the toaster position to bottom-right (sonner default)", async () => {
    render(<Toaster />)
    // Sonner returns null from its root when there are no toasts in the queue,
    // so dispatch one first to force the [data-sonner-toaster] element to mount.
    toast("pos-default")
    await screen.findByText("pos-default")
    const toaster = document.querySelector("[data-sonner-toaster]")
    expect(toaster).toHaveAttribute("data-y-position", "bottom")
    expect(toaster).toHaveAttribute("data-x-position", "right")
  })

  it("honors a custom position prop", async () => {
    render(<Toaster position="top-left" />)
    toast("pos-custom")
    await screen.findByText("pos-custom")
    const toaster = document.querySelector("[data-sonner-toaster]")
    expect(toaster).toHaveAttribute("data-y-position", "top")
    expect(toaster).toHaveAttribute("data-x-position", "left")
  })

  it("toggles rich-colors on individual toasts when richColors is enabled", async () => {
    render(<Toaster richColors />)
    toast.success("rich-msg")
    const text = await screen.findByText("rich-msg")
    const toastEl = text.closest("[data-sonner-toast]")
    // Sonner stamps data-rich-colors on each toast element when the Toaster
    // has richColors enabled. The Toaster root itself doesn't carry the attr.
    expect(toastEl).toHaveAttribute("data-rich-colors", "true")
  })

  it("dismisses a toast by id via toast.dismiss(id)", async () => {
    render(<Toaster />)
    let id: string | number = ""
    act(() => {
      id = toast("bye-msg")
    })
    await screen.findByText("bye-msg")
    act(() => {
      toast.dismiss(id)
    })
    await waitFor(() => {
      expect(screen.queryByText("bye-msg")).not.toBeInTheDocument()
    })
  })

  it("renders a close button when closeButton is enabled and clicking it dismisses", async () => {
    render(<Toaster closeButton />)
    toast("with-close")
    await screen.findByText("with-close")
    // Sonner's close button carries an aria-label of "Close toast" by default.
    const closeBtn = await screen.findByLabelText("Close toast")
    // Use fireEvent.click here so we skip the pointerdown phase — sonner calls
    // event.target.setPointerCapture() which is not implemented in jsdom and
    // would otherwise raise an unhandled exception (harmless but noisy).
    fireEvent.click(closeBtn)
    await waitFor(() => {
      expect(screen.queryByText("with-close")).not.toBeInTheDocument()
    })
  })

  it("resolves toast.promise from loading to success", async () => {
    render(<Toaster />)
    let resolveFn: (value: string) => void = () => {}
    const promise = new Promise<string>((res) => {
      resolveFn = res
    })
    act(() => {
      toast.promise(promise, {
        loading: "loading-msg",
        success: (v) => `done-${v}`,
        error: "err",
      })
    })
    expect(await screen.findByText("loading-msg")).toBeInTheDocument()
    await act(async () => {
      resolveFn("ok")
      await promise
    })
    expect(await screen.findByText("done-ok")).toBeInTheDocument()
  })

  it("queues multiple toasts without unmounting earlier ones", async () => {
    render(<Toaster />)
    act(() => {
      toast("first")
      toast("second")
      toast("third")
    })
    await screen.findByText("first")
    await screen.findByText("second")
    await screen.findByText("third")
    expect(screen.getByText("first")).toBeInTheDocument()
    expect(screen.getByText("second")).toBeInTheDocument()
    expect(screen.getByText("third")).toBeInTheDocument()
  })
})
