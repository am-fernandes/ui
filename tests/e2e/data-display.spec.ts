import { type Page, expect, test } from "@playwright/test"
import { expectNoA11yViolations } from "./a11y"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

async function goto(page: Page, id: string, slot: string) {
  await page.goto(story(id))
  await expect(page.locator(`[data-slot="${slot}"]`).first()).toBeVisible({ timeout: 15_000 })
}

test.describe("Card", () => {
  test("a table with padding none touches the card's edges", async ({ page }) => {
    await goto(page, "data-card--with-table", "card")
    const card = (await page.locator('[data-slot="card"]').boundingBox())!
    const table = (await page.locator('[data-slot="card"] table').boundingBox())!
    // Only the 1px border between them.
    expect(table.x - card.x).toBeLessThanOrEqual(1)
    expect(card.x + card.width - (table.x + table.width)).toBeLessThanOrEqual(1)
  })

  test("a title on two lines keeps its lines apart", async ({ page }) => {
    await goto(page, "data-card--default", "card")
    const title = page.locator('[data-slot="card-title"]').first()
    await title.evaluate((el) => {
      el.textContent = "Propostas aprovadas no trimestre pela diretoria comercial"
      ;(el.closest('[data-slot="card"]') as HTMLElement).style.width = "220px"
    })
    const look = await title.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { size: Number.parseFloat(cs.fontSize), line: Number.parseFloat(cs.lineHeight) }
    })
    expect(look.line).toBeGreaterThanOrEqual(look.size * 1.3)
  })

  test("the metric card passes axe, contrast included", async ({ page }) => {
    await goto(page, "data-card--metric-card", "card")
    await expectNoA11yViolations(page, '[data-slot="card"]')
  })
})
