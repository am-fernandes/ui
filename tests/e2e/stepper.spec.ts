import { type Page, expect, test } from "@playwright/test"
import { expectNoA11yViolations } from "./a11y"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

// Storybook's dev server may still be compiling on the first hit.
async function gotoStepper(page: Page, id: string) {
  await page.goto(story(id))
  await expect(page.locator('[data-slot="stepper"]')).toBeAttached({ timeout: 15_000 })
}

/** Each connector runs from 4px after the previous indicator to 4px before the next, at their centre line. */
async function expectConnectorsAligned(page: Page) {
  const steps = page.locator('li[data-slot="stepper-step"]')
  const count = await steps.count()
  expect(count).toBeGreaterThan(1)
  for (let i = 1; i < count; i++) {
    const prev = (await steps
      .nth(i - 1)
      .locator('[data-slot="stepper-indicator"]')
      .boundingBox())!
    const curr = (await steps.nth(i).locator('[data-slot="stepper-indicator"]').boundingBox())!
    const line = (await steps.nth(i).locator('[data-slot="stepper-connector"]').boundingBox())!
    expect(
      Math.abs(line.x - (prev.x + prev.width + 4)),
      `connector ${i} start`,
    ).toBeLessThanOrEqual(1)
    expect(Math.abs(line.x + line.width - (curr.x - 4)), `connector ${i} end`).toBeLessThanOrEqual(
      1,
    )
    const lineMid = line.y + line.height / 2
    expect(
      Math.abs(lineMid - (curr.y + curr.height / 2)),
      `connector ${i} centre`,
    ).toBeLessThanOrEqual(1)
  }
}

test.describe("Stepper", () => {
  test("horizontal connectors line up with the indicators", async ({ page }) => {
    await gotoStepper(page, "navigation-stepper--default")
    await expect(page.getByRole("list", { name: "Progresso" })).toBeVisible()
    await expectConnectorsAligned(page)
  })

  test("connectors still line up when steps are buttons", async ({ page }) => {
    await gotoStepper(page, "navigation-stepper--clickable")
    await expectConnectorsAligned(page)
  })

  test("back-only steps: only finished steps are buttons, connectors still line up", async ({
    page,
  }) => {
    await gotoStepper(page, "navigation-stepper--back-only")
    const list = page.getByRole("list", { name: "Progresso" })
    await expect(list.getByRole("button")).toHaveCount(2)
    await expectConnectorsAligned(page)
    // The steps ahead are not greyed out like disabled ones.
    const ahead = page.locator('li[data-slot="stepper-step"]').nth(3)
    const opacity = await ahead.evaluate(
      (li) => getComputedStyle(li.firstElementChild?.nextElementSibling ?? li).opacity,
    )
    expect(opacity).toBe("1")
    await list.getByRole("button").first().click()
    await expect(page.locator('li[data-slot="stepper-step"]').first()).toHaveAttribute(
      "data-state",
      "current",
    )
  })

  test("vertical connector runs down the indicator's centre", async ({ page }) => {
    await gotoStepper(page, "navigation-stepper--vertical")
    const first = page.locator('li[data-slot="stepper-step"]').first()
    const dot = (await first.locator('[data-slot="stepper-indicator"]').boundingBox())!
    const line = (await first.locator('[data-slot="stepper-connector"]').boundingBox())!
    expect(Math.abs(line.x + line.width / 2 - (dot.x + dot.width / 2))).toBeLessThanOrEqual(1)
    expect(line.y).toBeGreaterThanOrEqual(dot.y + dot.height)
    // The current step's content sits under it.
    await expect(page.getByLabel("Nome completo")).toBeVisible()
  })

  test("collapses to the compact summary below the container threshold", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await gotoStepper(page, "navigation-stepper--default")
    await expect(page.getByRole("list", { name: "Progresso" })).toBeVisible()
    await expect(page.getByRole("group", { name: "Progresso" })).toBeHidden()

    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByRole("list", { name: "Progresso" })).toBeHidden()
    const compact = page.getByRole("group", { name: "Progresso" })
    await expect(compact).toBeVisible()
    await expect(compact).toContainText("Etapa 2 de 4")
    await expect(compact).toContainText("Endereço")
    // Nothing overflows the page.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test("the threshold follows the container, not the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await gotoStepper(page, "navigation-stepper--narrow-container")
    await expect(page.getByRole("list", { name: "Progresso" })).toBeHidden()
    await expect(page.getByRole("group", { name: "Progresso" })).toBeVisible()
  })

  test("clickable steps work from the keyboard", async ({ page }) => {
    await gotoStepper(page, "navigation-stepper--clickable")
    const list = page.getByRole("list", { name: "Progresso" })
    await list.getByRole("button").nth(2).focus()
    await page.keyboard.press("Enter")
    await expect(list.getByRole("button").nth(2)).toHaveAttribute("aria-current", "step")
    await page.keyboard.press("Shift+Tab")
    await page.keyboard.press("Space")
    await expect(list.getByRole("button").nth(1)).toHaveAttribute("aria-current", "step")
  })

  test("compact arrows move between enabled steps", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await gotoStepper(page, "navigation-stepper--clickable")
    const compact = page.getByRole("group", { name: "Progresso" })
    await expect(compact).toContainText("Etapa 2 de 4")
    await compact.getByRole("button", { name: "Próxima etapa" }).click()
    await expect(compact).toContainText("Etapa 3 de 4")
    await compact.getByRole("button", { name: "Etapa anterior" }).click()
    await expect(compact).toContainText("Etapa 2 de 4")
  })

  test("compact summary writes out the status and keeps the description", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await gotoStepper(page, "navigation-stepper--with-status")
    const compact = page.getByRole("group", { name: "Progresso" })
    await expect(compact).toBeVisible()
    const status = compact.locator('[data-slot="stepper-compact-status"]')
    await expect(status).toBeVisible()
    await expect(status).toHaveText("com alerta: RG vencido")
    // Capitalised on screen, from the same label.
    expect(await status.locator("span").first().innerText()).toBe("Com alerta: RG vencido")
    const icon = (await status.locator("svg").boundingBox())!
    expect(icon.width).toBeGreaterThanOrEqual(12)
  })

  test("compact summary has no WCAG 2.1 AA violations", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await gotoStepper(page, "navigation-stepper--with-status")
    await expect(page.getByRole("group", { name: "Progresso" })).toBeVisible()
    await expectNoA11yViolations(page, "#storybook-root")
  })
})
