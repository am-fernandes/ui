/**
 * Viewport-specific E2E specs for the Pixel 5 (393×727, touch) project.
 *
 * Behaviors covered:
 *   - Sidebar renders as a Sheet drawer (Radix Dialog) on mobile.
 *   - Dialog content stays usable on a narrow viewport (close to full width).
 *   - DataTable's internal table is wrapped in an overflow-auto container.
 *   - Tabs do not break layout when the trigger list is wider than the viewport.
 *
 * These specs are scoped to `mobile-chromium` in `playwright.config.ts`.
 */
import { expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

test.describe("Sidebar (mobile)", () => {
  test("renders as a Sheet (role=dialog) drawer instead of an aside", async ({ page }) => {
    await page.goto(story("navigation-sidebar--with-groups"))

    // `useIsMobile` defaults to `false` (SSR-safe) and flips to `true` after
    // the first effect runs against `window.matchMedia`. On a slow render the
    // initial paint shows an <aside>; we wait for the Sheet to swap in.
    const mobileSidebar = page.locator('[data-slot="sidebar"][data-mobile="true"]')
    await expect(mobileSidebar).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole("dialog")).toBeVisible()
  })

  test("group items render inside the drawer", async ({ page }) => {
    await page.goto(story("navigation-sidebar--with-groups"))

    const mobileSidebar = page.locator('[data-slot="sidebar"][data-mobile="true"]')
    await expect(mobileSidebar).toBeVisible({ timeout: 10_000 })
    // Group labels from the WithGroups story. Use `exact: true` because the
    // Sheet description contains the substring "Menu principal".
    await expect(mobileSidebar.getByText("Principal", { exact: true })).toBeVisible()
    await expect(mobileSidebar.getByText("Administração", { exact: true })).toBeVisible()
  })

  test("Escape closes the drawer", async ({ page }) => {
    await page.goto(story("navigation-sidebar--with-groups"))

    const mobileSidebar = page.locator('[data-slot="sidebar"][data-mobile="true"]')
    await expect(mobileSidebar).toBeVisible({ timeout: 10_000 })
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).not.toBeVisible()
  })
})

test.describe("Dialog (mobile)", () => {
  test("content adapts to narrow viewport without overflowing the screen", async ({ page }) => {
    await page.goto(story("overlays-dialog--default"))
    await page.getByRole("button", { name: "Abrir dialog" }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()

    const box = await dialog.boundingBox()
    const viewport = page.viewportSize()
    expect(box).not.toBeNull()
    expect(viewport).not.toBeNull()
    // Dialog must not overflow the viewport horizontally.
    expect(box?.width ?? 0).toBeLessThanOrEqual((viewport?.width ?? 0) + 1)
    // Dialog must still be wide enough to be usable (no collapse to 0).
    expect(box?.width ?? 0).toBeGreaterThan(280)
  })
})

test.describe("DataTable (mobile)", () => {
  test("table is wrapped in an overflow-auto container for horizontal scroll", async ({ page }) => {
    await page.goto(story("data-datatable--default"))

    // The Table primitive wraps the <table> in `relative w-full overflow-auto`.
    // On a narrow viewport, the wrapper must be present and contain the table.
    const tableEl = page.locator('[data-slot="table"]').first()
    await expect(tableEl).toBeVisible({ timeout: 10_000 })
    const scrollContainer = page.locator(".overflow-auto", { has: tableEl }).first()
    await expect(scrollContainer).toBeVisible()
  })
})

test.describe("Tabs (mobile)", () => {
  test("trigger list stays accessible when wrapper is wider than the viewport", async ({
    page,
  }) => {
    await page.goto(story("navigation-tabs--default"))

    const tabs = page.getByRole("tab")
    await expect(tabs.first()).toBeVisible({ timeout: 10_000 })
    expect(await tabs.count()).toBeGreaterThan(1)

    // Even when the parent wrapper is wider than the mobile viewport, the
    // first tab must remain clickable and update aria-selected.
    await tabs.nth(1).click()
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true")
  })
})
