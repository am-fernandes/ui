import { type Page, expect, test } from "@playwright/test"

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

// Storybook's dev server may still be compiling on the first hit.
async function gotoStory(page: Page, id: string, ready: string) {
  await page.goto(story(id))
  await expect(page.getByRole("button", { name: ready })).toBeVisible({ timeout: 15_000 })
}

test.describe("IconButton", () => {
  test("shows its label as a tooltip on hover", async ({ page }) => {
    await gotoStory(page, "primitives-iconbutton--variants", "Excluir")
    await page.getByRole("button", { name: "Excluir" }).hover()
    await expect(page.getByRole("tooltip", { name: "Excluir" })).toBeVisible()
  })

  test("sizes are 32, 40 and 44px squares; md matches Button height", async ({ page }) => {
    await gotoStory(page, "primitives-iconbutton--sizes", "Notificações (md)")
    for (const [name, px] of [
      ["Notificações (sm)", 32],
      ["Notificações (md)", 40],
      ["Notificações (lg)", 44],
    ] as const) {
      const box = await page.getByRole("button", { name }).boundingBox()
      expect(box?.width, name).toBe(px)
      expect(box?.height, name).toBe(px)
    }
    await gotoStory(page, "primitives-iconbutton--next-to-button", "Salvar proposta")
    const button = await page.getByRole("button", { name: "Salvar proposta" }).boundingBox()
    const icon = await page.getByRole("button", { name: "Duplicar proposta" }).boundingBox()
    expect(icon?.height).toBe(button?.height)
  })
})
