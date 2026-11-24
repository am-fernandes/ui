/**
 * Viewport-specific E2E specs for the Pixel 5 (393×727, touch) project.
 *
 * Behaviors covered:
 *   - AppShell swaps the side menu for a top bar + left drawer (Radix Dialog).
 *   - Dialog content stays usable on a narrow viewport (close to full width).
 *   - DataTable's internal table is wrapped in an overflow-auto container.
 *   - Tabs do not break layout when the trigger list is wider than the viewport.
 *   - Select opens and chooses by touch, with the list inside the screen.
 *   - NumberInput uses 16px text on touch (iOS zooms into smaller fields).
 *   - Slider takes a tap on its track.
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
  test("a table wider than the phone scrolls inside its box and the page does not", async ({
    page,
  }) => {
    await page.goto(story("data-datatable--default"))
    const table = page.locator('[data-slot="data-table"] table').first()
    await expect(table).toBeVisible({ timeout: 15_000 })
    const viewport = page.viewportSize()?.width ?? 0
    // The page itself never scrolls sideways.
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport + 1,
    )
    // The table's own box does, and a swipe reaches its last column.
    const box = page.locator('[data-slot="data-table"] table').first().locator("xpath=..")
    const widths = await box.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }))
    expect(widths.scroll).toBeGreaterThan(widths.client)
    await box.evaluate((el) => {
      el.scrollLeft = el.scrollWidth
    })
    const lastHeader = table.locator("thead th").last()
    const header = (await lastHeader.boundingBox())!
    expect(header.x + header.width).toBeLessThanOrEqual(viewport + 1)
  })
})

test.describe("Tabs (mobile)", () => {
  test("a long tab list scrolls inside the screen and every tab can be reached", async ({
    page,
  }) => {
    await page.goto(story("navigation-tabs--many-tabs"))
    const list = page.getByRole("tablist")
    await expect(list).toBeVisible({ timeout: 10_000 })
    const viewport = page.viewportSize()!
    const box = (await list.boundingBox())!
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
    // The page does not scroll sideways; the list does.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
    expect(await list.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true)
    // A tab out of sight can be scrolled to and tapped.
    const last = page.getByRole("tab", { name: "Tarefas" })
    await last.scrollIntoViewIfNeeded()
    await last.tap()
    await expect(last).toHaveAttribute("aria-selected", "true")
    await expect(page.getByRole("tabpanel")).toContainText("Tarefas do lead.")
  })
})

test.describe("Select (mobile)", () => {
  test("a tap opens the list inside the screen and a tap chooses", async ({ page }) => {
    await page.goto(story("forms-select--groups"))
    const trigger = page.getByRole("combobox", { name: "Tipo de imóvel" })
    await expect(trigger).toBeVisible({ timeout: 15_000 })
    await trigger.tap()
    const list = page.locator('[data-slot="select-content"]')
    await expect(list).toBeVisible()
    const box = (await list.boundingBox())!
    const viewport = page.viewportSize()!
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)
    await page.getByRole("option", { name: "Cobertura" }).tap()
    await expect(list).toHaveCount(0)
    await expect(trigger).toHaveText("Cobertura")
  })
})

test.describe("NumberInput (mobile)", () => {
  test("16px text on a touch screen, a numeric keyboard, and steppers by tap", async ({ page }) => {
    await page.goto(story("primitives-numberinput--steppers"))
    const field = page.getByRole("spinbutton", { name: "Vagas de garagem" })
    await expect(field).toBeVisible({ timeout: 15_000 })
    await expect(field).toHaveCSS("font-size", "16px")
    await expect(field).toHaveAttribute("inputmode", "numeric")
    await page.getByRole("button", { name: "Aumentar" }).tap()
    await expect(field).toHaveValue("3")
  })
})

test.describe("Slider (mobile)", () => {
  test("a tap on the track moves the thumb there", async ({ page }) => {
    await page.goto(story("primitives-slider--with-value"))
    const thumb = page.getByRole("slider", { name: "Área mínima" })
    await expect(thumb).toBeVisible({ timeout: 15_000 })
    const track = (await page.locator('[data-slot="slider"]').boundingBox())!
    await page.touchscreen.tap(track.x + track.width * 0.76, track.y + track.height / 2)
    await expect(thumb).toHaveAttribute("aria-valuenow", "380")
  })
})
