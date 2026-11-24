import { type Page, expect, test } from "@playwright/test"
import { expectNoA11yViolations } from "./a11y"

const story = (id: string) => `/iframe.html?id=forms-select--${id}&viewMode=story`

async function open(page: Page, id: string) {
  await page.goto(story(id))
  await expect(page.locator('[data-slot="select-trigger"]').first()).toBeVisible({
    timeout: 15_000,
  })
}

const formData = (page: Page) =>
  page.evaluate(() =>
    Object.fromEntries(new FormData(document.querySelector("form") as HTMLFormElement)),
  )

test.describe("Select — keyboard", () => {
  test("opens from the keyboard and chooses with typeahead", async ({ page }) => {
    await open(page, "with-description")
    const trigger = page.getByRole("combobox", { name: "Estágio" })
    await page.keyboard.press("Tab")
    await expect(trigger).toBeFocused()
    await page.keyboard.press("Enter")
    const list = page.getByRole("listbox")
    await expect(list).toBeVisible()
    await page.keyboard.type("vis")
    await expect(page.getByRole("option", { name: "Visita agendada" })).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(list).toBeHidden()
    await expect(trigger).toHaveText("Visita agendada")
    await expect(trigger).toBeFocused()
    // Reopened, the chosen option is marked by a check, and Esc closes.
    await page.keyboard.press("ArrowDown")
    const chosen = page.getByRole("option", { name: "Visita agendada" })
    await expect(chosen).toHaveAttribute("aria-selected", "true")
    await expect(chosen.locator("svg")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(list).toBeHidden()
  })

  test("a letter on the closed trigger chooses without opening", async ({ page }) => {
    await open(page, "with-description")
    const trigger = page.getByRole("combobox", { name: "Estágio" })
    await trigger.focus()
    await page.keyboard.type("f")
    await expect(trigger).toHaveText("Fechado")
    await expect(page.getByRole("listbox")).toHaveCount(0)
  })

  test("read-only: Enter, arrows and letters change nothing", async ({ page }) => {
    await open(page, "read-only")
    const trigger = page.getByRole("combobox", { name: "Estágio" })
    await trigger.focus()
    for (const key of ["Enter", "ArrowDown", " ", "n"]) await page.keyboard.press(key)
    await trigger.click()
    await expect(page.getByRole("listbox")).toHaveCount(0)
    await expect(trigger).toHaveText("Proposta enviada")
  })
})

test.describe("Select — layout", () => {
  test("the trigger is as tall as an Input of the same size", async ({ page }) => {
    await open(page, "sizes")
    for (const [size, px] of [
      ["sm", 32],
      ["md", 40],
      ["lg", 44],
    ] as const) {
      const select = await page.getByRole("combobox", { name: `Select ${size}` }).boundingBox()
      // The Input's border is on its wrapper, around the <input>.
      const input = await page
        .locator('[data-slot="input-wrapper"]')
        .filter({ has: page.getByRole("textbox", { name: `Input ${size}` }) })
        .boundingBox()
      expect(select?.height, size).toBe(px)
      expect(input?.height, size).toBe(px)
    }
  })

  test("at 360px the list stays inside the screen", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 })
    await page.goto(story("groups"))
    const trigger = page.getByRole("combobox", { name: "Tipo de imóvel" })
    await expect(trigger).toBeVisible({ timeout: 15_000 })
    await trigger.click()
    const list = page.locator('[data-slot="select-content"]')
    await expect(list).toBeVisible()
    const box = (await list.boundingBox())!
    // (The Storybook frame's own padding is wider than 360px; the list,
    // positioned against the screen, is what the Select controls.)
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(360)
    expect(box.y + box.height).toBeLessThanOrEqual(640)
    await page.getByRole("option", { name: "Galpão" }).click()
    await expect(trigger).toHaveText("Galpão")
  })

  test("a long list in a short window scrolls inside the screen", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 360 })
    await page.goto(story("inside-dialog"))
    await page.getByRole("button", { name: "Abrir dialog" }).click({ timeout: 15_000 })
    await page.getByRole("combobox", { name: "Andar" }).click()
    const list = page.locator('[data-slot="select-content"]')
    await expect(list).toBeVisible()
    const box = (await list.boundingBox())!
    expect(box.y + box.height).toBeLessThanOrEqual(360)
    await page.keyboard.press("End")
    await expect(page.getByRole("option", { name: "15º andar", exact: true })).toBeInViewport()
  })
})

