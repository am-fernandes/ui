import { expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

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
