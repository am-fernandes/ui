import { render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AlertDialog } from "./alert-dialog"
import { Dialog } from "./dialog"
import { Sheet } from "./sheet"

// Without `description`, Radix still pointed aria-describedby at an id no
// element had, and logged a warning for it.
const cases = [
  ["Dialog", (description?: string) => <Dialog open title="X" description={description} />],
  ["Sheet", (description?: string) => <Sheet open title="X" description={description} />],
  [
    "AlertDialog",
    (description?: string) => (
      <AlertDialog open title="X" description={description} onConfirm={() => {}} />
    ),
  ],
] as const

describe.each(cases)("%s aria-describedby", (_, renderModal) => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("is not set without a description, and Radix does not warn about a missing one", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    render(renderModal())
    const content = document.querySelector('[role="dialog"], [role="alertdialog"]') as HTMLElement
    expect(content).not.toHaveAttribute("aria-describedby")
    const dangling = warn.mock.calls.some((args) =>
      String(args[0]).includes("Missing `Description` or `aria-describedby={undefined}`"),
    )
    expect(dangling).toBe(false)
  })

  it("points at the description when there is one", () => {
    render(renderModal("Esta ação não pode ser desfeita."))
    const content = document.querySelector('[role="dialog"], [role="alertdialog"]') as HTMLElement
    const id = content.getAttribute("aria-describedby")
    expect(id).toBeTruthy()
    expect(document.getElementById(id as string)).toHaveTextContent(
      "Esta ação não pode ser desfeita.",
    )
  })
})
