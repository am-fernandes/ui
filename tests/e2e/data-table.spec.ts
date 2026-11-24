/**
 * DataTable in a real browser: the accessibility tree, keyboard, layout,
 * scrolling and sizes that jsdom cannot measure.
 */
import { type Page, expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

async function gotoTable(page: Page, id: string) {
  await page.goto(story(id))
  await expect(page.locator('[data-slot="table"]').first()).toBeVisible({ timeout: 15_000 })
}

test.describe("DataTable: linha clicável", () => {
  test("cada linha continua linha da tabela, com as suas células", async ({ page }) => {
    await gotoTable(page, "data-datatable--with-row-click")
    const table = page.getByRole("table")
    // header + 8 rows, 5 cells each
    await expect(table.getByRole("row")).toHaveCount(9)
    await expect(table.getByRole("cell")).toHaveCount(40)
    await expect(table.getByRole("button", { name: /C-2026-001.*Empresa A/ })).toHaveCount(0)
  })

  test("o teclado abre a linha pelo botão da primeira célula", async ({ page }) => {
    await gotoTable(page, "data-datatable--with-row-click")
    const action = page.getByRole("button", { name: "C-2026-002", exact: true })
    await action.focus()
    await page.keyboard.press("Enter")
    await expect(page.getByText("Selecionado: C-2026-002 — Empresa B")).toBeVisible()
    await page.getByRole("button", { name: "C-2026-003", exact: true }).focus()
    await page.keyboard.press(" ")
    await expect(page.getByText("Selecionado: C-2026-003 — Empresa C")).toBeVisible()
  })

  test("o mouse abre a linha clicando em qualquer célula", async ({ page }) => {
    await gotoTable(page, "data-datatable--with-row-click")
    await page.getByRole("cell", { name: "Empresa D" }).click()
    await expect(page.getByText("Selecionado: C-2026-004 — Empresa D")).toBeVisible()
  })

  test("o menu de ações da linha funciona pelo teclado sem abrir a linha", async ({ page }) => {
    await gotoTable(page, "data-datatable--with-row-click-and-actions")
    const state = page.getByTestId("row-click-state")
    const trigger = page.getByRole("button", { name: "Ações de C-2026-002" })
    await trigger.focus()
    await page.keyboard.press("Enter")
    const menu = page.getByRole("menu")
    await expect(menu).toBeVisible()
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    await expect(state).toContainText("Ação: Arquivar C-2026-002")
    await expect(state).toContainText("Linha aberta: nenhuma")

    await page.getByRole("button", { name: "Ações de C-2026-003" }).click()
    await page.getByRole("menuitem", { name: "Editar" }).click()
    await expect(state).toContainText("Ação: Editar C-2026-003")
    await expect(state).toContainText("Linha aberta: nenhuma")

    await page.getByRole("cell", { name: "Empresa A" }).click()
    await expect(state).toContainText("Linha aberta: C-2026-001")
  })
})
