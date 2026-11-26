import { expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

test.describe("EmptyState", () => {
  test("announces itself when a search empties the list, and recovers", async ({ page }) => {
    await page.goto(story("data-emptystate--search-without-results"))
    const heading = page.getByRole("heading", { name: "Nenhum lead encontrado" })
    await expect(heading).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole("status")).toHaveText(
      "Nenhum lead encontrado. Nada corresponde a “zz”.",
    )

    await page.getByRole("button", { name: "Limpar busca" }).click()
    await expect(heading).toHaveCount(0)
    await expect(page.getByText("Ana Souza")).toBeVisible()

    await page.getByRole("textbox", { name: "Buscar lead" }).fill("xyz")
    await expect(page.getByRole("status")).toHaveText(
      "Nenhum lead encontrado. Nada corresponde a “xyz”.",
    )
  })

  test("is centred inside the DataTable body", async ({ page }) => {
    await page.goto(story("data-emptystate--inside-data-table"))
    const heading = page.getByRole("heading", { name: "Nenhum lead" })
    await expect(heading).toBeVisible({ timeout: 15_000 })
    const cell = await page.locator("td", { has: heading }).boundingBox()
    const box = await heading.boundingBox()
    const tableCentre = (cell?.x ?? 0) + (cell?.width ?? 0) / 2
    const headingCentre = (box?.x ?? 0) + (box?.width ?? 0) / 2
    expect(Math.abs(tableCentre - headingCentre)).toBeLessThanOrEqual(2)
  })
})
