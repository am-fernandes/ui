/**
 * Viewport-specific E2E specs for the iPad (gen 7) — 810×1080 — project.
 *
 * The internal `useIsMobile` breakpoint is 768px, so a 810px tablet is treated
 * as *desktop* for layout purposes. These specs assert that:
 *
 *   - AppShell keeps the persistent side menu (no mobile bar / drawer).
 *   - Calendar can render two months side-by-side without overflowing.
 *   - Dialog uses its size-based max-width rather than the viewport width.
 *
 * Scoped to `tablet-chromium` in `playwright.config.ts`.
 */
import { type Page, expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

// Storybook's dev server can still be compiling on the first hit: wait for the
// shell itself instead of acting on a half-loaded iframe.
async function gotoShell(page: Page, id: string) {
  await page.goto(story(id))
  await expect(page.locator('[data-slot="app-shell"]')).toBeAttached({ timeout: 15_000 })
}

test.describe("AppShell (tablet)", () => {
  test("renders the persistent side menu, not the mobile bar", async ({ page }) => {
    await gotoShell(page, "navigation-appshell--default")
    const aside = page.locator('aside[data-slot="app-shell-sidebar"]')
    await expect(aside).toBeVisible()
    await expect(aside).toHaveAttribute("data-state", "expanded")
    await expect(page.getByRole("button", { name: "Abrir menu" })).toBeHidden()
  })
})

test.describe("Calendar (tablet)", () => {
  test("renders two month grids side-by-side without horizontal overflow", async ({ page }) => {
    await page.goto(story("forms-calendar--two-months-compact"))

    const grids = page.getByRole("grid")
    await expect(grids).toHaveCount(2)

    const viewport = page.viewportSize()
    expect(viewport).not.toBeNull()
    // Both grids must fit within the viewport width.
    const first = await grids.nth(0).boundingBox()
    const second = await grids.nth(1).boundingBox()
    expect(first).not.toBeNull()
    expect(second).not.toBeNull()
    if (first && second && viewport) {
      const rightmost = Math.max(first.x + first.width, second.x + second.width)
      expect(rightmost).toBeLessThanOrEqual(viewport.width + 1)
    }
  })
})

test.describe("Dialog (tablet)", () => {
  test("default size (md) stays at max-w-lg, well below viewport width", async ({ page }) => {
    await page.goto(story("overlays-dialog--default"))
    await page.getByRole("button", { name: "Abrir dialog" }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()

    const box = await dialog.boundingBox()
    const viewport = page.viewportSize()
    expect(box).not.toBeNull()
    expect(viewport).not.toBeNull()
    // max-w-lg is 32rem (~512px); on iPad (810px) we should see the design
    // breathing room rather than a stretched-to-edge dialog.
    expect(box?.width ?? 0).toBeLessThan((viewport?.width ?? 0) - 100)
  })
})
