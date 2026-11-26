// @vitest-environment node
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { AppShell } from "./app-shell"

// Server render (Next.js app router, Remix…): no `window`, no localStorage.
describe("AppShell (server render)", () => {
  it("renders without touching browser globals and falls back to defaultCollapsed", () => {
    expect(typeof window).toBe("undefined")
    const html = renderToString(
      <AppShell items={[{ id: "a", label: "Leads", href: "/leads" }]} defaultCollapsed={false}>
        <p>Conteúdo</p>
      </AppShell>,
    )
    expect(html).toContain('data-slot="app-shell"')
    expect(html).toContain('data-state="expanded"')
    expect(html).toContain('id="conteudo"')
    expect(html).toContain("Leads")
    expect(html).toContain("Conteúdo")
  })

  it("renders the collapsed rail by default", () => {
    const html = renderToString(<AppShell items={[{ id: "a", label: "Leads", href: "/leads" }]} />)
    expect(html).toContain('data-state="collapsed"')
  })
})
