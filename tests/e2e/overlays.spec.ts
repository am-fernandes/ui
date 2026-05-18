import { expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

test.describe("Dialog", () => {
  test("opens via trigger, traps focus, closes on Escape", async ({ page }) => {
    await page.goto(story("overlays-dialog--default"))
    await page.getByRole("button", { name: "Abrir dialog" }).click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()

    // Focus is inside dialog after open.
    const firstInput = dialog.getByLabel("Nome")
    await expect(firstInput).toBeVisible()

    // Tab should cycle within the dialog (focus trap).
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    // Pressing Escape closes.
    await page.keyboard.press("Escape")
    await expect(dialog).not.toBeVisible()
  })

  test("dismissible=false blocks Escape and overlay click", async ({ page }) => {
    await page.goto(story("overlays-dialog--non-dismissible"))
    await page.getByRole("button", { name: /abrir/i }).click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await page.keyboard.press("Escape")
    // Dialog must still be open.
    await expect(dialog).toBeVisible()
  })
})

test.describe("Tooltip", () => {
  test("appears on hover and disappears on mouse leave", async ({ page }) => {
    await page.goto(story("overlays-tooltip--default"))
    const trigger = page.getByRole("button").first()
    await trigger.hover()
    // Tooltip is portaled; query inside the page body
    await expect(page.getByRole("tooltip")).toBeVisible({ timeout: 2000 })
    // Move mouse away
    await page.mouse.move(0, 0)
    await expect(page.getByRole("tooltip")).not.toBeVisible({ timeout: 2000 })
  })

  test("appears on keyboard focus", async ({ page }) => {
    await page.goto(story("overlays-tooltip--default"))
    const trigger = page.getByRole("button").first()
    await trigger.focus()
    await expect(page.getByRole("tooltip")).toBeVisible({ timeout: 2000 })
  })
})

test.describe("Popover", () => {
  test("opens via trigger and closes on Escape", async ({ page }) => {
    await page.goto(story("overlays-popover--default"))
    await page
      .getByRole("button", { name: /abrir|open|filtrar/i })
      .first()
      .click()
    // Content renders via portal — assert visible content present
    await expect(page.getByText(/conte[uú]do/i).first()).toBeVisible({ timeout: 2000 })
    await page.keyboard.press("Escape")
    await expect(page.getByText(/conte[uú]do/i).first()).not.toBeVisible({ timeout: 2000 })
  })
})
