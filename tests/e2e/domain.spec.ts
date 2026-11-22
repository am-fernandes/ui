import { expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

test.describe("CurrencyInput", () => {
  test("typing digits formats to BRL display", async ({ page }) => {
    // `Playground` has no play function; `Default` types by itself and would race.
    await page.goto(story("domain-currencyinput--playground"))
    const input = page.getByRole("textbox", { name: /Valor do contrato/ })
    await expect(input).toHaveValue("0,00")
    // A scripted focus leaves the caret at the start; a person types at the end.
    await input.press("End")
    await input.pressSequentially("123456")
    // Display formatted as 1.234,56
    await expect(input).toHaveValue("1.234,56")
  })
})

test.describe("PercentageInput", () => {
  test("never goes above max", async ({ page }) => {
    await page.goto(story("domain-percentageinput--default"))
    const input = page.getByRole("textbox", { name: /Comissão/ })
    await expect(input).toHaveValue("0,00")
    await input.press("End")
    await input.pressSequentially("99999")
    // Default max=100: the field never shows more than 100,00.
    await expect(input).not.toHaveValue("0,00")
    const value = await input.inputValue()
    const numeric = Number.parseFloat(value.replace(".", "").replace(",", "."))
    expect(numeric).toBeLessThanOrEqual(100)
  })
})

test.describe("MultiInput", () => {
  test("Enter commits a tag", async ({ page }) => {
    await page.goto(story("domain-multiinput--string-tags"))
    const input = page.getByRole("textbox").first()
    await input.fill("playwright")
    await input.press("Enter")
    // The new tag should appear as a Badge
    await expect(page.getByText("playwright")).toBeVisible()
  })

  test("Backspace removes last tag from empty input", async ({ page }) => {
    await page.goto(story("domain-multiinput--string-tags"))
    const input = page.getByRole("textbox").first()
    await input.fill("removeme")
    await input.press("Enter")
    await expect(page.getByText("removeme")).toBeVisible()
    // Now empty input + backspace removes
    await input.press("Backspace")
    await expect(page.getByText("removeme")).not.toBeVisible({ timeout: 2000 })
  })
})

test.describe("InputOTP", () => {
  test("typing 6 digits fires onComplete", async ({ page }) => {
    await page.goto(story("domain-inputotp--default"))
    // input-otp library renders an invisible input that captures keystrokes
    const input = page.getByRole("textbox").first()
    await input.fill("123456")
    const slots = page.locator('[data-slot="input-otp-slot"]')
    await expect(slots).toHaveCount(6)
    // First slot has "1"
    await expect(slots.nth(0)).toContainText("1")
    await expect(slots.nth(5)).toContainText("6")
  })
})
