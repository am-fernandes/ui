/**
 * Viewport-specific E2E specs for the iPad (gen 7) — 810×1080 — project.
 *
 * The internal `useIsMobile` breakpoint is 768px, so a 810px tablet is treated
 * as *desktop* for layout purposes. These specs assert that:
 *
 *   - Sidebar renders as a persistent <aside> (not a Sheet drawer).
 *   - Calendar can render two months side-by-side without overflowing.
 *   - Dialog uses its size-based max-width rather than the viewport width.
 *
 * Scoped to `tablet-chromium` in `playwright.config.ts`.
 */
import { expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

test.describe("Sidebar (tablet)", () => {
  test("renders as a persistent aside (not a Sheet drawer)", async ({ page }) => {
    await page.goto(story("navigation-sidebar--with-groups"))

    const aside = page.locator('aside[data-slot="sidebar"]')
    await expect(aside).toBeVisible()
    // The mobile branch sets data-mobile="true" inside a dialog; that must NOT
    // be present at this viewport.
    await expect(aside).toHaveAttribute("data-state", "expanded")
    await expect(page.locator('[data-mobile="true"]')).toHaveCount(0)
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
