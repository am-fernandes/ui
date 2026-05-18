import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Combobox } from "./combobox"

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Bravo" },
  { value: "c", label: "Charlie" },
]

describe("Combobox", () => {
  it("renders trigger with placeholder", () => {
    render(<Combobox options={options} placeholder="Pick one" />)
    expect(screen.getByText("Pick one")).toBeInTheDocument()
    expect(screen.getByRole("combobox")).toBeInTheDocument()
  })

  it("opens and shows options on click", async () => {
    render(<Combobox options={options} placeholder="Pick one" />)
    await userEvent.click(screen.getByRole("combobox"))
    expect(await screen.findByText("Alpha")).toBeInTheDocument()
    expect(screen.getByText("Bravo")).toBeInTheDocument()
  })

  it("supports multiple mode", () => {
    render(<Combobox multiple options={options} value={["a", "b"]} placeholder="Pick many" />)
    expect(screen.getByText("Alpha")).toBeInTheDocument()
    expect(screen.getByText("Bravo")).toBeInTheDocument()
  })
})
