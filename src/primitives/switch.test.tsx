import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { Switch } from "./switch"

describe("Switch", () => {
  it("renders label associated with switch", () => {
    render(<Switch label="Notificações" />)
    expect(screen.getByRole("switch", { name: "Notificações" })).toBeInTheDocument()
  })

  it("renders description and error", () => {
    render(<Switch label="X" description="ajuda" error="erro" />)
    expect(screen.getByText("ajuda")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("erro")
  })

  it("toggles on label click", async () => {
    const onChange = vi.fn()
    render(<Switch label="Push" onCheckedChange={onChange} />)
    await userEvent.click(screen.getByText("Push"))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it("applies labelPosition='left'", () => {
    const { container } = render(<Switch label="X" labelPosition="left" />)
    expect(container.querySelector('[data-slot="switch-field"]')).toHaveAttribute(
      "data-label-position",
      "left",
    )
  })

  it("respects disabled", () => {
    render(<Switch label="X" disabled />)
    expect(screen.getByRole("switch", { name: "X" })).toBeDisabled()
  })

  it("toggles via Space key when focused (keyboard a11y)", async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Switch label="K" onCheckedChange={onChange} />)
    const sw = screen.getByRole("switch", { name: "K" })
    sw.focus()
    expect(sw).toHaveFocus()
    await user.keyboard(" ")
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it("is reachable via Tab (focusable)", async () => {
    const user = userEvent.setup()
    render(
      <div>
        <button type="button">Before</button>
        <Switch label="Tabbable" />
      </div>,
    )
    screen.getByRole("button", { name: "Before" }).focus()
    await user.tab()
    expect(screen.getByRole("switch", { name: "Tabbable" })).toHaveFocus()
  })

  it("reflects data-state='unchecked' by default and 'checked' once toggled", async () => {
    const user = userEvent.setup()
    render(<Switch label="DS" />)
    const sw = screen.getByRole("switch", { name: "DS" })
    expect(sw).toHaveAttribute("data-state", "unchecked")
    await user.click(sw)
    expect(sw).toHaveAttribute("data-state", "checked")
  })

  it("reflects aria-checked accurately for unchecked and checked states", async () => {
    const user = userEvent.setup()
    render(<Switch label="AC" />)
    const sw = screen.getByRole("switch", { name: "AC" })
    expect(sw).toHaveAttribute("aria-checked", "false")
    await user.click(sw)
    expect(sw).toHaveAttribute("aria-checked", "true")
  })

  it("renders the required asterisk inside the label when required=true", () => {
    render(<Switch label="Obrigatório" required />)
    const asterisk = screen.getByLabelText("obrigatório")
    expect(asterisk).toHaveTextContent("*")
  })

  it("sets aria-required on the control when required=true", () => {
    render(<Switch label="R" required />)
    expect(screen.getByRole("switch", { name: /R/ })).toHaveAttribute("aria-required", "true")
  })

  it("wires aria-describedby to the description element", () => {
    render(<Switch label="D" description="desc-text" />)
    const sw = screen.getByRole("switch", { name: "D" })
    const describedBy = sw.getAttribute("aria-describedby")
    expect(describedBy).toBeTruthy()
    const descEl = describedBy ? document.getElementById(describedBy) : null
    expect(descEl).toHaveTextContent("desc-text")
  })

  it("wires aria-describedby to the error message and sets aria-invalid", () => {
    render(<Switch label="E" error="err-text" />)
    const sw = screen.getByRole("switch", { name: "E" })
    expect(sw).toHaveAttribute("aria-invalid", "true")
    const describedBy = sw.getAttribute("aria-describedby") ?? ""
    const referenced = describedBy
      .split(/\s+/)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null)
    expect(referenced.some((el) => el.textContent === "err-text")).toBe(true)
  })

  it("references both description and error in aria-describedby when both set", () => {
    render(<Switch label="DE" description="d" error="e" />)
    const sw = screen.getByRole("switch", { name: "DE" })
    const ids = (sw.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean)
    expect(ids.length).toBeGreaterThanOrEqual(2)
    const texts = ids
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .filter(Boolean)
    expect(texts).toContain("d")
    expect(texts).toContain("e")
  })

  it("supports controlled checked + onCheckedChange round-trip", async () => {
    function Controlled() {
      const [checked, setChecked] = React.useState(false)
      return <Switch label="C" checked={checked} onCheckedChange={setChecked} />
    }
    const user = userEvent.setup()
    render(<Controlled />)
    const sw = screen.getByRole("switch", { name: "C" })
    expect(sw).toHaveAttribute("aria-checked", "false")
    await user.click(sw)
    expect(sw).toHaveAttribute("aria-checked", "true")
    await user.click(sw)
    expect(sw).toHaveAttribute("aria-checked", "false")
  })

  it("honors uncontrolled defaultChecked=true initial state", () => {
    render(<Switch label="DC" defaultChecked />)
    const sw = screen.getByRole("switch", { name: "DC" })
    expect(sw).toHaveAttribute("aria-checked", "true")
    expect(sw).toHaveAttribute("data-state", "checked")
  })

  it("clicking the label toggles the associated switch via htmlFor", async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Switch label="LblClick" onCheckedChange={onChange} />)
    const labelEl = screen.getByText("LblClick")
    expect(labelEl.tagName).toBe("LABEL")
    const switchEl = screen.getByRole("switch", { name: "LblClick" })
    expect(labelEl).toHaveAttribute("for", switchEl.id)
    await user.click(labelEl)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it("disabled switch does NOT toggle when clicked", async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Switch label="Off" disabled onCheckedChange={onChange} />)
    await user.click(screen.getByRole("switch", { name: "Off" }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it("forwards ref to the underlying button element", () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Switch label="Ref" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it("applies a custom className to the switch root", () => {
    render(<Switch label="Cls" className="my-switch" />)
    expect(screen.getByRole("switch", { name: "Cls" })).toHaveClass("my-switch")
  })
})
