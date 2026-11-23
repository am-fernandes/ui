import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { useForm } from "react-hook-form"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Textarea, defaultTextareaLabels } from "./textarea"

describe("Textarea", () => {
  it("renders label associated with textarea", () => {
    render(<Textarea label="Descrição" />)
    const ta = screen.getByLabelText("Descrição")
    expect(ta.tagName).toBe("TEXTAREA")
  })

  it("renders description and error", () => {
    render(<Textarea label="X" description="ajuda" error="erro" />)
    expect(screen.getByText("ajuda")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("erro")
    expect(screen.getByLabelText("X")).toHaveAttribute("aria-invalid", "true")
  })

  it("renders maxLength counter when set", () => {
    render(<Textarea label="X" maxLength={100} value="abc" onChange={() => {}} />)
    expect(screen.getByText("3/100")).toBeInTheDocument()
  })

  it("forwards onChange", () => {
    const onChange = vi.fn()
    render(<Textarea label="X" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText("X"), { target: { value: "abc" } })
    expect(onChange).toHaveBeenCalled()
  })

  it("forwards ref", () => {
    let captured: HTMLTextAreaElement | null = null
    render(
      <Textarea
        label="X"
        ref={(el) => {
          captured = el
        }}
      />,
    )
    expect(captured).toBeInstanceOf(HTMLTextAreaElement)
  })

  it("respects disabled and readOnly", () => {
    const { rerender } = render(<Textarea label="X" disabled />)
    expect(screen.getByLabelText("X")).toBeDisabled()
    rerender(<Textarea label="X" readOnly />)
    expect(screen.getByLabelText("X")).toHaveAttribute("readonly")
  })

  it("uncontrolled counter updates as user types (defaultValue path)", async () => {
    render(<Textarea label="X" maxLength={50} defaultValue="hi" />)
    expect(screen.getByText("2/50")).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText("X"), "!!")
    expect(screen.getByText("4/50")).toBeInTheDocument()
  })

  it("autoResize sets inline height after value change", () => {
    // Define scrollHeight so jsdom returns a non-zero number — verifies
    // the effect copies scrollHeight into style.height.
    const proto = HTMLTextAreaElement.prototype as unknown as { scrollHeight?: number }
    const originalDescriptor = Object.getOwnPropertyDescriptor(proto, "scrollHeight")
    Object.defineProperty(proto, "scrollHeight", {
      configurable: true,
      get() {
        return 123
      },
    })
    try {
      const { rerender } = render(<Textarea label="X" autoResize value="" onChange={() => {}} />)
      const el = screen.getByLabelText("X") as HTMLTextAreaElement
      expect(el.className).toContain("resize-none")
      expect(el.className).toContain("overflow-hidden")
      // Trigger effect with new value to force height recompute.
      rerender(<Textarea label="X" autoResize value="multi\nline" onChange={() => {}} />)
      expect(el.style.height).toBe("123px")
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(proto, "scrollHeight", originalDescriptor)
      } else {
        Reflect.deleteProperty(proto, "scrollHeight")
      }
    }
  })

  it("does NOT add autoResize classes when autoResize is omitted", () => {
    render(<Textarea label="X" />)
    const el = screen.getByLabelText("X")
    expect(el.className).not.toContain("resize-none")
    expect(el.className).not.toContain("overflow-hidden")
  })

  it("supports labelPosition variants", () => {
    const { rerender } = render(<Textarea label="X" labelPosition="left" />)
    expect(document.querySelector('[data-slot="field-shell"]')).toHaveAttribute(
      "data-label-position",
      "left",
    )
    rerender(<Textarea label="X" labelPosition="hidden" />)
    expect(document.querySelector('[data-slot="field-shell"]')).toHaveAttribute(
      "data-label-position",
      "hidden",
    )
  })

  it("accepts a MutableRefObject (not just a callback) ref", () => {
    const ref = React.createRef<HTMLTextAreaElement>()
    render(<Textarea label="X" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it("controlled value renders correctly with null/undefined fallback", () => {
    // value=undefined is the uncontrolled branch — already covered. Here we
    // exercise the controlled path with empty string to hit the `value ?? ""`
    // branch in the counter.
    render(<Textarea label="X" maxLength={10} value={""} onChange={() => {}} />)
    expect(screen.getByText("0/10")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    render(<Textarea label="X" className="my-ta" />)
    expect(screen.getByLabelText("X")).toHaveClass("my-ta")
  })

  // The counter used to be a polite live region: a screen reader read
  // "27/500", "28/500"… after every key, and never when the field got focus.
  describe("counter for assistive technology", () => {
    const announcer = () => document.querySelector('[data-slot="live-announcer"]')
    const counter = () => document.querySelector('[data-slot="textarea-counter"]') as HTMLElement
    beforeEach(() => announcer()?.remove())

    it("is not a live region: typing announces nothing", async () => {
      render(<Textarea label="Obs" maxLength={100} defaultValue="abc" />)
      expect(counter()).not.toHaveAttribute("aria-live")
      expect(counter().closest("[aria-live], [role=status], [role=alert]")).toBeNull()
      await userEvent.type(screen.getByLabelText("Obs"), "defg")
      await new Promise((resolve) => setTimeout(resolve, 150))
      expect(announcer()?.textContent ?? "").toBe("")
    })

    it("describes the field, in words, so it is read when the field gets focus", async () => {
      render(<Textarea label="Obs" description="Ajuda" maxLength={100} defaultValue="abc" />)
      const textarea = screen.getByLabelText("Obs")
      expect(textarea.getAttribute("aria-describedby")?.split(" ")).toContain(counter().id)
      expect(textarea).toHaveAccessibleDescription("Ajuda 3 de 100 caracteres")
      // What is on screen stays "3/100", hidden from the reading.
      expect(screen.getByText("3/100")).toHaveAttribute("aria-hidden", "true")
      await userEvent.type(textarea, "d")
      expect(textarea).toHaveAccessibleDescription("Ajuda 4 de 100 caracteres")
    })

    it("announces once when the limit is reached, and again only after leaving it", async () => {
      render(<Textarea label="Obs" maxLength={5} defaultValue="abc" />)
      const textarea = screen.getByLabelText("Obs")
      await userEvent.type(textarea, "de")
      await waitFor(() => expect(announcer()).toHaveTextContent("Limite de 5 caracteres atingido"))

      announcer()?.remove()
      // Still at the limit: more keys change nothing and say nothing.
      await userEvent.type(textarea, "f")
      await new Promise((resolve) => setTimeout(resolve, 150))
      expect(announcer()?.textContent ?? "").toBe("")

      await userEvent.type(textarea, "{Backspace}")
      await userEvent.type(textarea, "z")
      await waitFor(() => expect(announcer()).toHaveTextContent("Limite de 5 caracteres atingido"))
    })

    it("says nothing for a field that already mounts at the limit", async () => {
      render(<Textarea label="Obs" maxLength={3} defaultValue="abc" />)
      await new Promise((resolve) => setTimeout(resolve, 150))
      expect(announcer()?.textContent ?? "").toBe("")
    })

    it("takes its words from `labels`", async () => {
      render(
        <Textarea
          label="Notes"
          maxLength={4}
          defaultValue="abc"
          labels={{
            characterCount: (count, max) => `${count} of ${max} characters`,
            limitReached: (max) => `Limit of ${max} characters reached`,
          }}
        />,
      )
      const textarea = screen.getByLabelText("Notes")
      expect(textarea).toHaveAccessibleDescription("3 of 4 characters")
      await userEvent.type(textarea, "d")
      await waitFor(() => expect(announcer()).toHaveTextContent("Limit of 4 characters reached"))
      expect(defaultTextareaLabels.characterCount(3, 4)).toBe("3 de 4 caracteres")
      expect(defaultTextareaLabels.limitReached(4)).toBe("Limite de 4 caracteres atingido")
    })

    it("has no counter, and describes nothing, without maxLength", () => {
      render(<Textarea label="Obs" />)
      expect(counter()).toBeNull()
      expect(screen.getByLabelText("Obs")).not.toHaveAttribute("aria-describedby")
    })
  })

  // A textarea grows with its content, so `size` gives the minimum height: one
  // row is exactly as tall as an Input of that size (measured in a real
  // browser by tests/e2e/control-size.spec.ts).
  describe("size", () => {
    it("uses the minimum height of the shared control sizes, md by default", () => {
      const { rerender } = render(<Textarea label="X" />)
      const el = () => screen.getByLabelText("X")
      expect(el()).toHaveClass("min-h-control-md", "px-3")
      expect(el().className).not.toMatch(/(^|\s)h-control-/)

      rerender(<Textarea label="X" size="sm" />)
      expect(el()).toHaveClass("min-h-control-sm", "px-2.5")
      expect(el()).not.toHaveClass("min-h-control-md")

      rerender(<Textarea label="X" size="lg" />)
      expect(el()).toHaveClass("min-h-control-lg", "px-4")
    })
  })

  // The counter and the height used to follow React's onChange only, so a
  // value that reaches the DOM any other way (react-hook-form's `register`,
  // a form reset, an assignment through the ref) left them stale.
  describe("value written without onChange", () => {
    it("counts the defaultValues react-hook-form writes through `register`", () => {
      function Form() {
        const { register } = useForm({ defaultValues: { obs: "Cliente pediu retorno na sexta" } })
        return <Textarea label="Obs" maxLength={500} {...register("obs")} />
      }
      render(<Form />)
      expect(screen.getByLabelText("Obs")).toHaveValue("Cliente pediu retorno na sexta")
      expect(screen.getByText("30/500")).toBeInTheDocument()
    })

    it("follows react-hook-form's reset()", async () => {
      function Form() {
        const { register, reset } = useForm({ defaultValues: { obs: "" } })
        return (
          <>
            <Textarea label="Obs" maxLength={500} {...register("obs")} />
            <button type="button" onClick={() => reset({ obs: "x".repeat(240) })}>
              Carregar
            </button>
          </>
        )
      }
      render(<Form />)
      expect(screen.getByText("0/500")).toBeInTheDocument()
      await userEvent.click(screen.getByRole("button", { name: "Carregar" }))
      expect(await screen.findByText("240/500")).toBeInTheDocument()
    })

    it("follows react-hook-form's setValue(), which re-renders nothing", async () => {
      function Form() {
        const { register, setValue } = useForm({ defaultValues: { obs: "" } })
        return (
          <>
            <Textarea label="Obs" maxLength={500} {...register("obs")} />
            <button type="button" onClick={() => setValue("obs", "Modelo de observação")}>
              Usar modelo
            </button>
          </>
        )
      }
      render(<Form />)
      await userEvent.click(screen.getByRole("button", { name: "Usar modelo" }))
      expect(screen.getByLabelText("Obs")).toHaveValue("Modelo de observação")
      expect(await screen.findByText("20/500")).toBeInTheDocument()
    })

    it("goes back to the default length on a native form reset", async () => {
      render(
        <form>
          <Textarea label="Obs" maxLength={50} defaultValue="" />
          <button type="reset">Limpar</button>
        </form>,
      )
      await userEvent.type(screen.getByLabelText("Obs"), "texto")
      expect(screen.getByText("5/50")).toBeInTheDocument()
      await userEvent.click(screen.getByRole("button", { name: "Limpar" }))
      expect(screen.getByLabelText("Obs")).toHaveValue("")
      expect(await screen.findByText("0/50")).toBeInTheDocument()
    })

    it("counts a value assigned through the ref, with no event at all", async () => {
      const ref = React.createRef<HTMLTextAreaElement>()
      render(<Textarea label="Obs" maxLength={500} ref={ref} />)
      expect(screen.getByText("0/500")).toBeInTheDocument()
      await act(async () => {
        ;(ref.current as HTMLTextAreaElement).value = "x".repeat(120)
      })
      expect(screen.getByText("120/500")).toBeInTheDocument()
    })

    it("still fires onChange for what the user types after such an assignment", async () => {
      const onChange = vi.fn()
      const ref = React.createRef<HTMLTextAreaElement>()
      render(<Textarea label="Obs" maxLength={500} ref={ref} onChange={onChange} />)
      await act(async () => {
        ;(ref.current as HTMLTextAreaElement).value = "abc"
      })
      await userEvent.type(screen.getByLabelText("Obs"), "d")
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(screen.getByLabelText("Obs")).toHaveValue("abcd")
      expect(screen.getByText("4/500")).toBeInTheDocument()
    })

    it("leaves the counter of a controlled textarea to its `value`", async () => {
      const ref = React.createRef<HTMLTextAreaElement>()
      render(<Textarea label="Obs" maxLength={10} value="abc" onChange={() => {}} ref={ref} />)
      await act(async () => {
        ;(ref.current as HTMLTextAreaElement).value = "abcdef"
      })
      expect(screen.getByText("3/10")).toBeInTheDocument()
    })
  })

  describe("autoResize measured from the DOM", () => {
    let scrollHeight = 0
    const proto = HTMLTextAreaElement.prototype
    const original = Object.getOwnPropertyDescriptor(proto, "scrollHeight")

    function mockScrollHeight(initial: number) {
      scrollHeight = initial
      Object.defineProperty(proto, "scrollHeight", { configurable: true, get: () => scrollHeight })
    }

    afterEach(() => {
      if (original) Object.defineProperty(proto, "scrollHeight", original)
      else Reflect.deleteProperty(proto, "scrollHeight")
      vi.unstubAllGlobals()
    })

    it("grows when the value is assigned through the ref", async () => {
      mockScrollHeight(60)
      const ref = React.createRef<HTMLTextAreaElement>()
      render(<Textarea label="Obs" autoResize ref={ref} />)
      const el = ref.current as HTMLTextAreaElement
      expect(el.style.height).toBe("60px")
      scrollHeight = 262
      await act(async () => {
        el.value = Array.from({ length: 12 }, (_, i) => `Linha ${i + 1}`).join("\n")
      })
      expect(el.style.height).toBe("262px")
    })

    it("grows with the defaultValues react-hook-form writes on mount", () => {
      mockScrollHeight(180)
      function Form() {
        const { register } = useForm({ defaultValues: { obs: "a\nb\nc\nd\ne\nf\ng\nh" } })
        return <Textarea label="Obs" autoResize {...register("obs")} />
      }
      render(<Form />)
      expect((screen.getByLabelText("Obs") as HTMLTextAreaElement).style.height).toBe("180px")
    })

    it("shrinks back on a native form reset", async () => {
      mockScrollHeight(60)
      render(
        <form>
          <Textarea label="Obs" autoResize defaultValue="" />
          <button type="reset">Limpar</button>
        </form>,
      )
      const el = screen.getByLabelText("Obs") as HTMLTextAreaElement
      scrollHeight = 140
      await userEvent.type(el, "a{Enter}b{Enter}c{Enter}d")
      expect(el.style.height).toBe("140px")
      scrollHeight = 60
      await userEvent.click(screen.getByRole("button", { name: "Limpar" }))
      await waitFor(() => expect(el.style.height).toBe("60px"))
    })

    it("measures again when the box gets narrower and the text wraps", async () => {
      let notify: () => void = () => {}
      class FakeResizeObserver {
        constructor(callback: () => void) {
          notify = callback
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      }
      vi.stubGlobal("ResizeObserver", FakeResizeObserver)
      let clientWidth = 360
      const widthDescriptor = Object.getOwnPropertyDescriptor(proto, "clientWidth")
      Object.defineProperty(proto, "clientWidth", { configurable: true, get: () => clientWidth })
      try {
        mockScrollHeight(100)
        render(<Textarea label="Obs" autoResize defaultValue="um texto comprido que quebra" />)
        const el = screen.getByLabelText("Obs") as HTMLTextAreaElement
        expect(el.style.height).toBe("100px")
        // Same value, narrower box: the text wraps into more lines.
        clientWidth = 180
        scrollHeight = 220
        act(() => notify())
        await waitFor(() => expect(el.style.height).toBe("220px"))
      } finally {
        if (widthDescriptor) Object.defineProperty(proto, "clientWidth", widthDescriptor)
        else Reflect.deleteProperty(proto, "clientWidth")
      }
    })

    it("clears the inline height when autoResize is turned off", () => {
      mockScrollHeight(90)
      const { rerender } = render(<Textarea label="Obs" autoResize defaultValue="a" />)
      const el = screen.getByLabelText("Obs") as HTMLTextAreaElement
      expect(el.style.height).toBe("90px")
      rerender(<Textarea label="Obs" defaultValue="a" />)
      expect(el.style.height).toBe("")
    })
  })
})
