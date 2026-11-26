import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Slider } from "./slider"

describe("Slider", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("names the thumb with the label and says the value in Brazilian format", () => {
    render(<Slider label="Área mínima" min={0} max={5000} step={50} defaultValue={1250} />)
    const thumb = screen.getByRole("slider", { name: "Área mínima" })
    expect(thumb).toHaveAttribute("aria-valuenow", "1250")
    expect(thumb).toHaveAttribute("aria-valuemin", "0")
    expect(thumb).toHaveAttribute("aria-valuemax", "5000")
    expect(thumb).toHaveAttribute("aria-valuetext", "1.250")
  })

  it("moves with the keyboard and reports a number", async () => {
    const onValueChange = vi.fn()
    render(
      <Slider label="Quartos" min={0} max={10} defaultValue={2} onValueChange={onValueChange} />,
    )
    const thumb = screen.getByRole("slider", { name: "Quartos" })
    thumb.focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(onValueChange).toHaveBeenLastCalledWith(3)
    await userEvent.keyboard("{End}")
    expect(onValueChange).toHaveBeenLastCalledWith(10)
    expect(thumb).toHaveAttribute("aria-valuenow", "10")
  })

  it("range: two thumbs, each with its own name, and a pair of numbers", async () => {
    const onValueChange = vi.fn()
    render(
      <Slider
        range
        label="Preço"
        min={0}
        max={2_000_000}
        step={50_000}
        defaultValue={[300_000, 800_000]}
        onValueChange={onValueChange}
        formatValue={(v) => `R$ ${new Intl.NumberFormat("pt-BR").format(v)}`}
      />,
    )
    const low = screen.getByRole("slider", { name: "Preço mínimo" })
    const high = screen.getByRole("slider", { name: "Preço máximo" })
    expect(low).toHaveAttribute("aria-valuetext", "R$ 300.000")
    expect(high).toHaveAttribute("aria-valuetext", "R$ 800.000")
    high.focus()
    await userEvent.keyboard("{ArrowLeft}")
    expect(onValueChange).toHaveBeenLastCalledWith([300_000, 750_000])
  })

  it("range thumb names come from labels, and from aria-label without a visible label", () => {
    render(<Slider range aria-label="Andar" labels={{ min: "de", max: "até" }} min={0} max={30} />)
    expect(screen.getByRole("slider", { name: "Andar de" })).toBeInTheDocument()
    expect(screen.getByRole("slider", { name: "Andar até" })).toBeInTheDocument()
  })

  it("showValue shows the value next to the label, hidden from screen readers", async () => {
    const { container } = render(
      <Slider
        label="Desconto"
        showValue
        max={20}
        step={0.5}
        defaultValue={2.5}
        formatValue={(v) => `${v.toLocaleString("pt-BR")}%`}
      />,
    )
    const shown = container.querySelector('[data-slot="slider-value"]') as HTMLElement
    expect(shown).toHaveTextContent("2,5%")
    expect(shown).toHaveAttribute("aria-hidden", "true")
    screen.getByRole("slider").focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(shown).toHaveTextContent("3%")
  })

  it("draws labelled marks at their places, the end labels aligned to the ends", () => {
    const { container } = render(
      <Slider
        label="Vagas"
        min={0}
        max={4}
        marks={[0, { value: 2, label: "2" }, { value: 4, label: "4+" }]}
      />,
    )
    const marks = [...container.querySelectorAll('[data-slot="slider-mark"]')] as HTMLElement[]
    expect(marks.map((m) => m.style.left)).toEqual(["0%", "50%", "100%"])
    expect(marks[1]).toHaveTextContent("2")
    expect(marks[2]?.querySelector("span:last-child")).toHaveClass("-translate-x-full")
    expect(container.querySelector('[data-slot="slider-marks"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    )
  })

  it("wires description and error to the thumbs", () => {
    render(<Slider label="Área" description="Em m²." error="Escolha uma área." />)
    const thumb = screen.getByRole("slider", { name: "Área" })
    expect(thumb).toHaveAccessibleDescription("Em m². Escolha uma área.")
    expect(thumb).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("alert")).toHaveTextContent("Escolha uma área.")
  })

  it("disabled: no tab stop and no change", async () => {
    const onValueChange = vi.fn()
    render(<Slider label="Área" disabled defaultValue={10} onValueChange={onValueChange} />)
    const thumb = screen.getByRole("slider", { name: "Área" })
    expect(thumb).not.toHaveAttribute("tabindex")
    expect(thumb).toHaveAttribute("aria-disabled", "true")
    fireEvent.keyDown(thumb, { key: "ArrowRight" })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("is controlled by value", async () => {
    function Controlled() {
      const [value, setValue] = React.useState(5)
      return (
        <>
          <Slider label="Andar" max={10} value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      )
    }
    render(<Controlled />)
    screen.getByRole("slider").focus()
    await userEvent.keyboard("{ArrowRight}{ArrowRight}")
    expect(screen.getByRole("status")).toHaveTextContent("7")
  })

  it("sends the value under name, and a range sends the name twice", () => {
    const { container } = render(
      <form>
        <Slider label="Área" name="area" defaultValue={80} max={500} />
        <Slider range label="Preço" name="preco" defaultValue={[100, 400]} max={1000} />
      </form>,
    )
    const data = new FormData(container.querySelector("form") as HTMLFormElement)
    expect(data.get("area")).toBe("80")
    expect(data.getAll("preco")).toEqual(["100", "400"])
  })

  it("goes back to defaultValue on a form reset", async () => {
    const { container } = render(
      <form>
        <Slider label="Área" name="area" defaultValue={80} max={500} />
      </form>,
    )
    const thumb = screen.getByRole("slider", { name: "Área" })
    thumb.focus()
    await userEvent.keyboard("{ArrowRight}{ArrowRight}")
    expect(thumb).toHaveAttribute("aria-valuenow", "82")
    vi.useFakeTimers()
    ;(container.querySelector("form") as HTMLFormElement).reset()
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    vi.useRealTimers()
    expect(screen.getByRole("slider", { name: "Área" })).toHaveAttribute("aria-valuenow", "80")
  })

  it("forwards the ref to the slider root", () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(<Slider label="Área" ref={ref} />)
    expect(ref.current).toHaveAttribute("data-slot", "slider")
  })
})