test.describe("Select — forms and dialogs", () => {
  test("FormData has nothing before a choice, the value after, and reset restores", async ({
    page,
  }) => {
    await open(page, "in-form")
    expect(await formData(page)).toEqual({ estagio: "contato" })
    await page.getByRole("combobox", { name: "Tipo de imóvel" }).click()
    await page.getByRole("option", { name: "Loja" }).click()
    await page.getByRole("combobox", { name: "Estágio" }).click()
    await page.getByRole("option", { name: "Fechado" }).click()
    expect(await formData(page)).toEqual({ estagio: "fechado", tipo: "loja" })
    await page.getByRole("button", { name: "Enviar" }).click()
    await expect(page.getByTestId("sent")).toHaveText("Enviado: estagio=fechado; tipo=loja")

    await page.getByRole("button", { name: "Restaurar" }).click()
    await expect(page.getByRole("combobox", { name: "Estágio" })).toHaveText("Em contato")
    await expect(page.getByRole("combobox", { name: "Tipo de imóvel" })).toHaveText("Selecione…")
    await expect.poll(() => formData(page)).toEqual({ estagio: "contato" })
  })

  test("inside a Dialog: choosing and Esc on the list keep the Dialog open", async ({ page }) => {
    await page.goto(story("inside-dialog"))
    await page.getByRole("button", { name: "Abrir dialog" }).click({ timeout: 15_000 })
    const dialog = page.getByRole("dialog", { name: "Dados do imóvel" })
    await expect(dialog).toBeVisible()
    const trigger = dialog.getByRole("combobox", { name: "Andar" })
    await trigger.click()
    await page.getByRole("option", { name: "3º andar", exact: true }).click()
    await expect(trigger).toHaveText("3º andar")
    await expect(dialog).toBeVisible()
    await trigger.press("Enter")
    await expect(page.getByRole("listbox")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("listbox")).toHaveCount(0)
    await expect(dialog).toBeVisible()
    await expect(trigger).toBeFocused()
  })
})

test.describe("Select — accessibility", () => {
  for (const id of ["with-error", "required", "read-only", "disabled", "groups"]) {
    test(`${id} has no WCAG 2.1 AA violations`, async ({ page }) => {
      await open(page, id)
      await expectNoA11yViolations(page, '[data-slot="field-shell"]')
    })
  }

  test("the open list has no WCAG 2.1 AA violations", async ({ page }) => {
    await open(page, "groups")
    await page.getByRole("combobox", { name: "Tipo de imóvel" }).click()
    const list = page.locator('[data-slot="select-content"]')
    await expect(list).toBeVisible()
    await list.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)))
    await expectNoA11yViolations(page, '[data-slot="select-content"]')
  })

  test("in forced colours the highlighted option takes the system highlight", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" })
    await open(page, "groups")
    await page.getByRole("combobox", { name: "Tipo de imóvel" }).press("Enter")
    const first = page.getByRole("option", { name: "Apartamento" })
    await expect(first).toHaveAttribute("data-highlighted", "")
    const [bg, plain] = await Promise.all([
      first.evaluate((el) => getComputedStyle(el).backgroundColor),
      page
        .getByRole("option", { name: "Casa" })
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ])
    expect(bg).not.toBe(plain)
    await page.emulateMedia({ forcedColors: "none" })
  })
})
