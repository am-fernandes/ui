import { type Page, expect, test } from "@playwright/test"
import { expectNoA11yViolations } from "./a11y"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

// Storybook's dev server may still be compiling on the first hit.
async function gotoToken(page: Page, id: string) {
  await page.goto(story(id))
  await expect(page.locator('[data-slot="token"]').first()).toBeVisible({ timeout: 15_000 })
}

test.describe("Token", () => {
  test("removing a token does not trigger its click", async ({ page }) => {
    await gotoToken(page, "primitives-token--clickable-and-removable")
    const lastClicked = page.getByTestId("last-clicked")
    await page.getByRole("button", { name: "Torre B", exact: true }).click()
    await expect(lastClicked).toHaveText("Último clique: Torre B")

    await page.getByRole("button", { name: "Remover Torre A" }).click()
    await expect(page.getByRole("button", { name: "Torre A", exact: true })).toHaveCount(0)
    await expect(lastClicked).toHaveText("Último clique: Torre B")
  })

  test("the whole chip is clickable, not just the text", async ({ page }) => {
    await gotoToken(page, "primitives-token--clickable-and-removable")
    const chip = page.locator('[data-slot="token"]', { hasText: "Torre C" })
    const box = await chip.boundingBox()
    // Click on the left padding/icon area, outside the label text.
    await page.mouse.click((box?.x ?? 0) + 4, (box?.y ?? 0) + (box?.height ?? 0) / 2)
    await expect(page.getByTestId("last-clicked")).toHaveText("Último clique: Torre C")
  })

  test("keyboard: Tab goes to the chip, then to its ×", async ({ page }) => {
    await gotoToken(page, "primitives-token--clickable-and-removable")
    await page.keyboard.press("Tab")
    const action = page.getByRole("button", { name: "Torre A", exact: true })
    await expect(action).toBeFocused()
    // The ring is drawn by the stretched ::after, around the whole chip.
    const ring = await action.evaluate((el) => getComputedStyle(el, "::after").boxShadow)
    expect(ring).not.toBe("none")
    await page.keyboard.press("Tab")
    const remove = page.getByRole("button", { name: "Remover Torre A" })
    await expect(remove).toBeFocused()
    expect(await remove.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe("none")
    await page.keyboard.press("Enter")
    await expect(action).toHaveCount(0)
  })

  test("link tokens navigate", async ({ page }) => {
    await gotoToken(page, "primitives-token--link")
    await page.getByRole("link", { name: "Proposta #1042" }).click()
    await expect(page).toHaveURL(/#proposta-1042$/)
  })

  test("sizes: 24px (sm) and 28px (md) tall", async ({ page }) => {
    await gotoToken(page, "primitives-token--sizes")
    const small = await page.locator('[data-slot="token"][data-size="sm"]').boundingBox()
    const medium = await page.locator('[data-slot="token"][data-size="md"]').boundingBox()
    expect(small?.height).toBe(24)
    expect(medium?.height).toBe(28)
  })

  test("long labels truncate instead of overflowing", async ({ page }) => {
    await gotoToken(page, "primitives-token--default")
    await page.evaluate(() => {
      const root = document.querySelector('[data-slot="token"]')?.parentElement as HTMLElement
      root.style.width = "80px"
      const label = document.querySelector('[data-slot="token"] span') as HTMLElement
      label.textContent = "Um rótulo bem comprido que não cabe"
    })
    const chip = await page.locator('[data-slot="token"]').boundingBox()
    expect(chip?.width ?? 0).toBeLessThanOrEqual(80)
  })

  for (const id of [
    "primitives-token--colors",
    "primitives-token--sizes",
    "primitives-token--clickable-and-removable",
    "primitives-token--disabled",
  ]) {
    test(`passes WCAG 2.1 AA: ${id}`, async ({ page }) => {
      await gotoToken(page, id)
      await expectNoA11yViolations(page, "#storybook-root")
    })
  }
})
