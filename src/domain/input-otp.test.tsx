import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { InputOTP, REGEXP_ONLY_DIGITS } from "./input-otp"

afterEach(() => {
  cleanup()
})

describe("InputOTP", () => {
  it("renders the requested number of slots", () => {
    const { container } = render(<InputOTP length={4} value="" onValueChange={() => {}} />)
    expect(container.querySelectorAll('[data-slot="input-otp-slot"]')).toHaveLength(4)
  })

  it("renders the label and error", () => {
    render(
      <InputOTP length={4} value="" onValueChange={() => {}} label="Código" error="inválido" />,
    )
    expect(screen.getByText("Código")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("inválido")
  })

  it("re-exports REGEXP_ONLY_DIGITS", () => {
    expect(REGEXP_ONLY_DIGITS).toBe("^\\d+$")
  })

  it("fires onComplete when length reached", () => {
    const onComplete = vi.fn()
    function Wrapper() {
      const [v, setV] = React.useState("")
      return <InputOTP length={6} value={v} onValueChange={setV} onComplete={onComplete} />
    }
    render(<Wrapper />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "123456" } })
    expect(onComplete).toHaveBeenCalledWith("123456")
  })

  it("can override the default digits-only pattern", () => {
    function WithAlpha() {
      const [v, setV] = React.useState("")
      return <InputOTP length={6} value={v} onValueChange={setV} pattern="^[a-zA-Z0-9]+$" />
    }
    render(<WithAlpha />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "abc" } })
    expect(input.value).toBe("abc")
  })

  // -- Additional coverage tests below --------------------------------------

  it("does NOT fire onComplete for a partial value (length < required)", () => {
    const onComplete = vi.fn()
    function Wrapper() {
      const [v, setV] = React.useState("")
      return <InputOTP length={6} value={v} onValueChange={setV} onComplete={onComplete} />
    }
    render(<Wrapper />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "123" } })
    expect(onComplete).not.toHaveBeenCalled()
  })

  it("disabled flag is forwarded to the underlying OTPInput input element", () => {
    render(<InputOTP length={4} value="" onValueChange={() => {}} disabled />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toBeDisabled()
  })

  it("error renders the alert message via FieldShell", () => {
    render(<InputOTP length={4} value="" onValueChange={() => {}} error="bad" />)
    expect(screen.getByRole("alert")).toHaveTextContent("bad")
  })

  it("supports labelPosition='left'", () => {
    const { container } = render(
      <InputOTP length={4} value="" onValueChange={() => {}} label="Código" labelPosition="left" />,
    )
    const shell = container.querySelector("[data-slot='field-shell']")
    expect(shell).toHaveAttribute("data-label-position", "left")
  })

  it("supports labelPosition='hidden' (label is sr-only)", () => {
    render(
      <InputOTP
        length={4}
        value=""
        onValueChange={() => {}}
        label="Código"
        labelPosition="hidden"
      />,
    )
    const label = screen.getByText("Código")
    expect(label.className).toMatch(/sr-only/)
  })

  it("renders the description below the field", () => {
    render(<InputOTP length={4} value="" onValueChange={() => {}} description="Digite o código" />)
    expect(screen.getByText("Digite o código")).toBeInTheDocument()
  })

  it("custom non-digits pattern keeps onComplete behaviour", () => {
    const onComplete = vi.fn()
    function Wrapper() {
      const [v, setV] = React.useState("")
      return (
        <InputOTP
          length={3}
          value={v}
          onValueChange={setV}
          pattern="^[a-zA-Z]+$"
          onComplete={onComplete}
        />
      )
    }
    render(<Wrapper />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "abc" } })
    expect(onComplete).toHaveBeenCalledWith("abc")
  })

  it("renders consistent slot count with the requested length", () => {
    const { container } = render(<InputOTP length={5} value="ab" onValueChange={() => {}} />)
    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]')
    expect(slots).toHaveLength(5)
  })

  it("displays each typed character in its corresponding slot", () => {
    function Wrapper() {
      const [v, setV] = React.useState("")
      return <InputOTP length={4} value={v} onValueChange={setV} />
    }
    const { container } = render(<Wrapper />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "12" } })
    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]')
    expect(slots[0]?.textContent).toContain("1")
    expect(slots[1]?.textContent).toContain("2")
    expect(slots[2]?.textContent ?? "").not.toContain("1")
    expect(slots[2]?.textContent ?? "").not.toContain("2")
  })
  // Regressão: o contêiner tinha has-disabled:opacity-50 por cima do
  // opacity-50 do FieldShell, e o campo desabilitado ficava a 0,25.
  it("desabilitado, só o FieldShell esmaece", () => {
    const { container } = render(
      <InputOTP length={4} value="" onValueChange={() => {}} label="PIN" disabled />,
    )
    const faded = [...container.querySelectorAll("*")].filter((el) =>
      /(^|\s)(has-disabled:)?opacity-50(\s|$)/.test(el.getAttribute("class") ?? ""),
    )
    expect(faded).toEqual([container.querySelector('[data-slot="field-shell"]')])
  })
  // Regressão: com error, as caixas tinham a mesma borda de sem erro; só a
  // mensagem embaixo mudava.
  it("com error, cada caixa fica marcada como inválida, com a borda do erro", () => {
    const { container, rerender } = render(
      <InputOTP length={4} value="" onValueChange={() => {}} error="Código expirado" />,
    )
    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]')
    for (const slot of slots) {
      expect(slot).toHaveAttribute("data-invalid", "true")
      expect(slot).toHaveClass("border-destructive-text")
    }
    rerender(<InputOTP length={4} value="" onValueChange={() => {}} />)
    for (const slot of container.querySelectorAll('[data-slot="input-otp-slot"]')) {
      expect(slot).not.toHaveAttribute("data-invalid")
    }
  })
  // Regressão: o teclado era sempre numérico, e um código com letras
  // (pattern alfanumérico) não podia ser digitado no celular.
  describe("inputMode segue o pattern", () => {
    it("só dígitos: teclado numérico", () => {
      render(<InputOTP length={4} value="" onValueChange={() => {}} />)
      expect(screen.getByRole("textbox")).toHaveAttribute("inputmode", "numeric")
    })

    it.each([
      ["letras e dígitos", "^[a-zA-Z0-9]+$"],
      ["só letras", "^[a-zA-Z]+$"],
      ["hexadecimal em maiúsculas", "^[0-9A-F]+$"],
    ])("%s: teclado de texto", (_, pattern) => {
      render(<InputOTP length={4} value="" onValueChange={() => {}} pattern={pattern} />)
      expect(screen.getByRole("textbox")).toHaveAttribute("inputmode", "text")
    })

    it("inputMode explícito ganha do automático", () => {
      render(
        <InputOTP
          length={4}
          value=""
          onValueChange={() => {}}
          pattern="^[a-zA-Z0-9]+$"
          inputMode="numeric"
        />,
      )
      expect(screen.getByRole("textbox")).toHaveAttribute("inputmode", "numeric")
    })
  })
  // O campo não tinha name nem aria-required, e só funcionava controlado:
  // um form nativo não recebia o código e o leitor de tela não ouvia que ele
  // é obrigatório.
  describe("name, obrigatório e modo não controlado", () => {
    it("com name, o form nativo recebe o código", () => {
      render(
        <form data-testid="form">
          <InputOTP length={4} name="codigo" value="1234" onValueChange={() => {}} />
        </form>,
      )
      const data = new FormData(screen.getByTestId("form") as HTMLFormElement)
      expect(data.get("codigo")).toBe("1234")
    })

    it("required: anunciado como obrigatório, e o form nativo não passa vazio", () => {
      render(
        <form data-testid="form">
          <InputOTP length={4} label="Código" required value="" onValueChange={() => {}} />
        </form>,
      )
      const input = screen.getByRole("textbox", { name: /Código/ })
      expect(input).toHaveAttribute("aria-required", "true")
      expect((screen.getByTestId("form") as HTMLFormElement).checkValidity()).toBe(false)
    })

    it("sem value, guarda o que foi digitado a partir de defaultValue", () => {
      const onValueChange = vi.fn()
      render(<InputOTP length={4} defaultValue="12" onValueChange={onValueChange} />)
      const input = screen.getByRole("textbox") as HTMLInputElement
      expect(input.value).toBe("12")
      fireEvent.change(input, { target: { value: "123" } })
      expect(input.value).toBe("123")
      expect(onValueChange).toHaveBeenLastCalledWith("123")
    })
  })
})
