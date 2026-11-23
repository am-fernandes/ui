import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

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

  it("maps Sonner's status colours to the strong fills of the palette", async () => {
    render(<Toaster richColors />)
    toast.success("fill-msg")
    const text = await screen.findByText("fill-msg")
    const toaster = text.closest("[data-sonner-toaster]") as HTMLElement
    expect(toaster.style.getPropertyValue("--success-bg")).toBe("var(--success)")
    expect(toaster.style.getPropertyValue("--success-text")).toBe("var(--success-foreground)")
    expect(toaster.style.getPropertyValue("--warning-text")).toBe("var(--warning-foreground)")
    expect(toaster.style.getPropertyValue("--error-bg")).toBe("var(--destructive)")
    expect(toaster.style.getPropertyValue("--info-bg")).toBe("var(--info)")
  })

  // The consumer's props used to replace the library's: one `toastOptions`
  // and the toast lost `group/toast`, which is what colours its icon.
  describe("consumer props are merged with the library's", () => {
    const toastOf = async (message: string) =>
      (await screen.findByText(message)).closest("[data-sonner-toast]") as HTMLElement
    const toasterOf = (toastElement: HTMLElement) =>
      toastElement.closest("[data-sonner-toaster]") as HTMLElement

    it("toastOptions without classNames keeps the library's toast class", async () => {
      render(<Toaster richColors toastOptions={{ duration: 8000 }} />)
      toast.success("merge-duration")
      expect(await toastOf("merge-duration")).toHaveClass("group/toast")
    })

    it("toastOptions.classNames adds to the library's classes, part by part", async () => {
      render(
        <Toaster
          toastOptions={{ classNames: { toast: "meu-toast", description: "minha-descricao" } }}
        />,
      )
      toast("merge-classes", { description: "detalhe" })
      const element = await toastOf("merge-classes")
      expect(element).toHaveClass("group/toast", "meu-toast")
      expect(screen.getByText("detalhe")).toHaveClass("minha-descricao")
    })

    it("style adds to the library's variables and wins where both set one", async () => {
      render(
        <Toaster style={{ "--width": "420px", "--normal-bg": "tomato" } as React.CSSProperties} />,
      )
      toast("merge-style")
      const toaster = toasterOf(await toastOf("merge-style"))
      expect(toaster.style.getPropertyValue("--width")).toBe("420px")
      expect(toaster.style.getPropertyValue("--normal-bg")).toBe("tomato")
      // Untouched ones are still the library's.
      expect(toaster.style.getPropertyValue("--normal-text")).toBe("var(--popover-foreground)")
      expect(toaster.style.getPropertyValue("--error-bg")).toBe("var(--destructive)")
      expect(toaster.style.zIndex).toBe("var(--z-toast)")
    })

    it("icons replaces only the icons it names", async () => {
      render(<Toaster icons={{ success: <span data-testid="meu-icone" /> }} />)
      toast.success("merge-icon-success")
      toast.error("merge-icon-error")
      const success = await toastOf("merge-icon-success")
      const error = await toastOf("merge-icon-error")
      expect(success.querySelector('[data-testid="meu-icone"]')).not.toBeNull()
      expect(error.querySelector("svg.lucide-octagon-x")).not.toBeNull()
    })

    it("className adds to the library's", async () => {
      render(<Toaster className="meu-toaster" />)
      toast("merge-class")
      expect(toasterOf(await toastOf("merge-class"))).toHaveClass("toaster", "group", "meu-toaster")
    })
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

  // An error vanished after Sonner's 4s, before it could be read or acted on,
  // and a toast had no close button unless the consumer asked for one; the
  // labels were Sonner's English ones.
  describe("errors stay, every toast can be closed, labels in Portuguese", () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    /** Lets Sonner's timers run past its 4s lifetime and the exit animation. */
    const waitPastLifetime = () =>
      act(async () => {
        await vi.advanceTimersByTimeAsync(10_000)
      })

    it("toast.error stays until it is closed; the other types still expire", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      render(<Toaster />)
      act(() => {
        toast.error("erro-fica")
        toast.success("sucesso-sai")
      })
      await screen.findByText("erro-fica")
      await screen.findByText("sucesso-sai")
      await waitPastLifetime()
      expect(screen.getByText("erro-fica")).toBeInTheDocument()
      expect(screen.queryByText("sucesso-sai")).not.toBeInTheDocument()
    })

    it("an explicit duration on toast.error still wins", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      render(<Toaster />)
      act(() => {
        toast.error("erro-com-prazo", { duration: 3000 })
      })
      await screen.findByText("erro-com-prazo")
      await waitPastLifetime()
      expect(screen.queryByText("erro-com-prazo")).not.toBeInTheDocument()
    })

    it("the error of toast.promise stays too, its success does not", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      render(<Toaster />)
      act(() => {
        toast.promise(Promise.reject(new Error("x")), {
          loading: "enviando-1",
          error: (e: Error) => `falhou-${e.message}`,
        })
        toast.promise(Promise.resolve("ok"), { loading: "enviando-2", success: "foi" })
      })
      await screen.findByText("falhou-x")
      await screen.findByText("foi")
      await waitPastLifetime()
      expect(screen.getByText("falhou-x")).toBeInTheDocument()
      expect(screen.queryByText("foi")).not.toBeInTheDocument()
    })

    it("an extended error result of toast.promise keeps its own options", async () => {
      render(<Toaster />)
      act(() => {
        toast.promise(Promise.reject(new Error("x")), {
          loading: "enviando-3",
          error: { message: "falhou-estendido", description: "detalhe-estendido" },
        })
      })
      expect(await screen.findByText("falhou-estendido")).toBeInTheDocument()
      expect(screen.getByText("detalhe-estendido")).toBeInTheDocument()
    })

    it("shows a close button by default, labelled in Portuguese", async () => {
      render(<Toaster />)
      toast("com-x")
      await screen.findByText("com-x")
      expect(screen.getByRole("button", { name: "Fechar notificação" })).toBeInTheDocument()
      expect(screen.queryByLabelText("Close toast")).not.toBeInTheDocument()
    })

    it("closeButton={false} still hides it", async () => {
      render(<Toaster closeButton={false} />)
      toast("sem-x")
      await screen.findByText("sem-x")
      expect(screen.queryByRole("button", { name: "Fechar notificação" })).not.toBeInTheDocument()
    })

    it("names the notification region in Portuguese, with the shortcut", async () => {
      render(<Toaster />)
      toast("regiao")
      await screen.findByText("regiao")
      const region = document.querySelector("section[aria-live]") as HTMLElement
      expect(region.getAttribute("aria-label")).toMatch(/^Notificações /)
      expect(region.getAttribute("aria-label")).not.toMatch(/Notifications/)
    })

    it("the labels can still be changed", async () => {
      render(
        <Toaster
          containerAriaLabel="Avisos"
          toastOptions={{ closeButtonAriaLabel: "Dispensar aviso" }}
        />,
      )
      toast("rotulos")
      await screen.findByText("rotulos")
      expect(screen.getByRole("button", { name: "Dispensar aviso" })).toBeInTheDocument()
      expect(document.querySelector("section[aria-live]")?.getAttribute("aria-label")).toMatch(
        /^Avisos /,
      )
    })
  })

  it("renders a close button when closeButton is enabled and clicking it dismisses", async () => {
    render(<Toaster closeButton />)
    toast("with-close")
    await screen.findByText("with-close")
    const closeBtn = await screen.findByLabelText("Fechar notificação")
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
