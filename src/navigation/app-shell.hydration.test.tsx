import { act } from "@testing-library/react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AppShell } from "./app-shell"

const STORAGE_KEY = "amf-ui:sidebar:collapsed"

const shell = (
  <AppShell items={[{ id: "a", label: "Leads", href: "/leads" }]}>
    <p>Conteúdo</p>
  </AppShell>
)

// Next.js and Remix send the server HTML first; the browser then hydrates it
// with whatever the user saved in localStorage. The two must not disagree.
describe("AppShell (hydration)", () => {
  let container: HTMLDivElement

  beforeEach(() => {
    window.localStorage.clear()
    container = document.createElement("div")
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it("hydrates server HTML against a saved choice without a hydration error", async () => {
    // The server knows nothing about the user's choice: collapsed by default.
    container.innerHTML = renderToString(shell)
    expect(container.querySelector('[data-slot="app-shell"]')).toHaveAttribute(
      "data-state",
      "collapsed",
    )

    // The user had expanded the menu on a previous visit.
    window.localStorage.setItem(STORAGE_KEY, "false")
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    const recoverable = vi.fn()

    await act(async () => {
      hydrateRoot(container, shell, { onRecoverableError: recoverable })
    })

    expect(recoverable).not.toHaveBeenCalled()
    const hydrationErrors = consoleError.mock.calls.filter((call) =>
      /hydrat/i.test(String(call[0])),
    )
    expect(hydrationErrors).toEqual([])
    // After hydration the saved choice wins.
    expect(container.querySelector('[data-slot="app-shell"]')).toHaveAttribute(
      "data-state",
      "expanded",
    )
  })
})
