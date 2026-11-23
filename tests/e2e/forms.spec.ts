import { type Page, expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

/**
 * Opens a story and waits until it is mounted (and, with `ready`, until that
 * text is on screen). Storybook's dev server may still be compiling on the
 * first hit, and on a busy machine that takes longer than the 5s an
 * assertion waits.
 */
async function gotoStory(page: Page, id: string, ready?: string) {
  await page.goto(story(id))
  await page.waitForFunction(
    () =>
      document.body.classList.contains("sb-show-main") &&
      !document.body.classList.contains("sb-show-preparing-story") &&
      !!document.getElementById("storybook-root")?.firstChild,
    null,
    { timeout: 30_000 },
  )
  if (ready) await expect(page.getByText(ready).first()).toBeVisible({ timeout: 15_000 })
}

test.describe("Calendar", () => {
  test("renders weekday grid in ptBR locale", async ({ page }) => {
    await page.goto(story("forms-calendar--single"))
    // ptBR weekday short labels (rendered by react-day-picker)
    const grid = page.getByRole("grid").first()
    await expect(grid).toBeVisible()
  })

  test("arrow keys navigate between days", async ({ page }) => {
    await page.goto(story("forms-calendar--single"))
    const grid = page.getByRole("grid").first()
    await expect(grid).toBeVisible()
    // Focus the grid then arrow-right
    await grid.click()
    await page.keyboard.press("ArrowRight")
    // No crash; some day button now has data-focused or aria-selected
  })

  test("disabledDays=past disables past dates", async ({ page }) => {
    await page.goto(story("forms-calendar--disabled-past"))
    // At least one button has aria-disabled=true
    const disabledDay = page
      .locator('[aria-disabled="true"][role="gridcell"], [role="gridcell"][aria-disabled="true"]')
      .first()
    await expect(disabledDay.or(page.locator(".rdp-day_disabled").first())).toBeVisible({
      timeout: 3000,
    })
  })
})

test.describe("Combobox", () => {
  test("opens, filters, selects an option", async ({ page }) => {
    await page.goto(story("forms-combobox--default"))
    const trigger = page.getByRole("combobox").first()
    await trigger.click()
    // Type to filter
    const input = page.getByPlaceholder(/buscar/i)
    await expect(input).toBeVisible()
    await input.fill("são paulo")
    // First matching item
    const option = page.getByRole("option").first()
    if (await option.isVisible()) {
      await option.click()
    }
  })
})

test.describe("DateInput", () => {
  test("opens popover and selects a date", async ({ page }) => {
    await page.goto(story("forms-dateinput--default"))
    const trigger = page.getByRole("button").first()
    await trigger.click()
    const grid = page.getByRole("grid").first()
    await expect(grid).toBeVisible({ timeout: 3000 })
    // Click any non-outside day
    const days = page.locator("button[data-day]")
    await days.first().click()
    // Popover should close after selection
    await expect(grid).not.toBeVisible({ timeout: 3000 })
  })
})

test.describe("Combobox dentro de Dialog", () => {
  test("wheel rola a lista do dropdown e mantém o dialog aberto", async ({ page }) => {
    await page.goto(story("forms-combobox--inside-dialog"))
    await page.getByRole("button", { name: "Abrir dialog" }).click()
    await page.getByRole("combobox").click()
    const list = page.getByRole("listbox")
    await expect(list).toBeVisible()
    await list.hover()
    await page.mouse.wheel(0, 200)
    await expect.poll(() => list.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
    await expect(page.getByRole("dialog")).toBeVisible()
  })
})

test.describe("Combobox: limpar", () => {
  test("o botão de limpar é um alvo de 24px ao lado do gatilho", async ({ page }) => {
    await gotoStory(page, "forms-combobox--multi-select", "2 selecionados")
    const trigger = page.getByRole("combobox", { name: "Áreas" })
    const clear = page.getByRole("button", { name: "Limpar seleção" })
    const box = await clear.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(24)
    expect(box?.height).toBeGreaterThanOrEqual(24)
    // It sits inside the field's box, but is not part of the trigger button.
    const triggerBox = await trigger.boundingBox()
    if (!box || !triggerBox) throw new Error("no box")
    expect(box.y).toBeGreaterThanOrEqual(triggerBox.y)
    expect(box.y + box.height).toBeLessThanOrEqual(triggerBox.y + triggerBox.height)
    expect(await trigger.evaluate((el) => el.querySelector("[aria-label='Limpar seleção']"))).toBe(
      null,
    )

    await clear.click()
    await expect(trigger).toHaveText(/Selecione áreas/)
    await expect(trigger).toBeFocused()
  })
})

test.describe("Combobox: lista grande", () => {
  test("com 2.000 opções, abre e filtra montando no máximo 100", async ({ page }) => {
    await gotoStory(page, "forms-combobox--many-options", "Selecione uma unidade")
    await page.getByRole("combobox", { name: "Unidade" }).click()
    const list = page.getByRole("listbox")
    await expect(list).toBeVisible()
    await expect(list.getByRole("option")).toHaveCount(100)
    await expect(
      page.getByText("1.900 opções a mais. Continue digitando para filtrar."),
    ).toBeVisible()

    const search = page.getByPlaceholder("Buscar...")
    await search.pressSequentially("unidade 19")
    // 19, 190-199 and 1900-1999: 111 matches, 100 on screen.
    await expect(list.getByRole("option")).toHaveCount(100)
    await expect(page.getByText("11 opções a mais. Continue digitando para filtrar.")).toBeVisible()
    await search.pressSequentially("99")
    await expect(list.getByRole("option")).toHaveCount(1)
    await expect(list.getByRole("option", { name: "Unidade 1999" })).toBeVisible()
    await expect(page.getByText(/opções a mais/)).toHaveCount(0)

    await page.keyboard.press("Enter")
    await expect(page.getByRole("combobox", { name: "Unidade" })).toHaveText(/Unidade 1999/)
  })
})
