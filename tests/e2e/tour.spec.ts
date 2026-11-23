import { type Page, expect, test } from "@playwright/test"
import { expectNoA11yViolations } from "./a11y"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

// Storybook's dev server may still be compiling on the first hit.
async function gotoTour(page: Page, id = "overlays-tour--default") {
  await page.goto(story(id))
  await expect(page.getByRole("button", { name: "Iniciar tour" })).toBeVisible({ timeout: 15_000 })
}

async function startTour(page: Page) {
  await page.getByRole("button", { name: "Iniciar tour" }).click()
  const callout = page.getByRole("dialog")
  await expect(callout).toBeVisible()
  return callout
}

/** Waits for the open animation (zoom 95% → 100%) and returns the settled box. */
async function settledBox(page: Page, selector: string) {
  let previous = ""
  await expect
    .poll(async () => {
      const box = await page.locator(selector).boundingBox()
      const key = JSON.stringify(box)
      const stable = key === previous
      previous = key
      return stable
    })
    .toBe(true)
  return (await page.locator(selector).boundingBox())!
}

test.describe("Tour", () => {
  test("places the callout below its target, aligned to the start", async ({ page }) => {
    await gotoTour(page)
    const target = (await page.locator("#tour-novo-lead").boundingBox())!
    await startTour(page)
    const callout = await settledBox(page, '[data-slot="tour-step"]')
    expect(callout.y).toBeGreaterThanOrEqual(target.y + target.height)
    expect(callout.y - (target.y + target.height)).toBeLessThanOrEqual(16)
    expect(Math.abs(callout.x - target.x)).toBeLessThanOrEqual(1)
  })

  test("places a side=left step to the left of its target, centred when it fits", async ({
    page,
  }) => {
    await gotoTour(page)
    const target = (await page.locator("#tour-exportar").boundingBox())!
    await startTour(page)
    for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Próximo" }).click()
    await expect(page.getByRole("dialog")).toHaveAccessibleName("Exporte quando precisar")
    const callout = await settledBox(page, '[data-slot="tour-step"]')
    expect(callout.x + callout.width).toBeLessThanOrEqual(target.x)
    // Centred on the target when it fits; near the top of the page the
    // collision handling shifts it down to stay 8px inside the viewport.
    const centredTop = target.y + target.height / 2 - callout.height / 2
    const expectedTop = Math.max(centredTop, 8)
    expect(Math.abs(callout.y - expectedTop)).toBeLessThanOrEqual(1)
    // Either way it still faces the target.
    expect(callout.y).toBeLessThanOrEqual(target.y + target.height)
    expect(callout.y + callout.height).toBeGreaterThanOrEqual(target.y)
  })

  test("spotlight wraps the target with 4px and follows the page scroll", async ({ page }) => {
    // A short viewport makes the story scroll.
    await page.setViewportSize({ width: 1280, height: 300 })
    await gotoTour(page)
    await startTour(page)
    const spotlight = page.locator('[data-slot="tour-spotlight"]')
    const target = page.locator("#tour-novo-lead")
    const expectWrapped = async () => {
      const t = (await target.boundingBox())!
      const s = (await spotlight.boundingBox())!
      expect(Math.abs(s.x - (t.x - 4))).toBeLessThanOrEqual(0.5)
      expect(Math.abs(s.y - (t.y - 4))).toBeLessThanOrEqual(0.5)
      expect(Math.abs(s.width - (t.width + 8))).toBeLessThanOrEqual(0.5)
      expect(Math.abs(s.height - (t.height + 8))).toBeLessThanOrEqual(0.5)
    }
    await expectWrapped()
    const before = (await spotlight.boundingBox())!.y
    await page.evaluate(() => window.scrollBy(0, 40))
    await expect.poll(async () => (await spotlight.boundingBox())!.y).toBeLessThan(before)
    await expectWrapped()
  })

  test("focus moves into the callout and back to the opener on Escape", async ({ page }) => {
    await gotoTour(page)
    const opener = page.getByRole("button", { name: "Iniciar tour" })
    await startTour(page)
    await expect(page.getByRole("button", { name: "Próximo" })).toBeFocused()
    await page.getByRole("button", { name: "Próximo" }).click()
    await expect(page.getByRole("dialog")).toHaveAccessibleName("Encontre qualquer lead")
    await expect(page.getByRole("button", { name: "Próximo" })).toBeFocused()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await expect(opener).toBeFocused()
    await expect(page.getByTestId("tour-result")).toHaveText("Tour fechado antes do fim")
  })

  test("Concluir on the last step completes; the X dismisses", async ({ page }) => {
    await gotoTour(page)
    await startTour(page)
    for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Próximo" }).click()
    await page.getByRole("button", { name: "Concluir" }).click()
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await expect(page.getByTestId("tour-result")).toHaveText("Tour concluído")

    await startTour(page)
    // Restarts from the first step.
    await expect(page.getByRole("dialog")).toHaveAccessibleName("Cadastre um lead")
    await page.getByRole("button", { name: "Fechar tour" }).click()
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await expect(page.getByTestId("tour-result")).toHaveText("Tour fechado antes do fim")
  })

  test("clicking elsewhere on the page does not end the tour", async ({ page }) => {
    await gotoTour(page)
    await startTour(page)
    await page.getByRole("button", { name: "Filtros" }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByRole("dialog")).toHaveAccessibleName("Cadastre um lead")
  })

  // The spotlight dims the page with a 9999px outline at 50% black. Forced
  // colours made that outline opaque: the whole page was covered.
  test("in forced colours the spotlight is a ring around the target, not a cover", async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: "active" })
    await gotoTour(page)
    await startTour(page)
    const spotlight = page.locator('[data-slot="tour-spotlight"]')
    await expect(spotlight).toBeAttached()
    const outline = await spotlight.evaluate((el) => {
      const s = getComputedStyle(el)
      return { width: s.outlineWidth, style: s.outlineStyle }
    })
    expect(outline).toEqual({ width: "2px", style: "solid" })
    // The rest of the page is still there to read.
    await expect(page.getByRole("button", { name: "Exportar" })).toBeVisible()
  })

  test("no spotlight when turned off", async ({ page }) => {
    await gotoTour(page, "overlays-tour--without-spotlight")
    await startTour(page)
    await expect(page.locator('[data-slot="tour-spotlight"]')).toHaveCount(0)
  })

  test("open tour has no WCAG 2.1 AA violations", async ({ page }) => {
    await gotoTour(page)
    await startTour(page)
    await page.getByRole("button", { name: "Próximo" }).click()
    await expect(page.getByRole("dialog")).toHaveAccessibleName("Encontre qualquer lead")
    // One run over the page and the (portaled) callout.
    await expectNoA11yViolations(page, {
      include: [["#storybook-root"], ['[data-slot="tour-step"]']],
    })
  })
})
