/**
 * Viewport-specific E2E specs for the Pixel 5 (393×727, touch) project.
 *
 * Behaviors covered:
 *   - AppShell swaps the side menu for a top bar + left drawer (Radix Dialog).
 *   - Dialog content stays usable on a narrow viewport (close to full width).
 *   - DataTable's internal table is wrapped in an overflow-auto container.
 *   - Tabs do not break layout when the trigger list is wider than the viewport.
 *
 * These specs are scoped to `mobile-chromium` in `playwright.config.ts`.
 */
import { type Page, expect, test } from "@playwright/test"
import { expectNoA11yViolations } from "./a11y"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

// Storybook's dev server can still be compiling on the first hit: wait for the
// shell itself instead of acting on a half-loaded iframe.
async function gotoShell(page: Page, id: string) {
  await page.goto(story(id))
  await expect(page.locator('[data-slot="app-shell"]')).toBeAttached({ timeout: 15_000 })
}

test.describe("AppShell (mobile)", () => {
  test("shows the 64px bar with the menu button, the brand and the navbar", async ({ page }) => {
    await gotoShell(page, "navigation-appshell--default")
    const bar = page.locator('[data-slot="app-shell-navbar"]')
    await expect(bar).toBeVisible()
    expect((await bar.boundingBox())?.height).toBe(64)
    await expect(bar.getByRole("button", { name: "Abrir menu" })).toBeVisible()
    await expect(bar.getByText("Dash")).toBeVisible()
    await expect(bar.getByRole("button", { name: "Notificações" })).toBeVisible()
    await expect(page.locator('[data-slot="app-shell-sidebar"]')).toBeHidden()
  })

  test("opens the menu on the left with expanded items and the footer", async ({ page }) => {
    await gotoShell(page, "navigation-appshell--collapsed")
    await page.getByRole("button", { name: "Abrir menu" }).click()
    const menu = page.getByRole("dialog", { name: "Menu" })
    await expect(menu).toBeVisible()
    // Desktop starts collapsed in this story, but the drawer is always expanded.
    await expect(menu.getByText("Calculadora")).toBeVisible()
    await expect(menu.getByText("Usuário")).toBeVisible()
    // Anchored to the left edge once the slide-in finishes.
    await expect.poll(async () => (await menu.boundingBox())?.x).toBe(0)
  })

  test("closes after choosing an item", async ({ page }) => {
    await gotoShell(page, "navigation-appshell--default")
    await page.getByRole("button", { name: "Abrir menu" }).click()
    const menu = page.getByRole("dialog", { name: "Menu" })
    await menu.getByRole("link", { name: "Calculadora" }).click()
    await expect(page.getByRole("dialog")).toHaveCount(0)
  })

  test("Escape closes the menu and focus goes back to the menu button", async ({ page }) => {
    await gotoShell(page, "navigation-appshell--default")
    const trigger = page.getByRole("button", { name: "Abrir menu" })
    await trigger.click()
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test("mobile bar and open menu have no WCAG 2.1 AA violations", async ({ page }) => {
    await gotoShell(page, "navigation-appshell--default")
    await expectNoA11yViolations(page, '[data-slot="app-shell"]')
    await page.getByRole("button", { name: "Abrir menu" }).click()
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible()
    await expectNoA11yViolations(page, '[data-slot="app-shell-menu"]')
  })

  test("menu items are at least 44px tall", async ({ page }) => {
    await gotoShell(page, "navigation-appshell--default")
    await page.getByRole("button", { name: "Abrir menu" }).click()
    const menu = page.getByRole("dialog", { name: "Menu" })
    const link = menu.getByRole("link", { name: "Calculadora" })
    expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44)
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
