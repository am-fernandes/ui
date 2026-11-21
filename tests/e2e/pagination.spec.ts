import { type Page, expect, test } from "@playwright/test"
import { expectNoA11yViolations } from "./a11y"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

// Storybook's dev server may still be compiling on the first hit.
async function gotoPagination(page: Page, id: string) {
  await page.goto(story(id))
  await expect(page.getByRole("navigation", { name: "Paginação" })).toBeVisible({
    timeout: 15_000,
  })
}

const visiblePages = (page: Page) =>
  page
    .getByRole("navigation", { name: "Paginação" })
    .getByRole("button", { name: /^Página \d/ })
    .allTextContents()

const current = (page: Page) => page.locator('[aria-current="page"]')

test.describe("Pagination", () => {
  test("keyboard: Tab reaches every control and Enter/Space change the page", async ({ page }) => {
    await gotoPagination(page, "navigation-pagination--default")
    await page.keyboard.press("Tab") // previous is disabled on page 1 → skipped
    await expect(page.getByRole("button", { name: "Página 1", exact: true })).toBeFocused()
    await page.keyboard.press("Tab")
    await expect(page.getByRole("button", { name: "Página 2", exact: true })).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(current(page)).toHaveText("2")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Space")
    await expect(current(page)).toHaveText("3")
  })

  test("focused controls show the focus ring", async ({ page }) => {
    await gotoPagination(page, "navigation-pagination--default")
    await page.keyboard.press("Tab")
    const focused = page.getByRole("button", { name: "Página 1", exact: true })
    await expect(focused).toBeFocused()
    const shadow = await focused.evaluate((el) => getComputedStyle(el).boxShadow)
    expect(shadow).not.toBe("none")
  })

  test("ellipses keep 7 slots at the start, middle and end", async ({ page }) => {
    await gotoPagination(page, "navigation-pagination--many-pages")
    await expect(current(page)).toHaveText("25")
    expect(await visiblePages(page)).toEqual(["1", "24", "25", "26", "50"])
    await expect(page.locator('[data-slot="pagination-ellipsis"]')).toHaveCount(2)

    await page.getByRole("button", { name: "Última página" }).click()
    expect(await visiblePages(page)).toEqual(["1", "46", "47", "48", "49", "50"])
    await expect(page.getByRole("button", { name: "Próxima página" })).toBeDisabled()

    await page.getByRole("button", { name: "Primeira página" }).click()
    expect(await visiblePages(page)).toEqual(["1", "2", "3", "4", "5", "50"])
    await expect(page.getByRole("button", { name: "Página anterior" })).toBeDisabled()
  })

  test("the page list keeps the same width while paging", async ({ page }) => {
    await gotoPagination(page, "navigation-pagination--many-pages")
    const list = page.getByRole("navigation", { name: "Paginação" }).getByRole("list")
    const widths: number[] = []
    for (const target of ["Primeira página", "Próxima página", "Próxima página", "Última página"]) {
      await page.getByRole("button", { name: target }).click()
      widths.push((await list.boundingBox())?.width ?? 0)
    }
    widths.push((await list.boundingBox())?.width ?? 0)
    expect(new Set(widths.map((w) => Math.round(w))).size).toBe(1)
  })

  test("changing the page size goes back to page 1 and updates the summary", async ({ page }) => {
    await gotoPagination(page, "navigation-pagination--with-totals")
    await expect(page.getByText("1–10 de 243")).toBeVisible()
    await page.getByRole("button", { name: "Página 3", exact: true }).click()
    await expect(page.getByText("21–30 de 243")).toBeVisible()
    await page.getByRole("combobox", { name: "Itens por página" }).selectOption("50")
    await expect(current(page)).toHaveText("1")
    await expect(page.getByText("1–50 de 243")).toBeVisible()
    expect(await visiblePages(page)).toEqual(["1", "2", "3", "4", "5"])
  })

  test("link mode navigates and keeps the current page in sync", async ({ page }) => {
    await gotoPagination(page, "navigation-pagination--links")
    const page3 = page.getByRole("link", { name: "Página 3", exact: true })
    await expect(page3).toHaveAttribute("href", "#pagina-3")
    await page3.click()
    await expect(page).toHaveURL(/#pagina-3$/)
    await expect(page.getByRole("link", { name: "Página 3", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    )
    await page.getByRole("link", { name: "Próxima página" }).click()
    await expect(page).toHaveURL(/#pagina-4$/)
  })

  test("compact variant and cursor mode", async ({ page }) => {
    await gotoPagination(page, "navigation-pagination--compact")
    await expect(page.getByText("Página 3 de 12")).toBeVisible()
    await page.getByRole("button", { name: "Próxima página" }).click()
    await expect(page.getByText("Página 4 de 12")).toBeVisible()

    await gotoPagination(page, "navigation-pagination--cursor")
    const next = page.getByRole("button", { name: "Próxima página" })
    for (const n of [2, 3, 4]) {
      await next.click()
      await expect(page.getByText(`Página ${n}`, { exact: true })).toBeVisible()
    }
    await expect(next).toBeDisabled()
  })

  test("sizes: 40px controls by default, 32px with size=sm", async ({ page }) => {
    await gotoPagination(page, "navigation-pagination--default")
    for (const name of ["Página 1", "Próxima página"]) {
      const box = await page.getByRole("button", { name, exact: true }).boundingBox()
      expect(box?.height, name).toBe(40)
    }
    await gotoPagination(page, "navigation-pagination--small")
    for (const name of ["Página 10", "Próxima página"]) {
      const box = await page.getByRole("button", { name, exact: true }).boundingBox()
      expect(box?.height, name).toBe(32)
    }
  })

  for (const id of [
    "navigation-pagination--many-pages",
    "navigation-pagination--with-totals",
    "navigation-pagination--links",
    "navigation-pagination--disabled",
  ]) {
    test(`has no WCAG 2.1 AA violations: ${id}`, async ({ page }) => {
      await gotoPagination(page, id)
      await expectNoA11yViolations(page, '[data-slot="pagination"]')
    })
  }
})
