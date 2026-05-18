import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Switch } from "./switch"

describe("Switch", () => {
  it("renders with role=switch", () => {
    render(<Switch />)
    expect(screen.getByRole("switch")).toBeInTheDocument()
  })

  it("toggles aria-checked when clicked", async () => {
    render(<Switch />)
    const sw = screen.getByRole("switch")
    expect(sw).toHaveAttribute("aria-checked", "false")
    await userEvent.click(sw)
    expect(sw).toHaveAttribute("aria-checked", "true")
  })

  it("emits data-slot=switch", () => {
    render(<Switch />)
    expect(screen.getByRole("switch")).toHaveAttribute("data-slot", "switch")
  })

  it("disabled blocks click", async () => {
    const onCheckedChange = vi.fn()
    render(<Switch disabled onCheckedChange={onCheckedChange} />)
    await userEvent.click(screen.getByRole("switch"))
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(screen.getByRole("switch")).toBeDisabled()
  })

  it("supports controlled checked + onCheckedChange", async () => {
    function Controlled() {
      const [checked, setChecked] = useState(false)
      return <Switch checked={checked} onCheckedChange={setChecked} aria-label="notify" />
    }
    render(<Controlled />)
    const sw = screen.getByRole("switch", { name: "notify" })
    expect(sw).toHaveAttribute("aria-checked", "false")
    await userEvent.click(sw)
    expect(sw).toHaveAttribute("aria-checked", "true")
    await userEvent.click(sw)
    expect(sw).toHaveAttribute("aria-checked", "false")
  })

  it("toggles via keyboard Space", async () => {
    render(<Switch aria-label="kbd" />)
    const sw = screen.getByRole("switch", { name: "kbd" })
    sw.focus()
    expect(sw).toHaveAttribute("aria-checked", "false")
    await userEvent.keyboard(" ")
    expect(sw).toHaveAttribute("aria-checked", "true")
  })
})
