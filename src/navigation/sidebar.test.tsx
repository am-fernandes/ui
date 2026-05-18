import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
} from "./sidebar"

describe("Sidebar", () => {
  beforeEach(() => {
    if (typeof document !== "undefined") {
      document.cookie = "sidebar_state=; path=/; max-age=0"
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

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

  it("does NOT write the sidebar cookie when persistOpenState is false (default)", async () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Item</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    )

    // Trigger toggle via Cmd+B
    await userEvent.keyboard("{Meta>}b{/Meta}")

    expect(document.cookie).not.toContain("sidebar_state=")
  })

  it("writes the cookie with SameSite=Lax and Secure when persistOpenState is true", async () => {
    // jsdom does not surface cookie attributes via document.cookie; spy on the setter.
    const writes: string[] = []
    const originalDoc = Object.getOwnPropertyDescriptor(Document.prototype, "cookie")
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get() {
        return ""
      },
      set(value: string) {
        writes.push(value)
      },
    })

    try {
      render(
        <SidebarProvider persistOpenState>
          <Sidebar>
            <SidebarContent />
          </Sidebar>
        </SidebarProvider>,
      )

      await userEvent.keyboard("{Meta>}b{/Meta}")

      const persistWrite = writes.find((w) => w.startsWith("sidebar_state="))
      expect(persistWrite).toBeDefined()
      expect(persistWrite).toMatch(/SameSite=Lax/)
      expect(persistWrite).toMatch(/Secure/)
    } finally {
      if (originalDoc) {
        Object.defineProperty(Document.prototype, "cookie", originalDoc)
      }
    }
  })

  it("keyboardShortcut=null disables the global toggle shortcut", async () => {
    const onOpenChange = vi.fn()
    render(
      <SidebarProvider open={true} onOpenChange={onOpenChange} keyboardShortcut={null}>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>,
    )

    await userEvent.keyboard("{Meta>}b{/Meta}")
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it("ignores the shortcut while focus is on an editable element", async () => {
    const onOpenChange = vi.fn()
    render(
      <SidebarProvider open={true} onOpenChange={onOpenChange}>
        <Sidebar>
          <SidebarContent>
            <input data-testid="editable" />
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    )

    const input = screen.getByTestId("editable") as HTMLInputElement
    input.focus()
    await userEvent.keyboard("{Meta>}b{/Meta}")

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('emits data-active="true" only for active items (absent otherwise)', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>Active</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Inactive</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    )

    const buttons = container.querySelectorAll('[data-slot="sidebar-menu-button"]')
    expect(buttons).toHaveLength(2)
    expect(buttons[0]?.getAttribute("data-active")).toBe("true")
    // Must be absent, not "false"
    expect(buttons[1]?.hasAttribute("data-active")).toBe(false)
  })

  it("SidebarMenuSkeleton renders with a deterministic width derived from useId", () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuSkeleton />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    )

    const skeletonText = container.querySelector('[data-sidebar="menu-skeleton-text"]')
    const style = skeletonText?.getAttribute("style") || ""
    expect(style).toMatch(/--skeleton-width:\s*\d+%/)
  })

  it("SidebarMenuSkeleton honors the explicit width prop", () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenuSkeleton width="73%" />
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    )
    const skeletonText = container.querySelector('[data-sidebar="menu-skeleton-text"]')
    expect(skeletonText?.getAttribute("style")).toMatch(/--skeleton-width:\s*73%/)
  })
})
