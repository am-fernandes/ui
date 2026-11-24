import { type Page, expect, test } from "@playwright/test"
import { expectFocusRing, expectNoA11yViolations } from "./a11y"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

async function open(page: Page, id: string, slot = "bar-chart") {
  await page.goto(story(id))
  await expect(page.locator(`[data-slot="${slot}"]`).first()).toBeVisible({ timeout: 15_000 })
}

test.describe("Charts — hover", () => {
  test("a bar category's tooltip lists every series with its value", async ({ page }) => {
    await open(page, "data-barchart--several-series")
    const hit = page.locator('[data-slot="bar-chart-hit"]').nth(1)
    await hit.hover()
    const tooltip = page.locator('[data-slot="chart-tooltip"]')
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toContainText("2º tri")
    await expect(tooltip.locator("> span").nth(1)).toHaveText("38Residencial Bosque")
    await expect(tooltip.locator("> span").nth(2)).toHaveText("36Torre Norte")
    await expect(tooltip.locator("> span").nth(3)).toHaveText("24Vila Jardim")
    await expect(page.locator('[data-slot="bar-chart-highlight"]')).toBeVisible()
    await page.mouse.move(0, 0)
    await expect(tooltip).toHaveCount(0)
  })

  test("the line chart's crosshair snaps to the nearest month", async ({ page }) => {
    await open(page, "data-linechart--several-series", "line-chart")
    const plot = (await page.locator('[data-slot="line-chart-hit"]').boundingBox())!
    // Just right of October (9 of 11 steps), the pointer snaps to it.
    await page.mouse.move(plot.x + (plot.width * 9) / 11 + 6, plot.y + plot.height / 2)
    const tooltip = page.locator('[data-slot="chart-tooltip"]')
    await expect(tooltip).toContainText("out.")
    await expect(tooltip).toContainText("13Residencial Bosque")
    await expect(tooltip).toContainText("6Torre Norte")
    await expect(tooltip).toContainText("3Vila Jardim")
    // A vertical hairline has no width, so check where it is instead.
    const crosshair = page.locator('[data-slot="line-chart-crosshair"]')
    await expect(crosshair).toHaveCount(1)
    const svgLeft = (await page.locator('[data-slot="line-chart"] svg').boundingBox())!.x
    const at = Number(await crosshair.getAttribute("x1")) + svgLeft
    expect(Math.abs(at - (plot.x + (plot.width * 9) / 11))).toBeLessThanOrEqual(1)
    await expect(page.locator('[data-slot="line-chart-point"]')).toHaveCount(3)
  })
})

test.describe("Charts — keyboard", () => {
  test("Tab reaches the chart, the arrows move between points and announce them", async ({
    page,
  }) => {
    await open(page, "data-linechart--several-series", "line-chart")
    // The legend buttons come first, then the plot.
    const chart = page.getByRole("img", { name: "Vendas por empreendimento" })
    await chart.focus()
    await expectFocusRing(chart)
    await page.keyboard.press("ArrowRight")
    await expect(page.locator('[data-slot="chart-tooltip"]')).toContainText("jan.")
    await page.keyboard.press("End")
    await expect(page.locator('[data-slot="chart-tooltip"]')).toContainText("dez.")
    await expect(page.locator('[data-slot="chart-announcer"]')).toHaveText(
      "dez.. Residencial Bosque: 17; Torre Norte: 9; Vila Jardim: 5",
    )
    await page.keyboard.press("Tab")
    await expect(page.locator('[data-slot="chart-tooltip"]')).toHaveCount(0)
  })

  test("horizontal bars move with the up and down arrows", async ({ page }) => {
    await open(page, "data-barchart--horizontal")
    await page.getByRole("img", { name: "Leads por canal de origem" }).focus()
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowDown")
    await expect(page.locator('[data-slot="chart-tooltip"]')).toContainText("Site da incorporadora")
    await page.keyboard.press("ArrowUp")
    await expect(page.locator('[data-slot="chart-tooltip"]')).toContainText("Portais imobiliários")
  })
})

