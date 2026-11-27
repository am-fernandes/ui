import { expect, test } from "@playwright/test"
import { expectNoA11yViolations } from "./a11y"

const story = (id: string, theme = "Claro") =>
  `/iframe.html?id=data-timeline--${id}&viewMode=story&globals=theme:${theme}`

test.describe("Timeline", () => {
  for (const theme of ["Claro", "Escuro"]) {
    const ids = ["default", "pipeline", "deploy-log", "owner-history", "horizontal"]
    for (const id of ids) {
      test(`${id} has no accessibility violations (${theme})`, async ({ page }) => {
        await page.goto(story(id, theme))
        await expect(page.getByRole("list")).toBeVisible({ timeout: 15_000 })
        await expectNoA11yViolations(page, "#storybook-root")
      })
    }
  }

  test("links each marker to the next one, whatever the content height", async ({ page }) => {
    await page.goto(story("owner-history"))
    const entries = page.getByRole("listitem")
    await expect(entries.first()).toBeVisible({ timeout: 15_000 })
    const line = await page.locator('[data-slot="timeline-connector"]').first().boundingBox()
    const first = await entries.first().getByRole("img").boundingBox()
    const next = await entries.nth(1).getByRole("img").boundingBox()
    expect(line?.width).toBe(2)
    expect(line?.y).toBeCloseTo((first?.y ?? 0) + (first?.height ?? 0) + 4, 0)
    expect((line?.y ?? 0) + (line?.height ?? 0)).toBeCloseTo((next?.y ?? 0) - 4, 0)
    expect((line?.x ?? 0) + 1).toBeCloseTo((first?.x ?? 0) + (first?.width ?? 0) / 2, 0)
  })

  test("links the markers side by side when horizontal", async ({ page }) => {
    await page.goto(story("horizontal"))
    const markers = page.locator('[data-slot="timeline-icon"]')
    await expect(markers.first()).toBeVisible({ timeout: 15_000 })
    const line = await page.locator('[data-slot="timeline-connector"]').first().boundingBox()
    const first = await markers.first().boundingBox()
    const next = await markers.nth(1).boundingBox()
    expect(next?.y).toBe(first?.y)
    expect(line?.height).toBe(2)
    expect(line?.x).toBeCloseTo((first?.x ?? 0) + (first?.width ?? 0) + 4, 0)
    expect((line?.x ?? 0) + (line?.width ?? 0)).toBeCloseTo((next?.x ?? 0) - 4, 0)
    expect((line?.y ?? 0) + 1).toBeCloseTo((first?.y ?? 0) + (first?.height ?? 0) / 2, 0)
  })

  for (const id of ["owner-history", "horizontal"]) {
    test(`${id} fits 360px without sideways scrolling`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 700 })
      await page.goto(story(id))
      await expect(page.getByRole("list")).toBeVisible({ timeout: 15_000 })
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }
})
