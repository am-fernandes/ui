import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Sidebar, SidebarContent, SidebarProvider } from "./sidebar"

describe("Sidebar", () => {
  it("mounts without crashing", () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    )
    expect(container).toBeTruthy()
    expect(container.querySelector('[data-slot="sidebar"]')).toBeTruthy()
  })
})