test.describe("Charts — legend", () => {
  test("hiding a series keeps the colours of the others", async ({ page }) => {
    await open(page, "data-barchart--several-series")
    const vila = page.locator('[data-slot="bar-chart-bar"][data-series="vila"]').first()
    const before = await vila.evaluate((el) => getComputedStyle(el).fill)
    await page.getByRole("button", { name: "Torre Norte" }).click()
    await expect(page.locator('[data-series="torre"]')).toHaveCount(0)
    expect(await vila.evaluate((el) => getComputedStyle(el).fill)).toBe(before)
    await expect(page.getByRole("button", { name: "Torre Norte" })).toHaveAttribute(
      "aria-pressed",
      "false",
    )
  })
})

test.describe("Charts — layout", () => {
  for (const [id, slot] of [
    ["data-barchart--several-series", "bar-chart"],
    ["data-barchart--horizontal", "bar-chart"],
    ["data-barchart--stacked", "bar-chart"],
    ["data-linechart--several-series", "line-chart"],
    ["data-linechart--six-series", "line-chart"],
  ] as const) {
    test(`${id} has no horizontal scroll at 360px and its legend goes below`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 })
      await open(page, id, slot)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        360,
      )
      const figure = (await page.locator(`[data-slot="${slot}"]`).boundingBox())!
      const svg = (await page.locator(`[data-slot="${slot}"] svg`).boundingBox())!
      expect(svg.x + svg.width).toBeLessThanOrEqual(figure.x + figure.width + 0.5)
      const legend = page.locator('[data-slot="chart-legend"]')
      if (await legend.count()) {
        expect((await legend.boundingBox())!.y).toBeGreaterThan(svg.y + svg.height - 1)
      }
    })
  }
})

test.describe("Charts — forced colours", () => {
  test("bars, lines and the sparkline stay visible", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" })
    const canvas = async () => page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    await open(page, "data-barchart--several-series")
    const bar = await page
      .locator('[data-slot="bar-chart-bar"]')
      .first()
      .evaluate((el) => getComputedStyle(el).fill)
    expect(bar).not.toBe(await canvas())
    expect(bar).not.toBe("none")
    await open(page, "data-linechart--several-series", "line-chart")
    const line = await page
      .locator('[data-slot="line-chart-line"]')
      .first()
      .evaluate((el) => getComputedStyle(el).stroke)
    expect(line).not.toBe(await canvas())
    await page.goto(story("data-sparkline--default"))
    const spark = page.locator('[data-slot="sparkline-line"]')
    await expect(spark).toBeVisible({ timeout: 15_000 })
    expect(await spark.evaluate((el) => getComputedStyle(el).stroke)).not.toBe(await canvas())
    await page.emulateMedia({ forcedColors: "none" })
  })
})

test.describe("Charts — table view", () => {
  test("the visible table matches the data", async ({ page }) => {
    await open(page, "data-barchart--with-table")
    const table = page.getByRole("table", { name: "Vendas por empreendimento" })
    await expect(table).toBeVisible()
    const rows = await table.getByRole("row").allTextContents()
    expect(rows).toEqual([
      "CategoriaResidencial BosqueTorre NorteVila Jardim",
      "1º tri423118",
      "2º tri383624",
      "3º tri452930",
      "4º tri514027",
    ])
  })

  test("the line chart's table shows a missing point as a dash", async ({ page }) => {
    await page.goto(story("data-linechart--missing-points"))
    const table = page.getByRole("table", { name: "Leads dos portais", includeHidden: true })
    await expect(table).toBeAttached({ timeout: 15_000 })
    const rows = await table.getByRole("row", { includeHidden: true }).allTextContents()
    expect(rows[4]).toBe("abr.—")
  })
})

test.describe("Charts — accessibility", () => {
  for (const [id, slot] of [
    ["data-barchart--several-series", "bar-chart"],
    ["data-barchart--horizontal", "bar-chart"],
    ["data-barchart--negative-values", "bar-chart"],
    ["data-barchart--with-table", "bar-chart"],
    ["data-barchart--empty", "bar-chart"],
    ["data-barchart--dark", "bar-chart"],
    ["data-linechart--several-series", "line-chart"],
    ["data-linechart--area", "line-chart"],
    ["data-linechart--dark", "line-chart"],
    ["data-sparkline--in-table-cell", "sparkline"],
    ["data-sparkline--dark", "sparkline"],
  ] as const) {
    test(`${id} has no WCAG 2.1 AA violations`, async ({ page }) => {
      await open(page, id, slot)
      await expectNoA11yViolations(page, "#storybook-root")
    })
  }
})
