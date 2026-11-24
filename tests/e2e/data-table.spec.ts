/**
 * DataTable in a real browser: the accessibility tree, keyboard, layout,
 * scrolling and sizes that jsdom cannot measure.
 */
import { readFileSync } from "node:fs"

import { type Page, expect, test } from "@playwright/test"
import { unzipSync } from "fflate"

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

test.describe("DataTable: exportação", () => {
  test("um .csv sai para o Excel brasileiro", async ({ page }) => {
    await gotoTable(page, "data-datatable--export-csv")
    await page.getByRole("button", { name: "Exportar para Excel" }).click()
    const downloading = page.waitForEvent("download")
    await page.getByRole("menuitem", { name: "Exportar todos os dados" }).click()
    const download = await downloading
    expect(download.suggestedFilename()).toBe("contratos.csv")
    const bytes = readFileSync((await download.path()) ?? "")
    expect([...bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
    const lines = bytes.subarray(3).toString("utf8").split("\r\n")
    expect(lines[0]).toBe("Número;Cliente;Vencimento;Valor;Status")
    expect(lines[1]).toBe("C-2026-001;Empresa A;2026-06-15;12000;aprovado")
    expect(lines[4]).toBe("C-2026-099;'=SOMA(A1:A2);2026-10-01;1234,56;pendente")
  })
})

test.describe("DataTable: exportação em outro fuso", () => {
  // East of UTC a local midnight is the day before in UTC: the day that
  // slipped in Excel when the Date went in as it was.
  test.use({ timezoneId: "Asia/Tokyo" })

  test("a data do .xlsx é o dia que a tabela mostra", async ({ page }) => {
    await gotoTable(page, "data-datatable--export-dates")
    await expect(page.getByRole("cell", { name: "19/05/2026, 00:00" })).toBeVisible()
    await page.getByRole("button", { name: "Exportar para Excel" }).click()
    const downloading = page.waitForEvent("download")
    await page.getByRole("menuitem", { name: "Exportar todos os dados" }).click()
    const download = await downloading
    expect(download.suggestedFilename()).toBe("assinaturas.xlsx")
    const files = unzipSync(readFileSync((await download.path()) ?? ""))
    const sheet = new TextDecoder().decode(files["xl/worksheets/sheet1.xml"])
    // 46161 = 19/05/2026 at 00:00; 46162.6041… = 20/05/2026 at 14:30.
    expect(sheet).toMatch(/<c r="B2"[^>]*><v>46161<\/v>/)
    expect(sheet).toMatch(/<c r="B3"[^>]*><v>46162\.6041666/)
  })
})

test.describe("DataTable: paginação", () => {
  test("o rodapé usa a Pagination da lib, com páginas, faixa e foco estável", async ({ page }) => {
    await gotoTable(page, "data-datatable--paginated-with-page-size-selector")
    const nav = page.getByRole("navigation", { name: "Paginação" })
    await expect(nav.getByText("1–5 de 15")).toBeVisible()
    await nav.getByRole("button", { name: "Página 3" }).click()
    await expect(page.getByRole("cell", { name: "C-2026-011" })).toBeVisible()
    await expect(nav.getByText("11–15 de 15")).toBeVisible()

    await nav.getByRole("button", { name: "Página 1" }).click()
    const next = nav.getByRole("button", { name: "Próxima página" })
    await next.focus()
    await page.keyboard.press("Enter")
    await expect(nav.getByRole("button", { name: "Página 2" })).toHaveAttribute(
      "aria-current",
      "page",
    )
    await expect(next).toBeFocused()

    await nav.getByRole("combobox", { name: "Linhas por página" }).selectOption("10")
    await expect(nav.getByRole("button", { name: "Página 1" })).toHaveAttribute(
      "aria-current",
      "page",
    )
    await expect(nav.getByText("1–10 de 15")).toBeVisible()
  })
})

test.describe("DataTable: estados", () => {
  test("o carregamento chega à tecnologia assistiva e o esqueleto tem o tamanho da página", async ({
    page,
  }) => {
    await gotoTable(page, "data-datatable--loading")
    const statuses = page.getByRole("status")
    await expect(statuses).toHaveCount(2)
    await expect(statuses.nth(0)).toHaveText("Carregando dados…")
    await expect(statuses.nth(1)).toHaveText("Carregando dados…")
    const tables = page.locator('[data-slot="data-table"]')
    await expect(tables.nth(0).locator('[data-slot="data-table-skeleton-row"]')).toHaveCount(5)
    await expect(tables.nth(1).locator('[data-slot="data-table-skeleton-row"]')).toHaveCount(8)
  })

  test("uma falha aparece como erro, com tentar de novo", async ({ page }) => {
    await gotoTable(page, "data-datatable--with-error")
    await expect(page.getByRole("alert")).toHaveText("Não foi possível carregar os contratos.")
    await expect(page.getByText("Nenhum resultado.")).toHaveCount(0)
    await page.getByRole("button", { name: "Tentar de novo" }).click()
    await expect(page.getByRole("status")).toHaveText("Carregando dados…")
    await expect(page.getByRole("cell", { name: "C-2026-001" })).toBeVisible()
    await expect(page.getByRole("alert")).toHaveCount(0)
  })
})
